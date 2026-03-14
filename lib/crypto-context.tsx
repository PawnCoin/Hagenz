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
  pcBalance: number;
  loyaltyTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  verifyWallet: () => Promise<void>;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pcRate, setPcRate] = useState(0.85); // Example: 1 $Pc = 0.85 USDC
  const [pcBalance, setPcBalance] = useState(0);
  const [loyaltyTier, setLoyaltyTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'Platinum'>('Bronze');

  const getTier = (balance: number): 'Bronze' | 'Silver' | 'Gold' | 'Platinum' => {
    if (balance >= 20000) return 'Platinum';
    if (balance >= 5000) return 'Gold';
    if (balance >= 1000) return 'Silver';
    return 'Bronze';
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Mock wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddress = '0x' + Math.random().toString(16).slice(2, 10) + '...' + Math.random().toString(16).slice(2, 6);
      setWalletAddress(mockAddress);
      
      // Mock balance fetch
      const mockBalance = Math.floor(Math.random() * 25000);
      setPcBalance(mockBalance);
      setLoyaltyTier(getTier(mockBalance));
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const verifyWallet = async () => {
    // In a real app, this would involve signing a message
    // For this demo, we'll just simulate the verification process
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setPcBalance(0);
    setLoyaltyTier('Bronze');
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
      isConnecting,
      pcBalance,
      loyaltyTier,
      verifyWallet
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
