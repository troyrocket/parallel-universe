// ─── Parallel Universe Dashboard ───

// State
const state = {
  agent: null, // { name, address, status }
  credit: null, // { zkBase, onChain, composite, offWeight, onWeight, capacity }
  loans: [],
  activities: [],
};

// ─── Navigation ───
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.dataset.section;
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(section).classList.add('active');
  });
});

// ─── Avatar Preview (live update) ───
const nameInput = document.getElementById('agent-name');
const avatarPreview = document.getElementById('avatar-preview');

nameInput.addEventListener('input', () => {
  const name = nameInput.value || 'default';
  avatarPreview.src = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear,solid`;
});

// ─── Log Helper ───
function addLog(containerId, msg, type = 'info') {
  const container = document.getElementById(containerId);
  const line = document.createElement('div');
  line.className = `log-line log-${type}`;
  line.textContent = msg;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}

function addActivity(text, ok = true) {
  state.activities.push({ text, ok });
  renderActivityLog();
}

function renderActivityLog() {
  const container = document.getElementById('activity-log');
  container.innerHTML = state.activities.map(a => `
    <div class="activity-item">
      <span class="activity-icon ${a.ok ? 'ok' : 'fail'}">${a.ok ? '>>' : 'XX'}</span>
      <span class="ghost">${a.text}</span>
    </div>
  `).join('');
}

// ─── Simulate delay ───
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Create Digital Self ───
document.getElementById('btn-create').addEventListener('click', async () => {
  const name = nameInput.value.trim() || 'Agent-001';
  const log = 'create-log';

  addLog(log, 'Initializing WDK wallet...', 'info');
  await delay(800);

  const address = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  addLog(log, `WDK wallet created: ${address.slice(0, 6)}...${address.slice(-4)}`, 'ok');
  await delay(500);

  addLog(log, 'Deploying on-chain identity...', 'info');
  await delay(1000);
  addLog(log, 'On-chain identity deployed', 'ok');
  const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  addLog(log, txHash, 'tx');
  await delay(500);

  addLog(log, 'Minting ERC-8004 identity token...', 'info');
  await delay(800);
  addLog(log, 'ERC-8004 soulbound token minted', 'ok');
  await delay(300);

  addLog(log, `Digital Self "${name}" created successfully`, 'ok');

  // Update state
  state.agent = { name, address, status: 'ACTIVE' };

  // Update dashboard
  document.getElementById('dash-name').textContent = name;
  document.getElementById('dash-address').textContent = `${address.slice(0, 6)}...${address.slice(-4)}`;
  document.getElementById('dash-status').textContent = 'ACTIVE';
  document.getElementById('dash-avatar').src = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear,solid`;

  addActivity('Digital Self created');
  addActivity('ERC-8004 registered');
});

// ─── Verify Credit ───
document.getElementById('btn-verify').addEventListener('click', async () => {
  const log = 'verify-log';

  addLog(log, 'Connecting to Experian...', 'info');
  await delay(1000);
  addLog(log, 'Experian credit score verified: 680', 'ok');

  addLog(log, 'Connecting to JP Morgan...', 'info');
  await delay(800);
  addLog(log, 'Chase Sapphire credit limit verified: $15,000', 'ok');

  addLog(log, 'Verifying employment status...', 'info');
  await delay(600);
  addLog(log, 'Employment: ACTIVE (Software Engineer)', 'ok');

  addLog(log, 'Generating ZK proof...', 'info');
  await delay(2000);
  const proofHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  addLog(log, `ZK proof generated: ${proofHash.slice(0, 10)}...`, 'ok');

  addLog(log, 'Submitting ZK proof to credit contract...', 'info');
  await delay(1000);
  addLog(log, 'Credit score initialized on-chain', 'ok');

  // Update state
  state.credit = {
    zkBase: 680,
    onChain: 0,
    composite: 680,
    offWeight: 100,
    onWeight: 0,
    capacity: '6.7 ETH',
  };

  updateDashboardCredit();
  addActivity('ZK credit verified');
  addLog(log, 'Digital Self is now credit-enabled', 'ok');
});

function updateDashboardCredit() {
  if (!state.credit) return;
  const c = state.credit;
  document.getElementById('dash-score').textContent = c.composite;
  document.getElementById('dash-bar').style.width = `${(c.composite / 900) * 100}%`;
  document.getElementById('dash-zk').textContent = c.zkBase;
  document.getElementById('dash-onchain').textContent = c.onChain || '—';
  document.getElementById('dash-capacity').textContent = c.capacity;
  document.getElementById('dash-risk').textContent = c.composite >= 700 ? 'LOW' : c.composite >= 500 ? 'MEDIUM' : 'HIGH';
  document.getElementById('loan-capacity').textContent = c.capacity;

  // Estimate rate based on score
  let rate = '12.0%';
  if (c.composite >= 800) rate = '2.0%';
  else if (c.composite >= 700) rate = '3.5%';
  else if (c.composite >= 600) rate = '5.0%';
  else if (c.composite >= 500) rate = '7.5%';
  document.getElementById('est-rate').textContent = rate;
}

// ─── Borrow ───
document.getElementById('btn-borrow').addEventListener('click', async () => {
  const amount = document.getElementById('loan-amount').value;
  const log = 'loan-log';

  if (!state.credit) {
    addLog(log, 'Credit not verified. Verify credit first.', 'fail');
    return;
  }

  addLog(log, `Requesting loan: ${amount} USDT...`, 'info');
  await delay(500);

  addLog(log, 'CreditAgent evaluating...', 'info');
  await delay(800);
  addLog(log, `Credit score: ${state.credit.composite} — ELIGIBLE`, 'ok');

  addLog(log, 'Guardrails check...', 'info');
  await delay(500);
  addLog(log, 'Max borrow limit    PASS', 'ok');
  addLog(log, 'Per-tx cap          PASS', 'ok');
  addLog(log, 'Anomaly detection   PASS', 'ok');

  addLog(log, 'LendingAgent executing loan from pool...', 'info');
  await delay(1200);

  const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  addLog(log, 'Loan executed', 'ok');
  addLog(log, txHash, 'tx');

  const loan = {
    id: state.loans.length + 1,
    amount: `${amount} USDT`,
    rate: document.getElementById('est-rate').textContent,
    status: 'ACTIVE',
    date: new Date().toISOString().slice(0, 10),
  };
  state.loans.push(loan);
  renderLoans();

  document.getElementById('dash-active-loans').textContent = state.loans.filter(l => l.status === 'ACTIVE').length;
  document.getElementById('dash-total-borrowed').textContent = state.loans.reduce((sum, l) => sum + parseInt(l.amount), 0) + ' USDT';

  addActivity(`Borrowed ${amount} USDT`);
  addLog(log, `RevenueWatcher activated — monitoring agent income`, 'ok');
});

function renderLoans() {
  const container = document.getElementById('loans-list');
  if (state.loans.length === 0) {
    container.innerHTML = '<div class="ghost" style="padding: 2rem; text-align: center">NO ACTIVE LOANS</div>';
    return;
  }
  container.innerHTML = state.loans.map(l => `
    <div class="loan-item">
      <div class="loan-item-header">
        <span class="loan-item-amount">${l.amount}</span>
        <span class="loan-item-status ${l.status === 'OVERDUE' ? 'overdue' : ''}">${l.status}</span>
      </div>
      <div class="info-row"><span class="ghost">RATE</span><span>${l.rate}</span></div>
      <div class="info-row"><span class="ghost">DATE</span><span class="dim">${l.date}</span></div>
      ${l.status === 'ACTIVE' ? `<button class="btn-secondary" onclick="repayLoan(${l.id - 1})">[ REPAY ]</button>` : ''}
    </div>
  `).join('');
}

// ─── Repay ───
async function repayLoan(index) {
  const loan = state.loans[index];
  if (!loan || loan.status !== 'ACTIVE') return;

  loan.status = 'REPAID';
  renderLoans();

  // Update credit score (simulate growth)
  if (state.credit) {
    state.credit.onChain = 900;
    state.credit.offWeight = Math.max(20, state.credit.offWeight - 10);
    state.credit.onWeight = 100 - state.credit.offWeight;
    state.credit.composite = Math.round(
      (state.credit.zkBase * state.credit.offWeight + state.credit.onChain * state.credit.onWeight) / 100
    );
    state.credit.capacity = ((state.credit.composite - 300) * 9 / 600 + 1).toFixed(2) + ' ETH';
    updateDashboardCredit();
  }

  document.getElementById('dash-active-loans').textContent = state.loans.filter(l => l.status === 'ACTIVE').length;

  addActivity('Repaid on-time');

  // Add timeline event
  const timeline = document.getElementById('repayment-timeline');
  timeline.innerHTML = `
    <div class="timeline-item">
      <span class="pulse">REPAID</span> — ${loan.amount} — ${new Date().toLocaleTimeString()}
    </div>
  ` + timeline.innerHTML;
}

// Make repayLoan available globally
window.repayLoan = repayLoan;

// ─── Polling (simulated) ───
setInterval(() => {
  const el = document.getElementById('next-check');
  if (el) el.textContent = new Date().toLocaleTimeString();
}, 5000);
