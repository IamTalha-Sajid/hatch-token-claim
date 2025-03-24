import { ethers } from 'ethers';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { HatchTokenABI, contractAddresses } from './contractConfig';

// BNB Smart Chain testnet configurations
export const BSC_TESTNET_CHAIN_ID = 97;
export const BSC_TESTNET_CONFIG = {
  chainId: `0x${BSC_TESTNET_CHAIN_ID.toString(16)}`,
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com'],
};

// Provider and signer functions
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('MetaMask is not installed');
};

export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// Network switching functions
export const switchToBscTestnet = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // Try to switch to BSC testnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      // If the network doesn't exist, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_TESTNET_CONFIG],
          });
        } catch (addError) {
          console.error('Error adding BSC testnet:', addError);
          throw addError;
        }
      } else {
        console.error('Error switching to BSC testnet:', switchError);
        throw switchError;
      }
    }
  }
};

// Contract interaction functions
export const getContract = async (signer?: ethers.Signer) => {
  try {
    // First, ensure we're on the BSC testnet
    await switchToBscTestnet();
    
    let currentSigner;
    if (!signer) {
      currentSigner = await getSigner();
    } else {
      currentSigner = signer;
    }

    const network = await getProvider().getNetwork();
    const chainId = Number(network.chainId);
    
    // Get the contract address for BSC testnet
    const contractAddress = contractAddresses[chainId];

    if (!contractAddress) {
      throw new Error(`No contract address available for chain ID: ${chainId}. Please switch to BSC testnet.`);
    }

    return new ethers.Contract(contractAddress, HatchTokenABI, currentSigner);
  } catch (error) {
    console.error('Error getting contract instance:', error);
    throw error;
  }
};

// Merkle Tree Functions
export interface Allocation {
  address: string;
  amount: string; // amount in wei format
}

export const generateMerkleTree = (allocations: Allocation[]) => {
  const values = allocations.map(allocation => [allocation.address, allocation.amount]);
  return StandardMerkleTree.of(values, ["address", "uint256"]);
};

export const formatMerkleTreeOutput = (merkleTree: StandardMerkleTree<any[]>) => {
  const values: any[] = [];
  
  // Use traditional for loop instead of for...of to avoid TypeScript issues
  const valuesArray = merkleTree.dump().values;
  for (let i = 0; i < valuesArray.length; i++) {
    values.push({
      value: valuesArray[i].value,
      treeIndex: i,
      proof: merkleTree.getProof(i)
    });
  }

  return {
    root: merkleTree.root,
    format: "standard-v1",
    tree: merkleTree.dump(),
    values
  };
};

// Contract interaction functions that use connected user's wallet
export const claimTokens = async (totalAllocation: string, merkleProof: string[]) => {
  try {
    // Uses the connected wallet (from MetaMask)
    const contract = await getContract();
    const tx = await contract.claimTokens(totalAllocation, merkleProof);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error claiming tokens:', error);
    throw error;
  }
};

export const getUnlockedBalance = async (address: string) => {
  try {
    const contract = await getContract();
    return await contract.getUnlockedBalance(address);
  } catch (error) {
    console.error('Error getting unlocked balance:', error);
    throw error;
  }
};

export const getTotalClaimed = async (address: string) => {
  try {
    const contract = await getContract();
    return await contract.userTotalClaimed(address);
  } catch (error) {
    console.error('Error getting total claimed:', error);
    throw error;
  }
};

// Helper to connect to MetaMask
export const connectWallet = async () => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = getProvider();
      const signer = await provider.getSigner();
      return await signer.getAddress();
    } else {
      throw new Error('MetaMask is not installed');
    }
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};

// Check if MetaMask is connected
export const isWalletConnected = async () => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    }
    return false;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
}; 