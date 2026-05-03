import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, Trash2, Download, Save, RefreshCw, Layers, Package } from 'lucide-react';
import * as XLSX from 'xlsx';
import { db } from '../config/firebase';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function BulkUpload() {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories', or 'rentals'
  const [data, setData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    parseFile(file);
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);
        
        let formattedData = [];
        
        if (activeTab === 'products') {
          formattedData = jsonData.map((item, index) => ({
            id: index,
            name: item.name || item.Name || '',
            sku: item.sku || item.SKU || '',
            price: Number(item.price || item.Price || 0),
            stock: Number(item.stock || item.Stock || 0),
            category: item.category || item.Category || 'Uncategorized',
            status: item.status || item.Status || 'Draft',
            description: item.description || item.Description || '',
            imageUrl: item.imageUrl || item.ImageUrl || item.image || '',
          }));
        } else if (activeTab === 'rentals') {
          formattedData = jsonData.map((item, index) => ({
            id: index,
            name: item.name || item.Name || '',
            basePrice: Number(item.basePrice || item['Base Price'] || item.price || item.Price || 0),
            category: item.category || item.Category || 'Rentals',
            description: item.description || item.Description || '',
            image: item.image || item.Image || item.imageUrl || '',
            isAvailable: true
          }));
        } else {
          // Categories formatting
          formattedData = jsonData.map((item, index) => ({
            id: index,
            name: item.name || item.Name || '',
            slug: item.slug || item.Slug || (item.name ? item.name.toLowerCase().replace(/\s+/g, '-') : ''),
            image: item.image || item.Image || item.imageUrl || '',
          }));
        }

        setData(formattedData);
        toast.success(`Successfully loaded ${formattedData.length} rows`);
      } catch (err) {
        toast.error("Error parsing Excel file");
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleBulkUpload = async () => {
    if (data.length === 0) return;
    setIsUploading(true);
    
    try {
      const batch = writeBatch(db);
      const collectionRef = collection(db, 
        activeTab === 'products' ? 'products' : 
        activeTab === 'rentals' ? 'rental_products' : 'categories'
      );

      data.forEach((item) => {
        const newDocRef = doc(collectionRef);
        if (activeTab === 'products') {
          batch.set(newDocRef, {
            name: item.name,
            sku: item.sku,
            price: item.price,
            stock: item.stock,
            category: item.category,
            status: item.status,
            description: item.description,
            image: item.imageUrl || `https://picsum.photos/seed/${item.sku}/40/40`,
            imageUrl: item.imageUrl,
            updatedAt: serverTimestamp(),
          });
        } else if (activeTab === 'rentals') {
          batch.set(newDocRef, {
            name: item.name,
            basePrice: item.basePrice,
            category: item.category,
            description: item.description,
            image: item.image || `https://picsum.photos/seed/${item.name}/200/200`,
            isAvailable: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          batch.set(newDocRef, {
            name: item.name,
            slug: item.slug,
            image: item.image,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      });

      await batch.commit();
      toast.success(`Successfully uploaded ${data.length} ${activeTab}!`);
      setData([]);
    } catch (err) {
      toast.error(`Error uploading to Firestore. Check console for details.`);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    let template = [];
    let filename = "";
    
    if (activeTab === 'products') {
      template = [{ name: 'Example Product', sku: 'SKU-001', price: 99.99, stock: 100, category: 'Electronics', status: 'Active', description: 'Great product', imageUrl: 'https://example.com/image.jpg' }];
      filename = "product_upload_template.xlsx";
    } else if (activeTab === 'categories') {
      template = [{ name: 'Example Category', slug: 'example-category', image: 'https://example.com/cat-image.jpg' }];
      filename = "category_upload_template.xlsx";
    } else if (activeTab === 'rentals') {
      template = [{ name: 'Luxury Camera', basePrice: 1500, category: 'Photography', description: 'Professional Sony A7IV for rent', image: 'https://example.com/camera.jpg' }];
      filename = "rental_upload_template.xlsx";
    }

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeTab === 'products' ? "Products" : "Categories");
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Data Upload</h1>
          <p className="text-gray-500 text-sm">Upload multiple products or categories using Excel/CSV files.</p>
        </div>
        <button 
          onClick={downloadTemplate}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download {activeTab === 'products' ? 'Product' : 'Category'} Template
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 border-b border-gray-200 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => { setActiveTab('products'); setData([]); }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'products' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4" /> Products
        </button>
        <button
          onClick={() => { setActiveTab('categories'); setData([]); }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'categories' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" /> Categories
        </button>
        <button
          onClick={() => { setActiveTab('rentals'); setData([]); }}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rentals' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Rental Products
        </button>
      </div>

      {/* Instructions Guide */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-100 rounded-xl p-6"
      >
        <h2 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" /> 
          Excel Column Guide (Follow this order)
        </h2>
        
        {activeTab === 'products' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {['name', 'sku', 'price', 'stock', 'category', 'status', 'description', 'imageUrl'].map((col, i) => (
              <div key={col} className="bg-white border border-blue-200 rounded-lg p-2 text-center shadow-sm">
                <span className="text-[10px] text-blue-400 font-black block mb-1">COL {i+1}</span>
                <span className="text-xs font-bold text-blue-900">{col}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-3 gap-2 max-w-2xl">
            {['name', 'slug', 'image'].map((col, i) => (
              <div key={col} className="bg-white border border-blue-200 rounded-lg p-2 text-center shadow-sm">
                <span className="text-[10px] text-blue-400 font-black block mb-1">COL {i+1}</span>
                <span className="text-xs font-bold text-blue-900">{col}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rentals' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-4xl">
            {['name', 'basePrice', 'category', 'description', 'image'].map((col, i) => (
              <div key={col} className="bg-white border border-blue-200 rounded-lg p-2 text-center shadow-sm">
                <span className="text-[10px] text-blue-400 font-black block mb-1">COL {i+1}</span>
                <span className="text-xs font-bold text-blue-900">{col}</span>
              </div>
            ))}
          </div>
        )}
        
        <p className="text-[11px] text-blue-600 mt-4 font-medium italic">
          * Note: You can also use the "Download Template" button at the top to get a ready-made Excel file.
        </p>
      </motion.div>

      {!data.length ? (
        <div 
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); parseFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-xl p-20 text-center transition-colors ${
            dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white hover:bg-gray-50'
          }`}
        >
          <div className="max-w-xs mx-auto">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSpreadsheet className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload your {activeTab} file</h3>
            <p className="text-gray-500 text-sm mb-6">Drag and drop your file here, or click to browse</p>
            
            <label className="cursor-pointer inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium shadow-sm">
              <Upload className="w-4 h-4 mr-2" />
              Select File
              <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <h3 className="font-semibold text-gray-900">Preview Data ({data.length} rows)</h3>
               <button onClick={() => setData([])} className="text-xs text-red-600 hover:underline">Clear all</button>
            </div>
            <button 
              onClick={handleBulkUpload}
              disabled={isUploading}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm font-medium disabled:opacity-50"
            >
              {isUploading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isUploading ? 'Uploading...' : `Confirm & Upload ${activeTab}`}
            </button>
          </div>
          
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full divide-y divide-gray-200 min-w-[800px]">
              <thead className="bg-gray-100 sticky top-0 z-10">
                {activeTab === 'products' ? (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                ) : activeTab === 'rentals' ? (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Rental Item</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Daily Rate</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Category Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Image URL</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    {activeTab === 'products' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded bg-gray-100 mr-3 flex-shrink-0 overflow-hidden">
                              {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${item.price}</td>
                      </>
                    ) : activeTab === 'rentals' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded bg-gray-100 mr-3 flex-shrink-0 overflow-hidden">
                              {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">₹{item.basePrice}/day</td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.slug}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{item.image}</td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => setData(data.filter(d => d.id !== item.id))} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
