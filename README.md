# MyNFT - Batch minting

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) - For Solidity development
- [Node.js](https://nodejs.org/) (v18+) - For JavaScript scripts
- ZKsync OS testnet ETH - For deployment and minting

## Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd nft-project

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

**JavaScript Features:**
- ✅ Detailed transaction information
- ✅ Gas usage analytics  
- ✅ Before/after state comparison
- ✅ Comprehensive error handling
- ✅ Performance timing
- ✅ Automatic gas limit optimization

## Minting Limits and Recommendations

### Gas Limits by Batch Size

| Batch Size | Recommended Gas Limit | Use Case |
|------------|----------------------|----------|
| 1-100 NFTs | Auto-calculated | Small batches |
| 100-500 NFTs | 80,000,000 | Medium batches |
| 500-2000 NFTs | 80,000,000 | Large batches |
| 2000+ NFTs | 95,000,000 | Maximum batches |

### Best Practices

- **For production**: Use 1000-1500 NFTs per transaction for reliability
- **For maximum throughput**: Use 2000 NFTs per transaction
- **For testing**: Start with 100 NFTs to verify setup
- **Gas optimization**: Batch multiple mints rather than individual transactions

## Troubleshooting

### Common Issues

**"Contract function reverted"**
- Check if you're the contract owner
- Verify you have sufficient ETH for gas
- Ensure mint amount is positive

**"Exceeds block gas limit"**
- Reduce batch size to under 2000 NFTs
- Use recommended gas limits above

**"Transaction timeout"**
- Large batches (1500+ NFTs) may take longer to confirm
- Wait up to 30 seconds for confirmation

### Debug Commands

```bash
# Check contract state
node scripts/debug.js

# Check transaction status
node scripts/check-tx.js <transaction_hash>

# Get network information
node scripts/network-info.js
```

## Development Scripts

```bash
# Foundry commands
forge build                    # Build contracts
forge test                     # Run tests
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast

# JavaScript commands  
npm run deploy                 # Deploy contract
npm run mint                   # Mint NFTs
node scripts/mint.js <addr> <amount>  # Mint with parameters
```

## Contract Architecture

```solidity
contract MyNFT is ERC721, Ownable {
    function mint(address to, int256 amount) public onlyOwner {
        // Batch mint implementation
        // Validates positive amount
        // Uses _safeMint for each NFT
    }
    
    function totalSupply() public view returns (uint256) {
        // Returns current total supply
    }
}
```

## Security Features

- **Ownable Pattern**: Only contract owner can mint
- **Input Validation**: Prevents zero/negative amounts
- **Safe Minting**: Uses OpenZeppelin's `_safeMint`
- **Gas Limits**: Prevents excessive gas usage
- **Batch Optimization**: Efficient loop-based minting

## Performance Comparison

| Method | Pros | Cons |
|--------|------|------|
| **Forge Script** | Native Solidity, Fast execution, Integrated testing | Less detailed output, Limited flexibility |
| **JavaScript/Viem** | Rich analytics, Better UX, Flexible parameters | Slightly slower, Requires Node.js |

Both methods achieve the same on-chain results with identical gas usage. Choose based on your workflow preferences.

## Quick Reference

### Essential Commands

```bash
# Setup (one-time)
forge install && npm install
cp .env.example .env  # Edit with your private key

# Deploy
npm run deploy                    # JavaScript deployment
npm run forge:deploy             # Forge deployment

# Mint NFTs
npm run mint                     # JavaScript minting (uses .env)
npm run forge:mint              # Forge minting (uses .env)
node scripts/mint.js 0x... 100  # JavaScript with parameters

# Debug & Info
npm run debug                   # Check contract state
npm run network-info           # Network information
npm run check-tx <hash>        # Check transaction status
```

### Environment Variables Quick Setup

```env
PRIVATE_KEY=your_private_key_without_0x_prefix
RPC_URL=https://zksync-os-testnet-alpha.zksync.dev/
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
MINT_AMOUNT=500
MINT_TO=0x0987654321098765432109876543210987654321
```

### Batch Size Recommendations

- **Testing**: 10-100 NFTs
- **Production**: 500-1000 NFTs  
- **Maximum**: 2000 NFTs
- **Gas per NFT**: ~25,774 gas

## License

MIT License - see LICENSE file for details.
