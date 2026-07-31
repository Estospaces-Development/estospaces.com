import { readFile, writeFile } from 'node:fs/promises';

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '';
const analyticsConfigured = /^G-[A-Z0-9]+$/.test(measurementId);

if (analyticsConfigured) {
  console.log('Kept homepage hydration because consent-gated analytics is configured.');
  process.exit(0);
}

const homeArtifacts = [
  '.next/server/app/index.html',
  '.next/standalone/.next/server/app/index.html',
];

for (const artifactPath of homeArtifacts) {
  const source = await readFile(artifactPath, 'utf8');
  const nextScripts = source.match(/<script\b[^>]*src="\/_next\/[^"]+"[^>]*><\/script>/gi) || [];
  const flightScripts =
    source.match(/<script\b[^>]*>\s*(?:\(self\.__next_f|self\.__next_f)[\s\S]*?<\/script>/gi) || [];

  if (nextScripts.length === 0 || flightScripts.length === 0) {
    throw new Error(`Expected Next.js runtime markers were not found in ${artifactPath}`);
  }

  const stripped = source
    .replace(/<script\b[^>]*src="\/_next\/[^"]+"[^>]*><\/script>/gi, '')
    .replace(/<script\b[^>]*>\s*(?:\(self\.__next_f|self\.__next_f)[\s\S]*?<\/script>/gi, '')
    .replace(
      /<link\b(?=[^>]*rel="preload")(?=[^>]*as="script")(?=[^>]*href="\/_next\/)[^>]*>/gi,
      '',
    );

  if (!stripped.includes('/navigation.js') || !stripped.includes('application/ld+json')) {
    throw new Error(`Homepage enhancement or structured data was removed from ${artifactPath}`);
  }

  await writeFile(artifactPath, stripped, 'utf8');
  console.log(
    `Removed ${nextScripts.length} runtime scripts and ${flightScripts.length} Flight payloads from ${artifactPath}.`,
  );
}
