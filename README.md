# SeedSandbox

"The Safest Laboratory to Start Investing" — Risk Analysis & Mock Trading Platform for Beginners

![Build](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Vite](https://img.shields.io/badge/bundler-vite-ff69b4) ![TypeScript](https://img.shields.io/badge/lang-TypeScript-3178C6)

---

## Overview

SeedSandbox is a web frontend that provides a safe, sandboxed environment for beginner investors to practice trading, inspect risk exposures, and learn portfolio construction without real capital. It blends interactive visual analytics and an AI-backed diagnosis layer to make financial concepts actionable and comprehensible.

The interface emphasizes clarity for financial data (returns, volatility, correlations) and brings domain-aware tooling to the novice investor.

---

## Key Features ✅

- **Dashboard** — Interactive time-series chart comparing portfolio & asset returns vs a Benchmark (S&P 500)  
  [Insert Screenshot Here]
- **AI Portfolio Diagnosis** — Natural language reports analyzing investment style, concentration risk, and tail exposures using Google Gemini API  
  [Insert Screenshot Here]
- **Risk Analytics** — Visualizations for essential quantitative metrics (Volatility, Beta, Sharpe Ratio, Maximum Drawdown) to help users interpret risk-adjusted performance  
  [Insert Screenshot Here]
- **Asset Correlation Map** — Correlation heatmap to reveal concentration and diversification insights among held assets  
  [Insert Screenshot Here]

---

## Tech Stack 🔧

- Frontend: **React** ⚛️, **TypeScript** 🟦, **Vite** ⚡, **SCSS** 🎨
- State Management: **Jotai** 🧠
- Visualization: **Nivo Chart** 📊
- Data & APIs: **yahoo-finance2** 💹, **Google Gemini API** 🤖
- Tooling: ESLint, Prettier, Vite dev server

---

## Problem Solving — Technical Challenges & Solutions 🧩

SeedSandbox required robust data ingestion and validation to keep visualizations reliable and the AI diagnosis meaningful. Below are two concrete problems and the production fixes implemented during development.

### 1) Optimizing Data Collection Strategy (Fetch API → Library)

**Problem:**  
Originally we used raw `fetch` calls against the Yahoo Finance endpoints. Responses came back fragmented (separate arrays for timestamps and quote values), which forced custom parsing layers that were hard to reason about and brittle to future shape changes.

**Solution:**  
Migrated to the `yahoo-finance2` library. The library returns well-structured, typed arrays of historical bars and quote objects (e.g., `{ date, open, high, low, close, volume }`) and utility helpers that reduce boilerplate.

**Result:**

- Reduced data-processing logic by **over 50%**, simplifying both server and client ingestion code.
- Increased maintainability and readability of time-series pipelines.
- Example:

```ts
import yahooFinance from "yahoo-finance2";

const series = await yahooFinance.historical("AAPL", {
  period1: "2020-01-01",
  period2: "2025-01-01",
});
// series => [{ date: Date, open: number, close: number, high: number, low: number, volume: number }, ...]
```

---

### 2) Ensuring Financial Data Integrity (Preprocessing)

**Problem:**  
Invalid symbols or empty values returned from third-party data caused server errors and broken chart renders on the client.

**Solution:**  
Implemented robust preprocessing and validation layers prior to storage or rendering. This includes strict filters to exclude invalid entries, normalization of missing fields, and defensive checks before plotting.

**Implementation example:**

```ts
const cleaned = rawAssets
  .filter((item) => item && item.symbol) // ensure symbol exists
  .map((item) => ({
    symbol: item.symbol,
    prices: (item.prices || []).filter(Boolean), // remove empty entries
  }));
```

**Result:**

- Prevented invalid data from being injected into UI components.
- Significantly improved chart stability and correctness of displayed asset statuses.

> Tip: Track counts of filtered/invalid symbols in analytics to surface upstream data issues to the team early.

---

## Getting Started — Development Setup 🚀

### Prerequisites

- Node.js >= 16 LTS
- npm or yarn

### Install

```bash
git clone https://github.com/your-org/SeedSandbox-FE.git
cd SeedSandbox-FE
npm install
```

### Environment

Create a `.env` file (Vite requires `VITE_`-prefixed variables) or update `src/constants/env.ts`:

```
VITE_API_BASE_URL=https://api.your-backend.com
VITE_GOOGLE_GEMINI_KEY=your_gemini_api_key
# other env variables as needed
```

### Run (development)

```bash
npm run dev
# open http://localhost:5173
```

### Build & Preview

```bash
npm run build
npm run preview
```

---

## Backend Repository 🔗

The frontend pairs with a backend that handles portfolio persistence, analytics computation, and AI orchestration.

**Link:** https://github.com/your-org/SeedSandbox-BE  
(Replace with the actual repository URL and configure `VITE_API_BASE_URL` accordingly.)

---

## Contributing 🤝

- Fork the repo, create a feature branch, add tests for logic changes, and open a PR with a clear description of the work.
- Follow the code style, run linting, and include screenshots for UI changes when applicable.

---

## License & Contact

- **License:** MIT
- **Contact:** Open an issue in this repository or reach the maintainers via the org contact for collaboration or security reports.

---

## Acknowledgements

Thanks to the maintainers of **yahoo-finance2**, **Nivo**, **Jotai**, and **Google Gemini** for the open-source building blocks used in SeedSandbox.
