import { useState, useEffect } from 'react';
import { claimTokens, getUnlockedBalance, getTotalClaimed } from '../lib/contractUtils';
import { ethers } from 'ethers';

interface TokenClaimerProps {
  walletConnected: boolean;
  address: string;
  merkleData: any;
}

export default function TokenClaimer({ walletConnected, address, merkleData }: TokenClaimerProps) {
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [unlockedBalance, setUnlockedBalance] = useState<string>('0');
  const [totalClaimed, setTotalClaimed] = useState<string>('0');
  const [allocation, setAllocation] = useState<{amount: string, proof: string[]} | null>(null);

  useEffect(() => {
    if (walletConnected && address) {
      fetchBalances();
      findUserAllocation();
    }
  }, [walletConnected, address, merkleData]);

  const fetchBalances = async () => {
    try {
      const unlocked = await getUnlockedBalance(address);
      const claimed = await getTotalClaimed(address);
      
      setUnlockedBalance(ethers.formatEther(unlocked));
      setTotalClaimed(ethers.formatEther(claimed));
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const findUserAllocation = () => {
    if (!merkleData || !merkleData.values || !address) return;

    const userAllocation = merkleData.values.find((v: any) => 
      v.value[0].toLowerCase() === address.toLowerCase()
    );

    if (userAllocation) {
      setAllocation({
        amount: userAllocation.value[1],
        proof: userAllocation.proof
      });
    } else {
      setAllocation(null);
    }
  };

  const handleClaim = async () => {
    if (!walletConnected) {
      setError('Connect your wallet first');
      return;
    }

    if (!allocation) {
      setError('No allocation found for your address in the current merkle tree');
      return;
    }

    setError(null);
    setTxHash(null);
    setClaiming(true);

    try {
      // This will use the connected wallet (browser provider and signer)
      const hash = await claimTokens(allocation.amount, allocation.proof);
      setTxHash(hash);
      // Refresh balances after claim
      await fetchBalances();
    } catch (error: any) {
      console.error('Error claiming tokens:', error);
      setError(error.message || 'Failed to claim tokens');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Claim Tokens</h2>
      
      {walletConnected && (
        <div className="mb-4">
          <p className="text-gray-700">
            <span className="font-bold">Your Address:</span> {address}
          </p>
          <p className="text-gray-700 mt-2">
            <span className="font-bold">Unlocked Balance:</span> {unlockedBalance} HATCH
          </p>
          <p className="text-gray-700 mt-2">
            <span className="font-bold">Total Claimed:</span> {totalClaimed} HATCH
          </p>
        </div>
      )}
      
      {allocation ? (
        <div className="mb-4">
          <p className="text-green-600">
            You have an allocation of {ethers.formatEther(allocation.amount)} HATCH tokens available to claim!
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Note: Claiming will be done using your connected wallet.
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-yellow-600">
            No allocation found for your address in the current merkle tree.
          </p>
        </div>
      )}
      
      <div className="mb-4">
        <button
          onClick={handleClaim}
          disabled={claiming || !walletConnected || !allocation}
          className={`${
            walletConnected && allocation
              ? 'bg-primary-600 hover:bg-primary-700' 
              : 'bg-gray-400 cursor-not-allowed'
          } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors`}
        >
          {claiming ? 'Claiming...' : 'Claim Tokens'}
        </button>
        
        {!walletConnected && (
          <p className="text-yellow-600 mt-2">Connect your wallet to claim tokens</p>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
          {error}
        </div>
      )}
      
      {txHash && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded text-green-700">
          <p>Claim successful!</p>
          <p className="text-sm mt-1">
            Transaction hash: <a href={`https://testnet.bscscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{txHash}</a>
          </p>
        </div>
      )}
    </div>
  );
} 