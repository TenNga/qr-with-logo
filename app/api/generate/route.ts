import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const text = data.get("text") as string;
  const logoFile = data.get("logo") as File;

  if (!text || !logoFile) {
    return NextResponse.json({ error: "Missing text or logo file" }, { status: 400 });
  }

  try {
    // Generate base QR code
    const qrBuffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: "H", // High to tolerate logo overlay
      width: 500,
      margin: 2,
    });

    const qrImage = sharp(qrBuffer);
    const { width, height } = await qrImage.metadata();

    const logoArrayBuffer = await logoFile.arrayBuffer();
    const logoBuffer = Buffer.from(logoArrayBuffer);

    const logoSize = 100;

    // Create a white square background for logo
    const whiteBox = await sharp({
      create: {
        width: logoSize + 10,
        height: logoSize + 10,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    }).png().toBuffer();

    const resizedLogo = await sharp(logoBuffer)
      .resize(logoSize, logoSize)
      .png()
      .toBuffer();

    // Composite QR + white square + logo
    const finalImage = await qrImage
      .composite([
        {
          input: whiteBox,
          top: Math.floor((height! - logoSize - 10) / 2),
          left: Math.floor((width! - logoSize - 10) / 2),
        },
        {
          input: resizedLogo,
          top: Math.floor((height! - logoSize) / 2),
          left: Math.floor((width! - logoSize) / 2),
        },
      ])
      .png()
      .toBuffer();

    return new NextResponse(finalImage, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "inline; filename=qr.png",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
