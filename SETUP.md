# ImpactOps AI — Comprehensive Setup & Developer Reproduction Guide

> This guide provides step-by-step instructions for cloning, configuring, testing, and running **ImpactOps AI** on a fresh developer machine.

---

## 1. Project Overview & Architecture

**ImpactOps AI** is an autonomous sustainable operations intelligence platform and decision agent. It solves a major enterprise problem: operational energy, water, and waste data is typically scattered across isolated building management systems (BMS), SCADA loops, and spreadsheets. When abnormalities occur (such as stuck bypass valves, chiller variable-frequency-drive lockups, or unneeded off-hours HVAC runs), they frequently go unnoticed for weeks, wasting thousands of dollars and generating avoidable emissions.

ImpactOps AI continuously monitors streaming multi-resource telemetry, computes statistical anomalies ($z > 2.2\sigma$), uses **Google Gemini 1.5 Flash** (or its built-in **Deterministic Rule Engine fallback**) to formulate explainable root-cause investigations, ranks intervention plans with transparent payback formulas, enforces a strict **Human-in-the-Loop decision gate**, and logs every action in a **SHA-256 tamper-evident audit ledger**.

### Architectural Flow:
1. **Frontend Client (`http://localhost:5173`)**: Built with React 19, TypeScript, and Vite. Features dark-mode enterprise UI styled with Google Stitch MCP design tokens, pure SVG time-series charts, and interactive scenario modeling.
2. **Backend API Proxy (`http://127.0.0.1:3001`)**: Built with Node.js and Express. Implements security validation, sandboxes model inputs, calculates ground-truth mathematics, manages the tamper-evident audit ledger, and communicates securely with Google Gemini.
3. **Vite Development Proxy**: Configured in [`vite.config.ts`](vite.config.ts) to transparently route all client `/api/*` calls to the Express server at `http://127.0.0.1:3001` with zero CORS friction.

---

## 2. Prerequisites & Compatibility

Ensure your system meets the following prerequisites before starting:

| Requirement | Supported Versions | Tested Environment |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` (LTS recommended) | `v22.20.0` |
| **npm** | `>= 10.0.0` | `10.5.0` |
| **Operating System** | Windows 10/11, macOS, Linux | Windows 11 (PowerShell & Command Prompt) |
| **Git** | `>= 2.30.0` | `2.47.1` |
| **Modern Browser** | Chrome, Edge, Firefox, Safari | Chrome / Chromium |

---

## 3. Repository Structure

```
Hackathon/
├── .env.example             # Safe environment variable configuration template
├── .gitignore               # Strict ignore rules (ignores .env, node_modules, dist)
├── index.html               # Frontend HTML root with Google Fonts (Plus Jakarta Sans/Inter)
├── package.json             # Scripts, dependencies, and project metadata
├── package-lock.json        # Pinned dependency lockfile
├── tsconfig.json            # Root TypeScript project references
├── tsconfig.app.json        # Frontend TypeScript bundler configuration
├── tsconfig.node.json       # Node environment TypeScript configuration
├── vite.config.ts           # Vite bundler config with /api proxy to port 3001
├── README.md                # Project overview and hackathon highlights
├── SETUP.md                 # This setup & developer reproduction guide
├── server/
│   ├── index.ts             # Express backend server (REST API, audit logging, security)
│   ├── geminiService.ts     # Google Gemini 1.5 Flash integration with structured schema
│   └── ruleEngine.ts        # Transparent deterministic mathematical fallback engine
├── src/
│   ├── App.tsx              # Main dashboard assembly and tab router
│   ├── main.tsx             # React DOM root entrypoint
│   ├── index.css            # Enterprise CSS tokens (Stitch design system & glassmorphism)
│   ├── components/
│   │   ├── Header.tsx                 # Branding, facility switcher, AI mode badge
│   │   ├── MetricCards.tsx            # 5 Core KPI cards with baseline variances
│   │   ├── TelemetryChart.tsx         # 168-hour interactive SVG telemetry visualizer
│   │   ├── AnomalyInspector.tsx       # Anomaly list with statistical deviations
│   │   ├── InvestigationWorkspace.tsx # Multi-stage autonomous agent reasoning interface
│   │   ├── RecommendationApproval.tsx # Human-in-the-Loop operational plan authorization
│   │   ├── ScenarioSimulator.tsx      # Real-time interactive scenario lever simulator
│   │   ├── AuditLogViewer.tsx         # Cryptographically digested SHA-256 audit ledger
│   │   ├── ArchitectureModal.tsx      # In-product architecture & security blueprint
│   │   └── ApiKeyModal.tsx            # Live Google Gemini key switcher / fallback toggle
│   ├── data/
│   │   └── telemetryData.ts # 168h synthetic telemetry across 3 facilities
│   ├── services/
│   │   └── analytics.ts     # Deterministic mathematical engine (z-scores, formulas)
│   └── types/
│       └── index.ts         # Comprehensive TypeScript interfaces & schemas
└── test/
    └── analytics.test.ts    # Automated test suite (7 unit tests covering core math)
```

---

## 4. Step-by-Step Installation

### Step 1: Clone the Repository
Open your terminal and clone the repository:
```bash
git clone <repository-url>
cd Hackathon
```

### Step 2: Install Dependencies
Install dependencies using the committed `package-lock.json`:
```bash
npm install
```

---

## 5. Environment Configuration

### Step 1: Create the Local `.env` File
Copy `.env.example` to create your local `.env`:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux / Git Bash:**
```bash
cp .env.example .env
```

### Step 2: Configure Supported Environment Variables

Open `.env` in an editor. The application supports the following variables:

| Variable | Default Value | Required? | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `3001` | No | Port on which the Express backend listens. |
| `HOST` | `127.0.0.1` | No | Host IP on which the Express backend binds. |
| `GEMINI_API_KEY` | *(blank)* | **No** | Google Gemini API key. If left blank, the app uses its **Deterministic Rule Engine fallback**. |
| `GEMINI_MODEL` | `gemini-1.5-flash` | No | Gemini model identifier (`gemini-1.5-flash` or `gemini-2.0-flash`). |
| `ENABLE_SIMULATED_STREAM` | `true` | No | Indicates whether simulated streaming telemetry is active. |
| `DEFAULT_FACILITY` | `fac-dc-north` | No | Facility loaded on initial startup (`fac-dc-north`, `fac-mfg-austin`, or `fac-hq-seattle`). |

> **Security Rule:** Never commit `.env` containing actual keys to Git. The `.gitignore` file is configured to strictly ignore `.env` while preserving `.env.example`.

---

## 6. Running the Application

### Option A: Run Full Application (Recommended)
This starts both the Express backend and the Vite frontend concurrently in a single terminal:

```bash
npm run dev
```

Output:
```
[0] [ImpactOps AI] Server listening on http://127.0.0.1:3001
[0] [ImpactOps AI] Mode: Deterministic Rule Engine Fallback
[1]   VITE v8.3.5  ready in 264 ms
[1]   ➜  Local:   http://localhost:5173/
```

- **Frontend Application:** Open **`http://localhost:5173`**
- **Backend API Server:** Running on **`http://127.0.0.1:3001`**

### Option B: Run Services in Separate Terminals

**Terminal 1 (Backend Server):**
```bash
npm run dev:server
# Server listens on http://127.0.0.1:3001
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Vite client runs on http://localhost:5173
```

---

## 7. Verifying AI Modes & The Deterministic Fallback

ImpactOps AI is engineered to be **100% functional out-of-the-box** without requiring third-party credentials:

### 1. Deterministic Rule Engine (Active Fallback)
- **When Active:** When `GEMINI_API_KEY` is blank, omitted, or invalid.
- **How It Operates:** Implemented in [`server/ruleEngine.ts`](server/ruleEngine.ts). Evaluates equipment physics, computes exact baseline deviations, generates causal hypotheses, calculates payback formulas, and sets `engineSource: 'deterministic_rule_engine'`.
- **UI Indicator:** The header displays a cyan badge: **"Deterministic Engine"**.

### 2. Google Gemini 1.5 Flash (Production AI)
- **When Active:** When a valid `GEMINI_API_KEY` is provided in `.env` or pasted into the in-app key modal.
- **How It Operates:** Sends pre-calculated ground-truth evidence to Google Gemini's REST API using strict JSON schema output. Gemini generates causal deductions and ranked interventions without hallucinating math.
- **UI Indicator:** The header displays an emerald badge: **"Google Gemini AI"**.

### How to Test / Switch Modes Live
Click the **AI Mode Badge** (with the key icon) in the top header. You can:
1. Paste a Gemini API key to activate live Gemini reasoning on the fly.
2. Click **"Disconnect Key (Use Fallback)"** to immediately switch back to the deterministic engine.

---

## 8. Principal User Journey Walkthrough

1. **Dashboard & KPIs:**
   - Open `http://localhost:5173`.
   - Inspect the 5 KPI cards.
   - Switch facilities using the top dropdown (**North Data Center**, **Austin Advanced Mfg**, **HQ Innovation Campus**) to see how telemetry profiles differ.
2. **Telemetry Chart:**
   - Scroll to the 168-hour chart.
   - Toggle between **Electricity (kWh)**, **Water (kL)**, and **Cost ($)**.
   - Hover over data points to inspect the real-time crosshair tooltip displaying actual vs. baseline delta and cost.
3. **Investigate an Anomaly:**
   - In the **Detected Anomalies** panel, click **"Investigate with AI"** on `Chiller Loop #3 VFD Resonance Lockup`.
   - Watch the agent progress through the 6 stages:
     `1. Ingest Telemetry` &rarr; `2. Statistical Outlier` &rarr; `3. Root Cause Physics` &rarr; `4. Mathematical Proof` &rarr; `5. Formulate Plans` &rarr; `6. Human Gate`.
   - Review the structured diagnosis, probabilities, ground-truth evidence, and verification steps.
4. **Authorize an Operational Plan:**
   - Click **"Review Formulated Operational Plans"** (or open the **Authorized Operational Plans** tab).
   - Click **"Inspect Math & Details"** to view the transparent mathematical formula.
   - Click **"Authorize Operational Plan"**, enter optional operator notes, and click **"Confirm Authorization"**.
   - Notice the generated **Authorized Operational Plan Code (e.g. `AOP-4514-9775`)**.
5. **Simulate Scenarios:**
   - Open the **Scenario Simulator** tab.
   - Adjust the **Electricity Reduction %**, **Water Leak Recovery %**, and **Peak Shifting** sliders.
   - Observe the side-by-side monthly cost comparison, annualized yield, carbon abatement, and empirical $\pm 6\%$ confidence interval.
6. **Audit Ledger:**
   - Open the **Audit Ledger** tab.
   - Verify that your investigation and authorization events were recorded with immutable timestamps, actor IDs, and **SHA-256 cryptographic digests**.
7. **Architecture & Security Visualizer:**
   - Click the **"Architecture & Security"** button in the header to review the system specification modal.

---

## 9. Running Automated Tests

Run the automated test suite to verify calculation correctness, anomaly detection, and input handling:

```bash
npm test
```

### What is Tested:
1. **Consumption Aggregation**: Correctly sums kWh, kL, waste tons, total cost, and avoidable cost.
2. **Statistical Anomaly Detection**: Accurately computes mean, standard deviation, and statistical z-scores ($z > 2.2\sigma$).
3. **Percentage Deviation Calculations**: Validates $((actual - baseline) / baseline) \times 100$.
4. **Scenario Simulation**: Verifies baseline vs. projected cost reductions, annual yields, and carbon calculations.
5. **Invalid Input & Edge Cases**: Tests empty arrays, zero divisions, and negative parameter clamping.
6. **Deterministic Investigation Engine**: Validates generation of structured investigation reports, ground-truth math, and ranked interventions.

---

## 10. Building for Production

To create a production client bundle:

```bash
npm run build
```

This compiles TypeScript using `tsc -b` and builds optimized static assets with Vite into `dist/`.

To preview the production build locally:
```bash
npm run preview
```

---

## 11. Troubleshooting Guide

### Issue: Port 3001 or 5173 is already in use
**Symptom:** `Error: listen EADDRINUSE: address already in use 127.0.0.1:3001` or Vite switches to port 5174.  
**Resolution:**
- **Windows:** Check and terminate the conflicting process:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force
  ```
- **macOS / Linux:**
  ```bash
  lsof -ti:3001 | xargs kill -9
  ```
- Alternatively, modify `PORT=3002` in your `.env` file and update the proxy target in `vite.config.ts`.

### Issue: PowerShell Script Execution Policy
**Symptom:** `npm : File ... cannot be loaded because running scripts is disabled on this system.`  
**Resolution:** Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Issue: Google Gemini API returns Quota or Network Error
**Symptom:** Log warns `[Gemini API] Request returned status 429 or 500`.  
**Resolution:** No action needed. ImpactOps AI is designed with graceful fault tolerance and automatically falls back to the deterministic rule engine without interrupting user workflows.

---

## 12. Honest Operational Disclosures & Boundaries

- **Synthetic Telemetry**: Telemetry figures are high-fidelity synthetic streams seeded to demonstrate realistic industrial and computing consumption profiles. They should not be represented as active real-world utility connections.
- **Operational Authority**: Approving an action creates a structured **Authorized Operational Plan (AOP)** for dispatch to building engineers. ImpactOps AI does not directly send actuation signals to physical BACnet or Modbus industrial machinery.
