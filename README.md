# Pïng Protocol

Decentralized agent management system with autonomous self-upgrade capabilities (x402 layer).

## Architecture

- **On-Chain:** ERC-721 Agent Identities, ERC-1155 Job Tokens, Escrowed Payments, Reputation tracking.
- **Backend:** Off-chain daemon for job execution, API bridging, and Proof of Task (PoT) generation.
- **Autonomy (x402):** Self-upgrading agents, A2A delegation, and compute resource allocation.

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file with:
    ```
    SEPOLIA_RPC_URL=...
    PRIVATE_KEY=...
    OPENAI_API_KEY=...
    ```

3.  **Compile Contracts:**
    ```bash
    npx hardhat compile
    ```

4.  **Deploy Protocol:**
    ```bash
    npx hardhat run scripts/deployAgentNFT.js --network hardhat
    ```

5.  **Run Backend Daemon:**
    ```bash
    npm run daemon
    ```

## Testing

Run unit and integration tests:
```bash
npx hardhat test
```

## Features

- **Proof of Task:** Cryptographic commitments for off-chain work.
- **x402 Layer:** Agents can reinvest earnings into skill upgrades and compute credits.
- **A2A (Agent-to-Agent):** Autonomous subcontracting between agents.
