/// EscalationAgent — Notifies real person when agent defaults, triggers force-reclaim

export class EscalationAgent {
  constructor(contracts) {
    this.identity = contracts.identity;
    this.revenueEscrow = contracts.revenueEscrow;
    this.guardrails = contracts.guardrails;
    this.name = "ESCALATION_AGENT";
  }

  async escalate(agentAddress, collectionResult, onEvent) {
    const owner = await this.identity.getOwner(agentAddress);
    const events = [];

    // Step 1: Notify owner
    events.push({
      type: "OWNER_NOTIFIED",
      owner,
      message: `Digital Self ${agentAddress.slice(0, 10)}... has ${collectionResult.overdueLoans} overdue loan(s). Total: ${collectionResult.totalOverdue}`,
      severity: "CRITICAL",
      timestamp: Date.now(),
    });

    if (onEvent) onEvent("notify", events[0]);

    // Step 2: Force reclaim from escrow (if escrow has funds)
    if (this.revenueEscrow) {
      try {
        const escrowAccount = await this.revenueEscrow.accounts(agentAddress);
        if (escrowAccount.balance > 0n) {
          const tx = await this.revenueEscrow.forceReclaim(agentAddress);
          await tx.wait();
          events.push({
            type: "ESCROW_RECLAIMED",
            amount: escrowAccount.balance,
            tx: tx.hash,
          });
          if (onEvent) onEvent("reclaim", events[events.length - 1]);
        }
      } catch (err) {
        events.push({ type: "RECLAIM_FAILED", error: err.message });
      }
    }

    // Step 3: Deactivate the Digital Self
    try {
      const tx = await this.identity.deactivate(agentAddress);
      await tx.wait();
      events.push({
        type: "AGENT_DEACTIVATED",
        tx: tx.hash,
        message: "Digital Self deactivated. Real person must resolve outstanding debt.",
      });
      if (onEvent) onEvent("deactivate", events[events.length - 1]);
    } catch (err) {
      events.push({ type: "DEACTIVATE_FAILED", error: err.message });
    }

    return {
      action: "escalated",
      owner,
      events,
      resolution: "Real person must repay outstanding debt to reactivate Digital Self",
    };
  }
}
