import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'bullies-bypasser-logo.jpg');
    const fileBuffer = readFileSync(filePath);

    const blob = await put('bullies-bypasser-logo.jpg', fileBuffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
