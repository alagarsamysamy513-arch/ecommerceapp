import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ImageIcon, ArrowLeft, Save, LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../config/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const schema = yup.object({
  name: yup.string().required('Product name is required'),
  sku: yup.string().required('SKU is required'),
  price: yup.number().typeError('Price must be a number').positive('Price must be positive').required('Price is required'),
  stock: yup.number().typeError('Stock must be a number').integer().min(0, 'Stock cannot be negative').required('Stock is required'),
  category: yup.string().required('Category is required'),
  status: yup.string().required('Status is required'),
  description: yup.string(),
  imageUrl: yup.string().url('Must be a valid URL').nullable().transform(v => v === '' ? null : v),
  isRental: yup.boolean(),
  basePrice: yup.number().when('isRental', {
    is: true,
    then: (s) => s.typeError('Rental price must be a number').positive('Rental price must be positive').required('Rental price is required'),
    otherwise: (s) => s.nullable()
  }),
}).required();

export default function ProductForm() {
  const [imagePreview, setImagePreview] = useState('');
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      sku: '',
      price: '',
      stock: '',
      category: 'Electronics',
      status: 'Draft',
      description: '',
      imageUrl: '',
      isRental: false,
      basePrice: '',
    }
  });

  const isRental = watch('isRental');

  // If editing, load the existing product from Firestore
  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          // Try standard products first
          let docRef = doc(db, 'products', id);
          let docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            // Try rental products
            docRef = doc(db, 'rental_products', id);
            docSnap = await getDoc(docRef);
          }

          if (docSnap.exists()) {
            const data = docSnap.data();
            reset(data);
            setImagePreview(data.imageUrl || '');
          } else {
            toast.error('Product not found');
            navigate('/products');
          }
        } catch (err) {
          toast.error('Failed to load product');
          navigate('/products');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
        basePrice: data.isRental ? Number(data.basePrice) : null,
        image: data.imageUrl || `https://picsum.photos/seed/${data.sku || Math.random()}/40/40`,
        updatedAt: serverTimestamp(),
      };
      const collectionName = data.isRental ? 'rental_products' : 'products';

      if (isEdit) {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, payload);
        toast.success(`${data.isRental ? 'Rental' : 'Standard'} product updated successfully!`);
      } else {
        await addDoc(collection(db, collectionName), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        toast.success(`${data.isRental ? 'Rental' : 'Standard'} product added successfully!`);
      }
      navigate('/products');
    } catch (error) {
      toast.error('Failed to save product. Check Firestore rules.');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl h-64 border border-gray-200"></div>
          <div className="bg-white rounded-xl h-64 border border-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/products')}
          className="p-2 text-gray-500 hover:text-gray-900 bg-white rounded-md border border-gray-200 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isEdit ? `Editing product ID: ${id}` : 'Fill in the information below to add a new product.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                <input
                  {...register('name')}
                  placeholder="e.g. Wireless Headphones"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Describe your product..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Product Image</h2>
              
              {/* Image Preview */}
              <div className="w-full h-48 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                    onError={() => setImagePreview('')}
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="text-xs text-gray-400 mt-2">Image preview</p>
                  </div>
                )}
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    {...register('imageUrl')}
                    placeholder="https://example.com/image.jpg"
                    onChange={e => {
                      register('imageUrl').onChange(e);
                      setImagePreview(e.target.value);
                    }}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                {errors.imageUrl && <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>}
                <p className="mt-1 text-xs text-gray-400">Paste a public image URL to display the product photo.</p>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Organization</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <select
                  {...register('category')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Home">Home & Kitchen</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  {...register('status')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md border"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      {...register('isRental')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Rental Product</span>
                </label>
                <p className="mt-1 text-xs text-gray-500">Enable this if the item is for rental.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {isRental ? 'Original Buy Price *' : 'Standard Price *'}
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('price')}
                    className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>

              {isRental && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-gray-700">Rental Price / Day *</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register('basePrice')}
                      className="pl-7 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                  </div>
                  {errors.basePrice && <p className="mt-1 text-sm text-red-600">{errors.basePrice.message}</p>}
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('stock')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">SKU *</label>
                <input
                  type="text"
                  placeholder="e.g. SKU-1001"
                  {...register('sku')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-end space-x-3 pb-8">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Update Product' : 'Save Product'}
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
