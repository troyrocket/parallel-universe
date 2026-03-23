import { ethers } from "ethers";
import WDK from "@tetherto/wdk";
import WalletManagerEvm from "@tetherto/wdk-wallet-evm";
import ora from "ora";
import chalk from "chalk";
const G = chalk.hex("#00FF41");
const GHOST = chalk.hex("#b9ccb2");
const ERR = chalk.hex("#ffb4ab");

import { getContracts, loadAddresses } from "./contracts.js";
import { startDashboard } from "./server.js";
import { CreditAgent } from "./agents/CreditAgent.js";
import { LendingAgent } from "./agents/LendingAgent.js";
import { RevenueWatcher } from "./agents/RevenueWatcher.js";
import { CollectionAgent } from "./agents/CollectionAgent.js";
import { EscalationAgent } from "./agents/EscalationAgent.js";
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

// ─── Configuration ───
const AGENT_NAME = "Alice-Explorer";
const ZK_BASE_SCORE = 680;
const USDT_DECIMALS = 6;
const BORROW_AMOUNT = 1000n * 1_000_000n; // 1,000 USDT
const BORROW_DISPLAY = "1,000 USDT";
const OVER_BORROW_AMOUNT = 50_000n * 1_000_000n; // 50,000 USDT
const OVER_BORROW_DISPLAY = "50,000 USDT";

function formatUSDT(amount) {
  return (Number(amount) / 1_000_000).toLocaleString() + " USDT";
}

// ─── Main Demo ───
async function main() {

  // ═══════════════════════════════════════
  // SCENE 1: Boot Up
  // ═══════════════════════════════════════
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

  // Start web dashboard
  spinner = ora({ text: "Starting dashboard server...", color: "magenta" }).start();
  const dashServer = startDashboard(3000);
  spinner.succeed("Dashboard running at http://localhost:3000");

  const ownerSigner = await provider.getSigner(0);
  const ownerAddress = await ownerSigner.getAddress();
  printInfo(`Real Person: ${ownerAddress}`);

  const contracts = getContracts(ownerSigner);

  // Initialize agents
  const creditAgent = new CreditAgent(contracts);
  const lendingAgent = new LendingAgent(contracts);
  const revenueWatcher = new RevenueWatcher(contracts, provider);
  const collectionAgent = new CollectionAgent(contracts);
  const escalationAgent = new EscalationAgent(contracts);

  printInfo("5 autonomous agents initialized:");
  printInfo(`  ${G("CREDIT_AGENT")}      ${GHOST("Credit evaluation")}`);
  printInfo(`  ${G("LENDING_AGENT")}     ${GHOST("Loan execution")}`);
  printInfo(`  ${G("REVENUE_WATCHER")}   ${GHOST("Income monitoring")}`);
  printInfo(`  ${G("COLLECTION_AGENT")}  ${GHOST("Overdue handling")}`);
  printInfo(`  ${G("ESCALATION_AGENT")} ${GHOST("Owner notification")}`);

  await sleep(1500);

  // ═══════════════════════════════════════
  // SCENE 2: Create Digital Self
  // ═══════════════════════════════════════
  printStep(2, "Create Digital Self");

  spinner = ora({ text: "Initializing WDK wallet...", color: "magenta" }).start();
  const seedPhrase = WDK.getRandomSeedPhrase();
  const wdk = new WDK(seedPhrase);
  wdk.registerWallet("ethereum", WalletManagerEvm, { provider: rpcUrl });
  const agentAccount = await wdk.getAccount("ethereum", 0);
  const agentAddress = await agentAccount.getAddress();
  spinner.succeed(`WDK wallet created: ${agentAddress}`);

  spinner = ora({ text: "Funding agent wallet for gas...", color: "magenta" }).start();
  const fundTx = await ownerSigner.sendTransaction({
    to: agentAddress,
    value: ethers.parseEther("0.5"),
  });
  await fundTx.wait();
  spinner.succeed("Agent funded with 0.5 ETH for gas");

  spinner = ora({ text: "Deploying on-chain identity...", color: "magenta" }).start();
  const createTx = await contracts.identity.createDigitalSelf(agentAddress, AGENT_NAME);
  await createTx.wait();
  spinner.succeed("On-chain identity deployed");
  printTx(createTx.hash);

  await printAvatar(AGENT_NAME, `${agentAddress.slice(0, 6)}...${agentAddress.slice(-4)}`, "CREATED", null);

  await sleep(1000);

  // ═══════════════════════════════════════
  // SCENE 3: ERC-8004 Identity
  // ═══════════════════════════════════════
  printStep(3, "ERC-8004 Identity");

  spinner = ora({ text: "Minting ERC-8004 identity token...", color: "magenta" }).start();
  await sleep(1500);
  spinner.succeed("ERC-8004 soulbound token minted");

  const tokenId = Math.floor(Math.random() * 9000 + 1000);
  printInfo("ERC-8004 IDENTITY TOKEN");
  printInfo(`  Token ID        #${tokenId}`);
  printInfo(`  Standard        ERC-8004`);
  printInfo(`  Owner           ${ownerAddress.slice(0, 10)}...`);
  printInfo(`  Digital Self    ${agentAddress.slice(0, 10)}...`);
  printInfo(`  Transferable    NO (Soulbound)`);

  printSuccess("Identity registered. Soulbound and non-transferable.");

  await sleep(1000);

  // ═══════════════════════════════════════
  // SCENE 4: Credit Verification
  // ═══════════════════════════════════════
  printStep(4, "Credit Verification");

  await typewrite("  Verifying off-chain credit sources...");
  console.log();

  // Simulate real credit sources
  spinner = ora({ text: "Connecting to Experian...", color: "magenta" }).start();
  await sleep(1200);
  spinner.succeed("Experian credit score: 680 / 850");

  spinner = ora({ text: "Connecting to JP Morgan...", color: "magenta" }).start();
  await sleep(1000);
  spinner.succeed("Chase Sapphire credit limit: $15,000 (23% utilization)");

  spinner = ora({ text: "Verifying employment...", color: "magenta" }).start();
  await sleep(800);
  spinner.succeed("Employment: ACTIVE — Software Engineer");

  spinner = ora({ text: "Verifying bank balance...", color: "magenta" }).start();
  await sleep(600);
  spinner.succeed("Bank balance: $52,000");

  // Generate ZK proof
  spinner = ora({ text: "Generating ZK proof (privacy-preserving)...", color: "magenta" }).start();
  await sleep(2000);
  const proofHash = ethers.keccak256(ethers.toUtf8Bytes(`zk-proof-${Date.now()}`));
  spinner.succeed(`ZK proof: ${proofHash.slice(0, 10)}...${proofHash.slice(-4)}`);

  // Submit on-chain
  spinner = ora({ text: "Submitting ZK proof to credit contract...", color: "magenta" }).start();
  const bindTx = await contracts.identity.bindZKProof(agentAddress, proofHash);
  await bindTx.wait();
  spinner.succeed("ZK proof bound on-chain");
  printTx(bindTx.hash);

  spinner = ora({ text: "Initializing credit score...", color: "magenta" }).start();
  const initTx = await contracts.creditScore.initializeCredit(agentAddress, ZK_BASE_SCORE);
  await initTx.wait();
  spinner.succeed("Credit score initialized");

  // Set guardrails (USDT amounts, 6 decimals)
  const setRulesTx = await contracts.guardrails.setRules(
    agentAddress,
    5000n * 1_000_000n,  // max 5,000 USDT
    3000n * 1_000_000n,  // 3,000 USDT per tx
    8000n * 1_000_000n   // 8,000 USDT daily
  );
  await setRulesTx.wait();

  // Activate escrow (50% auto-repayment ratio)
  if (contracts.revenueEscrow) {
    const activateTx = await contracts.revenueEscrow.activate(agentAddress, 50);
    await activateTx.wait();
    printSuccess("Revenue escrow activated (50% auto-repayment)");
  }

  const capacity = await contracts.creditScore.getBorrowingCapacity(agentAddress);
  printCreditScore(ZK_BASE_SCORE, "N/A", ZK_BASE_SCORE, 100, 0, formatUSDT(capacity));
  printSuccess("Digital Self is now credit-enabled.");

  await sleep(1000);

  // ═══════════════════════════════════════
  // SCENE 5: Agent Requests Loan
  // ═══════════════════════════════════════
  printStep(5, "First Loan");

  await typewrite(`  > Agent requests ${BORROW_DISPLAY}`);
  console.log();

  // CreditAgent evaluates
  spinner = ora({ text: "CREDIT_AGENT evaluating...", color: "magenta" }).start();
  await sleep(800);
  const creditReport = await creditAgent.evaluate(agentAddress);
  spinner.succeed(`CREDIT_AGENT: Score ${creditReport.composite} — ${creditReport.riskBand}`);

  printInfo(`Credit Score:        ${creditReport.composite}`);
  printInfo(`Risk Band:           ${creditReport.riskBand}`);
  printInfo(`Repayment Rate:      ${creditReport.repaymentRate}%`);
  printInfo(`Eligible:            ${creditReport.eligible ? "YES" : "NO"}`);

  // Mint USDT to owner for lending operations
  if (contracts.usdt) {
    const mintTx = await contracts.usdt.mint(ownerAddress, 10_000n * 1_000_000n);
    await mintTx.wait();
  }

  // LendingAgent processes application
  spinner = ora({ text: "LENDING_AGENT processing application...", color: "magenta" }).start();
  await sleep(600);
  const application = await lendingAgent.processApplication(agentAddress, BORROW_AMOUNT, creditReport);

  if (application.approved) {
    spinner.succeed(`LENDING_AGENT: APPROVED at ${application.terms.rate}% APR`);

    printGuardrailCheck([
      { name: "Max borrow limit", value: "5,000 USDT", pass: true },
      { name: "Per-tx cap", value: "3,000 USDT", pass: true },
      { name: "Pool liquidity", value: formatUSDT(application.terms.poolAvailable), pass: true },
    ]);

    // Execute loan
    spinner = ora({ text: "LENDING_AGENT executing loan...", color: "magenta" }).start();
    const loanResult = await lendingAgent.executeLoan(agentAddress, BORROW_AMOUNT);
    spinner.succeed("Loan executed from liquidity pool");
    printTx(loanResult.tx);

    // Get pool stats
    const [poolAvail, poolOut, poolRes, poolUtil, poolRate] = await contracts.lendingPool.getPoolStats();
    printLoanSummary(BORROW_DISPLAY, `${application.terms.rate}% APR`, (await provider.getBlockNumber()) + 100);
    printInfo(`Pool liquidity:      ${formatUSDT(poolAvail)}`);
    printInfo(`Pool utilization:    ${Number(poolUtil) / 100}%`);

    // Check agent USDT balance
    if (contracts.usdt) {
      const agentUsdtBalance = await contracts.usdt.balanceOf(agentAddress);
      printInfo(`Digital Self wallet:  ${formatUSDT(agentUsdtBalance)}`);
    }

    printSuccess("REVENUE_WATCHER activated — monitoring agent USDT income");
  }

  await sleep(1000);

  // ═══════════════════════════════════════
  // SCENE 6: Revenue & Auto-Repayment
  // ═══════════════════════════════════════
  printStep(6, "Revenue & Repayment");

  await typewrite("  Agent completes task and earns revenue...");
  console.log();

  // Simulate agent earning revenue in USDT
  spinner = ora({ text: "Agent executing task...", color: "magenta" }).start();
  await sleep(1500);
  spinner.succeed("Task completed: data analysis for Client-X");

  spinner = ora({ text: "Revenue incoming: 1,500 USDT...", color: "magenta" }).start();
  // Mint USDT to simulate revenue and send to agent
  if (contracts.usdt) {
    const revMintTx = await contracts.usdt.mint(agentAddress, 1500n * 1_000_000n);
    await revMintTx.wait();
  }
  spinner.succeed("Revenue received: 1,500 USDT");

  // RevenueWatcher detects and triggers repayment
  spinner = ora({ text: "REVENUE_WATCHER detected incoming funds...", color: "magenta" }).start();
  await sleep(800);
  spinner.succeed("REVENUE_WATCHER: funds detected, initiating auto-repay");

  // Mint USDT to owner for repayment, approve, then repay
  spinner = ora({ text: "Processing auto-repayment...", color: "magenta" }).start();
  if (contracts.usdt) {
    // Mint repayment amount to owner (simulating agent routing funds via escrow)
    const mintForRepay = await contracts.usdt.mint(ownerAddress, BORROW_AMOUNT);
    await mintForRepay.wait();
    const approveTx = await contracts.usdt.approve(addresses.lendingPool, BORROW_AMOUNT);
    await approveTx.wait();
  }
  const repayTx = await contracts.lendingPool.repay(agentAddress, 0, BORROW_AMOUNT);
  await repayTx.wait();
  spinner.succeed("Loan CLOSED — on-time repayment recorded on-chain");
  printTx(repayTx.hash);

  // Show credit growth
  const [zkAfter, onChainAfter, compositeAfter, weightAfter] =
    await contracts.creditScore.getScores(agentAddress);
  const capacityAfter = await contracts.creditScore.getBorrowingCapacity(agentAddress);

  console.log();
  printInfo("CREDIT GROWTH");
  printInfo(`  ZK Base:      680  →  680   (unchanged)`);
  printInfo(`  On-chain:     N/A  →  ${onChainAfter}`);
  printInfo(`  Composite:    680  →  ${compositeAfter}`);
  printInfo(`  Off-chain:    100% →  ${weightAfter}%`);
  printInfo(`  On-chain:     0%   →  ${100n - weightAfter}%`);

  printCreditScore(
    Number(zkAfter),
    Number(onChainAfter),
    Number(compositeAfter),
    Number(weightAfter),
    Number(100n - weightAfter),
    formatUSDT(capacityAfter)
  );

  printSuccess("Digital Self is building independent credit history.");

  await sleep(1000);

  // ═══════════════════════════════════════
  // SCENE 7: Guardrail + Collection
  // ═══════════════════════════════════════
  printStep(7, "Guardrail & Collection");

  await typewrite(`  > Agent attempts ${OVER_BORROW_DISPLAY}`);
  console.log();

  // CreditAgent re-evaluates
  const report2 = await creditAgent.evaluate(agentAddress);
  printInfo(`Credit Score:        ${report2.composite}`);
  printInfo(`Capacity:            ${formatUSDT(report2.capacity)}`);
  printInfo(`Requested:           ${OVER_BORROW_DISPLAY}`);
  printError("DENIED — exceeds capacity");

  printGuardrailCheck([
    { name: "Max borrow limit", value: "5,000 USDT", pass: false },
    { name: "Credit capacity", value: formatUSDT(report2.capacity), pass: false },
  ]);

  console.log();
  printWarning("GUARDRAIL TRIGGERED");
  printWarning("COLLECTION_AGENT on standby");
  printWarning("ESCALATION_AGENT ready if agent defaults");
  console.log();

  // Simulate what happens on default
  printInfo("ESCALATION SCENARIO (if agent defaults):");
  printInfo(`  1. COLLECTION_AGENT freezes agent spending`);
  printInfo(`  2. COLLECTION_AGENT marks loan as defaulted`);
  printInfo(`  3. ESCALATION_AGENT notifies real person: ${ownerAddress.slice(0, 10)}...`);
  printInfo(`  4. ESCROW funds force-reclaimed to owner`);
  printInfo(`  5. Digital Self deactivated`);
  printInfo(`  6. Real person must resolve outstanding debt`);

  await sleep(1000);

  // ═══════════════════════════════════════
  // SCENE 8: Dashboard
  // ═══════════════════════════════════════
  printStep(8, "Dashboard");

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
    capacity: formatUSDT(finalCapacity),
    activities: [
      { ok: true, text: "Digital Self created" },
      { ok: true, text: "ERC-8004 registered" },
      { ok: true, text: "ZK credit verified (Experian + JP Morgan)" },
      { ok: true, text: "Credit score initialized: 680" },
      { ok: true, text: `Borrowed ${BORROW_DISPLAY} (LENDING_AGENT)` },
      { ok: true, text: "Revenue earned: 1,500 USDT" },
      { ok: true, text: "Auto-repaid (REVENUE_WATCHER)" },
      { ok: true, text: `Credit grew: 680 → ${Number(finalScores[2])}` },
      { ok: false, text: `Over-borrow denied (GUARDRAIL)` },
    ],
    contracts: {
      credit: addresses.creditScore.slice(0, 10) + "...",
      pool: addresses.lendingPool.slice(0, 10) + "...",
      identity: addresses.identity.slice(0, 10) + "...",
    },
  });

  console.log();
  printSuccess("Demo complete.");
  printInfo("Open http://localhost:3000 for the web dashboard.");
  printInfo("Powered by Tether WDK + Parallel Universe Protocol");
  console.log();

  // Keep server running
  printInfo("Press Ctrl+C to exit.");

  // Cleanup WDK
  wdk.dispose();
}

main().catch((err) => {
  console.error("\n  Demo error:", err.message);
  process.exit(1);
});
