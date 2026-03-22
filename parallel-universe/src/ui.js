import chalk from "chalk";
import figlet from "figlet";

// ─── Design System Colors ───
const G = chalk.hex("#00FF41");
const GHOST = chalk.hex("#b9ccb2");
const DIM = chalk.hex("#84967e");
const ON = chalk.hex("#e2e2e2");
const ERR = chalk.hex("#ffb4ab");

// ─── Center a block of text in the terminal ───
function centerBlock(text) {
  const cols = process.stdout.columns || 100;
  const lines = text.split("\n");
  const maxLen = Math.max(...lines.map((l) => l.length));
  const pad = Math.max(0, Math.floor((cols - maxLen) / 2));
  return lines.map((line) => " ".repeat(pad) + line).join("\n");
}

// ─── LOGO (ANSI Shadow — biggest, centered) ───
export function printLogo() {
  const p = figlet.textSync("PARALLEL", { font: "ANSI Shadow" });
  const u = figlet.textSync("UNIVERSE", { font: "ANSI Shadow" });
  const cols = process.stdout.columns || 100;

  console.log();
  console.log();
  console.log(G(centerBlock(p)));
  console.log(G(centerBlock(u)));
  const tag = ">_ v0.1.0  //  Powered by Tether WDK";
  const tagPad = Math.max(0, Math.floor((cols - tag.length) / 2));
  console.log(" ".repeat(tagPad) + G(">_ ") + DIM("v0.1.0  //  Powered by Tether WDK"));
  console.log();
  console.log();
}

// ─── SCENE HEADER ───
export function printStep(step, title) {
  console.log();
  console.log();
  console.log(DIM("   " + `0${step}`.slice(-2)));
  console.log(G("   >_"));
  console.log(ON.bold("   " + title.toUpperCase()));
  console.log();
}

// ─── STATUS ───
export function printSuccess(msg) {
  console.log(G("   ✓ ") + ON(msg));
}

export function printError(msg) {
  console.log(ERR("   ✗ ") + ON(msg));
}

export function printWarning(msg) {
  console.log(chalk.hex("#FFD700")("   ! ") + ON(msg));
}

export function printInfo(msg) {
  console.log(GHOST("     " + msg));
}

export function printTx(hash) {
  console.log(DIM("     tx " + hash));
}

// ─── AVATAR (DiceBear — opens in browser) ───
export async function printAvatar(name, address, status, credit) {
  const statusText = status === "ACTIVE" ? G(status) : GHOST(status);

  try {
    const avatarUrl = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear,solid`;

    // Generate an HTML card and open in browser
    const fs = await import("fs");
    const path = await import("path");
    const { execSync } = await import("child_process");

    const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #131313;
    color: #e2e2e2;
    font-family: 'Space Grotesk', 'SF Mono', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .card {
    background: #1b1b1b;
    padding: 48px;
    text-align: center;
    max-width: 400px;
  }
  .avatar {
    width: 200px;
    height: 200px;
    margin: 0 auto 32px;
    border: 2px solid #00FF41;
  }
  .avatar img { width: 100%; height: 100%; }
  .name {
    color: #00FF41;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 2px;
    margin-bottom: 24px;
  }
  .label { color: #84967e; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; }
  .value { color: #e2e2e2; font-size: 14px; margin-bottom: 16px; }
  .tag {
    display: inline-block;
    border-left: 2px solid #00FF41;
    background: #353535;
    color: #00FF41;
    font-size: 10px;
    letter-spacing: 2px;
    padding: 4px 12px;
    margin: 4px;
  }
  .footer { color: #84967e; font-size: 10px; margin-top: 32px; letter-spacing: 2px; }
</style>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
</head><body>
<div class="card">
  <div class="avatar"><img src="${avatarUrl}" /></div>
  <div class="name">${name}</div>
  <div class="label">ADDRESS</div>
  <div class="value">${address}</div>
  <div class="label">STATUS</div>
  <div class="value" style="color: #00FF41">${status}</div>
  <div class="label">CREDIT</div>
  <div class="value">${credit || "UNVERIFIED"}</div>
  <div style="margin-top: 16px">
    <span class="tag">DIGITAL_SELF</span>
    <span class="tag">ERC-8004</span>
  </div>
  <div class="footer">>_ PARALLEL_UNIVERSE</div>
</div>
</body></html>`;

    const tmpPath = path.default.join(process.cwd(), ".avatar-card.html");
    fs.default.writeFileSync(tmpPath, html);
    execSync(`open "${tmpPath}"`);
    printSuccess("Avatar card opened in browser");
  } catch (e) {
    // Silent fallback
  }

  console.log();
  console.log(GHOST("     NAME        ") + ON(name));
  console.log(GHOST("     ADDRESS     ") + DIM(address));
  console.log(GHOST("     STATUS      ") + statusText);
  console.log(GHOST("     CREDIT      ") + (credit || DIM("UNVERIFIED")));
  console.log();
}

// ─── CREDIT SCORE ───
export function printCreditScore(zkBase, onChain, composite, offWeight, onWeight, capacity) {
  const barLen = 40;
  const filled = Math.round((composite / 900) * barLen);
  const bar = G("█".repeat(filled)) + DIM("░".repeat(barLen - filled));

  console.log();
  console.log();
  console.log("     " + bar);
  console.log();
  console.log(G("                    " + composite) + DIM(" / 900"));
  console.log();
  console.log(GHOST("     ZK BASE         ") + ON(String(zkBase)) + DIM("   " + offWeight + "% weight"));
  console.log(GHOST("     ON-CHAIN        ") + (onChain > 0 ? ON(String(onChain)) : DIM("—")) + DIM("   " + onWeight + "% weight"));
  console.log(GHOST("     CAPACITY        ") + G(capacity));
  console.log();
}

// ─── GUARDRAILS ───
export function printGuardrailCheck(checks) {
  console.log();
  for (const c of checks) {
    const status = c.pass ? G("PASS") : ERR("FAIL");
    console.log("     " + GHOST(c.name.padEnd(20)) + DIM(c.value.toString().padEnd(12)) + status);
  }
  console.log();
}

// ─── LOAN ───
export function printLoanSummary(amount, rate, dueBlock) {
  console.log();
  console.log(GHOST("     AMOUNT          ") + ON(amount));
  console.log(GHOST("     RATE            ") + G(rate));
  console.log(GHOST("     DUE             ") + DIM("Block #" + dueBlock));
  console.log(GHOST("     COLLATERAL      ") + G("Credit-based // No lock"));
  console.log();
}

// ─── DASHBOARD ───
export function printDashboard(data) {
  const barLen = 44;
  const filled = Math.round((data.compositeScore / 900) * barLen);
  const bar = G("█".repeat(filled)) + DIM("░".repeat(barLen - filled));

  const risk =
    data.compositeScore >= 700 ? G("LOW") :
    data.compositeScore >= 500 ? chalk.hex("#FFD700")("MEDIUM") :
    ERR("HIGH");

  console.log();
  console.log();
  console.log(G("   >_"));
  console.log(ON.bold("   DASHBOARD"));
  console.log();

  console.log(GHOST("     NAME            ") + ON(data.name));
  console.log(GHOST("     ADDRESS         ") + DIM(data.address));
  console.log(GHOST("     STATUS          ") + G("ACTIVE"));
  console.log();

  console.log("     " + bar);
  console.log();
  console.log(G("                    " + data.compositeScore) + DIM(" / 900"));
  console.log();

  console.log(GHOST("     ZK BASE         ") + ON(String(data.zkBase)) + DIM("   " + data.offWeight + "%"));
  console.log(GHOST("     ON-CHAIN        ") + ON(String(data.onChain)) + DIM("   " + data.onWeight + "%"));
  console.log(GHOST("     CAPACITY        ") + G(data.capacity));
  console.log(GHOST("     RISK            ") + risk);
  console.log();
  console.log();

  console.log(DIM("     ACTIVITY"));
  console.log();
  for (const a of data.activities) {
    const icon = a.ok ? G(">>") : ERR("XX");
    console.log("       " + icon + "  " + GHOST(a.text));
  }
  console.log();
  console.log();

  console.log(DIM("     CONTRACTS"));
  console.log();
  console.log("       " + DIM("CREDIT     ") + GHOST(data.contracts.credit));
  console.log("       " + DIM("POOL       ") + GHOST(data.contracts.pool));
  console.log("       " + DIM("IDENTITY   ") + GHOST(data.contracts.identity));
  console.log();
  console.log();
  console.log(DIM("     (C) 2026 PARALLEL_UNIVERSE // NULL_VOID"));
  console.log();
}

// ─── UTILS ───
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function typewrite(text, delay = 30) {
  for (const char of text) {
    process.stdout.write(G(char));
    await sleep(delay);
  }
  console.log();
}
