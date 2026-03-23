import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const deployer = await provider.getSigner(0);
  console.log("Deploying from:", deployer.address);

  const artifactsDir = path.join(__dirname, "..", "artifacts", "contracts");

  function loadContract(name) {
    const artifactPath = path.join(artifactsDir, `${name}.sol`, `${name}.json`);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return { abi: artifact.abi, bytecode: artifact.bytecode };
  }

  // 1. Deploy USDTMint
  console.log("\nDeploying USDTMint...");
  const usdt = loadContract("USDTMint");
  const UsdtFactory = new ethers.ContractFactory(usdt.abi, usdt.bytecode, deployer);
  const usdtContract = await UsdtFactory.deploy();
  await usdtContract.waitForDeployment();
  const usdtAddr = await usdtContract.getAddress();
  console.log("  USDTMint:", usdtAddr);

  // 2. Deploy Identity
  console.log("Deploying Identity...");
  const identity = loadContract("Identity");
  const IdentityFactory = new ethers.ContractFactory(identity.abi, identity.bytecode, deployer);
  const identityContract = await IdentityFactory.deploy();
  await identityContract.waitForDeployment();
  const identityAddr = await identityContract.getAddress();
  console.log("  Identity:", identityAddr);

  // 3. Deploy CreditScore
  console.log("Deploying CreditScore...");
  const credit = loadContract("CreditScore");
  const CreditFactory = new ethers.ContractFactory(credit.abi, credit.bytecode, deployer);
  const creditContract = await CreditFactory.deploy(identityAddr);
  await creditContract.waitForDeployment();
  const creditAddr = await creditContract.getAddress();
  console.log("  CreditScore:", creditAddr);

  // 4. Deploy Guardrails
  console.log("Deploying Guardrails...");
  const guardrails = loadContract("Guardrails");
  const GuardrailsFactory = new ethers.ContractFactory(guardrails.abi, guardrails.bytecode, deployer);
  const guardrailsContract = await GuardrailsFactory.deploy(creditAddr, identityAddr);
  await guardrailsContract.waitForDeployment();
  const guardrailsAddr = await guardrailsContract.getAddress();
  console.log("  Guardrails:", guardrailsAddr);

  // 5. Deploy LendingPool (now takes USDT address)
  console.log("Deploying LendingPool...");
  const pool = loadContract("LendingPool");
  const PoolFactory = new ethers.ContractFactory(pool.abi, pool.bytecode, deployer);
  const poolContract = await PoolFactory.deploy(creditAddr, guardrailsAddr, identityAddr, usdtAddr);
  await poolContract.waitForDeployment();
  const poolAddr = await poolContract.getAddress();
  console.log("  LendingPool:", poolAddr);

  // 6. Deploy RevenueEscrow
  console.log("Deploying RevenueEscrow...");
  const escrow = loadContract("RevenueEscrow");
  const EscrowFactory = new ethers.ContractFactory(escrow.abi, escrow.bytecode, deployer);
  const escrowContract = await EscrowFactory.deploy(identityAddr, poolAddr, usdtAddr);
  await escrowContract.waitForDeployment();
  const escrowAddr = await escrowContract.getAddress();
  console.log("  RevenueEscrow:", escrowAddr);

  // Fund the lending pool with 100,000 USDT
  console.log("\nFunding lending pool with 100,000 USDT...");
  const fundAmount = 100_000n * 1_000_000n; // 100K USDT (6 decimals)
  const approveTx = await usdtContract.approve(poolAddr, fundAmount);
  await approveTx.wait();
  const fundTx = await poolContract.fundPool(fundAmount);
  await fundTx.wait();
  console.log("  Pool funded with 100,000 USDT ✓");

  // Save addresses
  const addresses = {
    network: "localhost",
    rpcUrl: "http://127.0.0.1:8545",
    usdt: usdtAddr,
    identity: identityAddr,
    creditScore: creditAddr,
    guardrails: guardrailsAddr,
    lendingPool: poolAddr,
    revenueEscrow: escrowAddr,
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "src", "addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to src/addresses.json");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch(console.error);
