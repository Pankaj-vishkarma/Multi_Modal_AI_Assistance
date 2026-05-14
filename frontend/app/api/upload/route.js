import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Generate unique filename
    const buffer = await file.arrayBuffer();
    const filename = `${randomBytes(16).toString('hex')}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, Buffer.from(buffer));

    // Return file info
    return new Response(
      JSON.stringify({
        url: `/uploads/${filename}`,
        name: file.name,
        size: file.size,
        type: file.type,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Upload failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
