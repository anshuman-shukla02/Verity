"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants";
import CopyButton from "../components/CopyButton";
import StatsCards from "../components/StatsCards";
import QRGenerator from "../components/QRGenerator";
import { useToast } from "../components/Toast";

export default function AdminPage() {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("issue");
  const [file, setFile] = useState(null);
  const [account, setAccount] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);

  // Revocation State
  const [revokeHash, setRevokeHash] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);

  // History State
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Role State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [checkingRole, setCheckingRole] = useState(false);

  // Admin Management State (Owner Only)
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Last issued cert for QR display
  const [lastIssuedHash, setLastIssuedHash] = useState(null);

  // Contract reference for stats
  const [contract, setContract] = useState(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);

  const checkRole = useCallback(async (currentAccount) => {
    if (!currentAccount) {
      setIsAdmin(false);
      setIsOwner(false);
      return;
    }
    setCheckingRole(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      setContract(c);

      const ownerAddress = await c.owner();
      const isUserAdmin = await c.admins(currentAccount);

      setIsOwner(ownerAddress.toLowerCase() === currentAccount.toLowerCase());
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error("Error checking roles:", error);
    } finally {
      setCheckingRole(false);
    }
  }, []);

  const fetchHistory = useCallback(async (currentAccount) => {
    if (!currentAccount) return;
    setIsLoadingHistory(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const filter = c.filters.CertificateIssued();
      const allEvents = await c.queryFilter(filter);
      const events = allEvents.filter(
        (e) => e.args[2].toLowerCase() === currentAccount.toLowerCase()
      );

      const historyData = await Promise.all(
        events.map(async (event) => {
          const cert = await c.verifyCertificate(event.args[0]);
          return {
            hash: event.args[0],
            cid: event.args[1],
            timestamp: Number(event.args[3]),
            isValid: cert.isValid,
          };
        })
      );

      historyData.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const handleAddAdmin = async () => {
    if (!newAdminAddress) {
      toast.warning("Missing Address", "Please enter an address to add.");
      return;
    }
    setIsAddingAdmin(true);
    toast.info("Transaction Pending", "Submitting transaction to add admin...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await c.addAdmin(newAdminAddress);
      await tx.wait();
      toast.success("Admin Added", `${newAdminAddress.substring(0, 6)}...${newAdminAddress.substring(newAdminAddress.length - 4)} is now an admin.`);
      setNewAdminAddress("");
    } catch (error) {
      console.error(error);
      toast.error("Transaction Failed", error.reason || error.message || "Unknown error");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!newAdminAddress) {
      toast.warning("Missing Address", "Please enter an address to remove.");
      return;
    }
    setIsAddingAdmin(true);
    toast.info("Transaction Pending", "Submitting transaction to remove admin...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await c.removeAdmin(newAdminAddress);
      await tx.wait();
      toast.success("Admin Removed", `${newAdminAddress.substring(0, 6)}...${newAdminAddress.substring(newAdminAddress.length - 4)} has been removed.`);
      setNewAdminAddress("");
    } catch (error) {
      console.error(error);
      toast.error("Transaction Failed", error.reason || error.message || "Unknown error");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        checkRole(accounts[0]);

        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x7a69" }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x7a69",
                    chainName: "Hardhat Localhost",
                    rpcUrls: ["http://127.0.0.1:8545/"],
                    nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
                  },
                ],
              });
            } catch (addError) {
              console.error("Error adding network", addError);
            }
          }
        }

        toast.success("Wallet Connected", `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`);
      } catch (error) {
        console.error("Wallet connection failed", error);
        toast.error("Connection Failed", "Please try again.");
      }
    } else {
      toast.error("No Wallet Found", "Please install MetaMask or another Web3 wallet.");
    }
  };

  const checkIfWalletIsConnected = useCallback(async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkRole(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection", error);
      }
    }
  }, [checkRole]);

  // Fix 1.5: Proper cleanup for MetaMask event listeners
  useEffect(() => {
    setMounted(true);
    checkIfWalletIsConnected();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount("");
        setHistory([]);
        setIsAdmin(false);
        setIsOwner(false);
      }
    };

    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, [checkIfWalletIsConnected]);

  // Fix 1.4: Proper dependencies
  useEffect(() => {
    if (account) {
      fetchHistory(account);
      checkRole(account);
    } else {
      setIsAdmin(false);
      setIsOwner(false);
    }
  }, [account, fetchHistory, checkRole]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
      if (allowedTypes.includes(dropped.type)) {
        setFile(dropped);
      } else {
        toast.warning("Invalid File", "Only PDF, PNG, and JPG files are allowed.");
      }
    }
  };

  const handleIssue = async () => {
    if (!file) {
      toast.warning("No File", "Please select a file first.");
      return;
    }
    if (!account) {
      toast.warning("No Wallet", "Please connect your wallet.");
      return;
    }

    setIsIssuing(true);
    setLastIssuedHash(null);
    toast.info("Uploading", "Uploading to IPFS and generating hash...");

    try {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7a69" }],
        });
      } catch (switchError) {
        console.error("Network switch failed", switchError);
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast.info("Signing", "Pinned to IPFS. Signing transaction...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await c.issueCertificate(data.hash, data.cid);
      await tx.wait();

      setLastIssuedHash(data.hash);
      toast.success("Certificate Issued!", `CID: ${data.cid.substring(0, 16)}...`);
      setFile(null);
      fetchHistory(account);
    } catch (error) {
      console.error(error);
      toast.error("Issuance Failed", error.reason || error.message || "Unknown error");
    } finally {
      setIsIssuing(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeHash) {
      toast.warning("No Hash", "Please enter a hash to revoke.");
      return;
    }
    if (!account) {
      toast.warning("No Wallet", "Please connect your wallet.");
      return;
    }

    setIsRevoking(true);
    toast.info("Revoking", "Initiating revocation...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const hashWithPrefix = revokeHash.startsWith("0x") ? revokeHash : "0x" + revokeHash;

      const tx = await c.revokeCertificate(hashWithPrefix);
      await tx.wait();

      toast.success("Revoked", "Certificate successfully revoked!");
      setRevokeHash("");
      fetchHistory(account);
    } catch (error) {
      console.error(error);
      toast.error("Revocation Failed", error.reason || error.message || "Unknown error");
    } finally {
      setIsRevoking(false);
    }
  };

  if (!mounted) return null;

  const tabs = [
    { id: "issue", label: "📤 Issue", show: true },
    { id: "revoke", label: "🚫 Revoke", show: true },
    { id: "history", label: "📜 History", show: true },
    { id: "admins", label: "👑 Admin Mgmt", show: isOwner },
  ];

  return (
    <div className="container animate-fade-in">
      <h1 className="page-title" style={{ textAlign: "center" }}>
        Institution Dashboard
      </h1>
      <p className="page-subtitle" style={{ textAlign: "center", margin: "0 auto 2rem" }}>
        Issue, revoke, and manage tamper-proof certificates secured by blockchain.
      </p>

      {/* Wallet Banner */}
      <div className="wallet-banner max-w-xl mx-auto">
        <div className="wallet-info">
          <div
            className={`status-dot ${account ? "status-dot-success" : "status-dot-danger"}`}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              {account ? "Wallet Connected" : "Not Connected"}
            </div>
            {account && (
              <div className="wallet-address">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
                <CopyButton text={account} />
              </div>
            )}
          </div>
        </div>
        <div className="wallet-role">
          {checkingRole ? (
            <span className="badge badge-neutral">Checking...</span>
          ) : account ? (
            <>
              {isOwner && <span className="badge badge-info">👑 Owner</span>}
              {isAdmin && <span className="badge badge-success">✅ Admin</span>}
              {!isAdmin && !isOwner && (
                <span className="badge badge-danger">⚠️ Not Admin</span>
              )}
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {/* Access Warning */}
      {account && !checkingRole && !isAdmin && !isOwner && (
        <div className="alert alert-danger max-w-xl mx-auto">
          <span className="alert-icon">⚠️</span>
          <div>
            <strong>Not an Authorized Admin</strong>
            <p className="text-sm mt-1">
              Your connected wallet is not registered as an authorized admin. You
              will not be able to issue or revoke certificates.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-xl mx-auto">
        <StatsCards contract={contract} />
      </div>

      {/* Tabs */}
      <div className="max-w-xl mx-auto">
        <div className="tabs">
          {tabs
            .filter((t) => t.show)
            .map((t) => (
              <button
                key={t.id}
                className={`tab ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
        </div>

        {/* Issue Tab */}
        {activeTab === "issue" && (
          <div className="glass-card-static animate-fade-in">
            <h2 className="section-title">
              <span className="icon">📤</span> Issue Certificate
            </h2>

            <div className="form-group">
              <label className="form-label">Upload Document</label>
              <div
                className={`file-upload ${isDragging ? "file-upload-active" : ""}`}
                onClick={() => document.getElementById("file-upload").click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input
                  id="file-upload"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                {file ? (
                  <div className="file-upload-selected">📄 {file.name}</div>
                ) : (
                  <>
                    <span className="file-upload-icon">📁</span>
                    <p className="file-upload-text">
                      Click or drag a file to upload
                    </p>
                    <p className="file-upload-hint">
                      Supported: PDF, PNG, JPG (max 10MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary w-full mt-1"
              onClick={handleIssue}
              disabled={isIssuing || !file || !account}
            >
              {isIssuing ? (
                <>
                  <span className="spinner spinner-sm" /> Issuing...
                </>
              ) : (
                "Issue Certificate"
              )}
            </button>

            {lastIssuedHash && (
              <div className="mt-3 animate-fade-in" style={{ textAlign: "center" }}>
                <p className="text-sm text-muted mb-1">
                  Share this QR code — it links directly to verification:
                </p>
                <QRGenerator
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/verify?hash=${lastIssuedHash}`}
                  size={180}
                />
                <div className="mt-1" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                  <span className="font-mono text-xs text-muted truncate" style={{ maxWidth: 200 }}>
                    {lastIssuedHash}
                  </span>
                  <CopyButton text={lastIssuedHash} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revoke Tab */}
        {activeTab === "revoke" && (
          <div className="glass-card-static animate-fade-in">
            <h2 className="section-title">
              <span className="icon">🚫</span> Revoke Certificate
            </h2>

            <div className="form-group">
              <label className="form-label">Certificate Hash (SHA256)</label>
              <input
                type="text"
                className="form-input form-input-mono"
                placeholder="e.g. 0xb94d27b99..."
                value={revokeHash}
                onChange={(e) => setRevokeHash(e.target.value)}
              />
            </div>

            <button
              className="btn btn-danger w-full mt-1"
              onClick={handleRevoke}
              disabled={isRevoking || !revokeHash || !account}
            >
              {isRevoking ? (
                <>
                  <span className="spinner spinner-sm" /> Revoking...
                </>
              ) : (
                "Revoke Certificate"
              )}
            </button>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="glass-card-static animate-fade-in">
            <h2 className="section-title justify-between">
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="icon">📜</span> Issued History
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => fetchHistory(account)}
                disabled={isLoadingHistory || !account}
              >
                ↻ Refresh
              </button>
            </h2>

            {!account ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔗</div>
                <p className="empty-state-text">Connect your wallet to view history.</p>
              </div>
            ) : isLoadingHistory ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton skeleton-card" style={{ height: 48 }} />
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p className="empty-state-text">No certificates issued yet.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Hash</th>
                      <th>IPFS CID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((cert, i) => (
                      <tr key={i}>
                        <td>
                          {new Date(cert.timestamp * 1000).toLocaleDateString()}
                        </td>
                        <td>
                          <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            {cert.hash.substring(0, 10)}...
                            {cert.hash.substring(cert.hash.length - 6)}
                            <CopyButton text={cert.hash} />
                          </span>
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                            <a
                              href={`https://gateway.pinata.cloud/ipfs/${cert.cid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mono"
                              style={{
                                color: "var(--text-link)",
                                textDecoration: "underline",
                                textDecorationColor: "var(--primary-200)",
                                textUnderlineOffset: "2px",
                              }}
                            >
                              {cert.cid.substring(0, 12)}...
                            </a>
                            <CopyButton text={cert.cid} />
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              cert.isValid ? "badge-success" : "badge-danger"
                            }`}
                          >
                            <span
                              className={`status-dot ${
                                cert.isValid
                                  ? "status-dot-success"
                                  : "status-dot-danger"
                              }`}
                            />
                            {cert.isValid ? "Valid" : "Revoked"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Admin Management Tab */}
        {activeTab === "admins" && isOwner && (
          <div className="glass-card-static animate-fade-in">
            <h2 className="section-title">
              <span className="icon">👑</span> Admin Management
            </h2>
            <p className="text-sm text-muted mb-3">
              As the contract owner, you can register or remove institution wallets
              as authorized admins.
            </p>

            <div className="form-group">
              <label className="form-label">Wallet Address</label>
              <input
                type="text"
                className="form-input form-input-mono"
                placeholder="e.g. 0x70997970C518..."
                value={newAdminAddress}
                onChange={(e) => setNewAdminAddress(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleAddAdmin}
                disabled={isAddingAdmin || !newAdminAddress}
              >
                {isAddingAdmin ? (
                  <>
                    <span className="spinner spinner-sm" /> Processing...
                  </>
                ) : (
                  "Add Admin"
                )}
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={handleRemoveAdmin}
                disabled={isAddingAdmin || !newAdminAddress}
              >
                Remove Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
