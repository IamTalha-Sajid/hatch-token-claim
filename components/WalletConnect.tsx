import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connectWallet, isWalletConnected, switchToBscTestnet, BSC_TESTNET_CHAIN_ID } from '../lib/contractUtils';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await isWalletConnected();
        setIsConnected(connected);
        
        if (connected) {
          // Check if we're on the correct network
          const provider = new ethers.BrowserProvider(window.ethereum!);
          const network = await provider.getNetwork();
          const chainId = Number(network.chainId);
          
          if (chainId !== BSC_TESTNET_CHAIN_ID) {
            setNetworkError('Please switch to BNB Smart Chain Testnet');
            try {
              await switchToBscTestnet();
              // Get signer after network switch
              const signer = await provider.getSigner();
              const address = await signer.getAddress();
              onConnect(address);
              setNetworkError(null);
            } catch (switchError) {
              console.error('Failed to switch network:', switchError);
            }
          } else {
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            onConnect(address);
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
    
    // Listen for chain changes
    const handleChainChanged = () => {
      window.location.reload();
    };
    
    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      setIsConnected(accounts.length > 0);
      if (accounts.length > 0) {
        onConnect(accounts[0]);
      }
    };
    
    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [onConnect]);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      await switchToBscTestnet();
      const address = await connectWallet();
      onConnect(address);
      setIsConnected(true);
    } catch (error: any) {
      console.error('Connection error:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div>
      {!isConnected ? (
        <>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {error && (
            <p className="text-red-500 mt-2">{error}</p>
          )}
        </>
      ) : (
        <p className="text-green-600">
          Wallet Connected
        </p>
      )}
      
      {networkError && (
        <p className="text-amber-500 mt-2">{networkError}</p>
      )}
      
      <p className="text-sm text-gray-600 mt-2">
        Note: This app works only with the BNB Smart Chain Testnet
      </p>
    </div>
  );
} 