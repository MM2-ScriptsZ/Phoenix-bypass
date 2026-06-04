import { put } from '@vercel/blob';

// Generate a dark themed logo using sharp
import sharp from 'sharp';

const width = 256;
const height = 256;

// Create a dark logo with cyan accent - SVG approach
const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </radialGradient>
    <linearGradient id="shield" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#0891b2"/>
    </linearGradient>
  </defs>
  <circle cx="128" cy="128" r="128" fill="url(#bg)"/>
  <circle cx="128" cy="128" r="124" fill="none" stroke="#06b6d4" stroke-width="2" opacity="0.4"/>
  <!-- Shield -->
  <path d="M128 45 L175 75 L175 140 C175 175 128 210 128 210 C128 210 81 175 81 140 L81 75 Z" 
        fill="none" stroke="url(#shield)" stroke-width="3.5" opacity="0.9"/>
  <path d="M128 55 L168 80 L168 138 C168 168 128 198 128 198 C128 198 88 168 88 138 L88 80 Z" 
        fill="#06b6d4" opacity="0.15"/>
  <!-- B letter in shield -->
  <text x="128" y="148" font-family="Arial Black, sans-serif" font-size="60" font-weight="900" 
        fill="#06b6d4" text-anchor="middle" dominant-baseline="middle">B</text>
</svg>`;

const imageBuffer = await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toBuffer();

const blob = await put('bullies-bypasser-logo.jpg', imageBuffer, {
  access: 'public',
  contentType: 'image/jpeg',
});

console.log('Blob URL:', blob.url);

