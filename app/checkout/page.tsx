'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Navbar from '@/components/Navbar';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { CheckCircle2, Loader2, ArrowLeft, Wallet, Coins, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import PcPayButton from '@/components/PcPayButton';
import { useCrypto } from '@/lib/crypto-context';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().min(5, 'Zip code is required'),
  country: z.string().min(2, 'Country is required'),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { walletAddress, usdcToPc } = useCrypto();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [isApplyingGiftCard, setIsApplyingGiftCard] = useState(false);
  const [giftCardError, setGiftCardError] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState<any>(null);

  const { register, handleSubmit, setValue, formState: { errors, isValid }, watch } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onChange',
    defaultValues: {
      email: user?.email || '',
      fullName: user?.displayName || '',
    }
  });

  const { profile, updateUserProfile } = useAuth();
  const [saveAddress, setSaveAddress] = useState(false);

  // Logistics Calculations
  const taxRate = 0.08; // 8% tax
  
  // Loyalty Discount
  const getLoyaltyDiscountRate = (tier: string) => {
    switch (tier) {
      case 'Silver': return 0.05;
      case 'Gold': return 0.10;
      case 'Platinum': return 0.15;
      default: return 0;
    }
  };

  const loyaltyDiscountRate = getLoyaltyDiscountRate(profile?.loyaltyTier || 'Bronze');
  const loyaltyDiscountAmount = totalPrice * loyaltyDiscountRate;
  const discountedSubtotal = totalPrice - loyaltyDiscountAmount;

  const taxAmount = discountedSubtotal * taxRate;
  const shippingThreshold = 200;
  const flatShippingRate = 15;
  const shippingCost = discountedSubtotal >= shippingThreshold ? 0 : flatShippingRate;
  const finalTotal = discountedSubtotal + taxAmount + shippingCost;

  const handleSelectAddress = (address: any) => {
    setValue('fullName', address.fullName, { shouldValidate: true });
    setValue('address', address.address, { shouldValidate: true });
    setValue('city', address.city, { shouldValidate: true });
    setValue('zipCode', address.zipCode, { shouldValidate: true });
    setValue('country', address.country, { shouldValidate: true });
  };

  const handleApplyGiftCard = async () => {
    if (!giftCardCode) return;
    setIsApplyingGiftCard(true);
    setGiftCardError('');
    
    try {
      const q = query(collection(db, 'giftcards'), where('code', '==', giftCardCode.replace(/-/g, '').toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setGiftCardError('Invalid gift card code.');
        return;
      }

      const gcDoc = querySnapshot.docs[0];
      const gcData = gcDoc.data();

      if (!gcData.isActive) {
        setGiftCardError('This gift card is inactive.');
        return;
      }

      if (gcData.currentBalance <= 0) {
        setGiftCardError('This gift card has no remaining balance.');
        return;
      }

      const discount = Math.min(gcData.currentBalance, totalPrice - loyaltyDiscountAmount);
      setGiftCardDiscount(discount);
      setAppliedGiftCard({ id: gcDoc.id, ...gcData, appliedAmount: discount });
    } catch (error) {
      console.error('Error applying gift card:', error);
      setGiftCardError('Failed to apply gift card.');
    } finally {
      setIsApplyingGiftCard(false);
    }
  };

  const onPaymentSuccess = async () => {
    // This will be called by PcPayButton after mock payment
    await handleSubmit(async (data) => {
      setIsSubmitting(true);
      try {
        // Save address if requested
        if (saveAddress && profile) {
          const newAddress = {
            id: crypto.randomUUID(),
            fullName: data.fullName,
            address: data.address,
            city: data.city,
            zipCode: data.zipCode,
            country: data.country,
            isDefault: (profile.savedAddresses || []).length === 0
          };
          
          const updatedAddresses = [...(profile.savedAddresses || []), newAddress];
          await updateUserProfile({ savedAddresses: updatedAddresses });
        }

          const orderData = {
            userId: user?.uid || 'anonymous',
            walletAddress,
            items: items.map(item => ({
              productId: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })),
            subtotal: totalPrice,
            loyaltyDiscount: loyaltyDiscountAmount,
            giftCardDiscount: giftCardDiscount,
            giftCardId: appliedGiftCard?.id || null,
            tax: taxAmount,
            shippingCost: shippingCost,
            total: finalTotal,
            totalPc: usdcToPc(finalTotal),
            notes: data.notes || '',
            status: 'paid',
            paymentMethod: 'PcPay',
            shippingAddress: {
              fullName: data.fullName,
              address: data.address,
              city: data.city,
              zipCode: data.zipCode,
              country: data.country
            },
            createdAt: serverTimestamp()
          };

          const docRef = await addDoc(collection(db, 'orders'), orderData);
          
          // Update gift card balance if used
          if (appliedGiftCard) {
            const gcRef = doc(db, 'giftcards', appliedGiftCard.id);
            await updateDoc(gcRef, {
              currentBalance: appliedGiftCard.currentBalance - appliedGiftCard.appliedAmount
            });
          }

          setOrderId(docRef.id);
        setIsSuccess(true);
        clearCart();
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to save order details. Please contact support.');
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#fdfcf8] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="flex justify-center mb-8">
            <CheckCircle2 size={80} className="text-stone-900" />
          </div>
          <h1 className="text-5xl font-light text-stone-900 mb-6 font-display italic leading-tight">Order Confirmed</h1>
          <p className="text-stone-500 mb-10 font-medium text-lg">
            Thank you for your purchase. Your order <span className="font-bold text-stone-900">#{orderId}</span> has been successfully placed.
            A confirmation email has been sent to your inbox.
          </p>
          <Link 
            href="/"
            className="inline-block bg-stone-900 text-white px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-800 transition-all shadow-xl"
          >
            Return to Store
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfcf8] pt-24 pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link href="/cart" className="inline-flex items-center text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">
            <ArrowLeft size={14} className="mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-5xl font-light text-stone-900 mt-6 font-display italic leading-tight">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form Sections */}
          <div className="lg:col-span-8 space-y-10">
            {/* Shipping Info */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-stone-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-stone-900 font-display uppercase tracking-tight">Shipping Information</h2>
                {profile?.savedAddresses && profile.savedAddresses.length > 0 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2 max-w-[50%] custom-scrollbar">
                    {profile.savedAddresses.map((addr: any) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectAddress(addr)}
                        className="flex-shrink-0 px-4 py-2 rounded-full border border-stone-200 bg-stone-50 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:border-stone-900 hover:text-stone-900 transition-all"
                      >
                        {addr.fullName.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Full Name</label>
                  <input 
                    {...register('fullName')}
                    placeholder="John Doe"
                    className={`w-full px-6 py-4 rounded-full border-2 ${errors.fullName ? 'border-rose-500' : 'border-stone-50'} bg-stone-50 focus:outline-none focus:border-stone-900 text-stone-900 text-sm transition-all`}
                  />
                  {errors.fullName && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-1">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Email Address</label>
                  <input 
                    {...register('email')}
                    placeholder="john@example.com"
                    className={`w-full px-6 py-4 rounded-full border-2 ${errors.email ? 'border-rose-500' : 'border-stone-50'} bg-stone-50 focus:outline-none focus:border-stone-900 text-stone-900 text-sm transition-all`}
                  />
                  {errors.email && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-1">{errors.email.message}</p>}
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Street Address</label>
                  <input 
                    {...register('address')}
                    placeholder="123 Main St"
                    className={`w-full px-6 py-4 rounded-full border-2 ${errors.address ? 'border-rose-500' : 'border-stone-50'} bg-stone-50 focus:outline-none focus:border-stone-900 text-stone-900 text-sm transition-all`}
                  />
                  {errors.address && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-1">{errors.address.message}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400">City</label>
                  <input 
                    {...register('city')}
                    placeholder="New York"
                    className={`w-full px-6 py-4 rounded-full border-2 ${errors.city ? 'border-rose-500' : 'border-stone-50'} bg-stone-50 focus:outline-none focus:border-stone-900 text-stone-900 text-sm transition-all`}
                  />
                  {errors.city && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-1">{errors.city.message}</p>}
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Zip Code</label>
                  <input 
                    {...register('zipCode')}
                    placeholder="10001"
                    className={`w-full px-6 py-4 rounded-full border-2 ${errors.zipCode ? 'border-rose-500' : 'border-stone-50'} bg-stone-50 focus:outline-none focus:border-stone-900 text-stone-900 text-sm transition-all`}
                  />
                  {errors.zipCode && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-1">{errors.zipCode.message}</p>}
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Country</label>
                  <input 
                    {...register('country')}
                    placeholder="United States"
                    className={`w-full px-6 py-4 rounded-full border-2 ${errors.country ? 'border-rose-500' : 'border-stone-50'} bg-stone-50 focus:outline-none focus:border-stone-900 text-stone-900 text-sm transition-all`}
                  />
                  {errors.country && <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-1">{errors.country.message}</p>}
                </div>

                {user && (
                  <div className="md:col-span-2 flex items-center space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setSaveAddress(!saveAddress)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${saveAddress ? 'bg-stone-900 border-stone-900' : 'border-stone-200'}`}
                    >
                      {saveAddress && <CheckCircle2 size={14} className="text-white" />}
                    </button>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-stone-500">Save this address to my profile</span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-stone-100">
              <h2 className="text-2xl font-bold text-stone-900 mb-8 font-display uppercase tracking-tight">Order Notes</h2>
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Additional Instructions (Optional)</label>
                <textarea 
                  {...register('notes')}
                  placeholder="Special delivery instructions, gift messages, etc."
                  rows={4}
                  className="w-full px-6 py-4 rounded-3xl border-2 border-stone-50 bg-stone-50 focus:outline-none focus:border-stone-900 text-stone-900 text-sm transition-all resize-none"
                />
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-stone-900 text-white rounded-[2rem] p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold font-display uppercase tracking-tight">Payment Method</h2>
                <div className="flex items-center space-x-2 bg-white/10 text-white/60 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                  <Shield size={14} />
                  <span>Secure Payment</span>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="p-8 border border-white/10 bg-white/5 rounded-3xl text-center">
                  <p className="text-sm text-stone-400 mb-6 uppercase tracking-widest font-bold">
                    Hagenz Market accepts **Pawn Coin ($Pc)** for all transactions.
                  </p>
                  <div className="flex justify-center items-center space-x-12">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-stone-500 uppercase mb-2 tracking-widest">Total Value</p>
                      <p className="text-3xl font-bold tracking-tight">${totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center text-stone-700">
                      <ArrowRight size={24} />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-stone-400 uppercase mb-2 tracking-widest">Pay in $Pc</p>
                      <p className="text-3xl font-bold text-white tracking-tight">{usdcToPc(totalPrice).toFixed(2)} $Pc</p>
                    </div>
                  </div>
                </div>

                {!isValid && (
                  <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20 flex items-start space-x-4">
                    <div className="text-rose-500 mt-0.5">⚠️</div>
                    <p className="text-[11px] text-rose-500 font-bold uppercase tracking-widest leading-relaxed">
                      Please complete your shipping information to proceed with the payment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2rem] p-10 shadow-sm sticky top-24 border border-stone-100">
              <h2 className="text-2xl font-bold text-stone-900 mb-8 font-display uppercase tracking-tight">Summary</h2>
              <div className="space-y-5 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                    <span className="text-stone-400">{item.name} x {item.quantity}</span>
                    <span className="text-stone-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-stone-100 space-y-5 mb-10">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-400">
                  <span>Subtotal</span>
                  <span className="text-stone-900">${totalPrice.toFixed(2)}</span>
                </div>
                {loyaltyDiscountAmount > 0 && (
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                    <span>Loyalty Discount ({profile?.loyaltyTier})</span>
                    <span>-${loyaltyDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                {giftCardDiscount > 0 && (
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                    <span>Gift Card</span>
                    <span>-${giftCardDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-400">
                  <span>Tax (8%)</span>
                  <span className="text-stone-900">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-400">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "text-emerald-600" : "text-stone-900"}>
                    {shippingCost === 0 ? 'Complimentary' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-stone-100">
                  <span className="text-xl font-bold text-stone-900 font-display uppercase tracking-tight">Total</span>
                  <div className="text-right">
                    <span className="block text-3xl font-bold text-stone-900 tracking-tight">${finalTotal.toFixed(2)}</span>
                    <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">{usdcToPc(finalTotal).toFixed(2)} $Pc</span>
                  </div>
                </div>
              </div>

              {/* Gift Card Redemption */}
              <div className="mb-8 p-6 bg-stone-50 rounded-3xl border border-stone-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Gift Card</h3>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value)}
                    className="flex-grow bg-white border border-stone-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-stone-900 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleApplyGiftCard}
                    disabled={isApplyingGiftCard || !giftCardCode}
                    className="bg-stone-900 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all disabled:opacity-50"
                  >
                    {isApplyingGiftCard ? <Loader2 size={12} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {giftCardError && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest mt-2 ml-2">{giftCardError}</p>}
                {appliedGiftCard && (
                  <div className="mt-3 flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                    <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">Applied: ${giftCardDiscount.toFixed(2)}</span>
                    <button 
                      onClick={() => {
                        setAppliedGiftCard(null);
                        setGiftCardDiscount(0);
                        setGiftCardCode('');
                      }}
                      className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              
              <PcPayButton 
                amount={finalTotal} 
                onSuccess={onPaymentSuccess} 
                disabled={!isValid || isSubmitting}
              />

              <p className="text-center text-[10px] text-stone-300 mt-8 uppercase tracking-[0.2em] font-bold">
                Secure Checkout • Hagenz Market
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
