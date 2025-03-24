'use client';

import { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import MerkleGenerator from '../components/MerkleGenerator';
import MerkleUpdater from '../components/MerkleUpdater';
import TokenClaimer from '../components/TokenClaimer';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [merkleData, setMerkleData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'update' | 'claim'>('generate');

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const handleMerkleGenerate = (data: any) => {
    setMerkleData(data);
    
    // Switch to update tab after generation
    if (data && data.root) {
      setActiveTab('update');
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center mb-10">
          <h1 className="text-4xl font-bold text-center mb-4">Hatch Token Interface</h1>
          <p className="text-gray-600 mb-6 text-center max-w-2xl">
            Generate a merkle tree for token distribution, update the contract's merkle root, and claim your tokens.
          </p>
          
          <div className="bg-amber-100 border border-amber-400 rounded p-3 text-amber-800 max-w-md w-full mb-6">
            <p className="text-center font-bold">
              BNB Smart Chain Testnet Only
            </p>
          </div>
          
          <div className="w-full max-w-md mb-6">
            <div className="flex flex-col items-center">
              <WalletConnect onConnect={handleWalletConnect} />
              
              {walletAddress && (
                <div className="bg-green-100 border border-green-400 rounded p-3 text-green-700 max-w-md w-full mt-4">
                  <p className="text-center">
                    <span className="font-bold">Connected:</span> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-2 px-4 text-center ${
                activeTab === 'generate' 
                  ? 'border-b-2 border-primary-500 text-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('generate')}
            >
              Generate Merkle Tree
            </button>
            
            <button
              className={`py-2 px-4 text-center ${
                activeTab === 'update' 
                  ? 'border-b-2 border-primary-500 text-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('update')}
            >
              Update Merkle Root
            </button>
            
            <button
              className={`py-2 px-4 text-center ${
                activeTab === 'claim' 
                  ? 'border-b-2 border-primary-500 text-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('claim')}
            >
              Claim Tokens
            </button>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {activeTab === 'generate' && (
            <MerkleGenerator onGenerate={handleMerkleGenerate} />
          )}
          
          {activeTab === 'update' && (
            <MerkleUpdater 
              merkleRoot={merkleData ? merkleData.root : ''} 
              walletConnected={!!walletAddress}
            />
          )}
          
          {activeTab === 'claim' && (
            <TokenClaimer 
              walletConnected={!!walletAddress} 
              address={walletAddress}
              merkleData={merkleData}
            />
          )}
        </div>
        
        {merkleData && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Generated Merkle Data</h3>
              
              <div className="mb-4">
                <p className="font-bold">Merkle Root:</p>
                <p className="font-mono text-sm break-all bg-gray-100 p-2 rounded">
                  {merkleData.root}
                </p>
              </div>
              
              <div className="mb-4">
                <p className="font-bold mb-2">Allocations:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (ETH)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {merkleData.values.map((item: any, index: number) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                            {item.value[0]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                            {item.value[1] && (+item.value[1] / 10**18).toString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
