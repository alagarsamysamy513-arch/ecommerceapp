import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Image as ImageIcon, Link as LinkIcon, Save, RefreshCw, MoveUp, MoveDown } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Slider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    cta: 'Shop Now',
    link: '/products',
    order: 0
  });

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'hero_slides'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSlides(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) return toast.error("Title and Image URL are required");
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        order: Number(formData.order),
        updatedAt: serverTimestamp()
      };

      if (editId) {
        await updateDoc(doc(db, 'hero_slides', editId), payload);
        toast.success("Slide updated!");
      } else {
        await addDoc(collection(db, 'hero_slides'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        toast.success("Slide added!");
      }
      
      setFormData({ title: '', subtitle: '', image: '', cta: 'Shop Now', link: '/products', order: slides.length + 1 });
      setEditId(null);
      fetchSlides();
    } catch (err) {
      toast.error("Error saving slide");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (slide) => {
    setEditId(slide.id);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      image: slide.image,
      cta: slide.cta || 'Shop Now',
      link: slide.link || '/products',
      order: slide.order || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this slide?")) return;
    try {
      await deleteDoc(doc(db, 'hero_slides', id));
      toast.success("Slide deleted");
      setSlides(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      toast.error("Failed to delete slide");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slider Management</h1>
          <p className="text-gray-500 text-sm">Manage the images and text shown on the customer app home page.</p>
        </div>
        <button 
          onClick={fetchSlides}
          className="p-2 text-gray-500 hover:text-primary-600 bg-white rounded-md border border-gray-200 shadow-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editId ? 'Edit Slide' : 'Add New Slide'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Slide Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="e.g. Summer Collection"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                <textarea
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Brief description..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Button Text</label>
                  <input
                    type="text"
                    value={formData.cta}
                    onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Button Link</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="/products or /category/electronics"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL *</label>
                <div className="mb-3 aspect-video w-full rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center relative">
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                      <span className="text-xs">Image Preview</span>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {editId && (
                  <button
                    type="button"
                    onClick={() => { setEditId(null); setFormData({ title: '', subtitle: '', image: '', cta: 'Shop Now', link: '/products', order: slides.length }); }}
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
                  {isSubmitting ? 'Saving...' : editId ? 'Update Slide' : 'Add Slide'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : slides.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No slides found. Add your first slide to show it on the app.</p>
            </div>
          ) : (
            slides.map((slide, index) => (
              <motion.div 
                key={slide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row"
              >
                <div className="w-full md:w-48 h-32 md:h-auto bg-gray-100 relative group">
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                    Order: {slide.order}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{slide.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">{slide.subtitle}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        Button: {slide.cta}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        Link: {slide.link}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => handleEdit(slide)}
                      className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(slide.id)}
                      className="flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
