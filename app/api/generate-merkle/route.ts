import { NextResponse } from 'next/server';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

interface Allocation {
  address: string;
  amount: string; // amount in wei format
}

interface ResponseValue {
  value: string[];
  treeIndex: number;
  proof: string[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.allocations || !Array.isArray(body.allocations)) {
      return NextResponse.json({ error: 'Invalid request: allocations array is required' }, { status: 400 });
    }
    
    const allocations: Allocation[] = body.allocations;
    
    // Validate allocations
    for (const allocation of allocations) {
      if (!allocation.address || !allocation.amount) {
        return NextResponse.json({ 
          error: 'Each allocation must have address and amount fields' 
        }, { status: 400 });
      }
      
      // Validate address format
      if (!allocation.address.match(/^0x[a-fA-F0-9]{40}$/)) {
        return NextResponse.json({ 
          error: `Invalid address format: ${allocation.address}` 
        }, { status: 400 });
      }
      
      // Validate amount format (simple check for numeric string)
      if (!/^\d+$/.test(allocation.amount)) {
        return NextResponse.json({ 
          error: `Invalid amount format: ${allocation.amount}` 
        }, { status: 400 });
      }
    }
    
    // Format allocations for Merkle tree
    const values = allocations.map(allocation => [allocation.address, allocation.amount]);
    
    // Generate Merkle tree
    const merkleTree = StandardMerkleTree.of(values, ["address", "uint256"]);
    
    // Format the response
    const response = {
      root: merkleTree.root,
      format: "standard-v1",
      tree: merkleTree.dump(),
      values: [] as ResponseValue[]
    };
    
    // Add proofs for each value - revert to original approach but with explicit indexing
    // Use traditional for-loop instead of for...of to avoid TypeScript issues
    for (let i = 0; i < values.length; i++) {
      response.values.push({
        value: values[i],
        treeIndex: i,
        proof: merkleTree.getProof(i)
      });
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error generating merkle tree:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate merkle tree' }, { status: 500 });
  }
} 