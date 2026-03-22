/// RevenueWatcher — Monitors agent wallet for income and triggers auto-repayment

export class RevenueWatcher {
  constructor(contracts, provider) {
    this.lendingPool = contracts.lendingPool;
    this.revenueEscrow = contracts.revenueEscrow;
    this.provider = provider;
    this.name = "REVENUE_WATCHER";
    this.watching = false;
    this.interval = null;
  }

  async checkBalance(agentAddress) {
    const balance = await this.provider.getBalance(agentAddress);
    return balance;
  }

  async getActiveLoans(agentAddress) {
    const loans = await this.lendingPool.getLoans(agentAddress);
    return loans
      .map((loan, index) => ({ ...loan, index }))
      .filter((loan) => !loan.repaid);
  }

  async checkAndRepay(agentAddress, signer, onEvent) {
    const balance = await this.checkBalance(agentAddress);
    const activeLoans = await this.getActiveLoans(agentAddress);

    if (activeLoans.length === 0) {
      if (onEvent) onEvent("no_loans", { balance });
      return { action: "none", reason: "No active loans" };
    }

    const firstLoan = activeLoans[0];
    const loanAmount = firstLoan.amount;

    if (balance >= loanAmount) {
      if (onEvent) onEvent("sufficient_funds", { balance, loanAmount });

      // Auto-repay
      try {
        const tx = await this.lendingPool.connect(signer).repay(agentAddress, firstLoan.index, {
          value: loanAmount,
        });
        await tx.wait();

        if (onEvent) onEvent("repaid", { tx: tx.hash, amount: loanAmount, loanIndex: firstLoan.index });
        return { action: "repaid", tx: tx.hash };
      } catch (err) {
        if (onEvent) onEvent("repay_failed", { error: err.message });
        return { action: "failed", error: err.message };
      }
    } else {
      if (onEvent) onEvent("insufficient", { balance, needed: loanAmount });
      return { action: "waiting", balance, needed: loanAmount };
    }
  }

  startWatching(agentAddress, signer, intervalMs = 15000, onEvent) {
    this.watching = true;
    if (onEvent) onEvent("started", { interval: intervalMs });

    this.interval = setInterval(async () => {
      if (!this.watching) return;
      await this.checkAndRepay(agentAddress, signer, onEvent);
    }, intervalMs);
  }

  stopWatching() {
    this.watching = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
