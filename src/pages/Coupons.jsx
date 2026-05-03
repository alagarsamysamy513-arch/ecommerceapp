import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Copy, Edit, Trash2 } from 'lucide-react';

const MOCK_COUPONS = [
  { id: 1, code: 'SUMMER20', type: 'Percentage', value: 20, minOrder: 50, usage: 145, expiry: '2024-08-31', status: 'Active' },
  { id: 2, code: 'WELCOME10', type: 'Percentage', value: 10, minOrder: 0, usage: 890, expiry: '2025-12-31', status: 'Active' },
  { id: 3, code: 'FREESHIP', type: 'Fixed', value: 15, minOrder: 100, usage: 45, expiry: '2023-12-31', status: 'Expired' },
];

export default function Coupons() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors shadow-sm font-medium text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search coupons..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_COUPONS.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase())).map((coupon, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  key={coupon.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded border border-primary-100">{coupon.code}</span>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors"><Copy className="w-4 h-4" /></button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {coupon.type === 'Percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${coupon.minOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.usage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.expiry}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      coupon.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {coupon.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-gray-400 hover:text-primary-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
