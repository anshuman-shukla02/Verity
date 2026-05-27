import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 413 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: PDF, PNG, JPG." }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate SHA256 Hash only — no IPFS upload
    const hashSum = crypto.createHash('sha256');
    hashSum.update(buffer);
    const hexHash = hashSum.digest('hex');
    const hashWithPrefix = '0x' + hexHash;

    return NextResponse.json({
      success: true,
      hash: hashWithPrefix,
    });

  } catch (error) {
    console.error("Hash Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
