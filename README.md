# Token Swap Interface

This component provides a fully functional UI for token swapping on EVM-compatible blockchains. It supports token selection, amount input, wallet connection, token approvals (via `approve()`), and intent-based swaps using a smart contract.

---

## 🛠️ Tech Stack

- **React / Next.js (App Router)**
- **TypeScript**
- **Wagmi + Viem** (for web3 interactions)
- **ShadCN/UI** (UI components)
- **RainbowKit** (wallet connect)
- **ERC20 + Custom Swap Intent Smart Contract**

---

## 📦 Contracts Used

- **ERC20 Standard ABI** for token approvals
- **SwapIntentABI** for calling `submitIntent()` on different chain-specific addresses

---

## ✨ Features

- Connects wallet using RainbowKit or a custom connect button
- Select source and destination tokens
- Network-aware token switching and balance fetching
- Handles token approvals before swaps
- Submits intents to a custom swap contract (multi-chain ready)
- Shows transaction success dialog with token and chain info
- Responsive UI with MAX balance shortcut

---

## 🔐 Prerequisites

- EVM-compatible wallet (e.g., MetaMask)
- Token balances on testnet
- Contract deployed and funded for testing

---

## 🧪 Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start dev server:

   ```bash
   npm run dev
   ```

> Make sure you’ve configured `wagmi` and have valid network/token data in `@/lib/data`

---

## 📌 To-Do / Next Steps

- Add slippage & gas estimation
- Fetch real-time exchange rates
- Implement the OIF-Framework

---
