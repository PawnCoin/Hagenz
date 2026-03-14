'use client';

import React, { useState } from 'react';
import { useCrypto } from '@/lib/crypto-context';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Wallet, Trophy, CheckCircle2, Loader2, Star, Zap, Crown, Info } from 'lucide-react';

const TIERS = [
  {
    name: 'Bronze',
    min: 0,
    color: 'text-stone-400',
    bg: 'bg-stone-400/10',
    border: 'border-stone-400/20',
    benefits: ['Standard Access', 'Pawn Coin Payments'],
    icon: Star
  },
  {
    name: 'Silver',
    min: 1000,
    color: 'text-slate-400',
    bg: 'bg-slate-400/10',
    border: 'border-slate-400/20',
    benefits: ['5% Discount on All Items', 'Exclusive Drops Access'],
    icon: Zap
  },
  {
    name: 'Gold',
    min: 5000,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    benefits: ['10% Discount on All Items', 'Free Priority Shipping', 'Early Access to Sales'],
    icon: Trophy
  },
  {
    name: 'Platinum',
    min: 20000,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    border: 'border-indigo-400/20',
    benefits: ['15% Discount on All Items', 'Free Priority Shipping', '24/7 Concierge Support', 'VIP Event Invites'],
    icon: Crown
  }
];

export default function LoyaltyDashboard() {
  const { walletAddress, connectWallet, pcBalance, loyaltyTier, verifyWallet, isConnecting } = useCrypto();
  const { user, profile, updateUserProfile } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleVerify = async () => {
    if (!walletAddress) {
      await connectWallet();
    }
    
    setIsVerifying(true);
    try {
      await verifyWallet();
      if (user) {
        await updateUserProfile({
          walletAddress: walletAddress,
          pcBalance: pcBalance,
          loyaltyTier: loyaltyTier
        });
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const currentTierData = TIERS.find(t => t.name === (profile?.loyaltyTier || loyaltyTier)) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTierData) + 1];
  const progress = nextTier ? (pcBalance / nextTier.min) * 100 : 100;

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-stone-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-xl ${currentTierData.bg} ${currentTierData.color}`}>
                  <currentTierData.icon size={20} />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${currentTierData.color}`}>
                  {currentTierData.name} Member
                </span>
              </div>
              <h2 className="text-4xl font-light font-display italic mb-2">Loyalty Rewards</h2>
              <p className="text-stone-400 text-sm max-w-md">
                Verify your wallet to unlock exclusive benefits based on your $Pc holdings.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm min-w-[240px]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Current Balance</span>
                <div className="flex items-center space-x-1 text-white">
                  <Shield size={12} className="text-stone-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Verified</span>
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold tracking-tight">{pcBalance.toLocaleString()}</span>
                <span className="text-sm font-bold text-stone-500">$Pc</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {nextTier && (
            <div className="mt-10">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3">
                <span className="text-stone-500">Progress to {nextTier.name}</span>
                <span className="text-white">{Math.min(100, Math.round(progress))}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, progress)}%` }}
                  className={`h-full ${currentTierData.color.replace('text', 'bg')}`}
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-3 uppercase tracking-widest font-bold">
                Hold { (nextTier.min - pcBalance).toLocaleString() } more $Pc to unlock {nextTier.name} benefits
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Card */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 flex flex-col">
          <h3 className="text-xl font-bold text-stone-900 mb-6 font-display uppercase tracking-tight">Wallet Verification</h3>
          
          <div className="space-y-6 flex-grow">
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Wallet size={20} className="text-stone-900" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</p>
                  <p className="text-xs font-bold text-stone-900 uppercase tracking-widest">
                    {walletAddress ? 'Connected' : 'Not Connected'}
                  </p>
                </div>
              </div>
              {walletAddress && (
                <p className="text-[10px] font-mono text-stone-400 break-all bg-white p-2 rounded-lg border border-stone-100">
                  {walletAddress}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1 text-emerald-500"><CheckCircle2 size={14} /></div>
                <p className="text-[11px] text-stone-500 leading-relaxed">Verification confirms your $Pc holdings on-chain.</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="mt-1 text-emerald-500"><CheckCircle2 size={14} /></div>
                <p className="text-[11px] text-stone-500 leading-relaxed">Rewards are updated instantly after verification.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={isVerifying || isConnecting}
            className="w-full mt-8 bg-stone-900 text-white py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isVerifying || isConnecting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : showSuccess ? (
              <>
                <CheckCircle2 size={14} />
                <span>Verified</span>
              </>
            ) : (
              <span>Verify Wallet</span>
            )}
          </button>
        </div>

        {/* Benefits Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TIERS.map((tier) => {
              const isCurrent = (profile?.loyaltyTier || loyaltyTier) === tier.name;
              const isLocked = TIERS.indexOf(tier) > TIERS.findIndex(t => t.name === (profile?.loyaltyTier || loyaltyTier));

              return (
                <div 
                  key={tier.name}
                  className={`relative rounded-[2rem] p-8 border-2 transition-all ${isCurrent ? `${tier.border} ${tier.bg}` : 'border-stone-100 bg-white opacity-60'}`}
                >
                  {isCurrent && (
                    <div className="absolute top-6 right-6 bg-stone-900 text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest">
                      Current
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-3 rounded-2xl ${tier.bg} ${tier.color}`}>
                      <tier.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-stone-900 font-display uppercase tracking-tight">{tier.name}</h4>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{tier.min.toLocaleString()} $Pc Required</p>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${isCurrent ? tier.color.replace('text', 'bg') : 'bg-stone-200'}`} />
                        <span className="text-[11px] font-bold text-stone-600 uppercase tracking-widest">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex items-start space-x-4">
            <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">About Loyalty Tiers</p>
              <p className="text-[11px] text-amber-800/70 leading-relaxed">
                Tiers are calculated based on your $Pc balance at the time of verification. Discounts are automatically applied at checkout when you pay with $Pc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
