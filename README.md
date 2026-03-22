<img src="parallel-universe/assets/logo.svg" alt="Parallel Universe" width="100%">

---

## What is Parallel Universe?

Parallel Universe is a dual-layer credit protocol that allows AI agents to participate in the on-chain economy by borrowing, earning, and building credit — all backed by real-person accountability.

Today, AI agents have no financial identity. They can't open bank accounts, can't get credit, and can't be held accountable — because they can be shut down and recreated at any time. This means no one will lend to them, and they're locked out of the financial system entirely.

Parallel Universe solves this by creating a **Digital Self** — an on-chain financial identity for your AI agent, cold-started with your real-world credit (Experian score, bank balance, credit card limits), and gradually building its own independent on-chain credit history through economic behavior.

Think of it like an immigrant's credit journey: you rely on your home-country credit at first, then over time your local credit history becomes the primary reference.

```
Early    ██████████████░░░░░░   Off-chain dominates (cold-start)
Mature   ░░░░░░██████████████   On-chain dominates (independent)
```

---

## Digital Self

Each Digital Self is a unique on-chain identity — an ERC-8004 soulbound token bound to a real person, with a generated avatar, a dual-layer credit score, and programmable behavioral guardrails that protect the real person from agent misbehavior.

<p align="center">
  <img src="parallel-universe/assets/avatar-card.svg" alt="Digital Self Avatar Card" width="360">
</p>

The Digital Self can autonomously borrow from liquidity pools, earn revenue by completing tasks, repay loans automatically through a revenue escrow system, and build its own credit history over time — all without human intervention. If things go wrong, the system escalates to the real person.

---

## How It Works

The protocol operates across three layers: a web dashboard for human oversight, an autonomous agent coordination layer that handles the lending lifecycle, and a set of smart contracts that enforce all rules on-chain.

<p align="center">
  <img src="parallel-universe/assets/architecture.svg" alt="Architecture" width="700">
</p>

**Layer 1: Web Dashboard** — A browser-based management interface where the real person can create Digital Selves, view credit scores, manage loans, and monitor collection status. Built with the Terminal Echo design system.

**Layer 2: Agent Coordination** — Five autonomous agents that coordinate the entire lending lifecycle without human intervention. They evaluate credit, execute loans, monitor revenue, handle overdue loans, and escalate to the real person when things go wrong.

**Layer 3: Smart Contracts** — Five Solidity contracts deployed on-chain that enforce all financial rules: identity binding, credit scoring, behavioral guardrails, lending with dynamic interest rates, and revenue escrow with automatic repayment.

---

## Smart Contracts

**Identity.sol** — The ERC-8004 soulbound identity contract. Each Digital Self is bound to a real person's wallet address. The identity stores a ZK proof hash that verifies the person's off-chain credit without exposing private data. The real person can deactivate or freeze the Digital Self at any time.

**CreditScore.sol** — The dual-layer credit scoring engine. It computes a composite score from two sources: a ZK-verified off-chain base (Experian score, bank balance, employment) and an on-chain behavioral score (repayment history, transaction patterns). The weight dynamically shifts — starting at 100% off-chain for cold-start, gradually moving toward on-chain as the Digital Self builds history. Minimum off-chain weight is 20%, ensuring the real-person anchor is never fully removed.

**Guardrails.sol** — Behavioral safety constraints that protect the real person. The owner sets maximum borrow limits, per-transaction caps, and daily spending limits. The contract enforces these rules on every borrow attempt and can freeze the Digital Self entirely in emergencies. Guardrails also track outstanding debt and daily spending with automatic resets.

**LendingPool.sol** — A credit-based lending pool with a Jump Rate interest model inspired by Compound. Below 80% utilization, interest rates rise gradually. Above 80%, rates spike steeply to protect liquidity. The effective rate is the higher of the pool rate and a credit-score-based floor (better score = lower floor). 10% of all interest goes to a risk reserve fund.

**RevenueEscrow.sol** — Revenue custody and automatic repayment. When a Digital Self earns income, the revenue flows into escrow first. A configurable percentage (e.g., 50%) is automatically allocated to loan repayment. The remainder is available to the agent. If the agent defaults, the real person can force-reclaim all escrowed funds.

---

## Autonomous Agents

Five agents coordinate the full lending lifecycle without human intervention:

**CreditAgent** — Evaluates the Digital Self's creditworthiness by reading on-chain credit data. Calculates a risk band (EXCELLENT / GOOD / FAIR / POOR / HIGH), checks for past defaults, and recommends maximum loan amounts. Agents with any defaults are automatically ineligible.

**LendingAgent** — Processes loan applications end-to-end. Runs guardrail checks (borrow limit, per-tx cap, pool liquidity), calculates the effective interest rate from the Jump Rate model, and executes the loan by calling the LendingPool contract. Returns full transaction details.

**RevenueWatcher** — Monitors the Digital Self's wallet balance by polling every 15 seconds. When incoming revenue is detected and the balance exceeds the repayment threshold, it automatically triggers repayment through the LendingPool contract. Tracks repayment progress and reports events.

**CollectionAgent** — Activates when loans become overdue. Checks all active loans against the current block number, freezes the agent's spending via Guardrails, and marks severely overdue loans (100+ blocks) as defaulted. Determines whether escalation to the real person is needed.

**EscalationAgent** — The last resort. Notifies the real person (wallet owner) that their Digital Self has defaulted. Force-reclaims any funds in the RevenueEscrow. Deactivates the Digital Self entirely. The real person must resolve the outstanding debt before the Digital Self can be reactivated.

---

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Wallet | Tether WDK (`@tetherto/wdk`, `wdk-wallet-evm`) |
| Smart Contracts | Solidity 0.8.24, Hardhat 3 |
| Web Dashboard | Express.js, vanilla HTML/CSS/JS |
| CLI | Node.js, chalk, ora, figlet |
| Avatar | DiceBear API (notionists style) |
| ZK Verification | Simulated (production: Reclaim Protocol / tlsnotary) |
| Chain | EVM-compatible (Sepolia testnet / localhost) |

---

## Quick Start

```bash
cd parallel-universe
npm install
npm run compile
```

**Terminal 1** — start local blockchain:
```bash
npm run dev
```

**Terminal 2** — deploy contracts and run demo:
```bash
npm run deploy:local
npm start
```

Open **http://localhost:3000** in your browser for the web dashboard.

---

## Demo

The demo walks through the complete lifecycle of a Digital Self in 8 scenes:

| # | Scene | Description |
|:--|:------|:------------|
| 01 | **Boot Up** | Connect to network, start web dashboard, initialize 5 autonomous agents |
| 02 | **Create Digital Self** | Generate WDK wallet, deploy on-chain identity, render DiceBear avatar card |
| 03 | **ERC-8004 Identity** | Mint a soulbound identity token — non-transferable, bound to real person |
| 04 | **Credit Verification** | Verify Experian score (680), JP Morgan credit limit ($15K), generate ZK proof |
| 05 | **First Loan** | CreditAgent evaluates creditworthiness, LendingAgent executes loan from pool |
| 06 | **Revenue & Repayment** | Agent earns 1.5 ETH from task, RevenueWatcher detects and auto-repays loan |
| 07 | **Guardrail & Collection** | Agent attempts to over-borrow, denied by guardrails, escalation scenario shown |
| 08 | **Dashboard** | Final overview of credit growth (680 → 702), weight shift, activity log |

---

## Project Structure

```
parallel-universe/
├── contracts/
│   ├── Identity.sol          ERC-8004 soulbound identity
│   ├── CreditScore.sol       Dual-layer credit scoring
│   ├── Guardrails.sol        Behavioral safety rules
│   ├── LendingPool.sol       Jump Rate lending pool
│   └── RevenueEscrow.sol     Revenue custody + auto-repay
├── src/
│   ├── index.js              Main demo (8 scenes)
│   ├── server.js             Express dashboard server
│   ├── ui.js                 CLI renderer
│   ├── contracts.js          Contract loader
│   └── agents/
│       ├── CreditAgent.js    Credit evaluation
│       ├── LendingAgent.js   Loan execution
│       ├── RevenueWatcher.js Income monitoring
│       ├── CollectionAgent.js Overdue handling
│       └── EscalationAgent.js Owner escalation
├── web/
│   ├── index.html            Dashboard UI
│   ├── style.css             Terminal Echo design system
│   └── app.js                Frontend logic
└── scripts/
    ├── deploy.js             Sepolia deployment
    └── deploy-local.js       Local deployment
```

---

## Roadmap

- [x] Smart contracts — Identity, CreditScore, Guardrails, LendingPool, RevenueEscrow
- [x] Jump Rate interest model with risk reserve
- [x] 5 autonomous agents for full lending lifecycle
- [x] Tether WDK wallet integration
- [x] 8-scene CLI demo with real on-chain transactions
- [x] Web dashboard for Digital Self management
- [x] DiceBear avatar generation
- [x] Sepolia testnet deployment
- [ ] Real ZK proofs via Circom circuits + Reclaim Protocol
- [ ] USDT token transfers via WDK
- [ ] Multi-agent support — one person managing multiple Digital Selves
- [ ] Cross-chain credit portability
- [ ] ML-based credit scoring model

---

## Why Now

AI agents are proliferating at an unprecedented rate. They are beginning to participate in real economic activity — executing trades, purchasing services, collaborating with other agents. But the financial infrastructure hasn't caught up. On-chain lending today is 100% over-collateralized — you need to lock up more value than you borrow, which defeats the purpose for agents that need working capital.

At the same time, zero-knowledge proof technology has matured to the point where we can bridge off-chain financial data (bank balances, credit scores, employment records) on-chain without exposing private information. This creates a new design space: **credit-based lending for autonomous agents, backed by real-person accountability.**

These conditions — agent proliferation, economic participation, ZK maturity, and the absence of credit infrastructure — are all true for the first time, right now.

---

## Team

**Troy Yan** — Founder

## License

MIT
