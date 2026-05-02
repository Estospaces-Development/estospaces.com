import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import sharp from 'sharp';

const DEFAULT_OUTPUT_DIR = 'public/blog-images';
const HERO_VERSION = 'v8';
const POSTS_PER_DATE_GROUP = 4;
const TARGET_POST_COUNT = 100;
const BASE_IMAGE_PROFILES = [
  { path: 'public/blog-base-images/compliance.png', focusX: 0.18, focusY: 0.44, zoom: 1.06 },
  { path: 'public/blog-base-images/local-renting.png', focusX: 0.24, focusY: 0.36, zoom: 1.08 },
  { path: 'public/blog-base-images/buying-selling.png', focusX: 0.24, focusY: 0.42, zoom: 1.08 },
  { path: 'public/blog-base-images/agents-tech.png', focusX: 0.22, focusY: 0.54, zoom: 1.10 },
  { path: 'public/blog-base-images/investment-data.png', focusX: 0.26, focusY: 0.38, zoom: 1.08 },
  { path: 'public/assets/modern-apartment.png', focusX: 0.50, focusY: 0.44, zoom: 1.00 },
  { path: 'public/blog-base-images/compliance.png', focusX: 0.78, focusY: 0.50, zoom: 1.34 },
  { path: 'public/blog-base-images/local-renting.png', focusX: 0.76, focusY: 0.54, zoom: 1.34 },
  { path: 'public/blog-base-images/buying-selling.png', focusX: 0.74, focusY: 0.48, zoom: 1.30 },
  { path: 'public/blog-base-images/agents-tech.png', focusX: 0.78, focusY: 0.46, zoom: 1.36 },
  { path: 'public/blog-base-images/investment-data.png', focusX: 0.74, focusY: 0.52, zoom: 1.34 },
  { path: 'public/assets/modern-apartment.png', focusX: 0.28, focusY: 0.52, zoom: 1.22 },
];

export async function generateBlogHeroImage(post, { outputDir = DEFAULT_OUTPUT_DIR } = {}) {
  const fileName = `${post.slug}-hero-photo-${HERO_VERSION}.webp`;
  const seed = hashNumber(post.slug);
  const numericId = postNumber(post, seed);
  const canvas = { width: 1600, height: 900 };
  const baseProfile = baseImageProfile(post, seed);
  const source = {
    width: Math.round(2320 * baseProfile.zoom),
    height: Math.round(1305 * baseProfile.zoom),
  };

  let image = sharp(basePath(post, seed))
    .resize(source.width, source.height, { fit: 'cover' })
    .extract(cropWindow(seed, source.width, source.height, canvas.width, canvas.height, baseProfile))
    .modulate({
      brightness: 0.95 + ((seed % 11) / 100),
      saturation: 0.96 + (((seed >>> 4) % 15) / 100),
      hue: (seed % 13) - 6,
    });

  if (numericId % 2 === 0) image = image.flop();

  const bytes = await image
    .sharpen({ sigma: 0.45 })
    .webp({ quality: 90, effort: 5 })
    .toBuffer();

  const absoluteOutputDir = resolve(process.cwd(), outputDir);
  await mkdir(absoluteOutputDir, { recursive: true });
  await writeFile(resolve(absoluteOutputDir, fileName), bytes);

  return {
    bytes,
    fileName,
    contentType: 'image/webp',
    localUrl: `/blog-images/${fileName}`,
    gcpPath: `blogs/${post.slug}/${fileName}`,
  };
}

function basePath(post, seed) {
  return resolve(process.cwd(), baseImageProfile(post, seed).path);
}

function baseImageProfile(post, seed) {
  return BASE_IMAGE_PROFILES[baseImageIndex(post, seed)];
}

function baseImageIndex(post, seed) {
  const rank = listingRank(post, seed);
  const sourceIndex = rank % 6;
  const cropVariant = Math.floor(rank / 6) % 2;
  return sourceIndex + (cropVariant * 6);
}

function postNumber(post, seed) {
  return Number.parseInt(String(post.id || '').replace(/\D/g, ''), 10) || ((seed % 100) + 1);
}

function listingRank(post, seed) {
  const number = postNumber(post, seed);
  const maxGroup = Math.floor((TARGET_POST_COUNT - 1) / POSTS_PER_DATE_GROUP);
  const dateGroup = Math.floor((number - 1) / POSTS_PER_DATE_GROUP);
  const withinGroup = (number - 1) % POSTS_PER_DATE_GROUP;
  return Math.max(0, ((maxGroup - dateGroup) * POSTS_PER_DATE_GROUP) + withinGroup);
}

function cropWindow(seed, sourceWidth, sourceHeight, width, height, baseProfile) {
  const maxLeft = sourceWidth - width;
  const maxTop = sourceHeight - height;
  const jitterX = (((seed >>> 11) % 101) - 50) / 100;
  const jitterY = (((seed >>> 17) % 101) - 50) / 100;
  const focusX = clamp(baseProfile.focusX + jitterX * 0.08, 0, 1);
  const focusY = clamp(baseProfile.focusY + jitterY * 0.08, 0, 1);
  return {
    left: Math.round(maxLeft * focusX),
    top: Math.round(maxTop * focusY),
    width,
    height,
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashNumber(value) {
  return createHash('sha256').update(value).digest().readUInt32BE(0);
}
