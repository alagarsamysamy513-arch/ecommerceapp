import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Users, Package, RefreshCw } from 'lucide-react';
import KpiCard from '../features/dashboard/KpiCard';
import RevenueChart from '../features/dashboard/RevenueChart';
import OrdersPieChart from '../features/dashboard/OrdersPieChart';
import RecentOrdersTable from '../features/dashboard/RecentOrdersTable';
import { db } from '../config/firebase';
import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ordersSnap, usersSnap, productsSnap] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'products'))
      ]);

      // Calculate Revenue
      const totalRevenue = ordersSnap.docs.reduce((acc, doc) => acc + (Number(doc.data().totalAmount) || 0), 0);

      setStats({
        revenue: totalRevenue,
        orders: ordersSnap.size,
        customers: usersSnap.size,
        products: productsSnap.size
      });

      // Fetch Top Products (just getting latest products as "top" for now)
      const topQ = query(collection(db, 'products'), limit(5));
      const topSnap = await getDocs(topQ);
      setTopProducts(topSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, here's what's happening with your store today.</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <button 
            onClick={fetchDashboardData}
            className="flex-1 sm:flex-none p-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 mx-auto ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 transition-colors">
            Add Product
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          title="Total Revenue" 
          value={stats.revenue} 
          prefix="₹" 
          trend={stats.revenue > 1000 ? "up" : "down"} 
          change={stats.revenue > 0 ? 100 : 0} 
          icon={DollarSign} 
          delay={0.1} 
        />
        <KpiCard 
          title="Total Orders" 
          value={stats.orders} 
          trend={stats.orders > 0 ? "up" : "down"} 
          change={stats.orders > 0 ? 100 : 0} 
          icon={ShoppingBag} 
          delay={0.2} 
        />
        <KpiCard 
          title="Total Customers" 
          value={stats.customers} 
          trend={stats.customers > 0 ? "up" : "down"} 
          change={stats.customers > 0 ? 100 : 0} 
          icon={Users} 
          delay={0.3} 
        />
        <KpiCard 
          title="Total Products" 
          value={stats.products} 
          trend={stats.products > 0 ? "up" : "down"} 
          change={stats.products > 0 ? 100 : 0} 
          icon={Package} 
          delay={0.4} 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96">
          <RevenueChart delay={0.5} />
        </div>
        <div className="h-96">
          <OrdersPieChart delay={0.6} />
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable delay={0.7} />
        </div>
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">View All</button>
            </div>
            <div className="space-y-4 flex-1">
              {topProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm italic">No products available</div>
              ) : (
                topProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 truncate">{product.category}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">₹{Number(product.price).toFixed(0)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
