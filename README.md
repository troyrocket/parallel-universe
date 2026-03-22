# Parallel Universe

> Your Digital Self deserves its own credit history.

A blockchain-based dual-layer credit protocol that cold-starts an on-chain Digital Self with real-person credit, then builds an independent digital credit identity through on-chain economic behavior — enabling agent-level decentralized lending.

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

## Architecture

```
Real Person (Off-chain Identity)
         │
    ZK Proof (Bank, Credit, Income)
         │
         ▼
  ┌──────────────────┐
  │  Credit Score     │
  │  = f(ZK Base,     │
  │    On-chain       │
  │    Behavior)      │
  └──────┬───────────┘
         │
    ┌────┴────┐
    ▼         ▼
Guardrails  Lending Pool
    │         │
    └────┬────┘
         ▼
   Digital Self (AI Agent)
    · Borrow / Repay
    · Trade / Interact
    · Earn / Collaborate
         │
         └──→ Behavior feeds back to Credit Score
```

## Smart Contracts

| Contract | Purpose |
|----------|---------|
| `Identity.sol` | Binds Digital Self wallet to real person, stores ZK proof hash |
| `CreditScore.sol` | Dual-layer scoring: ZK base + on-chain behavior, dynamic weight shifting |
| `Guardrails.sol` | Spending limits, per-tx caps, daily limits, emergency freeze |
| `LendingPool.sol` | Credit-based lending — no collateral, interest rate based on score |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Wallet | Tether WDK (`@tetherto/wdk`, `wdk-wallet-evm`) |
| Smart Contracts | Solidity 0.8.24, Hardhat 3 |
| ZK Verification | Simulated (production: Reclaim Protocol / tlsnotary) |
| CLI | Node.js, chalk, ora, boxen, gradient-string |
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

# Run the demo
npm start
```

## Demo Flow

The demo walks through the full lifecycle of a Digital Self in 7 scenes:

1. **Boot Up** — CLI launch, connect to network via WDK
2. **Create Digital Self** — Generate WDK wallet, deploy on-chain identity
3. **ZK Credit Verification** — Verify off-chain credit, initialize score (680)
4. **First Loan** — Borrow from lending pool with guardrails check
5. **Repay & Credit Growth** — On-time repayment, score increases (680→702), weight shifts
6. **Guardrail Trigger** — Over-borrow denied, real person notified
7. **Dashboard** — Full overview of Digital Self's credit journey

## Project Structure

```
├── README.md
├── Accelerator application/     # YZi Labs, Hustle Fund, Tether hackathon applications
└── parallel-universe/           # Core project
    ├── contracts/               # Solidity smart contracts
    │   ├── Identity.sol
    │   ├── CreditScore.sol
    │   ├── Guardrails.sol
    │   └── LendingPool.sol
    ├── scripts/                 # Deployment scripts
    │   ├── deploy.js            # Sepolia
    │   └── deploy-local.js      # Local hardhat
    ├── src/                     # Application code
    │   ├── index.js             # Main entry — 7-scene demo
    │   ├── contracts.js         # Contract loading utilities
    │   └── ui.js                # Cyberpunk CLI renderer
    ├── Parallel Universe.md     # Product spec
    ├── Demo Design.md           # Demo design doc
    ├── hardhat.config.cjs
    └── package.json
```

## Roadmap

- [x] Core smart contracts (Identity, CreditScore, Guardrails, LendingPool)
- [x] WDK wallet integration
- [x] CLI demo with full lifecycle
- [ ] Deploy to Sepolia testnet
- [ ] Real ZK proof integration (Reclaim Protocol)
- [ ] WDK MCP toolkit — agent autonomously manages its own credit
- [ ] Multi-agent support (one person, multiple Digital Selves)
- [ ] USDT integration via WDK token transfers
- [ ] Cross-chain credit portability

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
