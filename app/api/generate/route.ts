import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const text = data.get("text") as string;
  const logoFile = data.get("logo") as File | null;

  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    const qrBuffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: "H",
      width: 500,
    });

    // If no logo, return QR code directly
    if (!logoFile || logoFile.size === 0) {
      return new NextResponse(qrBuffer, {
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": "inline; filename=qr.png",
        },
      });
    }

    const logoArrayBuffer = await logoFile.arrayBuffer();
    const logoBuffer = Buffer.from(logoArrayBuffer);

    const logoSize = 100;

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

    const qrImage = sharp(qrBuffer);
    const { width, height } = await qrImage.metadata();

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
