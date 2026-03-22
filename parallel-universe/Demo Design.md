# Parallel Universe — Demo Design

> A 5-minute live demo that walks through the full lifecycle of a Digital Self: from creation to credit growth to guardrail trigger.

---

## Demo Narrative

**Story:** Alice is a software engineer. She wants her Digital Self to explore DeFi trading on-chain. But no protocol will lend to a brand-new agent with zero history. Parallel Universe solves this.

---

## Scene 1: Boot Up (30s)

User launches the CLI. Cyberpunk terminal fires up with ASCII art logo and glitch animation.

```
$ parallel-universe init

  ██████╗   █████╗  ██████╗  █████╗  ██╗     ██╗     ███████╗██╗
  ██╔══██╗ ██╔══██╗ ██╔══██╗██╔══██╗ ██║     ██║     ██╔════╝██║
  ██████╔╝ ███████║ ██████╔╝███████║ ██║     ██║     █████╗  ██║
  ██╔═══╝  ██╔══██║ ██╔══██║██╔══██║ ██║     ██║     ██╔══╝  ██║
  ██║      ██║  ██║ ██║  ██║██║  ██║ ███████╗███████╗███████╗███████╗
  ╚═╝      ╚═╝  ╚═╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚══════╝╚══════╝╚══════╝╚══════╝

  U N I V E R S E  v0.1.0

  Connecting to Ethereum Sepolia...  ✓
  Loading credit engine...           ✓
  Ready.

  > _
```

**What audience sees:** A polished, themed terminal — sets the tone immediately.

---

## Scene 2: Create Digital Self (45s)

User creates their Digital Self. The CLI generates a wallet, binds it to the real person, and displays the avatar.

```
> create-self --name "Alice-Explorer"

  Generating wallet...          0xA3c8...7F2d  ✓
  Binding to real person...     ZK-ID: 0x91..  ✓
  Deploying on-chain identity...               ✓

  ┌─────────────────────────┐
  │     ╭━━━━━━━━━━━╮       │
  │     ┃  ◉    ◉  ┃       │   Name:    Alice-Explorer
  │     ┃    ━━    ┃       │   Address: 0xA3c8...7F2d
  │     ┃  ╲____╱  ┃       │   Status:  CREATED
  │     ╰━━━━━━━━━━━╯       │   Credit:  -- (unverified)
  │    [ DIGITAL SELF ]     │
  └─────────────────────────┘

  ⚠ No credit score yet. Run `verify-credit` to cold-start.
```

**Key point:** Digital Self exists but has NO credit — can't do anything yet.

---

## Scene 3: ZK Credit Verification (60s)

The real person verifies off-chain credit data via ZK proof. This is the cold-start moment.

```
> verify-credit

  Starting ZK credit verification...

  ┌─ Off-chain Data Sources ──────────────────┐
  │                                           │
  │  [1] Bank Balance      ████████░░  $52K   │
  │  [2] Credit History    █████████░  7 yrs  │
  │  [3] Employment        ██████████  Active  │
  │  [4] Debt-to-Income    ████░░░░░░  23%    │
  │                                           │
  └───────────────────────────────────────────┘

  Generating ZK proof...  ████████████████████  100%
  Proof hash: 0x7f2a...9c1d

  Submitting to credit contract...  ✓
  Tx: 0x4b8e...2a3f (Sepolia)

  ┌─ Credit Score Initialized ────────────────┐
  │                                           │
  │  ZK Base Score:      680                  │
  │  On-chain Score:     N/A (no history)     │
  │                                           │
  │  Composite Score:    680                  │
  │  Weight: Off-chain 100% / On-chain 0%     │
  │                                           │
  │  Borrowing Capacity: 2,000 USDC           │
  │  ██████████████░░░░░░░░░░░░  680/900      │
  │                                           │
  └───────────────────────────────────────────┘

  ✓ Digital Self is now credit-enabled.
```

**Key point:** Real-person credit bootstraps the Digital Self. Weight is 100% off-chain at this stage. The audience sees a real tx hash on Sepolia.

---

## Scene 4: First Loan (60s)

Digital Self borrows from the liquidity pool. Show the on-chain transaction.

```
> borrow 1000 USDC

  Checking credit...
  ├─ Credit Score:        680
  ├─ Borrowing Capacity:  2,000 USDC
  ├─ Requested:           1,000 USDC
  └─ Status:              ✓ APPROVED

  ┌─ Guardrails Check ───────────────────────┐
  │  Max borrow limit     2,000   ✓ PASS     │
  │  Per-tx cap           1,500   ✓ PASS     │
  │  Anomaly detection    Normal  ✓ PASS     │
  └──────────────────────────────────────────┘

  Executing loan from Liquidity Pool...
  Tx: 0x9d1f...3b7a (Sepolia)  ✓

  ┌─ Loan Summary ───────────────────────────┐
  │  Borrowed:       1,000 USDC              │
  │  Interest Rate:  4.2% APR                │
  │  Repay by:       Block #8,420,000        │
  │  Collateral:     Credit-based (no lock)  │
  └──────────────────────────────────────────┘

  Digital Self wallet: 1,000.00 USDC
```

**Key point:** Under-collateralized lending powered by credit score. Guardrails check happens before execution.

---

## Scene 5: Repay & Credit Growth (60s)

Digital Self repays the loan. Credit score updates in real-time, showing the dual-source fusion shifting.

```
> repay 1000 USDC

  Processing repayment...
  Tx: 0x2e7c...8d4a (Sepolia)  ✓

  Loan CLOSED. On-time repayment recorded.

  ┌─ Credit Score Updated ────────────────────┐
  │                                           │
  │  BEFORE              →    AFTER           │
  │                                           │
  │  ZK Base:    680           680            │
  │  On-chain:   N/A           720            │
  │  Composite:  680     →     694            │
  │                                           │
  │  Weight shift:                            │
  │  Off-chain:  100%    →     80%            │
  │  On-chain:   0%      →     20%            │
  │                                           │
  │  ████████████████░░░░░░░░░░  694/900      │
  │                      ↑ +14                │
  │                                           │
  │  Borrowing Capacity: 2,000 → 2,500 USDC  │
  │                                           │
  └───────────────────────────────────────────┘

  ✓ Your Digital Self is building its own credit history.
```

**Key point:** This is the "aha" moment — the audience sees the weight shifting from off-chain to on-chain. The Digital Self is growing its own identity.

---

## Scene 6: Guardrail Trigger (45s)

Digital Self tries to over-borrow. Guardrails kick in.

```
> borrow 10000 USDC

  Checking credit...
  ├─ Credit Score:        694
  ├─ Borrowing Capacity:  2,500 USDC
  ├─ Requested:           10,000 USDC
  └─ Status:              ✗ DENIED

  ┌─ Guardrails Check ───────────────────────┐
  │  Max borrow limit     2,500   ✗ FAIL     │
  │  Risk assessment      HIGH    ✗ FAIL     │
  └──────────────────────────────────────────┘

  ⚠ GUARDRAIL TRIGGERED
  Requested amount exceeds borrowing capacity by 300%.
  This action has been blocked to protect the real person.

  Real person notified: alice@email.com
  Override available via `override --human-auth`
```

**Key point:** The system protects the real person. Guardrails are not optional.

---

## Scene 7: Dashboard Overview (30s)

End with a full dashboard view showing the Digital Self's journey.

```
> dashboard

╔═══════════════════════════════════════════════════════════════╗
║  P A R A L L E L   U N I V E R S E                          ║
║                                                               ║
║  ┌─────────────────────┐  ┌─────────────────────────────────┐ ║
║  │                     │  │                                 │ ║
║  │   ╭━━━━━━━━━━━╮     │  │  Alice-Explorer                │ ║
║  │   ┃  ◉    ◉  ┃     │  │  0xA3c8...7F2d                 │ ║
║  │   ┃  ╲____╱  ┃     │  │  Status: ACTIVE                │ ║
║  │   ╰━━━━━━━━━━━╯     │  │                                 │ ║
║  │  [ DIGITAL SELF ]   │  │  Credit Score         [ 694 ]   │ ║
║  │                     │  │  ├─ Off-chain Base:  680 (80%)  │ ║
║  │                     │  │  └─ On-chain:        720 (20%)  │ ║
║  └─────────────────────┘  │                                 │ ║
║                           │  ████████████████░░░░  694/900  │ ║
║  ┌─ Activity ──────────┐  │                                 │ ║
║  │ ✓ Created identity  │  │  Capacity:    2,500 USDC        │ ║
║  │ ✓ ZK verified       │  │  Total Borrowed: 1,000 USDC    │ ║
║  │ ✓ Borrowed 1K USDC  │  │  Total Repaid:   1,000 USDC    │ ║
║  │ ✓ Repaid on-time    │  │  Repayment Rate: 100%          │ ║
║  │ ✗ Over-borrow denied│  │  Risk Level:     ● LOW         │ ║
║  └─────────────────────┘  │  Guardrail Triggers: 1          │ ║
║                           └─────────────────────────────────┘ ║
║                                                               ║
║  Contracts (Sepolia):                                         ║
║  ├─ Credit:    0x1a2b...3c4d                                  ║
║  ├─ Pool:      0x5e6f...7a8b                                  ║
║  └─ Identity:  0x9c0d...1e2f                                  ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Demo Timing Summary

| Scene | Content | Duration |
|-------|---------|----------|
| 1. Boot Up | CLI launch, branding | 30s |
| 2. Create Digital Self | Wallet + avatar generation | 45s |
| 3. ZK Credit Verification | Off-chain → on-chain cold-start | 60s |
| 4. First Loan | Borrow from liquidity pool | 60s |
| 5. Repay & Credit Growth | Weight shift visualization | 60s |
| 6. Guardrail Trigger | Over-borrow denied | 45s |
| 7. Dashboard | Full overview | 30s |
| **Total** | | **~5.5 min** |

---

## What Makes This Demo Compelling

1. **Real transactions on Sepolia** — Not a mockup. Every action creates a real tx with a viewable hash.
2. **Credit growth is visible** — The weight shift from off-chain to on-chain is the core "aha" moment.
3. **Guardrails are dramatic** — The denied over-borrow shows the system's value proposition clearly.
4. **Cyberpunk aesthetic** — Memorable visual identity, stands out from typical DeFi demos.
5. **Full lifecycle in 5 minutes** — Create → Verify → Borrow → Repay → Grow → Guardrail. Complete story arc.

---

## Technical Requirements for Demo

### Smart Contracts (Sepolia)

- `CreditScore.sol` — Stores and updates dual-source credit scores
- `LiquidityPool.sol` — Simple lending pool with credit-based approval
- `Identity.sol` — Binds Digital Self address to ZK-verified real person
- `Guardrails.sol` — On-chain spending limits and anomaly rules

### CLI Application

- Terminal UI framework (ratatui / ink / blessed)
- Ethers.js / viem for contract interaction
- ASCII art renderer for avatar
- Animation system for progress bars and transitions

### ZK Component

- For demo: can simulate ZK proof generation with realistic delay + output a proof hash
- For production: Reclaim Protocol / tlsnotary integration

### Pre-demo Setup

- [ ] Deploy contracts to Sepolia
- [ ] Fund liquidity pool with test USDC
- [ ] Pre-generate a wallet for Alice
- [ ] Test full flow end-to-end
- [ ] Prepare backup: pre-recorded video in case of network issues
