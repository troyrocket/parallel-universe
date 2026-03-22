import "dotenv/config";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo";
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

  if (!privateKey) {
    console.error("Set DEPLOYER_PRIVATE_KEY env var");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const deployer = new ethers.Wallet(privateKey, provider);
  console.log("Deploying from:", deployer.address);

  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");

  function loadContract(name) {
    const artifactPath = path.join(artifactsDir, `${name}.sol`, `${name}.json`);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return { abi: artifact.abi, bytecode: artifact.bytecode };
  }

  // 1. Deploy Identity
  console.log("\nDeploying Identity...");
  const identity = loadContract("Identity");
  const IdentityFactory = new ethers.ContractFactory(identity.abi, identity.bytecode, deployer);
  const identityContract = await IdentityFactory.deploy();
  await identityContract.waitForDeployment();
  const identityAddr = await identityContract.getAddress();
  console.log("  Identity:", identityAddr);

  // 2. Deploy CreditScore
  console.log("Deploying CreditScore...");
  const credit = loadContract("CreditScore");
  const CreditFactory = new ethers.ContractFactory(credit.abi, credit.bytecode, deployer);
  const creditContract = await CreditFactory.deploy(identityAddr);
  await creditContract.waitForDeployment();
  const creditAddr = await creditContract.getAddress();
  console.log("  CreditScore:", creditAddr);

  // 3. Deploy Guardrails
  console.log("Deploying Guardrails...");
  const guardrails = loadContract("Guardrails");
  const GuardrailsFactory = new ethers.ContractFactory(guardrails.abi, guardrails.bytecode, deployer);
  const guardrailsContract = await GuardrailsFactory.deploy(creditAddr, identityAddr);
  await guardrailsContract.waitForDeployment();
  const guardrailsAddr = await guardrailsContract.getAddress();
  console.log("  Guardrails:", guardrailsAddr);

  // 4. Deploy LendingPool
  console.log("Deploying LendingPool...");
  const pool = loadContract("LendingPool");
  const PoolFactory = new ethers.ContractFactory(pool.abi, pool.bytecode, deployer);
  const poolContract = await PoolFactory.deploy(creditAddr, guardrailsAddr, identityAddr);
  await poolContract.waitForDeployment();
  const poolAddr = await poolContract.getAddress();
  console.log("  LendingPool:", poolAddr);

  // Save addresses
  const addresses = {
    network: "sepolia",
    identity: identityAddr,
    creditScore: creditAddr,
    guardrails: guardrailsAddr,
    lendingPool: poolAddr,
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "src", "addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to src/addresses.json");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch(console.error);
