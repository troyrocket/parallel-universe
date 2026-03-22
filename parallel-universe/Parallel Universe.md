# Parallel Universe

> Your Digital Self deserves its own credit history.

---

## One-Liner

A blockchain-based dual-layer credit protocol that cold-starts an on-chain Digital Self with real-person credit, then builds an independent digital credit identity through on-chain economic behavior — enabling agent-level decentralized lending.

---

## Inspiration

Pika Labs is building "Your Digital Self" — in real life you're a programmer, but your digital self can explore being a director.

What if your Digital Self needs to participate in the on-chain economy (lending, trading, collaborating)? It needs **credit**. But the fundamental problem with pure on-chain agents is: **they can be shut down and recreated at any time, bearing no consequences** — so no one dares to extend them credit.

**Parallel Universe's solution:** Use real-person credit to underwrite the Digital Self, while letting the Digital Self accumulate its own on-chain economic behavior, forming an independent credit entity with its own growth trajectory.

---

## Core Problems

| Problem | Current State | Our Solution |
|---------|--------------|-------------|
| On-chain agents have no credit | Agents can be shut down and recreated anytime, no accountability | Real-person credit underwriting provides an anchor of responsibility |
| Pure off-chain mapping is too thin | Just a "shadow" of real-person credit, no on-chain dimension | Dual-source fusion: off-chain foundation + on-chain behavior, composite expression |
| Agent behavior risk | Agents may recklessly borrow, gamble, causing harm to the real person | Smart contract-level behavioral guardrails + spending limits |

---

## Dual-Layer Credit Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                  Digital Self Credit Score                     │
│          = f(Off-chain Credit Base, On-chain Behavior)         │
│                                                                │
│  ┌───────────────────────┐      ┌───────────────────────────┐  │
│  │   Off-chain (ZK)      │      │   On-chain Behavior       │  │
│  │                       │      │                           │  │
│  │   · Bank deposits     │      │   · Loan repayment        │  │
│  │   · Credit cards      │      │   · Tx frequency/quality  │  │
│  │   · Employment        │      │   · Protocol history      │  │
│  │   · Asset proof       │      │   · Agent collaboration   │  │
│  │                       │      │   · Revenue stability     │  │
│  └───────────┬───────────┘      └─────────────┬─────────────┘  │
│              │                                │                │
│              └──────────┐    ┌────────────────┘                │
│                         ▼    ▼                                 │
│                  ┌──────────────────┐                          │
│                  │  Weighted Fusion │                          │
│                  └──────────────────┘                          │
│                                                                │
│  Dynamic weight adjustment:                                    │
│                                                                │
│  Early  ██████████████░░░░░░  Off-chain dominates              │
│         (cold-start anchor)                                    │
│                                                                │
│  Mature ░░░░░░██████████████  On-chain dominates               │
│         (independent credit entity)                            │
│                                                                │
│  Analogy: An immigrant relies on home-country credit at first; │
│  over time, local credit history becomes the primary reference.│
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Credit Layering Logic

1. **Layer 0 — Real Person Identity (Off-chain)**
   - ZK Proof verification of off-chain credit data
   - The real person is always the accountability anchor for the Digital Self
   - No privacy exposure — only proves "my credit meets a certain threshold"

2. **Layer 1 — Digital Self Credit (On-chain)**
   - Cold-started by real-person credit underwriting, receives initial credit limit
   - Gradually builds an independent credit profile through on-chain economic activity
   - Credit score is a **composite expression** of off-chain base + on-chain behavior, not a one-way mapping

3. **Guardrails**
   - Smart contract level: max borrowing limit, interaction whitelist, per-transaction cap
   - Anomaly detection: high-risk behavior (e.g., high leverage, frequent borrowing) triggers automatic downgrade or suspension
   - Real person can intervene / freeze the Digital Self's economic permissions at any time

---

## Technical Architecture

```
                    ┌─────────────────────────┐
                    │      Real Person        │
                    │   (Off-chain Identity)  │
                    └────────────┬────────────┘
                                 │
                            ZK Proof
                     (Bank, Credit, Income)
                                 │
                                 ▼
                   ┌──────────────────────────┐
                   │                          │
                   │   On-chain Credit Score  │
                   │   ═══════════════════    │
                   │                          │
                   │   ZK Base ──┐            │
                   │             ├─→ f(x,y)   │
                   │   On-chain ─┘            │
                   │   Behavior               │
                   │                          │
                   └──────┬─────────────┬─────┘
                          │             │
                ┌─────────┘             └──────────┐
                │                                  │
                ▼                                  ▼
   ┌────────────────────────┐     ┌────────────────────────┐
   │                        │     │                        │
   │      Guardrails        │     │    Liquidity Pool      │
   │                        │     │    (ETH Testnet)       │
   │  · Max borrow limit    │     │                        │
   │  · Interaction list│   │  · Credit-based Lending│
   │  · Per-tx cap          │     │  · ERC-8004 Standard   │
   │  · Anomaly detection   │     │  · Programmable Repay  │
   │  · Human override      │     │                        │
   │                        │     └───────────┬────────────┘
   └────────────┬───────────┘                 │
                │                             │
                └──────────┐   ┌──────────────┘
                           │   │
                           ▼   ▼
                 ┌───────────────────────┐
                 │                       │
                 │     Digital Self      │
                 │     (AI Agent)        │
                 │                       │
                 │  · Borrow / Repay     │
                 │  · Trade / Interact   │
                 │  · Earn / Collaborate │
                 │                       │
                 └───────────┬───────────┘
                             │
                             │  On-chain behavior
                             │  feeds back to
                             │  Credit Score
                             │
                             └──────→ (loop back ↑)
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| CLI / TUI | Rust (ratatui) or Node (ink/blessed), cyberpunk aesthetic |
| ZK Credit Verification | Reclaim Protocol / tlsnotary (ZK proofs for off-chain data) |
| Smart Contracts | Solidity on Sepolia/Holesky, ERC-8004 + lending pool |
| Avatar | Genie generation / ASCII Art (Digital Self visualization in CLI) |
| Credit Scoring Engine | Dual-source weighted algorithm (on-chain + off-chain) |

---

## Product: Cyberpunk CLI Terminal

All interactions happen in the CLI with cyberpunk aesthetics:

```
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ▄▄▄▄▄  ▄▄▄▄▄  ▄▄▄▄▄  ▄▄▄▄▄  ▄▄     ▄▄     ▄▄▄▄▄  ▄▄             ║
║   ██  ██ ██  ██ ██  ██ ██  ██ ██     ██     ██     ██             ║
║   ▀▀▀▀▀  ██████ █████▀ █████▀ ██     ██     ██████ ██             ║
║   ██     ██  ██ ██  ██ ██  ██ ██     ██     ██     ██             ║
║   ██     ██  ██ ██  ██ ██  ██ ██████ ██████ ▀▀▀▀▀  ██████         ║
║                                                                   ║
║              U  N  I  V  E  R  S  E    v0.1.0                     ║
║                                                                   ║
║ ┌─────────────────────────┐  ┌──────────────────────────────────┐ ║
║ │                         │  │                                  │ ║
║ │     ╭━━━━━━━━━━━╮       │  │  Identity                        │ ║
║ │     ┃  ◉    ◉  ┃        │  │  ├─ Address:  0xA3..F7           │ ║
║ │     ┃    ━━    ┃        │  │  ├─ Status:   ACTIVE             │ ║
║ │     ┃  ╲____╱  ┃        │  │  └─ Created:  2026-03-13         │ ║
║ │     ╰━━━━━━━━━━━╯       │  │                                  │ ║
║ │      ╱┃      ┃╲         │  │  Credit Score          [ 742 ]   │ ║
║ │     ╱ ┃      ┃ ╲        │  │  ├─ Off-chain Base:  680  (45%)  │ ║
║ │       ┃      ┃          │  │  └─ On-chain:        804  (55%)  │ ║
║ │      ╱╰━━━━━━╯╲         │  │                                  │ ║
║ │     ╱    ┃┃    ╲        │  │  ██████████████░░░░░░░░  742/900 │ ║
║ │          ┃┃             │  │                                  │ ║
║ │       ━━━┛┗━━━          │  │  Borrowing Capacity:  5,000 USDC │ ║
║ │                         │  │  Active Loans:        1,200 USDC │ ║
║ │    [ DIGITAL SELF ]     │  │  Repayment Rate:      98.7%      │ ║
║ │                         │  │  Risk Level:          ● LOW      │ ║
║ └─────────────────────────┘  └──────────────────────────────────┘ ║
║                                                                   ║
║ ┌───────────────────────────────────────────────────────────────┐ ║
║ │ > _                                                           │ ║
║ └───────────────────────────────────────────────────────────────┘ ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

---

## Demo Core Flow

1. **Create Digital Self** — Generate avatar + on-chain identity (address binding) in CLI
2. **ZK Credit Verification** — Real person verifies off-chain credit data via ZK proof to cold-start the Digital Self
3. **Receive Initial Credit Score** — Digital Self receives initial credit limit based on off-chain verification
4. **On-chain Lending** — Digital Self borrows from the testnet liquidity pool
5. **Credit Growth** — Repayment and other on-chain behavior updates the credit score, demonstrating dynamic weight shifts in the dual-source fusion
6. **Guardrail Trigger** — Demonstrate automatic restriction mechanisms in scenarios like over-borrowing

---

## Market Positioning

### Comparable / Reference

- **jane3.xyz** — On-chain credit protocol, but lacks the real-person-to-Digital-Self dual-layer architecture
- **ERC-8004** — On-chain credit standard

Differentiation: **Not pure on-chain credit, nor a simple off-chain mapping — but a composite credit entity built on real-person underwriting + on-chain behavior accumulation.**

### Accelerator / Investor Fit Analysis

#### 🟢 Strong Fit

**1. Hustle Fund — AI Fintech Infrastructure**
- Explicitly calls out **Agent Credit Scoring & Underwriting** (#2) and **Agent Lending & Working Capital** (#3)
- Quote: "An agent credit bureau that scores agents based on task completion rates, revenue history, uptime reliability..."
- Our dual-layer credit model (real-person underwrite + on-chain behavior) is an upgraded version of what they describe
- **#5 Agent Insurance & Risk Transfer** also aligns with our guardrails / risk control

**2. VanEck / Money Machines — RFS #07 Credit Infrastructure**
- Quote: "novel credit primitives built on stablecoins, smart contracts...extends capital to agent-controlled cards and wallets, with programmable repayment and risk controls"
- Our project is almost a direct response to #07; #05 Agent Identity & Reputation is also highly relevant

**3. YZi Labs — EASY Residency S3**
- Explicitly lists: **Stablecoin, payments, and DeFi-native banking infra**
- Also: **Privacy-preserving and chain-abstracted infra** (our ZK verification component)
- Web3 + AI crossover, $500K investment, Demo Day at TOKEN2049 Dubai (April 2026)

**4. Pear VC — PearX S26**
- **"Financial-grade agent infrastructure"** by Ryan Sells — practically written for us:
  - "identity and authorization frameworks that let agents act on behalf of humans with scoped, revocable permissions"
  - "policy engines that enforce compliance constraints and spending limits"
  - Our real-person underwrite + behavioral guardrails map directly to this
- **"IRL trust networks"** by Warren Shaeffer — bringing real-world trust on-chain, aligns with our ZK-verified real-person credit approach

#### 🟡 Partial Fit

**5. Ethereum Foundation — Use Case Lab Residency**
- As an Ethereum ecosystem project (ERC-8004, testnet deployment), naturally aligned

**6. Long Journey Residency**
- Sector-agnostic, emphasizes "magically weird before it becomes consensus"
- "Real-person credit underwriting a Digital Self" is sufficiently forward-looking
- Deadline: 2026-03-31

**7. Eigenprize**
- Pure talent prize, sector-agnostic, $100K no-strings-attached — worth a quick application

#### 🔴 Weak Fit

**8. YC Startup School** — Tech talent conference, not an investment/accelerator program

**9. OSV Fellowships** — Skews humanities/science/creative, not a strong match

---

## Open Design Questions

- [ ] Can one real person have multiple Digital Selves? How is credit capacity allocated?
- [ ] What happens to credit history when a Digital Self "dies" (shutdown/abandoned)?
- [ ] Off-chain credit data update frequency — real-time vs. periodic snapshots?
- [ ] How are credit score algorithm weights determined? Is a governance mechanism needed?
- [ ] What are the specific trigger conditions for real-person intervention?

---

## Above is the framework. Next step: build the Demo.
