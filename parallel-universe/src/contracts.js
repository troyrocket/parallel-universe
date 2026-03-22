import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load ABIs from artifacts
function loadABI(contractName) {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return artifact.abi;
}

// Load deployed addresses
function loadAddresses() {
  const addrPath = path.join(__dirname, "addresses.json");
  if (!fs.existsSync(addrPath)) {
    throw new Error("No addresses.json found. Deploy contracts first.");
  }
  return JSON.parse(fs.readFileSync(addrPath, "utf8"));
}

export function getContracts(signer) {
  const addresses = loadAddresses();

  const identity = new ethers.Contract(addresses.identity, loadABI("Identity"), signer);
  const creditScore = new ethers.Contract(addresses.creditScore, loadABI("CreditScore"), signer);
  const guardrails = new ethers.Contract(addresses.guardrails, loadABI("Guardrails"), signer);
  const lendingPool = new ethers.Contract(addresses.lendingPool, loadABI("LendingPool"), signer);
  const revenueEscrow = addresses.revenueEscrow
    ? new ethers.Contract(addresses.revenueEscrow, loadABI("RevenueEscrow"), signer)
    : null;

  return { identity, creditScore, guardrails, lendingPool, revenueEscrow, addresses };
}

export { loadAddresses };
