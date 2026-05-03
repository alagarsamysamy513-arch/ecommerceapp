import { motion } from 'framer-motion';

const MOCK_ORDERS = [
  { id: 'ORD-1001', customer: 'John Doe', date: '2023-10-25', amount: 120.50, status: 'Delivered' },
  { id: 'ORD-1002', customer: 'Jane Smith', date: '2023-10-25', amount: 345.00, status: 'Processing' },
  { id: 'ORD-1003', customer: 'Bob Johnson', date: '2023-10-24', amount: 89.99, status: 'Pending' },
  { id: 'ORD-1004', customer: 'Alice Brown', date: '2023-10-24', amount: 210.00, status: 'Delivered' },
  { id: 'ORD-1005', customer: 'Charlie Davis', date: '2023-10-23', amount: 55.20, status: 'Cancelled' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Delivered': return 'bg-green-100 text-green-800';
    case 'Processing': return 'bg-blue-100 text-blue-800';
    case 'Pending': return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function RecentOrdersTable({ delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col"
    >
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">View All</button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ORDERS.map((order, index) => (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + (index * 0.1) }}
                key={order.id} 
                className="bg-white border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                <td className="px-6 py-4">{order.customer}</td>
                <td className="px-6 py-4 text-gray-500">{order.date}</td>
                <td className="px-6 py-4 font-medium">₹{order.amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
