import { useState, useEffect } from 'react';

interface MerkleUpdaterProps {
  merkleRoot: string;
  walletConnected: boolean;
}

export default function MerkleUpdater({ merkleRoot, walletConnected }: MerkleUpdaterProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [inputRoot, setInputRoot] = useState(merkleRoot);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  // Update the input when the prop changes
  useEffect(() => {
    setInputRoot(merkleRoot);
  }, [merkleRoot]);

  const handleUpdate = async () => {
    if (!walletConnected) {
      setError('Connect your wallet first');
      return;
    }

    if (!inputRoot || !inputRoot.startsWith('0x') || inputRoot.length !== 66) {
      setError('Invalid merkle root format');
      return;
    }

    setError(null);
    setTxHash(null);
    setUpdateMessage(null);
    setUpdating(true);

    try {
      // Use the API endpoint that leverages the admin private key from .env
      const response = await fetch('/api/update-merkle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ merkleRoot: inputRoot }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update merkle root');
      }

      if (result.txHash) {
        setTxHash(result.txHash);
        setUpdateMessage(result.message || 'Merkle root updated successfully');
      } else {
        setUpdateMessage(result.message || 'No update needed');
      }
    } catch (error: any) {
      console.error('Error updating merkle root:', error);
      setError(error.message || 'Failed to update merkle root');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Update Merkle Root (Admin Function)</h2>
      
      <div className="mb-4">
        <p className="text-gray-600 mb-4">
          This operation will be performed by the admin account configured in the server environment.
          You only need to be connected with any wallet to authenticate the request.
        </p>
        
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="merkleRoot">
          Merkle Root
        </label>
        <input
          type="text"
          id="merkleRoot"
          value={inputRoot}
          onChange={(e) => setInputRoot(e.target.value)}
          placeholder="0x..."
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      
      <div className="mb-4">
        <button
          onClick={handleUpdate}
          disabled={updating || !walletConnected}
          className={`${
            walletConnected 
              ? 'bg-primary-600 hover:bg-primary-700' 
              : 'bg-gray-400 cursor-not-allowed'
          } text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors`}
        >
          {updating ? 'Updating...' : 'Update Merkle Root'}
        </button>
        
        {!walletConnected && (
          <p className="text-yellow-600 mt-2">Connect your wallet to update the merkle root</p>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded text-red-700">
          {error}
        </div>
      )}
      
      {updateMessage && !txHash && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 rounded text-blue-700">
          {updateMessage}
        </div>
      )}
      
      {txHash && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded text-green-700">
          <p>Update successful!</p>
          <p className="text-sm mt-1">
            Transaction hash: <a href={`https://testnet.bscscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{txHash}</a>
          </p>
        </div>
      )}
    </div>
  );
} 