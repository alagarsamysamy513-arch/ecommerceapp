import { Menu, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ sidebarOpen, setSidebarOpen }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-10 flex-shrink-0">
      <div className="flex items-center">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </motion.button>

        <div className="ml-4 hidden sm:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          className="p-2 text-gray-400 hover:text-primary-600 relative transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </motion.button>
      </div>
    </header>
  );
}
