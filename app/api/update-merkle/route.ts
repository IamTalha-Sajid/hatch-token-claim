import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { HatchTokenABI, contractAddresses } from '../../../lib/contractConfig';
import { BSC_TESTNET_CHAIN_ID } from '../../../lib/contractUtils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.merkleRoot) {
      return NextResponse.json({ 
        error: 'Missing required parameter: merkleRoot' 
      }, { status: 400 });
    }
    
    const merkleRoot = body.merkleRoot;
    const walletPrivateKey = process.env.WALLET_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
    
    if (!walletPrivateKey || !rpcUrl) {
      return NextResponse.json({ 
        error: 'Server configuration error: Missing environment variables' 
      }, { status: 500 });
    }
    
    // Validate merkle root format
    if (!merkleRoot.startsWith('0x') || merkleRoot.length !== 66) {
      return NextResponse.json({ 
        error: 'Invalid merkle root format. Must be a 0x-prefixed 32-byte hex string' 
      }, { status: 400 });
    }
    
    // Create provider and wallet for BNB testnet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(walletPrivateKey, provider);
    
    // Get the contract address for BNB testnet
    const contractAddress = contractAddresses[BSC_TESTNET_CHAIN_ID];
    
    if (!contractAddress) {
      return NextResponse.json({ 
        error: `No contract address available for BNB testnet` 
      }, { status: 400 });
    }
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, HatchTokenABI, wallet);
    
    // Get current merkle root for comparison
    const currentMerkleRoot = await contract.merkleRoot();
    
    if (currentMerkleRoot === merkleRoot) {
      return NextResponse.json({ 
        message: 'New merkle root is the same as current. No update needed.',
        txHash: null,
        currentMerkleRoot
      });
    }
    
    // Update the merkle root
    const tx = await contract.updateMerkleRoot(merkleRoot);
    const receipt = await tx.wait();
    
    // Verify the update was successful
    const updatedMerkleRoot = await contract.merkleRoot();
    
    if (updatedMerkleRoot === merkleRoot) {
      return NextResponse.json({
        message: 'Merkle root updated successfully',
        txHash: tx.hash,
        updatedMerkleRoot
      });
    } else {
      return NextResponse.json({ 
        error: 'Merkle root update failed - new value does not match requested value',
        txHash: tx.hash,
        updatedMerkleRoot
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error updating merkle root:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to update merkle root' 
    }, { status: 500 });
  }
} 