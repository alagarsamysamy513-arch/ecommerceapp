import { motion } from 'framer-motion';
import RevenueChart from '../features/dashboard/RevenueChart';
import OrdersPieChart from '../features/dashboard/OrdersPieChart';
import { Download } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-3">
          <input type="date" className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm" />
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="h-[400px]">
          <RevenueChart />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="h-[400px]">
          <OrdersPieChart />
        </motion.div>
      </div>
    </div>
  );
}
