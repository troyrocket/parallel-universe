<p align="center">
  <img src="parallel-universe/assets/logo.svg" alt="Parallel Universe">
</p>

<p align="center">
  <em>Your Digital Self deserves its own credit history.</em>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &nbsp;&middot;&nbsp;
  <a href="#demo-flow">Demo</a> &nbsp;&middot;&nbsp;
  <a href="#architecture">Architecture</a> &nbsp;&middot;&nbsp;
  <a href="#smart-contracts">Contracts</a> &nbsp;&middot;&nbsp;
  <a href="#autonomous-agents">Agents</a>
</p>

---

A dual-layer credit protocol that cold-starts an on-chain **Digital Self** with real-person credit, then builds an independent digital credit identity through on-chain economic behavior — enabling autonomous agent-level decentralized lending.

<br>

## The Problem

AI agents are entering the on-chain economy — trading, borrowing, collaborating. But no protocol will extend credit to them, because **agents can be shut down and recreated at any time, bearing no consequences**.

No history. No identity. No accountability.

<br>

## The Solution

**Use real-person credit to underwrite a Digital Self, while the Digital Self accumulates its own on-chain credit history.**

Like an immigrant's credit journey — rely on home-country credit at first, then gradually build local history until it becomes the primary reference.

```
Early    ██████████████░░░░░░   Off-chain dominates (cold-start)
Mature   ░░░░░░██████████████   On-chain dominates (independent)
```

<br>

## Digital Self

Each Digital Self gets a unique identity — an ERC-8004 soulbound token with a generated avatar, credit score, and behavioral guardrails.

<p align="center">
  <img src="parallel-universe/assets/avatar-card.svg" alt="Digital Self Avatar Card" width="360">
</p>

<br>

## Architecture

```
                        ┌──────────────────┐
                        │   Web Dashboard   │
                        └────────┬─────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
        CreditAgent       LendingAgent       RevenueWatcher
        CollectionAgent   EscalationAgent
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 │
         ┌───────────┬───────────┼───────────┬──────────┐
         │           │           │           │          │
     Identity   CreditScore  Guardrails  LendingPool  Revenue
     (ERC-8004) (dual-layer) (safety)    (Jump Rate)  Escrow
```

<br>

## Smart Contracts

| Contract | Purpose |
|:---------|:--------|
| **Identity.sol** | ERC-8004 soulbound identity — binds Digital Self to real person, stores ZK proof |
| **CreditScore.sol** | Dual-layer scoring — ZK off-chain base + on-chain behavior, dynamic weight shifting |
| **Guardrails.sol** | Spending limits, per-tx caps, daily limits, emergency freeze |
| **LendingPool.sol** | Credit-based lending — Jump Rate interest model, risk reserve |
| **RevenueEscrow.sol** | Revenue custody — auto-splits income between repayment and agent |

<br>

## Autonomous Agents

Five agents coordinate the full lending lifecycle without human intervention:

| Agent | Role |
|:------|:-----|
| **CreditAgent** | Evaluates creditworthiness, calculates risk band, recommends terms |
| **LendingAgent** | Processes applications, checks guardrails, executes loans |
| **RevenueWatcher** | Monitors agent wallet for income, triggers auto-repayment |
| **CollectionAgent** | Handles overdue loans — freezes agent, marks defaults |
| **EscalationAgent** | Notifies real person, force-reclaims escrow, deactivates agent |

<br>

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| Wallet | Tether WDK |
| Contracts | Solidity 0.8.24, Hardhat 3 |
| Dashboard | Express.js + HTML/CSS/JS |
| CLI | Node.js, chalk, figlet |
| Avatar | DiceBear (notionists) |
| ZK | Simulated (prod: Reclaim Protocol) |
| Chain | EVM (Sepolia / localhost) |

<br>

## Quick Start

```bash
cd parallel-universe
npm install
npm run compile
```

**Terminal 1** — start local node:
```bash
npm run dev
```

**Terminal 2** — deploy and run:
```bash
npm run deploy:local
npm start
```

Then open **http://localhost:3000** for the web dashboard.

<br>

## Demo Flow

8 scenes walking through the full lifecycle of a Digital Self:

| # | Scene | What Happens |
|:--|:------|:-------------|
| 01 | **Boot Up** | Connect network, start dashboard, initialize 5 agents |
| 02 | **Create Digital Self** | WDK wallet + on-chain identity + avatar |
| 03 | **ERC-8004 Identity** | Mint soulbound identity token |
| 04 | **Credit Verification** | Experian + JP Morgan + ZK proof |
| 05 | **First Loan** | CreditAgent evaluates, LendingAgent executes |
| 06 | **Revenue & Repayment** | Earn income, auto-repay, credit grows |
| 07 | **Guardrail & Collection** | Over-borrow denied, escalation scenario |
| 08 | **Dashboard** | Final overview |

<br>

## Project Structure

```
parallel-universe/
├── contracts/                 # Solidity
│   ├── Identity.sol
│   ├── CreditScore.sol
│   ├── Guardrails.sol
│   ├── LendingPool.sol
│   └── RevenueEscrow.sol
├── src/
│   ├── index.js               # 8-scene demo
│   ├── server.js              # Web dashboard server
│   ├── ui.js                  # CLI renderer
│   ├── contracts.js
│   └── agents/
│       ├── CreditAgent.js
│       ├── LendingAgent.js
│       ├── RevenueWatcher.js
│       ├── CollectionAgent.js
│       └── EscalationAgent.js
├── web/                       # Dashboard UI
│   ├── index.html
│   ├── style.css
│   └── app.js
└── scripts/
    ├── deploy.js              # Sepolia
    └── deploy-local.js        # Local
```

<br>

## Roadmap

- [x] Smart contracts — Identity, CreditScore, Guardrails, LendingPool, RevenueEscrow
- [x] Jump Rate interest model
- [x] 5 autonomous agents
- [x] Tether WDK wallet integration
- [x] CLI demo (8 scenes)
- [x] Web dashboard
- [x] DiceBear avatar
- [x] Sepolia deployment
- [ ] Real ZK proofs (Circom + Reclaim Protocol)
- [ ] USDT via WDK token transfers
- [ ] Multi-agent (one person, multiple Digital Selves)
- [ ] Cross-chain credit portability

<br>

## Why Now

AI agents are exploding. They're starting to participate in real economic activity. But no credit infrastructure exists on-chain — it's 100% over-collateralized or zero-trust. ZK technology is finally mature enough to bridge off-chain data.

**These four conditions are true for the first time, right now.**

<br>

---

<p align="center">
  <strong>Troy Yan</strong> — Founder
</p>

<p align="center">
  <sub>MIT License</sub>
</p>
