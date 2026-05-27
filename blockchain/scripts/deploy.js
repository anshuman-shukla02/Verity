import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const CertificateStorage = await hre.ethers.getContractFactory("CertificateStorage");
  const certificateStorage = await CertificateStorage.deploy();

  await certificateStorage.waitForDeployment();

  const deployedAddress = await certificateStorage.getAddress();
  console.log("CertificateStorage deployed to:", deployedAddress);

  // Auto-write deployed address to frontend constants file
  const addressData = {
    address: deployedAddress,
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  const outputPath = path.resolve(__dirname, "../../frontend/src/app/deployed-address.json");
  fs.writeFileSync(outputPath, JSON.stringify(addressData, null, 2));
  console.log(`\nDeployed address written to: ${outputPath}`);
  console.log("Frontend will auto-detect this address on next reload.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
