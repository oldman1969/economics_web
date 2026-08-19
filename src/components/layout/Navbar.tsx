import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isHome = location.pathname === '/';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 no-underline">
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">经</span>
              Economics & Investing
            </Link>
          </div>

          {/* 首页链接（桌面） */}
          <div className="hidden md:flex items-center">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm transition-colors no-underline ${
                isHome ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              首页
            </Link>
          </div>

          {/* 移动菜单按钮 */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 移动菜单 */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 text-sm rounded-lg no-underline ${
                isHome ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              首页
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
