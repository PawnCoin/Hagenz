'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CryptoContextType {
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  pcRate: number; // 1 $Pc = X USDC
  usdcToPc: (usdc: number) => number;
  pcToUsdc: (pc: number) => number;
  isConnecting: boolean;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pcRate, setPcRate] = useState(0.85); // Example: 1 $Pc = 0.85 USDC

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Mock wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddress = '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6);
      setWalletAddress(mockAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  const usdcToPc = (usdc: number) => usdc / pcRate;
  const pcToUsdc = (pc: number) => pc * pcRate;

  return (
    <CryptoContext.Provider value={{ 
      walletAddress, 
      connectWallet, 
      disconnectWallet, 
      pcRate, 
      usdcToPc, 
      pcToUsdc,
      isConnecting
    }}>
      {children}
    </CryptoContext.Provider>
  );
}

export function useCrypto() {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
}
