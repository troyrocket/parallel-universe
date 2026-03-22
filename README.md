# Parallel Universe

```
██████╗  █████╗ ██████╗  █████╗ ██╗     ██╗     ███████╗██╗
██╔══██╗██╔══██╗██╔══██╗██╔══██╗██║     ██║     ██╔════╝██║
██████╔╝███████║██████╔╝███████║██║     ██║     █████╗  ██║
██╔═══╝ ██╔══██║██╔══██╗██╔══██║██║     ██║     ██╔══╝  ██║
██║     ██║  ██║██║  ██║██║  ██║███████╗███████╗███████╗███████╗
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝

██╗   ██╗███╗   ██╗██╗██╗   ██╗███████╗██████╗ ███████╗███████╗
██║   ██║████╗  ██║██║██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝
██║   ██║██╔██╗ ██║██║██║   ██║█████╗  ██████╔╝███████╗█████╗
██║   ██║██║╚██╗██║██║╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝
╚██████╔╝██║ ╚████║██║ ╚████╔╝ ███████╗██║  ██║███████║███████╗
 ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝

>_ Your Digital Self deserves its own credit history.
```

A blockchain-based dual-layer credit protocol that cold-starts an on-chain Digital Self with real-person credit, then builds an independent digital credit identity through on-chain economic behavior — enabling autonomous agent-level decentralized lending.

---

## The Problem

AI agents are entering the on-chain economy — trading, borrowing, collaborating. But no protocol will extend credit to them, because **agents can be shut down and recreated at any time, bearing no consequences**.

Pure on-chain credit doesn't work (no history). Pure off-chain mapping is too thin (just a shadow). There's no bridge between real-world trust and on-chain identity.

## The Solution

**Use real-person credit to underwrite a Digital Self, while the Digital Self accumulates its own on-chain credit history.**

Think of it like an immigrant's credit journey: rely on home-country credit at first, then gradually build local credit history until it becomes the primary reference.

```
Early   ██████████████░░░░░░  Off-chain dominates (cold-start anchor)
Mature  ░░░░░░██████████████  On-chain dominates (independent credit entity)
```

## Digital Self Avatar

Each Digital Self gets a unique avatar generated via [DiceBear](https://www.dicebear.com/) (notionists style), displayed as an identity card:

<p align="center">
  <img src="https://api.dicebear.com/9.x/notionists/svg?seed=Alice-Explorer&backgroundType=gradientLinear,solid" width="200" alt="Digital Self Avatar">
</p>

```
┌──────────────────────────────────┐
│                                  │
│         [ DIGITAL SELF ]         │
│                                  │
│  NAME        Alice-Explorer      │
│  ADDRESS     0xA3c8...7F2d       │
│  STATUS      ACTIVE              │
│  CREDIT      680 / 900           │
│                                  │
│  ┌────────┐  ┌─────────┐        │
│  │ERC-8004│  │ZK_PROOF │        │
│  └────────┘  └─────────┘        │
│                                  │
└──────────────────────────────────┘
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Web Dashboard                       │
│          (Digital Self management, human-facing)     │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────┐
│                  Agent Coordination                  │
│                                                      │
│  CreditAgent     LendingAgent     CollectionAgent    │
│  (evaluation)    (execution)      (overdue handling) │
│                                                      │
│  RevenueWatcher   EscalationAgent                    │
│  (income monitor)  (owner notify)                    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────┐
│                Smart Contracts                       │
│                                                      │
│  Identity.sol      CreditScore.sol   Guardrails.sol  │
│  (ERC-8004)        (dual-layer)      (safety rules)  │
│                                                      │
│  LendingPool.sol   RevenueEscrow.sol                 │
│  (Jump Rate model) (auto-repayment)                  │
└─────────────────────────────────────────────────────┘
```

## Smart Contracts

| Contract | Purpose |
|----------|---------|
| `Identity.sol` | ERC-8004 soulbound identity — binds Digital Self to real person, stores ZK proof |
| `CreditScore.sol` | Dual-layer scoring: ZK off-chain base + on-chain behavior, dynamic weight shifting |
| `Guardrails.sol` | Spending limits, per-tx caps, daily limits, emergency freeze |
| `LendingPool.sol` | Credit-based lending with Jump Rate interest model, risk reserve |
| `RevenueEscrow.sol` | Revenue custody — auto-splits income between repayment and agent funds |

## Autonomous Agents

| Agent | Role |
|-------|------|
| `CreditAgent` | Evaluates creditworthiness, calculates risk band, recommends loan terms |
| `LendingAgent` | Processes applications, checks guardrails, executes loans from pool |
| `RevenueWatcher` | Monitors agent wallet for income, triggers auto-repayment |
| `CollectionAgent` | Handles overdue loans — freezes agent, marks defaults |
| `EscalationAgent` | Notifies real person, force-reclaims escrow, deactivates agent |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Wallet | Tether WDK (`@tetherto/wdk`, `wdk-wallet-evm`) |
| Smart Contracts | Solidity 0.8.24, Hardhat 3 |
| Web Dashboard | Express.js + vanilla HTML/CSS/JS |
| CLI | Node.js, chalk, ora, figlet |
| Avatar | DiceBear API (notionists style) |
| ZK Verification | Simulated (production: Reclaim Protocol / tlsnotary) |
| Chain | EVM-compatible (Sepolia testnet / localhost) |

## Quick Start

```bash
cd parallel-universe

# Install dependencies
npm install

# Compile contracts
npm run compile

# Start local node (terminal 1)
npm run dev

# Deploy contracts (terminal 2)
npm run deploy:local

# Run the demo (terminal 2)
npm start

# Open web dashboard
open http://localhost:3000
```

## Demo Flow

The demo walks through the full lifecycle of a Digital Self in 8 scenes:

| Scene | What Happens | Agents Involved |
|-------|-------------|-----------------|
| 1. Boot Up | Logo, connect network, start dashboard, initialize 5 agents | — |
| 2. Create Digital Self | WDK wallet + on-chain identity + DiceBear avatar card | — |
| 3. ERC-8004 Identity | Mint soulbound identity token | — |
| 4. Credit Verification | Experian 680 + JP Morgan $15K + ZK proof + escrow activation | — |
| 5. First Loan | CreditAgent evaluates → LendingAgent executes (Jump Rate) | CreditAgent, LendingAgent |
| 6. Revenue & Repayment | Agent earns income → RevenueWatcher detects → auto-repay → credit grows | RevenueWatcher |
| 7. Guardrail & Collection | Over-borrow denied + collection/escalation scenario | CollectionAgent, EscalationAgent |
| 8. Dashboard | Final overview — CLI + web dashboard at localhost:3000 | — |

## Project Structure

```
├── README.md
├── parallel-universe/              # Core project
│   ├── contracts/                  # Solidity smart contracts
│   │   ├── Identity.sol
│   │   ├── CreditScore.sol
│   │   ├── Guardrails.sol
│   │   ├── LendingPool.sol
│   │   └── RevenueEscrow.sol
│   ├── src/
│   │   ├── index.js                # Main entry — 8-scene demo
│   │   ├── server.js               # Express server for web dashboard
│   │   ├── contracts.js            # Contract loading utilities
│   │   ├── ui.js                   # CLI renderer (design system)
│   │   └── agents/
│   │       ├── CreditAgent.js
│   │       ├── LendingAgent.js
│   │       ├── RevenueWatcher.js
│   │       ├── CollectionAgent.js
│   │       └── EscalationAgent.js
│   ├── web/                        # Web dashboard
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── scripts/
│   │   ├── deploy.js               # Sepolia deployment
│   │   └── deploy-local.js         # Local hardhat deployment
│   └── package.json
└── design style/                   # Visual identity reference
```

## Roadmap

- [x] Core smart contracts (Identity, CreditScore, Guardrails, LendingPool)
- [x] RevenueEscrow with auto-repayment
- [x] Jump Rate interest model
- [x] WDK wallet integration
- [x] 5 autonomous agents (Credit, Lending, Revenue, Collection, Escalation)
- [x] CLI demo with 8-scene lifecycle
- [x] Web dashboard
- [x] DiceBear avatar generation
- [x] Deploy to Sepolia testnet
- [ ] Real ZK proof integration (Circom + Reclaim Protocol)
- [ ] USDT integration via WDK token transfers
- [ ] Multi-agent support (one person, multiple Digital Selves)
- [ ] Cross-chain credit portability
- [ ] ML-based credit scoring model

## Why Now

- AI agent count is exploding (2025-2026)
- Agents are starting to participate in real economic activity
- No credit infrastructure exists on-chain — it's 100% over-collateralized or zero-trust
- ZK technology is mature enough to bridge off-chain data
- **These four conditions are true for the first time, right now.**

## Team

**Troy Yan** — Founder

## License

MIT
