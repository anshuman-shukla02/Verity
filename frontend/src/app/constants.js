// Try to load the auto-generated deployed address from the deploy script
let deployedAddress = null;
try {
  // Dynamic import of the auto-generated file from deploy script
  const addressData = require("./deployed-address.json");
  deployedAddress = addressData.address;
} catch {
  // File doesn't exist yet — use env var or default
}

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  deployedAddress ||
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Fallback for local Hardhat

export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:8545";

export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID || "0x7a69"; // 31337 in hex (Hardhat)

export const CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function admins(address) view returns (bool)",
  "function certificates(string) view returns (string cid, address issuer, uint256 timestamp, bool isValid, bool exists)",
  "function addAdmin(address _admin)",
  "function removeAdmin(address _admin)",
  "function issueCertificate(string calldata _hash, string calldata _cid)",
  "function revokeCertificate(string calldata _hash)",
  "function verifyCertificate(string calldata _hash) view returns (bool exists, bool isValid, string cid, address issuer, uint256 timestamp)",
  "event CertificateIssued(string hash, string cid, address issuer, uint256 timestamp)",
  "event CertificateRevoked(string hash, address issuer, uint256 timestamp)"
];
