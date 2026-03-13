'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  X,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Accessories',
    stock: '',
    image: '',
    variants: [] as { name: string; options: string[] }[]
  });

  const categories = ['Accessories', 'Bags', 'Apparel', 'Home', 'Tech'];

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      setProducts(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleOpenModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category,
        stock: product.stock?.toString() || '0',
        image: product.image,
        variants: product.variants || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Accessories',
        stock: '',
        image: '',
        variants: []
      });
    }
    setIsModalOpen(true);
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { name: '', options: [] }]
    });
  };

  const removeVariant = (index: number) => {
    const newVariants = [...formData.variants];
    newVariants.splice(index, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const updateVariantName = (index: number, name: string) => {
    const newVariants = [...formData.variants];
    newVariants[index].name = name;
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariantOption = (index: number, option: string) => {
    if (!option.trim()) return;
    const newVariants = [...formData.variants];
    if (!newVariants[index].options.includes(option.trim())) {
      newVariants[index].options.push(option.trim());
    }
    setFormData({ ...formData, variants: newVariants });
  };

  const removeVariantOption = (vIndex: number, oIndex: number) => {
    const newVariants = [...formData.variants];
    newVariants[vIndex].options.splice(oIndex, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        updatedAt: serverTimestamp()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp()
        });
      }
      
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-gray-500">Manage your store&apos;s inventory and catalog.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all"
          />
        </div>
        <select className="bg-gray-50 border-none rounded-xl px-6 py-3 font-medium focus:ring-2 focus:ring-black">
          <option>All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400">Stock</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-12 w-12 bg-gray-100 rounded-lg"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                        <Image 
                          src={product.image || 'https://picsum.photos/seed/placeholder/200/200'} 
                          alt={product.name}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-sm">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${product.stock <= 5 ? 'text-rose-600' : 'text-gray-900'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-black transition-all shadow-sm border border-transparent hover:border-gray-100"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-all shadow-sm border border-transparent hover:border-rose-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-400">No products found matching your search.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white z-[70] rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold tracking-tighter">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Product Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
                        placeholder="e.g. Minimalist Watch"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
                      >
                        {categories.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Price (USD)</label>
                      <input 
                        required
                        type="number" 
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Stock Quantity</label>
                      <input 
                        required
                        type="number" 
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Image URL</label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input 
                          required
                          type="url" 
                          value={formData.image}
                          onChange={(e) => setFormData({...formData, image: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden relative">
                        {formData.image ? (
                          <Image 
                            src={formData.image} 
                            alt="Preview" 
                            fill 
                            className="object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <ImageIcon className="text-gray-300" size={20} />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Product Variants</label>
                      <button 
                        type="button"
                        onClick={addVariant}
                        className="text-xs font-bold text-black hover:opacity-70 flex items-center gap-1"
                      >
                        <Plus size={14} />
                        <span>Add Variant Type</span>
                      </button>
                    </div>
                    
                    {formData.variants.length > 0 ? (
                      <div className="space-y-4">
                        {formData.variants.map((variant, vIndex) => (
                          <div key={vIndex} className="p-4 bg-gray-50 rounded-2xl space-y-3 relative">
                            <button 
                              type="button"
                              onClick={() => removeVariant(vIndex)}
                              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-rose-600"
                            >
                              <X size={16} />
                            </button>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Variant Name (e.g. Size)</label>
                              <input 
                                type="text"
                                value={variant.name}
                                onChange={(e) => updateVariantName(vIndex, e.target.value)}
                                className="w-full px-3 py-2 bg-white border-none rounded-lg text-sm focus:ring-1 focus:ring-black"
                                placeholder="Size, Color, etc."
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Options (Press Enter to add)</label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {variant.options.map((option, oIndex) => (
                                  <span key={oIndex} className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                    {option}
                                    <button type="button" onClick={() => removeVariantOption(vIndex, oIndex)}>
                                      <X size={10} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <input 
                                type="text"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addVariantOption(vIndex, (e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }}
                                className="w-full px-3 py-2 bg-white border-none rounded-lg text-sm focus:ring-1 focus:ring-black"
                                placeholder="Add option..."
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 border-2 border-dashed border-gray-100 rounded-2xl text-center">
                        <p className="text-xs text-gray-400">No variants added. (Optional)</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black resize-none"
                      placeholder="Product details..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 text-sm font-bold text-gray-500 hover:text-black transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={isSubmitting}
                      type="submit"
                      className="flex-[2] py-4 bg-black text-white rounded-full font-bold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
