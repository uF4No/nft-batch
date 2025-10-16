# MyNFT - Batch minting

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) - For Solidity development
- [Node.js](https://nodejs.org/) (v18+) - For JavaScript scripts
- ZKsync OS testnet ETH - For deployment and minting

## Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>

# Install Foundry dependencies
forge install

# Install JavaScript dependencies
npm install
```

### 2. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your details:

```env
# Your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# zkSync OS testnet RPC URL
RPC_URL=https://zksync-os-testnet-alpha.zksync.dev/

# Contract interaction settings (set after deployment)
CONTRACT_ADDRESS=your_deployed_contract_address
MINT_AMOUNT=100
MINT_TO=recipient_address_here
```

### 3. Build and Test

```bash
# Build contracts
forge build

# Run tests
forge test -v
```

## Deployment

### Deploy with Forge (Recommended)

```bash
# Deploy to zkSync OS testnet
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast

# The script will output your contract address
# Copy it to your .env file as CONTRACT_ADDRESS
```

### Deploy with JavaScript

```bash
# Deploy using JavaScript
npm run deploy

# This automatically updates your .env file with the contract address
```

## Minting NFTs

You can mint NFTs using either Forge scripts or JavaScript. Both methods offer the same functionality with different interfaces.

### Method 1: Mint with Forge (Solidity)

The Forge script reads configuration from your `.env` file:

```bash
# Mint NFTs using environment variables
forge script script/MintNFTs.s.sol --rpc-url $RPC_URL --broadcast

# The script will mint MINT_AMOUNT NFTs to MINT_TO address
```

**Configuration via .env:**
```env
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
MINT_AMOUNT=500
MINT_TO=0x0987654321098765432109876543210987654321
```

### Method 2: Mint with JavaScript (Viem)

The JavaScript script offers more flexibility and detailed output:

```bash
# Method 1: Use environment variables
npm run mint

# Method 2: Command line arguments
node scripts/mint.js <contract_address> <amount> [recipient_address]

# Examples:
node scripts/mint.js 0x1234... 100
node scripts/mint.js 0x1234... 500 0x5678...
node scripts/mint.js 0x1234... 2000  # Maximum batch size
```
