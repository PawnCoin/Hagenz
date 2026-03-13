'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send, Sparkles, ShoppingBag, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import Link from 'next/link';

interface Message {
  role: 'user' | 'model';
  text: string;
  products?: any[];
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m your Hagenz AI assistant. How can I help you find the perfect product today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchProducts = async (searchTerm: string) => {
    try {
      // Basic search logic: search by name (case-insensitive search is tricky in Firestore, 
      // so we'll fetch some products and filter or use simple queries)
      const productsRef = collection(db, 'products');
      const q = query(productsRef, limit(20));
      const querySnapshot = await getDocs(q);
      
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Simple client-side filtering for the demo
      return products.filter((p: any) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 3);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      // Define tools for function calling
      const searchProductsTool = {
        name: "searchProducts",
        parameters: {
          type: "OBJECT",
          description: "Search for products in the store by name, description, or category.",
          properties: {
            searchTerm: {
              type: "STRING",
              description: "The term to search for (e.g., 'shoes', 'electronics', 'blue shirt').",
            },
          },
          required: ["searchTerm"],
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat({ role: 'user', text: userMessage }).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "You are a helpful shopping assistant for Hagenz Store, a premium e-commerce site. You can help users find products, answer questions about the store, and provide recommendations. Use the searchProducts tool when users ask for specific items.",
          tools: [{ functionDeclarations: [searchProductsTool] }],
        },
      });

      const functionCalls = response.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === 'searchProducts') {
          const searchTerm = (call.args as any).searchTerm;
          const foundProducts = await searchProducts(searchTerm);
          
          if (foundProducts.length > 0) {
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: `I found some products related to "${searchTerm}" for you:`,
              products: foundProducts
            }]);
          } else {
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: `I searched for "${searchTerm}" but couldn't find any matching products. Is there something else I can help you with?` 
            }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm sorry, I couldn't process that request." }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having some trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 w-full max-w-[350px] h-[500px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-black p-6 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Hagenz AI</h3>
                  <p className="text-[10px] text-white/60">Shopping Assistant</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-black text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    {m.text}
                    
                    {m.products && (
                      <div className="mt-4 space-y-3">
                        {m.products.map((p) => (
                          <Link 
                            key={p.id} 
                            href={`/products/${p.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-gray-200 hover:border-black transition-colors"
                          >
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-bold">
                              {p.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs truncate">{p.name}</p>
                              <p className="text-[10px] text-gray-500">${p.price}</p>
                            </div>
                            <ShoppingBag size={14} className="text-gray-400" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-black hover:text-gray-600 disabled:opacity-30 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
