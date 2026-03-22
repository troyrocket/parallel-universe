/// CollectionAgent — Handles overdue loans, freezes spending, initiates collection

export class CollectionAgent {
  constructor(contracts) {
    this.lendingPool = contracts.lendingPool;
    this.guardrails = contracts.guardrails;
    this.creditScore = contracts.creditScore;
    this.name = "COLLECTION_AGENT";
  }

  async checkOverdueLoans(agentAddress, currentBlock) {
    const loans = await this.lendingPool.getLoans(agentAddress);
    const overdue = [];

    for (let i = 0; i < loans.length; i++) {
      if (!loans[i].repaid && BigInt(currentBlock) > loans[i].dueBlock) {
        overdue.push({
          index: i,
          amount: loans[i].amount,
          dueBlock: Number(loans[i].dueBlock),
          blocksOverdue: currentBlock - Number(loans[i].dueBlock),
        });
      }
    }

    return overdue;
  }

  async freezeAgent(agentAddress) {
    const tx = await this.guardrails.freeze(agentAddress);
    await tx.wait();
    return tx.hash;
  }

  async initiateCollection(agentAddress, currentBlock) {
    const overdue = await this.checkOverdueLoans(agentAddress, currentBlock);

    if (overdue.length === 0) {
      return { action: "none", reason: "No overdue loans" };
    }

    const actions = [];

    // Step 1: Freeze agent spending
    try {
      const freezeTx = await this.freezeAgent(agentAddress);
      actions.push({ type: "FREEZE", tx: freezeTx });
    } catch (err) {
      actions.push({ type: "FREEZE_FAILED", error: err.message });
    }

    // Step 2: Mark defaults for severely overdue loans (100+ blocks)
    for (const loan of overdue) {
      if (loan.blocksOverdue > 100) {
        try {
          const tx = await this.lendingPool.markDefault(agentAddress, loan.index);
          await tx.wait();
          actions.push({ type: "DEFAULT_MARKED", loanIndex: loan.index, tx: tx.hash });
        } catch (err) {
          actions.push({ type: "DEFAULT_FAILED", loanIndex: loan.index, error: err.message });
        }
      }
    }

    return {
      action: "collection_initiated",
      overdueLoans: overdue.length,
      totalOverdue: overdue.reduce((sum, l) => sum + l.amount, 0n),
      actions,
      needsEscalation: overdue.some((l) => l.blocksOverdue > 100),
    };
  }
}
