import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  RefreshCw,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload
} from 'lucide-react';
import { 
  getRentalProducts, 
  getAllRentalOrders, 
  getAllUsers,
  addRentalProduct,
  updateRentalProduct,
  deleteRentalProduct,
  updateRentalOrderStatus
} from '../lib/firestoreService';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

// --- Sub-components ---

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
      active 
        ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20 scale-105" 
        : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm"
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    'Processing': 'bg-blue-50 text-blue-600 border-blue-100',
    'Confirmed': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'Active': 'bg-green-50 text-green-600 border-green-100',
    'Returned': 'bg-gray-50 text-gray-600 border-gray-100',
    'Cancelled': 'bg-red-50 text-red-600 border-red-100',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
      {status}
    </span>
  );
};

// --- Main Admin Component ---

export default function RentalAdmin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [],
    orders: [],
    users: []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: '',
    originalPrice: '',
    description: '',
    image: '',
    seed: '',
    rating: 5.0,
    reviews: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [products, orders, users, categoriesSnapshot] = await Promise.all([
        getRentalProducts(),
        getAllRentalOrders(),
        getAllUsers(),
        getDocs(query(collection(db, 'categories'), orderBy('name', 'asc')))
      ]);
      setData({ products, orders, users });
      setCategories(categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        category: product.category || '',
        basePrice: product.basePrice || '',
        originalPrice: product.originalPrice || '',
        description: product.description || '',
        image: product.image || '',
        seed: product.seed || '',
        rating: product.rating || 5.0,
        reviews: product.reviews || 0
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        basePrice: '',
        originalPrice: '',
        description: '',
        image: '',
        seed: '',
        rating: 5.0,
        reviews: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingProduct ? "Updating product..." : "Adding product...");
    
    try {
      const productPayload = {
        ...formData,
        basePrice: Number(formData.basePrice),
        originalPrice: Number(formData.originalPrice),
        rating: Number(formData.rating),
        reviews: Number(formData.reviews)
      };

      if (editingProduct) {
        await updateRentalProduct(editingProduct.id, productPayload);
        toast.success("Product updated successfully", { id: loadingToast });
      } else {
        await addRentalProduct(productPayload);
        toast.success("Product added successfully", { id: loadingToast });
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Operation failed", { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    const loadingToast = toast.loading("Deleting product...");
    try {
      await deleteRentalProduct(id);
      toast.success("Product deleted", { id: loadingToast });
      fetchData();
    } catch (error) {
      toast.error("Delete failed", { id: loadingToast });
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateRentalOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus}`);
      fetchData();
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const filteredProducts = data.products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = data.orders.filter(o => 
    o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.productName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rental Management</h1>
          <p className="text-gray-500 mt-1">Manage your inventory, rental orders, and customers</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 w-full shadow-sm"
            />
          </div>
          <button 
            onClick={fetchData}
            className="p-2 bg-white border border-gray-300 rounded-lg text-gray-500 hover:text-primary-600 transition-all shadow-sm"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto pb-2 gap-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
        <TabButton 
          active={activeTab === 'inventory'} 
          icon={Package} 
          label="Inventory" 
          onClick={() => setActiveTab('inventory')} 
        />
        <TabButton 
          active={activeTab === 'orders'} 
          icon={ShoppingBag} 
          label="Rental Orders" 
          onClick={() => setActiveTab('orders')} 
        />
        <TabButton 
          active={activeTab === 'customers'} 
          icon={Users} 
          label="Customers" 
          onClick={() => setActiveTab('customers')} 
        />
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Loading Dashboard...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {/* --- INVENTORY TAB --- */}
              {activeTab === 'inventory' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Product Inventory ({filteredProducts.length})</h2>
                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                      <button 
                        onClick={() => navigate('/bulk-upload')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
                      >
                        <Upload className="w-4 h-4" /> Bulk Upload
                      </button>
                      <button 
                        onClick={() => handleOpenModal()}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6B46C1] text-white rounded-xl hover:bg-[#553C9A] transition-all font-bold text-sm shadow-lg shadow-[#6B46C1]/20"
                      >
                        <Plus className="w-4 h-4" /> Add Product
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-gray-100 rounded-lg">
                    <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Product</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Price / Day</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Original</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Stats</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={product.image || `https://picsum.photos/seed/${product.seed || product.id}/100/100`} 
                                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                  alt=""
                                />
                                <span className="font-medium text-sm text-gray-900 group-hover:text-primary-600 transition-colors">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">{product.category}</span>
                            </td>
                            <td className="px-6 py-4 font-bold text-sm">₹{product.basePrice}</td>
                            <td className="px-6 py-4 text-xs text-gray-400">₹{product.originalPrice}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-700">{product.rating}★</span>
                                <span className="text-[10px] text-gray-400">({product.reviews})</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleOpenModal(product)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(product.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- ORDERS TAB --- */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Active Rental Orders ({filteredOrders.length})</h2>
                  <div className="overflow-x-auto border border-gray-100 rounded-lg">
                    <table className="w-full text-left min-w-[900px]">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Order ID</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Customer</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Product</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Duration</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Total</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                          <th className="px-6 py-3 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-[10px] font-bold text-gray-400">#{order.id?.slice(-8).toUpperCase()}</td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-bold text-gray-900">{order.customerName || 'GUEST'}</div>
                              <div className="text-[10px] text-gray-400 truncate max-w-[120px]">{order.userId}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-gray-700">{order.productName}</span>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-gray-500">{order.duration} days</td>
                            <td className="px-6 py-4 font-bold text-sm text-primary-600">₹{order.totalPrice}</td>
                            <td className="px-6 py-4">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <select 
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border-none rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-primary-500/20 cursor-pointer outline-none"
                              >
                                <option value="Processing">Process</option>
                                <option value="Confirmed">Confirm</option>
                                <option value="Active">Mark Active</option>
                                <option value="Returned">Returned</option>
                                <option value="Cancelled">Cancel</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- CUSTOMERS TAB --- */}
              {activeTab === 'customers' && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Registered Customers ({data.users.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.users.map(user => (
                      <div key={user.id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-300 transition-all group">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-white rounded-full border border-gray-100 flex items-center justify-center text-lg overflow-hidden">
                            {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : '👤'}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm group-hover:text-primary-600 transition-colors">{user.name || 'No Name'}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.role || 'Customer'}</p>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                            <span className="w-4 h-4 text-gray-300">📧</span> {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="w-4 h-4 text-gray-300">📞</span> {user.phone}
                            </div>
                          )}
                          <div className="pt-3 border-t border-gray-200 mt-3 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined</span>
                            <span className="text-[10px] font-bold text-gray-600">{user.createdAt ? new Date(user.createdAt?.seconds * 1000).toLocaleDateString() : 'Unknown'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
            onClick={() => setIsModalOpen(false)}
          />
           <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
          >
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{editingProduct ? 'Edit Rental Item' : 'Add New Rental'}</h2>
                  <p className="text-sm text-gray-500">Enter product details below</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Sony A7III Camera"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name} {cat.isRental ? '(Rental)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price / Day (₹)</label>
                    <input 
                      required
                      type="number"
                      placeholder="500"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Buy Price (₹)</label>
                    <input 
                      required
                      type="number"
                      placeholder="50000"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Image URL</label>
                    <input 
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Image Seed (Fallback)</label>
                    <input 
                      type="text"
                      placeholder="e.g. camera-1"
                      value={formData.seed}
                      onChange={(e) => setFormData({...formData, seed: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reviews Count</label>
                    <input 
                      type="number"
                      value={formData.reviews}
                      onChange={(e) => setFormData({...formData, reviews: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe the product..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-gray-50 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-primary-600/20 hover:bg-primary-700 active:scale-95 transition-all"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
