'use client';

import React from 'react';
import { useCrypto } from '@/lib/crypto-context';
import { Coins, Loader2, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

interface PcPayButtonProps {
  amount: number;
  onSuccess: () => void;
  disabled?: boolean;
}

export default function PcPayButton({ amount, onSuccess, disabled }: PcPayButtonProps) {
  const { walletAddress, connectWallet, usdcToPc, isConnecting } = useCrypto();
  const pcAmount = usdcToPc(amount);
  const [isPaying, setIsPaying] = React.useState(false);

  const handlePay = async () => {
    if (!walletAddress) {
      await connectWallet();
      return;
    }

    setIsPaying(true);
    try {
      // Mock payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      onSuccess();
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-stone-50 rounded-3xl p-8 border border-stone-200 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-stone-900" />
        <div className="flex justify-between items-center mb-4">
          <span className="text-[11px] text-stone-500 font-bold uppercase tracking-[0.2em]">Payment Summary</span>
          <span className="text-3xl font-light text-stone-900 font-display tracking-tight italic">{pcAmount.toFixed(2)} <span className="font-normal not-italic text-lg">$Pc</span></span>
        </div>
        <div className="h-px bg-stone-200 mb-4" />
        <div className="flex justify-between items-center text-[10px] text-stone-400 uppercase tracking-widest">
          <span>Rate: 1 $Pc = 0.85 USDC</span>
          <span>Total: ${amount.toFixed(2)}</span>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handlePay}
        disabled={disabled || isPaying || isConnecting}
        className={`w-full py-6 rounded-full font-bold text-[12px] flex items-center justify-center space-x-3 transition-all uppercase tracking-[0.3em] ${
          !walletAddress 
            ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-xl' 
            : 'bg-white text-stone-900 border-2 border-stone-900 hover:bg-stone-900 hover:text-white'
        } disabled:bg-stone-100 disabled:text-stone-300 disabled:cursor-not-allowed`}
      >
        {isConnecting || isPaying ? (
          <Loader2 className="animate-spin" size={18} />
        ) : !walletAddress ? (
          <>
            <Wallet size={16} />
            <span>Connect Wallet</span>
          </>
        ) : (
          <>
            <Coins size={16} />
            <span>Pay with $Pc</span>
          </>
        )}
      </motion.button>
      
      {walletAddress && (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-stone-900 animate-pulse" />
          <p className="text-center text-[10px] text-stone-500 uppercase tracking-widest">
            Wallet Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
}
