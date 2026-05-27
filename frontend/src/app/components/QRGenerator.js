"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QRGenerator({ value, size = 200, label = "Scan to Verify" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;

    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: {
        dark: "#1e3a5f",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    }).catch(console.error);
  }, [value, size]);

  if (!value) return null;

  return (
    <div className="qr-container">
      <canvas ref={canvasRef} />
      <span className="qr-label">{label}</span>
    </div>
  );
}
