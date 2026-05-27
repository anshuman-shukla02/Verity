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

    // Generate SHA256 Hash
    const hashSum = crypto.createHash('sha256');
    hashSum.update(buffer);
    const hexHash = hashSum.digest('hex');
    const hashWithPrefix = '0x' + hexHash;

    // Check if Pinata API keys are set. If not, use a mock CID fallback for local development.
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
      console.warn("Pinata API keys are missing. Using mock IPFS fallback for local development.");
      const mockCid = "QmDevMockCID" + hexHash.substring(0, 32);
      return NextResponse.json({
        success: true,
        hash: hashWithPrefix,
        cid: mockCid,
        message: "WARNING: Pinata credentials not set. Using mock IPFS CID for local test environment!"
      });
    }

    // Upload to Pinata IPFS
    const pinataData = new FormData();
    pinataData.append('file', file);
    
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_API_SECRET,
      },
      body: pinataData,
    });

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text();
      console.error("Pinata Error:", errorText);
      throw new Error("Failed to upload to IPFS via Pinata");
    }

    const pinataResult = await pinataResponse.json();
    const realCid = pinataResult.IpfsHash;

    return NextResponse.json({
      success: true,
      hash: hashWithPrefix,
      cid: realCid,
      message: "File successfully hashed and pinned to IPFS!"
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
