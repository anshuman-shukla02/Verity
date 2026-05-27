"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, RPC_URL } from "../constants";
import CopyButton from "../components/CopyButton";
import QRScanner from "../components/QRScanner";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [file, setFile] = useState(null);
  const [manualHash, setManualHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("upload"); // "upload" | "hash" | "scan"
  const hasAutoVerified = useRef(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError("");
    }
  };

  const getContract = useCallback(() => {
    let provider;
    if (typeof window !== "undefined" && window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      provider = new ethers.JsonRpcProvider(RPC_URL);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, []);

  const verifyByHash = useCallback(async (hash) => {
    setIsVerifying(true);
    setResult(null);
    setError("");

    try {
      const contract = getContract();
      const hashWithPrefix = hash.startsWith("0x") ? hash : "0x" + hash;
      const cert = await contract.verifyCertificate(hashWithPrefix);

      if (!cert.exists) {
        setResult({
          status: "Invalid",
          icon: "❌",
          message: "This certificate hash was not found on the blockchain. The document may be forged or tampered with.",
        });
      } else if (!cert.isValid) {
        setResult({
          status: "Revoked",
          icon: "⚠️",
          message: "This certificate was issued but has since been revoked by the issuing institution.",
          details: cert,
          hash: hashWithPrefix,
        });
      } else {
        setResult({
          status: "Valid",
          icon: "✅",
          message: "Authenticity confirmed — this document matches the immutable record on the blockchain.",
          details: cert,
          hash: hashWithPrefix,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to verify. Ensure the blockchain node is running and accessible.");
    } finally {
      setIsVerifying(false);
    }
  }, [getContract]);

  // Auto-verify if hash is in URL query params (only once)
  useEffect(() => {
    if (hasAutoVerified.current) return;
    const hashFromUrl = searchParams.get("hash");
    if (hashFromUrl) {
      hasAutoVerified.current = true;
      setManualHash(hashFromUrl);
      setMode("hash");
      verifyByHash(hashFromUrl);
    }
  }, [searchParams, verifyByHash]);

  const handleVerifyFile = async () => {
    if (!file) {
      setError("Please select a file to verify.");
      return;
    }

    setIsVerifying(true);
    setResult(null);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Use the hash-only API route (no IPFS upload)
      const res = await fetch("/api/hash", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      await verifyByHash(data.hash);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to compute file hash.");
      setIsVerifying(false);
    }
  };

  const handleVerifyHash = async () => {
    if (!manualHash) {
      setError("Please enter a hash.");
      return;
    }
    await verifyByHash(manualHash);
  };

  const handleQRScan = (decodedText) => {
    try {
      const url = new URL(decodedText);
      const hash = url.searchParams.get("hash");
      if (hash) {
        setManualHash(hash);
        setMode("hash");
        verifyByHash(hash);
      } else {
        setError("QR code does not contain a valid verification link.");
      }
    } catch {
      // Not a URL — maybe it's a raw hash
      if (decodedText.length >= 64) {
        setManualHash(decodedText);
        setMode("hash");
        verifyByHash(decodedText);
      } else {
        setError("QR code does not contain a valid hash.");
      }
    }
  };

  const statusStyles = {
    Valid: "verify-result-valid",
    Invalid: "verify-result-invalid",
    Revoked: "verify-result-revoked",
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: "center" }}>
        <h1 className="page-title">Verify a Certificate</h1>
        <p className="page-subtitle" style={{ margin: "0 auto 2.5rem" }}>
          Upload a document, enter a hash, or scan a QR code to instantly check its authenticity on the blockchain.
        </p>
      </div>

      <div className="glass-card-static max-w-md mx-auto">
        {/* Mode Tabs */}
        <div className="tabs" style={{ marginBottom: "1.5rem" }}>
          <button
            className={`tab ${mode === "upload" ? "active" : ""}`}
            onClick={() => { setMode("upload"); setResult(null); setError(""); }}
          >
            📄 Upload File
          </button>
          <button
            className={`tab ${mode === "hash" ? "active" : ""}`}
            onClick={() => { setMode("hash"); setResult(null); setError(""); }}
          >
            🔑 Enter Hash
          </button>
          <button
            className={`tab ${mode === "scan" ? "active" : ""}`}
            onClick={() => { setMode("scan"); setResult(null); setError(""); }}
          >
            📷 Scan QR
          </button>
        </div>

        {/* Upload Mode */}
        {mode === "upload" && (
          <div className="animate-fade-in">
            <div className="form-group">
              <div
                className="file-upload"
                onClick={() => document.getElementById("file-upload-verify").click()}
              >
                <input
                  id="file-upload-verify"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                {file ? (
                  <div className="file-upload-selected">📄 {file.name}</div>
                ) : (
                  <>
                    <span className="file-upload-icon">🔍</span>
                    <p className="file-upload-text">Click to upload document for verification</p>
                    <p className="file-upload-hint">PDF, PNG, JPG — Max 10MB</p>
                  </>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={handleVerifyFile}
              disabled={isVerifying || !file}
            >
              {isVerifying ? (
                <>
                  <span className="spinner spinner-sm" /> Verifying...
                </>
              ) : (
                "Verify Authenticity"
              )}
            </button>
          </div>
        )}

        {/* Hash Mode */}
        {mode === "hash" && (
          <div className="animate-fade-in">
            <div className="form-group">
              <label className="form-label">Certificate Hash (SHA-256)</label>
              <input
                type="text"
                className="form-input form-input-mono"
                placeholder="0xb94d27b99..."
                value={manualHash}
                onChange={(e) => setManualHash(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={handleVerifyHash}
              disabled={isVerifying || !manualHash}
            >
              {isVerifying ? (
                <>
                  <span className="spinner spinner-sm" /> Verifying...
                </>
              ) : (
                "Verify Hash"
              )}
            </button>
          </div>
        )}

        {/* QR Scan Mode */}
        {mode === "scan" && (
          <div className="animate-fade-in">
            <QRScanner
              onScan={handleQRScan}
              onError={(msg) => setError(msg)}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="message-box message-error mt-2 animate-fade-in">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`verify-result ${statusStyles[result.status]} animate-fade-in`}>
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <div className="verify-icon">{result.icon}</div>
              <div
                className="verify-status"
                style={{
                  color:
                    result.status === "Valid"
                      ? "var(--success)"
                      : result.status === "Revoked"
                      ? "var(--warning)"
                      : "var(--danger)",
                }}
              >
                {result.status}
              </div>
              <p className="verify-message">{result.message}</p>
            </div>

            {result.details && (
              <div style={{
                paddingTop: "1.25rem",
                borderTop: "1px dashed var(--border-default)",
              }}>
                <h4 style={{
                  color: "var(--text-tertiary)",
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.75rem",
                  fontWeight: "600",
                }}>
                  On-Chain Details
                </h4>

                <div className="detail-grid">
                  <span className="detail-label">Hash</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span className="detail-value-mono">
                      {result.hash.substring(0, 14)}...{result.hash.slice(-8)}
                    </span>
                    <CopyButton text={result.hash} />
                  </div>

                  <span className="detail-label">Issuer</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span className="detail-value-mono">
                      {result.details.issuer.substring(0, 8)}...{result.details.issuer.substring(result.details.issuer.length - 6)}
                    </span>
                    <CopyButton text={result.details.issuer} />
                  </div>

                  <span className="detail-label">IPFS CID</span>
                  <div className="detail-value">
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${result.details.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-value-mono"
                      style={{
                        color: "var(--text-link)",
                        textDecoration: "underline",
                        textDecorationColor: "var(--primary-200)",
                        textUnderlineOffset: "2px",
                      }}
                    >
                      {result.details.cid.substring(0, 12)}...{result.details.cid.substring(result.details.cid.length - 10)}
                    </a>
                  </div>

                  <span className="detail-label">Issued On</span>
                  <span className="detail-value">
                    {new Date(Number(result.details.timestamp) * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="container animate-fade-in" style={{ textAlign: "center" }}>
        <h1 className="page-title">Verify a Certificate</h1>
        <p className="page-subtitle" style={{ margin: "0 auto" }}>Loading...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
