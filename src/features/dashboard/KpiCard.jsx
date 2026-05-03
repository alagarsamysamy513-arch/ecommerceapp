import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

function Counter({ from = 0, to, duration = 1.5, prefix = '' }) {
  const nodeRef = useRef();

  useEffect(() => {
    const node = nodeRef.current;
    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate(value) {
        node.textContent = `${prefix}${Math.round(value).toLocaleString()}`;
      },
    });
    return () => controls.stop();
  }, [from, to, duration, prefix]);

  return <span ref={nodeRef} />;
}

export default function KpiCard({ title, value, prefix = '', change, trend, icon: Icon, delay = 0 }) {
  const isPositive = trend === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            <Counter to={value} prefix={prefix} />
          </h3>
        </div>
        <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {change}%
        </span>
        <span className="text-gray-500 ml-2">vs last month</span>
      </div>
    </motion.div>
  );
}
