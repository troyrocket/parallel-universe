// ─── Parallel Universe Dashboard — Multi Digital Self Management ───

// Pre-populated Digital Selves
const state = {
  selves: [
    {
      name: "Alice-Explorer",
      address: "0xA3c8...7F2d",
      status: "ACTIVE",
      credit: { zkBase: 680, onChain: 900, composite: 702, offWeight: 90, onWeight: 10 },
      capacity: "7.03 ETH",
      activeLoans: 1,
      totalBorrowed: "1,000 USDT",
      risk: "LOW",
    },
    {
      name: "Bob-Trader",
      address: "0xF18F...78C1",
      status: "ACTIVE",
      credit: { zkBase: 720, onChain: 810, composite: 738, offWeight: 70, onWeight: 30 },
      capacity: "8.59 ETH",
      activeLoans: 2,
      totalBorrowed: "3,500 USDT",
      risk: "LOW",
    },
    {
      name: "Charlie-Analyst",
      address: "0x9bE9...7353",
      status: "FROZEN",
      credit: { zkBase: 580, onChain: 400, composite: 544, offWeight: 80, onWeight: 20 },
      capacity: "0 ETH",
      activeLoans: 0,
      totalBorrowed: "0 USDT",
      risk: "HIGH",
    },
  ],
  selectedIndex: null,
  loans: [],
  activities: [
    { text: "Alice-Explorer: Repaid 1,000 USDT on-time", ok: true },
    { text: "Bob-Trader: Borrowed 2,000 USDT", ok: true },
    { text: "Charlie-Analyst: FROZEN — overdue loan", ok: false },
    { text: "Bob-Trader: Borrowed 1,500 USDT", ok: true },
    { text: "Alice-Explorer: Credit grew 680 → 702", ok: true },
  ],
};

// ─── Navigation ───
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const section = link.dataset.section;
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));
    document.getElementById(section).classList.add("active");
  });
});

// ─── Render Fleet Grid ───
function renderFleet() {
  const grid = document.getElementById("fleet-grid");
  grid.innerHTML = state.selves
    .map(
      (s, i) => `
    <div class="self-card ${state.selectedIndex === i ? "selected" : ""}" onclick="selectSelf(${i})">
      <div class="self-avatar">
        <img src="https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(s.name)}&backgroundType=gradientLinear,solid" alt="${s.name}">
      </div>
      <div class="self-name">${s.name}</div>
      <div class="self-score">${s.credit.composite}</div>
      <div class="score-bar"><div class="score-bar-fill" style="width: ${(s.credit.composite / 900) * 100}%"></div></div>
      <div class="self-status ${s.status === "ACTIVE" ? "active" : "frozen"}">${s.status}</div>
    </div>
  `
    )
    .join("");

  // Update loan selector
  const loanSelect = document.getElementById("loan-agent");
  if (loanSelect) {
    loanSelect.innerHTML = state.selves
      .filter((s) => s.status === "ACTIVE")
      .map((s) => `<option value="${s.name}">${s.name} (Score: ${s.credit.composite})</option>`)
      .join("");
  }
}

// ─── Select Digital Self ───
function selectSelf(index) {
  state.selectedIndex = index;
  const s = state.selves[index];
  const detail = document.getElementById("selected-detail");
  detail.style.display = "block";

  document.getElementById("detail-avatar").src = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(s.name)}&backgroundType=gradientLinear,solid`;
  document.getElementById("detail-name").textContent = s.name;
  document.getElementById("detail-address").textContent = s.address;
  document.getElementById("detail-status").textContent = s.status;
  document.getElementById("detail-status").className = s.status === "ACTIVE" ? "pulse" : "error-text";
  document.getElementById("detail-score").textContent = s.credit.composite;
  document.getElementById("detail-bar").style.width = `${(s.credit.composite / 900) * 100}%`;
  document.getElementById("detail-zk").textContent = s.credit.zkBase;
  document.getElementById("detail-onchain").textContent = s.credit.onChain || "—";
  document.getElementById("detail-capacity").textContent = s.capacity;
  document.getElementById("detail-loans").textContent = s.activeLoans;
  document.getElementById("detail-risk").textContent = s.risk;

  renderFleet();
}
window.selectSelf = selectSelf;

// ─── Freeze Selected ───
function freezeSelected() {
  if (state.selectedIndex === null) return;
  const s = state.selves[state.selectedIndex];
  s.status = s.status === "ACTIVE" ? "FROZEN" : "ACTIVE";
  selectSelf(state.selectedIndex);
  addActivity(`${s.name}: ${s.status === "FROZEN" ? "FROZEN by owner" : "Reactivated"}`, s.status === "ACTIVE");
}
window.freezeSelected = freezeSelected;

// ─── Activity Log ───
function renderActivityLog() {
  const container = document.getElementById("activity-log");
  container.innerHTML = state.activities
    .map(
      (a) => `
    <div class="activity-item">
      <span class="activity-icon ${a.ok ? "ok" : "fail"}">${a.ok ? ">>" : "XX"}</span>
      <span class="ghost">${a.text}</span>
    </div>
  `
    )
    .join("");
}

function addActivity(text, ok = true) {
  state.activities.unshift({ text, ok });
  renderActivityLog();
}

// ─── Avatar Preview ───
const nameInput = document.getElementById("agent-name");
const avatarPreview = document.getElementById("avatar-preview");

nameInput.addEventListener("input", () => {
  const name = nameInput.value || "default";
  avatarPreview.src = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear,solid`;
});

// ─── Create Digital Self ───
document.getElementById("btn-create").addEventListener("click", async () => {
  const name = nameInput.value.trim();
  if (!name) return;
  const log = "create-log";

  addLog(log, "Initializing WDK wallet...", "info");
  await delay(800);
  const address = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  addLog(log, `WDK wallet created: ${address.slice(0, 6)}...${address.slice(-4)}`, "ok");
  await delay(500);
  addLog(log, "Deploying on-chain identity...", "info");
  await delay(1000);
  addLog(log, "ERC-8004 soulbound token minted", "ok");

  state.selves.push({
    name,
    address: `${address.slice(0, 6)}...${address.slice(-4)}`,
    status: "ACTIVE",
    credit: { zkBase: 0, onChain: 0, composite: 0, offWeight: 100, onWeight: 0 },
    capacity: "0 ETH",
    activeLoans: 0,
    totalBorrowed: "0 USDT",
    risk: "—",
  });

  renderFleet();
  addActivity(`${name}: Digital Self created`);
  addLog(log, `Digital Self "${name}" created`, "ok");
  nameInput.value = "";
});

// ─── Verify Credit ───
document.getElementById("btn-verify").addEventListener("click", async () => {
  const log = "verify-log";
  addLog(log, "Connecting to Experian...", "info");
  await delay(1000);
  addLog(log, "Experian credit score verified: 680", "ok");
  addLog(log, "Connecting to JP Morgan...", "info");
  await delay(800);
  addLog(log, "Chase Sapphire credit limit verified: $15,000", "ok");
  addLog(log, "Generating ZK proof...", "info");
  await delay(2000);
  addLog(log, "ZK proof submitted on-chain", "ok");
  addLog(log, "Credit score initialized for all Digital Selves", "ok");
  addActivity("ZK credit verified (Experian + JP Morgan)");
});

// ─── Borrow ───
document.getElementById("btn-borrow").addEventListener("click", async () => {
  const amount = document.getElementById("loan-amount").value;
  const agentName = document.getElementById("loan-agent").value;
  const log = "loan-log";
  if (!agentName) return;

  addLog(log, `${agentName}: Requesting ${amount} USDT...`, "info");
  await delay(500);
  addLog(log, "CreditAgent evaluating...", "info");
  await delay(800);
  addLog(log, "Guardrails: PASS", "ok");
  addLog(log, "LendingAgent executing...", "info");
  await delay(1200);
  addLog(log, `Loan executed: ${amount} USDT`, "ok");

  const s = state.selves.find((s) => s.name === agentName);
  if (s) {
    s.activeLoans += 1;
    s.totalBorrowed = (parseInt(s.totalBorrowed) + parseInt(amount)) + " USDT";
  }

  state.loans.push({
    agent: agentName,
    amount: `${amount} USDT`,
    status: "ACTIVE",
    date: new Date().toISOString().slice(0, 10),
  });
  renderLoans();
  renderFleet();
  addActivity(`${agentName}: Borrowed ${amount} USDT`);
});

function renderLoans() {
  const container = document.getElementById("loans-list");
  if (state.loans.length === 0) {
    container.innerHTML = '<div class="ghost" style="padding: 2rem; text-align: center">NO ACTIVE LOANS</div>';
    return;
  }
  container.innerHTML = state.loans
    .map(
      (l, i) => `
    <div class="loan-item">
      <div class="loan-item-header">
        <span class="loan-item-amount">${l.amount}</span>
        <span class="loan-item-status">${l.status}</span>
      </div>
      <div class="info-row"><span class="ghost">AGENT</span><span>${l.agent}</span></div>
      <div class="info-row"><span class="ghost">DATE</span><span class="dim">${l.date}</span></div>
      ${l.status === "ACTIVE" ? `<button class="btn-secondary" onclick="repayLoan(${i})">[ REPAY ]</button>` : ""}
    </div>
  `
    )
    .join("");
}

function repayLoan(index) {
  const loan = state.loans[index];
  if (!loan || loan.status !== "ACTIVE") return;
  loan.status = "REPAID";
  renderLoans();
  addActivity(`${loan.agent}: Repaid ${loan.amount}`);

  const timeline = document.getElementById("repayment-timeline");
  timeline.innerHTML = `<div class="timeline-item"><span class="pulse">REPAID</span> — ${loan.agent} — ${loan.amount} — ${new Date().toLocaleTimeString()}</div>` + timeline.innerHTML;
}
window.repayLoan = repayLoan;

// ─── Helpers ───
function addLog(containerId, msg, type = "info") {
  const container = document.getElementById(containerId);
  const line = document.createElement("div");
  line.className = `log-line log-${type}`;
  line.textContent = msg;
  container.appendChild(line);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Polling ───
setInterval(() => {
  const el = document.getElementById("next-check");
  if (el) el.textContent = new Date().toLocaleTimeString();
}, 5000);

// ─── Init ───
renderFleet();
renderActivityLog();
