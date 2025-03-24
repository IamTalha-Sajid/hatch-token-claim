import { useState } from 'react';
import { formatMerkleTreeOutput, generateMerkleTree, Allocation } from '../lib/contractUtils';
import { ethers } from 'ethers';

interface MerkleGeneratorProps {
  onGenerate: (merkleData: any) => void;
}

interface AllocationInput {
  address: string;
  amountEther: string; // amount in ETH (user-friendly format)
}

export default function MerkleGenerator({ onGenerate }: MerkleGeneratorProps) {
  const [allocations, setAllocations] = useState<AllocationInput[]>([
    { address: '', amountEther: '' }
  ]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddRow = () => {
    setAllocations([...allocations, { address: '', amountEther: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    if (allocations.length === 1) return;
    const newAllocations = [...allocations];
    newAllocations.splice(index, 1);
    setAllocations(newAllocations);
  };

  const handleInputChange = (index: number, field: keyof AllocationInput, value: string) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], [field]: value };
    setAllocations(newAllocations);
  };

  const validateAllocations = (): boolean => {
    for (const allocation of allocations) {
      // Check address format
      if (!allocation.address.match(/^0x[a-fA-F0-9]{40}$/)) {
        setError(`Invalid address format: ${allocation.address}`);
        return false;
      }
      
      // Check amount is a valid number
      if (!/^[0-9]*\.?[0-9]*$/.test(allocation.amountEther)) {
        setError(`Invalid amount format: ${allocation.amountEther}`);
        return false;
      }

      if (allocation.amountEther === '' || parseFloat(allocation.amountEther) <= 0) {
        setError('Amount must be greater than 0');
        return false;
      }
    }
    
    return true;
  };

  const handleGenerate = () => {
    setError(null);
    
    if (!validateAllocations()) {
      return;
    }
    
    setGenerating(true);
    
    try {
      // Convert ETH amounts to wei
      const weiAllocations: Allocation[] = allocations.map(allocation => ({
        address: allocation.address,
        amount: ethers.parseEther(allocation.amountEther).toString()
      }));

      const merkleTree = generateMerkleTree(weiAllocations);
      const merkleData = formatMerkleTreeOutput(merkleTree);
      onGenerate(merkleData);
    } catch (error: any) {
      console.error('Error generating merkle tree:', error);
      setError(error.message || 'Failed to generate merkle tree');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Generate Merkle Tree</h2>
      
      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          Add addresses and token amounts to generate a merkle tree for token distribution.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (ETH)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allocations.map((allocation, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={allocation.address}
                    onChange={(e) => handleInputChange(index, 'address', e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={allocation.amountEther}
                    onChange={(e) => handleInputChange(index, 'amountEther', e.target.value)}
                    placeholder="1.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleRemoveRow(index)}
                    disabled={allocations.length === 1}
                    className="text-red-500 hover:text-red-700 mr-2 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex gap-4">
        <button
          onClick={handleAddRow}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
        >
          Add Row
        </button>
        
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
        >
          {generating ? 'Generating...' : 'Generate Merkle Tree'}
        </button>
      </div>
      
      {error && (
        <p className="text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
} 