# Hatch Token Frontend

A Next.js application for interacting with the Hatch Token smart contract.

## Features

- Connect to MetaMask wallet
- Generate Merkle trees for token allocations
- Update the contract's Merkle root
- Claim tokens using Merkle proofs

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- MetaMask browser extension

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>/frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

Copy the `.env.local.example` file to `.env.local` and fill in the required values:

```bash
cp .env.local.example .env.local
```

Edit the `.env.local` file and add:
- Your RPC URL (from Alchemy, Infura, etc.)
- Private key for the wallet that will update the merkle root (only needed for the API endpoint)
- Contract addresses for different networks

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

### Connecting Your Wallet

Click the "Connect Wallet" button to connect your MetaMask wallet.

### Generating a Merkle Tree

1. Navigate to the "Generate Merkle Tree" tab
2. Add addresses and token amounts for your allocations
3. Click "Generate Merkle Tree"
4. The Merkle root and other data will be displayed below

### Updating the Contract's Merkle Root

1. Navigate to the "Update Merkle Root" tab
2. The Merkle root from the generated tree will automatically be filled in
3. Click "Update Merkle Root" to send a transaction that updates the contract

### Claiming Tokens

1. Navigate to the "Claim Tokens" tab
2. If your address is included in the allocations, you'll see your claim amount
3. Click "Claim Tokens" to send a transaction to claim your tokens

## API Endpoints

### `/api/generate-merkle`

Generates a Merkle tree from a list of address and amount allocations.

- Method: POST
- Body:
  ```json
  {
    "allocations": [
      { "address": "0x...", "amount": "1000000000000000000" },
      { "address": "0x...", "amount": "2000000000000000000" }
    ]
  }
  ```

### `/api/update-merkle`

Updates the contract's Merkle root.

- Method: POST
- Body:
  ```json
  {
    "merkleRoot": "0x..."
  }
  ```

## Important Note

This application is configured to work exclusively with the **BNB Smart Chain Testnet** (chain ID 97). 

### BNB Testnet Setup

1. Add BNB Smart Chain Testnet to your MetaMask:
   - Network Name: BNB Smart Chain Testnet
   - New RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
   - Chain ID: 97
   - Currency Symbol: tBNB
   - Block Explorer URL: https://testnet.bscscan.com

2. Get testnet BNB from the faucet:
   - Visit [BNB Smart Chain Faucet](https://testnet.bnbchain.org/faucet-smart)
   - Enter your wallet address
   - Click 'Request' to receive testnet BNB

The application will automatically prompt you to switch to BNB testnet if you're connected to a different network.

## License

MIT
