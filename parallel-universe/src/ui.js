import chalk from "chalk";
import gradient from "gradient-string";
import boxen from "boxen";

const cyber = gradient(["#00ff41", "#00d4ff", "#ff00ff"]);
const neon = gradient(["#ff00ff", "#00ff41"]);

export const LOGO = `
  ██████╗   █████╗  ██████╗  █████╗  ██╗     ██╗     ███████╗██╗
  ██╔══██╗ ██╔══██╗ ██╔══██╗██╔══██╗ ██║     ██║     ██╔════╝██║
  ██████╔╝ ███████║ ██████╔╝███████║ ██║     ██║     █████╗  ██║
  ██╔═══╝  ██╔══██║ ██╔══██║██╔══██║ ██║     ██║     ██╔══╝  ██║
  ██║      ██║  ██║ ██║  ██║██║  ██║ ███████╗███████╗███████╗███████╗
  ╚═╝      ╚═╝  ╚═╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══════╝╚══════╝╚══════╝╚══════╝
`;

export function printLogo() {
  console.log(cyber(LOGO));
  console.log(chalk.gray("  U N I V E R S E  v0.1.0"));
  console.log(chalk.gray("  Powered by Tether WDK\n"));
}

export function printStep(step, title) {
  console.log(
    "\n" + chalk.bgMagenta.black(` SCENE ${step} `) + " " + chalk.magentaBright.bold(title) + "\n"
  );
}

export function printSuccess(msg) {
  console.log(chalk.green("  ✓ " + msg));
}

export function printError(msg) {
  console.log(chalk.red("  ✗ " + msg));
}

export function printWarning(msg) {
  console.log(chalk.yellow("  ⚠ " + msg));
}

export function printInfo(msg) {
  console.log(chalk.cyan("  " + msg));
}

export function printTx(hash) {
  console.log(chalk.gray(`  Tx: ${hash}`));
}

export function printAvatar(name, address, status, credit) {
  const avatar = `
  ┌─────────────────────────┐
  │     ╭━━━━━━━━━━━╮       │
  │     ┃  ◉    ◉  ┃       │   Name:    ${chalk.cyan(name)}
  │     ┃    ━━    ┃       │   Address: ${chalk.gray(address)}
  │     ┃  ╲____╱  ┃       │   Status:  ${status === "ACTIVE" ? chalk.green(status) : chalk.yellow(status)}
  │     ╰━━━━━━━━━━━╯       │   Credit:  ${credit || chalk.gray("-- (unverified)")}
  │    [ DIGITAL SELF ]     │
  └─────────────────────────┘`;
  console.log(chalk.magenta(avatar));
}

export function printCreditScore(zkBase, onChain, composite, offWeight, onWeight, capacity) {
  const barLen = 30;
  const filled = Math.round((composite / 900) * barLen);
  const bar =
    chalk.green("█".repeat(filled)) + chalk.gray("░".repeat(barLen - filled));

  const box = boxen(
    [
      chalk.bold("Credit Score Updated"),
      "",
      `  ZK Base Score:      ${chalk.cyan(zkBase)}`,
      `  On-chain Score:     ${onChain > 0 ? chalk.green(onChain) : chalk.gray("N/A")}`,
      "",
      `  Composite Score:    ${chalk.bold.white(composite)}`,
      `  Weight: Off-chain ${chalk.yellow(offWeight + "%")} / On-chain ${chalk.green(onWeight + "%")}`,
      "",
      `  ${bar}  ${composite}/900`,
      "",
      `  Borrowing Capacity: ${chalk.bold.green(capacity)}`,
    ].join("\n"),
    {
      padding: 1,
      borderColor: "magenta",
      borderStyle: "round",
    }
  );

  console.log(box);
}

export function printGuardrailCheck(checks) {
  const lines = checks.map(
    (c) =>
      `  ${c.name.padEnd(22)} ${c.value.toString().padEnd(8)} ${
        c.pass ? chalk.green("✓ PASS") : chalk.red("✗ FAIL")
      }`
  );

  const box = boxen(
    [chalk.bold("Guardrails Check"), "", ...lines].join("\n"),
    {
      padding: 1,
      borderColor: checks.every((c) => c.pass) ? "green" : "red",
      borderStyle: "round",
    }
  );

  console.log(box);
}

export function printLoanSummary(amount, rate, dueBlock) {
  const box = boxen(
    [
      chalk.bold("Loan Summary"),
      "",
      `  Borrowed:       ${chalk.white(amount)}`,
      `  Interest Rate:  ${chalk.yellow(rate)}`,
      `  Repay by:       Block #${chalk.gray(dueBlock)}`,
      `  Collateral:     ${chalk.cyan("Credit-based (no lock)")}`,
    ].join("\n"),
    {
      padding: 1,
      borderColor: "cyan",
      borderStyle: "round",
    }
  );

  console.log(box);
}

export function printDashboard(data) {
  const barLen = 24;
  const filled = Math.round((data.compositeScore / 900) * barLen);
  const bar =
    chalk.green("█".repeat(filled)) + chalk.gray("░".repeat(barLen - filled));

  const riskColor =
    data.compositeScore >= 700
      ? chalk.green("● LOW")
      : data.compositeScore >= 500
      ? chalk.yellow("● MEDIUM")
      : chalk.red("● HIGH");

  const activityLines = data.activities.map(
    (a) => `║  │ ${a.ok ? chalk.green("✓") : chalk.red("✗")} ${a.text.padEnd(20)}│`
  );

  const lines = [
    "╔═══════════════════════════════════════════════════════════════╗",
    `║  ${cyber("P A R A L L E L   U N I V E R S E")}`,
    "║",
    `║  ${chalk.cyan(data.name)}   ${chalk.gray(data.address)}   Status: ${chalk.green("ACTIVE")}`,
    "║",
    `║  Credit Score: ${chalk.bold.white(`[ ${data.compositeScore} ]`)}   ${bar}  ${data.compositeScore}/900`,
    `║  ├─ Off-chain Base:  ${data.zkBase} (${data.offWeight}%)`,
    `║  └─ On-chain:        ${data.onChain} (${data.onWeight}%)`,
    "║",
    `║  Capacity: ${chalk.bold.green(data.capacity)}    Risk: ${riskColor}`,
    "║",
    "║  ┌─ Activity ─────────────┐",
    ...activityLines,
    "║  └─────────────────────────┘",
    "║",
    `║  Contracts:`,
    `║  ├─ Credit:   ${chalk.gray(data.contracts.credit)}`,
    `║  ├─ Pool:     ${chalk.gray(data.contracts.pool)}`,
    `║  └─ Identity: ${chalk.gray(data.contracts.identity)}`,
    "║",
    "╚═══════════════════════════════════════════════════════════════╝",
  ];

  console.log(lines.join("\n"));
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function typewrite(text, delay = 30) {
  for (const char of text) {
    process.stdout.write(char);
    await sleep(delay);
  }
  console.log();
}
