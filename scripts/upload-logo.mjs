import { put } from '@vercel/blob';
import { readFileSync } from 'fs';

const filePath = '/vercel/share/v0-project/public/bullies-bypasser-logo.jpg';
const fileBuffer = readFileSync(filePath);

const blob = await put('bullies-bypasser-logo.jpg', fileBuffer, {
  access: 'public',
  contentType: 'image/jpeg',
});

console.log('Uploaded! Public URL:', blob.url);
