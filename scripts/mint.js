import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define zkSync OS testnet
const zkSyncTestnet = defineChain({
  id: 8022833,
  name: 'zkSync OS Developer Preview',
  network: 'zksync-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.RPC_URL || 'https://zksync-os-testnet-alpha.zksync.dev/'],
    },
  },
});

// Contract ABI (minimal - just the functions we need)
const contractABI = [
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'int256', internalType: 'int256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string', internalType: 'string' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view'
  }
];

async function main() {
  // Get configuration from environment or command line
  const contractAddress = process.env.CONTRACT_ADDRESS || process.argv[2];
  const mintAmount = parseInt(process.argv[3] || process.env.MINT_AMOUNT || '5');
  const mintTo = process.env.MINT_TO || process.argv[4];

  if (!contractAddress) {
    console.error('❌ CONTRACT_ADDRESS must be provided via .env file or command line argument');
    process.exit(1);
  }

  if (!process.env.PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY must be set in .env file');
    process.exit(1);
  }

  // Create account from private key
  const account = privateKeyToAccount(process.env.PRIVATE_KEY);
  const recipientAddress = mintTo || account.address;

  // Create clients
  const publicClient = createPublicClient({
    chain: zkSyncTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: zkSyncTestnet,
    transport: http(),
  });

  console.log('🚀 Starting NFT minting process...');
  console.log('📋 Configuration:');
  console.log(`   Contract: ${contractAddress}`);
  console.log(`   Amount: ${mintAmount}`);
  console.log(`   Recipient: ${recipientAddress}`);
  console.log(`   Caller: ${account.address}`);

  try {
    // Get contract info before minting
    console.log('\n📊 Contract Info:');
    
    const [name, symbol, totalSupply, owner, currentBalance] = await Promise.all([
      publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'name',
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'symbol',
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'totalSupply',
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'owner',
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'balanceOf',
        args: [recipientAddress],
      }),
    ]);

    console.log(`   Name: ${name}`);
    console.log(`   Symbol: ${symbol}`);
    console.log(`   Owner: ${owner}`);
    console.log(`   Current Total Supply: ${totalSupply}`);
    console.log(`   Current Balance of Recipient: ${currentBalance}`);

    // Check wallet balance
    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`   Wallet Balance: ${formatEther(balance)} ETH`);
    
    // Check ownership
    console.log(`\n🔍 Ownership Check:`);
    console.log(`   Contract Owner: ${owner}`);
    console.log(`   Your Address: ${account.address}`);
    console.log(`   Are you owner? ${owner.toLowerCase() === account.address.toLowerCase() ? '✅ Yes' : '❌ No'}`);
    
    if (owner.toLowerCase() !== account.address.toLowerCase()) {
      console.error(`\n❌ You are not the contract owner! Only the owner can mint NFTs.`);
      console.error(`   Contract owner: ${owner}`);
      console.error(`   Your address: ${account.address}`);
      process.exit(1);
    }

    // Start timing
    const startTime = Date.now();
    
    console.log('\n⏳ Minting NFTs...');
    
    // Calculate gas limit based on amount (with some buffer)
    const baseGas = 100000n; // Base transaction cost
    const gasPerNFT = 26000n; // Approximate gas per NFT based on your data
    const buffer = 1000000n; // Safety buffer
    const calculatedGas = baseGas + (BigInt(mintAmount) * gasPerNFT) + buffer;
    
    // Use hardcoded gas limit for large amounts, or calculated for smaller amounts
    // Block gas limit is 100M, so we can use up to ~95M safely
    let gasLimit;
    if (mintAmount >= 2000) {
      gasLimit = 95000000n; // For very large amounts
    } else if (mintAmount >= 500) {
      gasLimit = 80000000n; // For large amounts  
    } else {
      gasLimit = calculatedGas; // For small amounts, use calculated
    }
    
    console.log(`\n🧪 Preparing transaction...`);
    console.log(`   Function: mint(${recipientAddress}, ${mintAmount})`);
    console.log(`   Calculated Gas: ${calculatedGas}`);
    console.log(`   Using Gas Limit: ${gasLimit}`);
    
    // Simulate the transaction first to validate
    const { request } = await publicClient.simulateContract({
      account,
      address: contractAddress,
      abi: contractABI,
      functionName: 'mint',
      args: [recipientAddress, BigInt(mintAmount)],
      gas: gasLimit, // Use our custom gas limit
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);
    
    console.log(`📝 Transaction submitted: ${hash}`);
    console.log('⏳ Waiting for confirmation...');

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\n✅ Minting completed successfully!');
    console.log(`⏱️  Total time: ${duration}ms`);
    console.log(`📊 Transaction Details:`);
    console.log(`   Hash: ${receipt.transactionHash}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    console.log(`   Gas Used: ${receipt.gasUsed}`);
    console.log(`   Status: ${receipt.status === 'success' ? '✅ Success' : '❌ Failed'}`);

    // Get updated contract info
    const [newTotalSupply, newBalance] = await Promise.all([
      publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'totalSupply',
      }),
      publicClient.readContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'balanceOf',
        args: [recipientAddress],
      }),
    ]);

    console.log('\n📈 Updated Stats:');
    console.log(`   New Total Supply: ${newTotalSupply} (+${newTotalSupply - totalSupply})`);
    console.log(`   New Balance of Recipient: ${newBalance} (+${newBalance - currentBalance})`);

  } catch (error) {
    console.error('\n❌ Error during minting:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause);
    }
    process.exit(1);
  }
}

main().catch(console.error);
