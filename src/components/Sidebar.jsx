import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tags, 
  Ticket, 
  BarChart3, 
  Settings,
  LogOut,
  Image as ImageIcon,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Rentals', path: '/rentals-admin', icon: Clock },
  { name: 'Bulk Upload', path: '/bulk-upload', icon: FileSpreadsheet },
  { name: 'Orders', path: '/orders', icon: ShoppingCart, badge: 5 },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Categories', path: '/categories', icon: Tags },
  { name: 'Slider', path: '/slider', icon: ImageIcon },
  { name: 'Coupons', path: '/coupons', icon: Ticket },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, isMobile }) {
  const { user, logout } = useAuthStore();

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isOpen ? 256 : (isMobile ? 0 : 80),
        x: (isMobile && !isOpen) ? -256 : 0
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`bg-primary-900 text-white flex flex-col h-screen border-r border-primary-800 z-30 flex-shrink-0 ${
        isMobile ? 'fixed inset-y-0 left-0 shadow-2xl' : 'sticky top-0'
      }`}
    >
      <div className="h-16 flex items-center justify-center font-bold text-xl border-b border-primary-800 whitespace-nowrap overflow-hidden">
        {(isOpen || !isMobile) ? (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            Admin Pro
          </motion.span>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center rounded-lg transition-colors group relative ${
                isActive 
                  ? 'bg-primary-800 text-white' 
                  : 'text-primary-100 hover:bg-primary-800 hover:text-white'
              } ${isOpen ? 'px-3 py-2.5' : 'p-3 justify-center'}`
            }
          >
            <item.icon className={`flex-shrink-0 ${isOpen ? 'w-5 h-5 mr-3' : 'w-6 h-6'}`} />
            
            <AnimatePresence>
              {isOpen && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap flex-1 overflow-hidden"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>

            {item.badge && isOpen && (
              <span className="bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-auto flex-shrink-0">
                {item.badge}
              </span>
            )}
            {item.badge && !isOpen && (
              <span className="absolute top-2 right-2 bg-accent-500 border-2 border-primary-900 rounded-full w-3 h-3"></span>
            )}

            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-primary-800 p-4">
        <div className={`flex items-center ${isOpen ? '' : 'justify-center'} group relative`}>
          <img 
            src={user?.avatar || 'https://i.pravatar.cc/150'} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-primary-700 object-cover flex-shrink-0"
          />
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-3 overflow-hidden whitespace-nowrap flex-1"
              >
                <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-primary-300">{user?.role || 'Admin'}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {isOpen && (
            <button 
              onClick={logout}
              className="p-1.5 text-primary-300 hover:text-white hover:bg-primary-800 rounded-md transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          {!isOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 flex items-center gap-2">
              <span>Logout</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
