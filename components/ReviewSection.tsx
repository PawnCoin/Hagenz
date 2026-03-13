'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';
import { Star, MessageSquare, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching reviews:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });
      setComment('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="mt-24 border-t border-gray-100 pt-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Summary & Form */}
        <div className="lg:col-span-4">
          <h2 className="text-3xl font-light mb-4 font-display italic text-stone-900">Customer <span className="font-normal not-italic">Reviews</span></h2>
          <div className="flex items-center space-x-4 mb-10">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  fill={i < Math.round(averageRating) ? "currentColor" : "none"} 
                  className={i < Math.round(averageRating) ? "text-amber-500" : "text-stone-200"}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-stone-900">{averageRating.toFixed(1)}</span>
            <span className="text-stone-400 text-[11px] font-bold uppercase tracking-widest">({reviews.length} Reviews)</span>
          </div>

          {user ? (
            <form onSubmit={handleSubmit} className="bg-stone-50 p-8 rounded-3xl border border-stone-200">
              <h3 className="font-bold mb-8 text-[12px] uppercase tracking-[0.2em] text-stone-900">Write a Review</h3>
              
              <div className="mb-8">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 ${
                        rating >= num ? 'bg-stone-900 border-stone-900 text-white shadow-lg' : 'bg-white text-stone-300 border-stone-100'
                      }`}
                    >
                      <Star size={18} fill={rating >= num ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-4">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full bg-white border-2 border-stone-100 rounded-2xl p-5 text-sm focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none min-h-[140px] resize-none font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-stone-900 text-white py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-stone-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-xl"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Post Review</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-stone-50 p-8 rounded-3xl border border-stone-200 text-center">
              <p className="text-stone-500 text-[11px] font-bold uppercase tracking-widest mb-6">Sign in to leave a review</p>
              <button className="text-stone-900 font-bold border-b-2 border-stone-900 pb-1 text-[12px] uppercase tracking-widest">Sign In</button>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-8">
          <div className="space-y-8">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-stone-100 rounded-full"></div>
                    <div className="h-4 bg-stone-100 rounded w-32"></div>
                  </div>
                  <div className="h-20 bg-stone-100 rounded-2xl"></div>
                </div>
              ))
            ) : reviews.length === 0 ? (
              <div className="text-center py-24 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                <MessageSquare size={48} className="text-stone-200 mx-auto mb-4" />
                <p className="text-stone-400 text-[11px] font-bold uppercase tracking-widest">No reviews yet. Be the first to share.</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border-b border-stone-100 pb-10 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-tight text-stone-900">{review.userName}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                            {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < review.rating ? "currentColor" : "none"} 
                            className={i < review.rating ? "text-amber-500" : "text-stone-200"}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-600 leading-relaxed text-sm font-medium">
                      {review.comment}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
