"use client";

import { useEffect, useRef, useState } from "react";

export default function QRScanner({ onScan, onError }) {
  const [scanning, setScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameraInUse, setCameraInUse] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startScanner = async () => {
    // Reset state before trying to start
    setPermissionDenied(false);
    setCameraInUse(false);
    setHasCamera(true);
    if (onError) onError("");

    try {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");
      
      const scannerId = "qr-scanner-" + Date.now();
      if (scannerRef.current) {
        scannerRef.current.id = scannerId;
      }

      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {
          // QR code not found in frame - ignore
        }
      );

      setScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      const errMsg = err.message || "";
      const isPermissionError = 
        err.name === "NotAllowedError" || 
        errMsg.includes("Permission") || 
        errMsg.includes("Allowed") || 
        errMsg.includes("dismissed");
        
      const isAlreadyInUse = 
        err.name === "NotReadableError" || 
        errMsg.includes("in use") || 
        errMsg.includes("Readable") || 
        errMsg.includes("Could not start video source");

      if (isPermissionError) {
        setPermissionDenied(true);
      } else if (isAlreadyInUse) {
        setCameraInUse(true);
      } else {
        setHasCamera(false);
      }

      if (onError) onError(errMsg || "Failed to access camera");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {
        // Ignore cleanup errors
      }
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center gap-4 text-center p-4">
        <div className="alert alert-warning w-full">
          <span className="alert-icon">🔒</span>
          <div className="text-left" style={{ flex: 1 }}>
            <strong>Camera Permission Required</strong>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Verity requires camera permission to scan QR codes. Access was denied or dismissed.
            </p>
          </div>
        </div>
        
        <div className="text-xs text-secondary w-full" style={{ color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}>
          <p className="font-semibold mb-2" style={{ textAlign: "left", color: "var(--text-primary)" }}>How to enable camera access:</p>
          <ol className="list-decimal list-inside text-left space-y-2" style={{ paddingLeft: "0.25rem" }}>
            <li>Click the **lock/settings icon** next to the URL in your browser's address bar.</li>
            <li>Locate **Camera** in the list and toggle/change it to **Allow**.</li>
            <li>Click the retry button below or refresh the page.</li>
          </ol>
        </div>

        <button className="btn btn-primary btn-sm mt-2" onClick={startScanner}>
          🔄 Request Permission Again
        </button>
      </div>
    );
  }

  if (cameraInUse) {
    return (
      <div className="flex flex-col items-center gap-4 text-center p-4">
        <div className="alert alert-danger w-full">
          <span className="alert-icon">📹</span>
          <div className="text-left" style={{ flex: 1 }}>
            <strong>Camera in Use</strong>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Another application, tab, or process is currently accessing your camera device.
            </p>
          </div>
        </div>
        
        <div className="text-xs text-secondary w-full" style={{ color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)" }}>
          <p className="font-semibold mb-2" style={{ textAlign: "left", color: "var(--text-primary)" }}>How to resolve:</p>
          <ul className="list-disc list-inside text-left space-y-2" style={{ paddingLeft: "0.25rem" }}>
            <li>Close any other browser tabs or apps (like Zoom, Teams, Meet) using the camera.</li>
            <li>Click the retry button below to re-initiate the connection.</li>
          </ul>
        </div>

        <button className="btn btn-primary btn-sm mt-2" onClick={startScanner}>
          🔄 Retry Camera Connection
        </button>
      </div>
    );
  }

  if (!hasCamera) {
    return (
      <div className="flex flex-col items-center gap-4 text-center p-4">
        <div className="alert alert-warning w-full">
          <span className="alert-icon">📷</span>
          <div className="text-left" style={{ flex: 1 }}>
            <strong>Camera Not Available</strong>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              No camera device was detected, or the environment does not support secure camera access (e.g. non-HTTPS).
            </p>
          </div>
        </div>
        <p className="text-xs text-secondary" style={{ color: "var(--text-secondary)" }}>
          Please use the **Upload File** or **Enter Hash** tabs to verify certificates instead.
        </p>
        <button className="btn btn-secondary btn-sm" onClick={startScanner}>
          🔄 Retry Hardware Detection
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={scannerRef}
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background: "var(--bg-secondary)",
          minHeight: scanning ? "auto" : "0",
          border: scanning ? "2px solid var(--primary-200)" : "none",
        }}
      />
      <button
        className={`btn ${scanning ? "btn-danger" : "btn-primary"} btn-sm`}
        onClick={scanning ? stopScanner : startScanner}
        style={{ transition: "all var(--transition-fast)" }}
      >
        {scanning ? "⏹ Stop Scanner" : "📷 Scan QR Code"}
      </button>
    </div>
  );
}
