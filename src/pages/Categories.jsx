import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, Image as ImageIcon, Link as LinkIcon, Save, RefreshCw } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

function CategoryRow({ category, onEdit, onDelete }) {
  return (
    <motion.div 
      layout
      className="flex items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center text-gray-400 border border-gray-200">
          {category.image ? (
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6" />
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900 flex items-center">
            {category.name}
            {category.isRental && (
              <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[8px] font-black uppercase rounded">Rental</span>
            )}
          </div>
          <div className="text-xs text-gray-500">{category.slug}</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => onEdit(category)}
          className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(category.id, category.name)}
          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    isRental: false
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Category name is required");
    
    setIsSubmitting(true);
    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-');
      const payload = {
        ...formData,
        slug,
        updatedAt: serverTimestamp()
      };

      if (editId) {
        await updateDoc(doc(db, 'categories', editId), payload);
        toast.success("Category updated!");
      } else {
        await addDoc(collection(db, 'categories'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        toast.success("Category added!");
      }
      
      setFormData({ name: '', slug: '', image: '', isRental: false });
      setEditId(null);
      fetchCategories();
    } catch (err) {
      toast.error("Error saving category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditId(category.id);
    setFormData({
      image: category.image || '',
      isRental: category.isRental || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
      toast.success("Category deleted");
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button 
          onClick={fetchCategories}
          className="p-2 text-gray-500 hover:text-primary-600 bg-white rounded-md border border-gray-200 shadow-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">All Categories</h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {categories.length} total
              </span>
            </div>
            <div className="divide-y divide-gray-100 min-h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                  <p>No categories found</p>
                </div>
              ) : (
                categories.map(category => (
                  <CategoryRow 
                    key={category.id} 
                    category={category} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editId ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. Mens Fashion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Slug (Optional)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="mens-fashion"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                
                {/* Live Preview */}
                <div className="mb-3 w-full h-32 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                      <span className="text-[10px]">Preview</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRental"
                  checked={formData.isRental}
                  onChange={(e) => setFormData({ ...formData, isRental: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isRental" className="ml-2 block text-sm font-medium text-gray-700">
                  Mark as Rental Category
                </label>
              </div>

              <div className="flex gap-2">
                {editId && (
                  <button
                    type="button"
                    onClick={() => { setEditId(null); setFormData({ name: '', slug: '', image: '', isRental: false }); }}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editId ? 'Update' : 'Add Category'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
