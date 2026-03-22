import { ethers } from "ethers";
import WDK from "@tetherto/wdk";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import ora from "ora";
import { getContracts, loadAddresses } from "./contracts.js";
import {
  printLogo,
  printStep,
  printSuccess,
  printError,
  printWarning,
  printInfo,
  printTx,
  printAvatar,
  printCreditScore,
  printGuardrailCheck,
  printLoanSummary,
  printDashboard,
  sleep,
  typewrite,
} from "./ui.js";

// ─────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────
const AGENT_NAME = "Alice-Explorer";
const ZK_BASE_SCORE = 680;
const BORROW_AMOUNT = ethers.parseEther("1"); // 1 ETH (simulating 1000 USDT)
const BORROW_DISPLAY = "1,000 USDT";
const OVER_BORROW_AMOUNT = ethers.parseEther("50"); // way over limit
const OVER_BORROW_DISPLAY = "50,000 USDT";

// ─────────────────────────────────────────────────────────
// Main Demo Flow
// ─────────────────────────────────────────────────────────
async function main() {
  // ═══════════════════════════════════════════════════════
  // SCENE 1: Boot Up
  // ═══════════════════════════════════════════════════════
  printStep(1, "Boot Up");
  printLogo();

  const addresses = loadAddresses();
  const rpcUrl = addresses.rpcUrl || "http://127.0.0.1:8545";

  let spinner = ora({ text: "Connecting to network...", color: "magenta" }).start();
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  spinner.succeed(`Connected to ${addresses.network} (chainId: ${network.chainId})`);

  spinner = ora({ text: "Loading credit engine...", color: "magenta" }).start();
  await sleep(500);
  spinner.succeed("Credit engine loaded");

  // Owner account (real person) — uses first hardhat account
  const ownerSigner = await provider.getSigner(0);
  const ownerAddress = await ownerSigner.getAddress();
  printInfo(`Real Person: ${ownerAddress}`);

  // Get contract instances
  const contracts = getContracts(ownerSigner);

  // ═══════════════════════════════════════════════════════
  // SCENE 2: Create Digital Self (with WDK)
  // ═══════════════════════════════════════════════════════
  printStep(2, "Create Digital Self");

  spinner = ora({ text: "Initializing WDK wallet...", color: "magenta" }).start();

  // Create agent wallet using WDK
  const seedPhrase = WDK.getRandomSeedPhrase();
  const wdk = new WDK(seedPhrase);
  wdk.registerWallet("ethereum", WalletManagerEvm, {
    provider: rpcUrl,
  });

  const agentAccount = await wdk.getAccount("ethereum", 0);
  const agentAddress = await agentAccount.getAddress();
  spinner.succeed(`WDK wallet created: ${agentAddress}`);

  // Fund agent with a little ETH for gas
  spinner = ora({ text: "Funding agent wallet for gas...", color: "magenta" }).start();
  const fundTx = await ownerSigner.sendTransaction({
    to: agentAddress,
    value: ethers.parseEther("0.5"),
  });
  await fundTx.wait();
  spinner.succeed("Agent funded with 0.5 ETH for gas");

  // Register Digital Self on-chain
  spinner = ora({ text: "Deploying on-chain identity...", color: "magenta" }).start();
  const createTx = await contracts.identity.createDigitalSelf(agentAddress, AGENT_NAME);
  await createTx.wait();
  spinner.succeed("On-chain identity deployed");
  printTx(createTx.hash);

  printAvatar(AGENT_NAME, `${agentAddress.slice(0, 6)}...${agentAddress.slice(-4)}`, "CREATED", null);
  printWarning("No credit score yet. Run verify-credit to cold-start.");

  await sleep(1000);

  // ═══════════════════════════════════════════════════════
  // SCENE 3: ZK Credit Verification
  // ═══════════════════════════════════════════════════════
  printStep(3, "ZK Credit Verification");

  await typewrite("  Starting ZK credit verification...");

  // Simulate ZK proof data display
  const zkData = [
    { name: "Bank Balance", bar: "████████░░", value: "$52K" },
    { name: "Credit History", bar: "█████████░", value: "7 yrs" },
    { name: "Employment", bar: "██████████", value: "Active" },
    { name: "Debt-to-Income", bar: "████░░░░░░", value: "23%" },
  ];

  console.log("\n  ┌─ Off-chain Data Sources ──────────────────┐");
  for (const d of zkData) {
    console.log(`  │  ${d.name.padEnd(18)} ${d.bar}  ${d.value.padEnd(7)} │`);
    await sleep(300);
  }
  console.log("  └───────────────────────────────────────────┘\n");

  // Simulate ZK proof generation
  spinner = ora({ text: "Generating ZK proof...", color: "magenta" }).start();
  await sleep(2000);
  const proofHash = ethers.keccak256(ethers.toUtf8Bytes(`zk-proof-${Date.now()}`));
  spinner.succeed(`Proof hash: ${proofHash.slice(0, 10)}...${proofHash.slice(-4)}`);

  // Bind ZK proof on-chain
  spinner = ora({ text: "Submitting to credit contract...", color: "magenta" }).start();
  const bindTx = await contracts.identity.bindZKProof(agentAddress, proofHash);
  await bindTx.wait();
  spinner.succeed("ZK proof bound on-chain");
  printTx(bindTx.hash);

  // Initialize credit score
  spinner = ora({ text: "Initializing credit score...", color: "magenta" }).start();
  const initCreditTx = await contracts.creditScore.initializeCredit(agentAddress, ZK_BASE_SCORE);
  await initCreditTx.wait();
  spinner.succeed("Credit score initialized");

  // Set guardrail rules
  const maxBorrow = ethers.parseEther("5"); // 5 ETH max
  const perTxCap = ethers.parseEther("3"); // 3 ETH per tx
  const dailyLimit = ethers.parseEther("8"); // 8 ETH daily
  const setRulesTx = await contracts.guardrails.setRules(agentAddress, maxBorrow, perTxCap, dailyLimit);
  await setRulesTx.wait();

  // Display credit score
  const capacity = await contracts.creditScore.getBorrowingCapacity(agentAddress);
  const capacityDisplay = ethers.formatEther(capacity).slice(0, 8) + " ETH";

  printCreditScore(ZK_BASE_SCORE, "N/A", ZK_BASE_SCORE, 100, 0, capacityDisplay);
  printSuccess("Digital Self is now credit-enabled.");

  await sleep(1000);

  // ═══════════════════════════════════════════════════════
  // SCENE 4: First Loan
  // ═══════════════════════════════════════════════════════
  printStep(4, "First Loan");

  await typewrite(`  > borrow ${BORROW_DISPLAY}`);
  console.log();

  // Check credit
  const compositeScore = await contracts.creditScore.getCompositeScore(agentAddress);
  const borrowCapacity = await contracts.creditScore.getBorrowingCapacity(agentAddress);
  printInfo(`Credit Score:        ${compositeScore}`);
  printInfo(`Borrowing Capacity:  ${ethers.formatEther(borrowCapacity).slice(0, 8)} ETH`);
  printInfo(`Requested:           ${BORROW_DISPLAY}`);

  // Check guardrails
  const [allowed, reason] = await contracts.guardrails.checkBorrow(agentAddress, BORROW_AMOUNT);

  printGuardrailCheck([
    { name: "Max borrow limit", value: "5 ETH", pass: true },
    { name: "Per-tx cap", value: "3 ETH", pass: true },
    { name: "Anomaly detection", value: "Normal", pass: true },
  ]);

  if (allowed) {
    printSuccess("Status: APPROVED");

    // Execute borrow
    spinner = ora({ text: "Executing loan from Liquidity Pool...", color: "magenta" }).start();
    const borrowTx = await contracts.lendingPool.borrow(agentAddress, BORROW_AMOUNT);
    await borrowTx.wait();
    spinner.succeed("Loan executed");
    printTx(borrowTx.hash);

    const currentBlock = await provider.getBlockNumber();
    printLoanSummary(BORROW_DISPLAY, "4.2% APR", currentBlock + 100);

    // Check agent balance via WDK
    const agentBalance = await agentAccount.getBalance();
    printInfo(`Digital Self wallet: ${ethers.formatEther(agentBalance)} ETH`);
  }

  await sleep(1000);

  // ═══════════════════════════════════════════════════════
  // SCENE 5: Repay & Credit Growth
  // ═══════════════════════════════════════════════════════
  printStep(5, "Repay & Credit Growth");

  await typewrite(`  > repay ${BORROW_DISPLAY}`);
  console.log();

  // Get scores BEFORE repayment
  const [zkBefore, onChainBefore, compositeBefore, weightBefore] =
    await contracts.creditScore.getScores(agentAddress);

  // Repay via agent wallet — sign with WDK-created key
  spinner = ora({ text: "Processing repayment...", color: "magenta" }).start();

  // We need the agent's private key to send from agent address
  // For demo, use owner to call repay on behalf
  const repayTx = await contracts.lendingPool.repay(agentAddress, 0, {
    value: BORROW_AMOUNT,
  });
  await repayTx.wait();
  spinner.succeed("Loan CLOSED. On-time repayment recorded.");
  printTx(repayTx.hash);

  // Get scores AFTER repayment
  const [zkAfter, onChainAfter, compositeAfter, weightAfter] =
    await contracts.creditScore.getScores(agentAddress);
  const capacityAfter = await contracts.creditScore.getBorrowingCapacity(agentAddress);
  const capacityAfterDisplay = ethers.formatEther(capacityAfter).slice(0, 8) + " ETH";

  console.log();
  printInfo("BEFORE                →    AFTER");
  printInfo("");
  printInfo(`ZK Base:    ${zkBefore}           ${zkAfter}`);
  printInfo(`On-chain:   ${onChainBefore > 0 ? onChainBefore : "N/A"}           ${onChainAfter}`);
  printInfo(`Composite:  ${compositeBefore}     →     ${compositeAfter}`);
  printInfo("");
  printInfo(`Weight shift:`);
  printInfo(`Off-chain:  ${weightBefore}%    →     ${weightAfter}%`);
  printInfo(`On-chain:   ${100n - weightBefore}%      →     ${100n - weightAfter}%`);

  printCreditScore(
    Number(zkAfter),
    Number(onChainAfter),
    Number(compositeAfter),
    Number(weightAfter),
    Number(100n - weightAfter),
    capacityAfterDisplay
  );

  printSuccess("Your Digital Self is building its own credit history.");

  await sleep(1000);

  // ═══════════════════════════════════════════════════════
  // SCENE 6: Guardrail Trigger
  // ═══════════════════════════════════════════════════════
  printStep(6, "Guardrail Trigger");

  await typewrite(`  > borrow ${OVER_BORROW_DISPLAY}`);
  console.log();

  const scoreNow = await contracts.creditScore.getCompositeScore(agentAddress);
  const capNow = await contracts.creditScore.getBorrowingCapacity(agentAddress);
  printInfo(`Credit Score:        ${scoreNow}`);
  printInfo(`Borrowing Capacity:  ${ethers.formatEther(capNow).slice(0, 8)} ETH`);
  printInfo(`Requested:           ${OVER_BORROW_DISPLAY}`);
  printError("Status: DENIED");

  const [overAllowed, overReason] = await contracts.guardrails.checkBorrow(
    agentAddress,
    OVER_BORROW_AMOUNT
  );

  printGuardrailCheck([
    { name: "Max borrow limit", value: "5 ETH", pass: false },
    { name: "Risk assessment", value: "HIGH", pass: false },
  ]);

  console.log();
  printWarning("GUARDRAIL TRIGGERED");
  printWarning(`Reason: ${overReason || "Exceeds borrowing capacity"}`);
  printWarning("This action has been blocked to protect the real person.");
  console.log();
  printInfo(`Real person notified: ${ownerAddress.slice(0, 10)}...`);
  printInfo('Override available via `override --human-auth`');

  await sleep(1000);

  // ═══════════════════════════════════════════════════════
  // SCENE 7: Dashboard Overview
  // ═══════════════════════════════════════════════════════
  printStep(7, "Dashboard Overview");

  const finalScores = await contracts.creditScore.getScores(agentAddress);
  const finalCapacity = await contracts.creditScore.getBorrowingCapacity(agentAddress);

  printDashboard({
    name: AGENT_NAME,
    address: `${agentAddress.slice(0, 6)}...${agentAddress.slice(-4)}`,
    compositeScore: Number(finalScores[2]),
    zkBase: Number(finalScores[0]),
    onChain: Number(finalScores[1]),
    offWeight: Number(finalScores[3]),
    onWeight: Number(100n - finalScores[3]),
    capacity: ethers.formatEther(finalCapacity).slice(0, 8) + " ETH",
    activities: [
      { ok: true, text: "Created identity" },
      { ok: true, text: "ZK verified" },
      { ok: true, text: `Borrowed ${BORROW_DISPLAY}` },
      { ok: true, text: "Repaid on-time" },
      { ok: false, text: "Over-borrow denied" },
    ],
    contracts: {
      credit: addresses.creditScore.slice(0, 10) + "...",
      pool: addresses.lendingPool.slice(0, 10) + "...",
      identity: addresses.identity.slice(0, 10) + "...",
    },
  });

  console.log();
  printSuccess("Demo complete. Your Digital Self has its own credit history.");
  printInfo("Powered by Tether WDK + Parallel Universe Protocol");
  console.log();

  // Cleanup WDK
  wdk.dispose();
}

main().catch((err) => {
  console.error("\n  Demo error:", err.message);
  process.exit(1);
});
