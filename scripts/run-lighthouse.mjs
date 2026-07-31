import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const port = 3027;
const url = `http://127.0.0.1:${port}`;
const artifactDirectory = 'artifacts/launch-readiness/lighthouse';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const profiles = (process.env.LIGHTHOUSE_PROFILES || 'mobile,desktop').split(',');
const runCount = Number(process.env.LIGHTHOUSE_RUNS || 3);
const server = spawn(process.execPath, ['.next/standalone/server.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port), HOSTNAME: '127.0.0.1' },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk.toString();
});

await mkdir(artifactDirectory, { recursive: true });
const runs = [];

try {
  await waitForServer();

  for (const profile of profiles) {
    for (let run = 1; run <= runCount; run += 1) {
      const outputPath = `${artifactDirectory}/${profile}-${run}.json`;
      const args = [
        '--yes',
        'lighthouse@13.4.1',
        url,
        '--quiet',
        '--only-categories=performance,accessibility,best-practices,seo',
        '--output=json',
        `--output-path=${outputPath}`,
        `--chrome-path=${chromePath}`,
        '--chrome-flags=--headless --no-sandbox --disable-gpu',
      ];
      if (profile === 'desktop') args.push('--preset=desktop');

      let result;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        result = await runCommand('npx', args);
        if (result.code === 0) break;
      }
      if (result.code !== 0) {
        throw new Error(
          `Lighthouse ${profile} run ${run} failed after retries: ${result.stderr || result.stdout}`,
        );
      }

      const report = JSON.parse(await readFile(outputPath, 'utf8'));
      runs.push({
        profile,
        run,
        scores: Object.fromEntries(
          Object.entries(report.categories).map(([key, category]) => [
            key,
            Math.round(category.score * 100),
          ]),
        ),
        metrics: {
          fcp: report.audits['first-contentful-paint'].numericValue,
          lcp: report.audits['largest-contentful-paint'].numericValue,
          cls: report.audits['cumulative-layout-shift'].numericValue,
          tbt: report.audits['total-blocking-time'].numericValue,
          speedIndex: report.audits['speed-index'].numericValue,
          transferBytes: report.audits['total-byte-weight'].numericValue,
          mainThreadMs: report.audits['mainthread-work-breakdown'].numericValue,
        },
      });
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    runs,
    medians: Object.fromEntries(
      profiles.map((profile) => {
        const profileRuns = runs.filter((run) => run.profile === profile);
        return [
          profile,
          {
            scores: mapMedian(profileRuns.map((run) => run.scores)),
            metrics: mapMedian(profileRuns.map((run) => run.metrics)),
          },
        ];
      }),
    ),
  };
  await writeFile(
    `${artifactDirectory}/summary.json`,
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  );
  console.log(JSON.stringify(summary, null, 2));
} finally {
  if (!server.killed) server.kill();
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${url}/health`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Local server did not start. ${serverOutput}`);
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      shell: process.platform === 'win32',
      windowsHide: true,
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

function mapMedian(rows) {
  const keys = Object.keys(rows[0]);
  return Object.fromEntries(
    keys.map((key) => {
      const values = rows.map((row) => row[key]).sort((left, right) => left - right);
      return [key, values[Math.floor(values.length / 2)]];
    }),
  );
}
