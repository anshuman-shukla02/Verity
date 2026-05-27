"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI, RPC_URL } from "../constants";
import CopyButton from "../components/CopyButton";
import QRGenerator from "../components/QRGenerator";

export default function StudentPage() {
  const [hash, setHash] = useState("");
  const [certData, setCertData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!hash) return;

    setIsLoading(true);
    setCertData(null);
    setError("");

    try {
      let provider;
      if (typeof window !== "undefined" && window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.JsonRpcProvider(RPC_URL);
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const hashWithPrefix = hash.startsWith("0x") ? hash : "0x" + hash;
      const cert = await contract.verifyCertificate(hashWithPrefix);

      if (!cert.exists) {
        setError("Certificate not found. Please check the hash and try again.");
      } else {
        setCertData({
          cid: cert.cid,
          issuer: cert.issuer,
          timestamp: cert.timestamp,
          isValid: cert.isValid,
          hash: hashWithPrefix,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch certificate. Ensure the blockchain is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && hash) {
      handleSearch();
    }
  };

  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: "center" }}>
        <h1 className="page-title">Student Portal</h1>
        <p className="page-subtitle" style={{ margin: "0 auto 2.5rem" }}>
          Access and share your verifiable digital certificates.
        </p>
      </div>

      {/* Search */}
      <div className="glass-card-static max-w-md mx-auto">
        <div className="form-group">
          <label className="form-label">Certificate Hash (SHA256)</label>
          <input
            type="text"
            className="form-input form-input-mono"
            placeholder="e.g. 0xb94d27b99..."
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={handleSearch}
          disabled={isLoading || !hash}
        >
          {isLoading ? (
            <>
              <span className="spinner spinner-sm" /> Searching...
            </>
          ) : (
            "🔍 Find Certificate"
          )}
        </button>

        {error && (
          <div className="message-box message-error mt-2 animate-fade-in">
            {error}
          </div>
        )}

        {/* Certificate Details */}
        {certData && (
          <div className="animate-fade-in mt-3">
            <h3 className="section-title" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
              <span className="icon">📜</span> Certificate Details
            </h3>

            <div style={{
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              border: "1px solid var(--border-default)",
            }}>
              {/* Status */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
                <span className={`badge ${certData.isValid ? "badge-success" : "badge-danger"}`} style={{ fontSize: "0.85rem", padding: "0.35rem 1rem" }}>
                  <span className={`status-dot ${certData.isValid ? "status-dot-success" : "status-dot-danger"}`} />
                  {certData.isValid ? "Valid Certificate" : "Revoked Certificate"}
                </span>
              </div>

              {/* Details Grid */}
              <div className="detail-grid">
                <span className="detail-label">Issuer</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span className="detail-value-mono">{certData.issuer}</span>
                  <CopyButton text={certData.issuer} />
                </div>

                <span className="detail-label">Issued On</span>
                <span className="detail-value">
                  {new Date(Number(certData.timestamp) * 1000).toLocaleString()}
                </span>

                <span className="detail-label">IPFS CID</span>
                <div className="detail-value">
                  <a
                    href={`https://gateway.pinata.cloud/ipfs/${certData.cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {certData.cid}
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
                <a
                  href={`https://gateway.pinata.cloud/ipfs/${certData.cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  🌐 View on IPFS
                </a>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    const url = `${window.location.origin}/verify?hash=${certData.hash}`;
                    if (navigator.share) {
                      navigator.share({ title: "Certificate Verification", url });
                    } else {
                      navigator.clipboard.writeText(url);
                    }
                  }}
                >
                  🔗 Share Link
                </button>
              </div>

              {/* QR Code */}
              <div className="mt-3" style={{ textAlign: "center" }}>
                <p className="text-xs text-muted mb-2">Verification QR Code</p>
                <QRGenerator
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify?hash=${certData.hash}`}
                  size={160}
                  label="Scan to verify"
                />
              </div>

              {/* Mock Preview */}
              {certData.cid.startsWith("QmDevMockCID") ? (
                <div className="cert-preview mt-3">
                  <div className="cert-preview-title">Digital Certificate</div>
                  <div className="cert-preview-subtitle">
                    Verified and secured on the blockchain
                  </div>
                  <hr className="cert-preview-divider" />
                  <div className="cert-preview-label">Verification Hash</div>
                  <div className="cert-preview-value">{certData.hash}</div>
                  <div className="cert-preview-label">Issuer Address</div>
                  <div className="cert-preview-value" style={{ color: "var(--success)" }}>
                    {certData.issuer}
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <h4 className="text-xs text-muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                    Document Preview
                  </h4>
                  <iframe
                    src={`https://gateway.pinata.cloud/ipfs/${certData.cid}`}
                    style={{
                      width: "100%",
                      height: "400px",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      background: "white",
                    }}
                    title="Certificate Preview"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
