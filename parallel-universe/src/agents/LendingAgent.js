/// LendingAgent — Processes loan applications and executes lending

export class LendingAgent {
  constructor(contracts) {
    this.lendingPool = contracts.lendingPool;
    this.guardrails = contracts.guardrails;
    this.name = "LENDING_AGENT";
  }

  async processApplication(agentAddress, amount, creditReport) {
    // Pre-checks
    if (!creditReport.eligible) {
      return { approved: false, reason: "Agent not eligible for lending" };
    }

    if (amount > creditReport.maxLoanRecommendation) {
      return {
        approved: false,
        reason: `Amount exceeds recommendation: max ${creditReport.maxLoanRecommendation}`,
      };
    }

    // Check guardrails
    const [allowed, reason] = await this.guardrails.checkBorrow(agentAddress, amount);
    if (!allowed) {
      return { approved: false, reason };
    }

    // Get pool stats
    const [available, outstanding, reserve, util, currentRate] =
      await this.lendingPool.getPoolStats();

    if (amount > available) {
      return { approved: false, reason: "Insufficient pool liquidity" };
    }

    // Get effective rate
    const effectiveRate = await this.lendingPool.getEffectiveRate(agentAddress);

    return {
      approved: true,
      terms: {
        amount,
        rate: Number(effectiveRate) / 100, // convert basis points to percentage
        rateBps: Number(effectiveRate),
        poolUtilization: Number(util) / 100,
        poolAvailable: available,
      },
    };
  }

  async executeLoan(agentAddress, amount) {
    const tx = await this.lendingPool.borrow(agentAddress, amount);
    const receipt = await tx.wait();
    return { tx: tx.hash, receipt };
  }
}
