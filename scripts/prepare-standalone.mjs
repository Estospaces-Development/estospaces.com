import { cp, mkdir, rm, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const standaloneDir = resolve(process.cwd(), '.next/standalone');
const publicSource = resolve(process.cwd(), 'public');
const publicTarget = resolve(standaloneDir, 'public');
const staticSource = resolve(process.cwd(), '.next/static');
const staticTarget = resolve(standaloneDir, '.next/static');

await assertDirectory(standaloneDir);
await copyDirectory(publicSource, publicTarget);
await copyDirectory(staticSource, staticTarget);

console.log('Prepared standalone public and static assets.');

async function copyDirectory(source, target) {
  await assertDirectory(source);
  await mkdir(resolve(target, '..'), { recursive: true });
  await rm(target, { recursive: true, force: true });
  await cp(source, target, { recursive: true });
}

async function assertDirectory(path) {
  const entry = await stat(path);
  if (!entry.isDirectory()) {
    throw new Error(`${path} is not a directory.`);
  }
}
