/// CreditAgent — Evaluates creditworthiness and recommends loan terms

export class CreditAgent {
  constructor(contracts) {
    this.creditScore = contracts.creditScore;
    this.guardrails = contracts.guardrails;
    this.name = "CREDIT_AGENT";
  }

  async evaluate(agentAddress) {
    const [zkBase, onChain, composite, offWeight] =
      await this.creditScore.getScores(agentAddress);
    const capacity = await this.creditScore.getBorrowingCapacity(agentAddress);
    const [totalLoans, repaidOnTime, defaulted] =
      await this.creditScore.getLoanStats(agentAddress);

    const repaymentRate =
      totalLoans > 0n ? Number((repaidOnTime * 100n) / totalLoans) : 0;

    let riskBand = "HIGH";
    if (composite >= 800n) riskBand = "EXCELLENT";
    else if (composite >= 700n) riskBand = "GOOD";
    else if (composite >= 600n) riskBand = "FAIR";
    else if (composite >= 500n) riskBand = "POOR";

    let maxLoanRecommendation = capacity;
    if (riskBand === "HIGH" || riskBand === "POOR") {
      maxLoanRecommendation = capacity / 2n;
    }

    return {
      composite: Number(composite),
      zkBase: Number(zkBase),
      onChain: Number(onChain),
      offWeight: Number(offWeight),
      onWeight: Number(100n - offWeight),
      riskBand,
      repaymentRate,
      totalLoans: Number(totalLoans),
      defaulted: Number(defaulted),
      capacity,
      maxLoanRecommendation,
      eligible: composite >= 300n && defaulted === 0n,
    };
  }
}
