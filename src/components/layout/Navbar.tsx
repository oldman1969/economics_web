import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/utils/constants';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) =>
              'children' in item ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    {item.label}
                    <ChevronDown size={14} />
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute top-full left-0 pt-1">
                      <div className="bg-white border border-gray-200 rounded-xl shadow-lg py-2 min-w-[180px]">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 no-underline ${
                              location.pathname === child.path
                                ? 'text-blue-600 font-medium bg-blue-50'
                                : 'text-gray-600'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors no-underline ${
                    location.pathname === item.path
                      ? 'text-blue-600 font-medium bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) =>
              'children' in item ? (
                <div key={item.label}>
                  <div className="px-3 py-2 text-sm font-medium text-gray-500">{item.label}</div>
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={() => setOpen(false)}
                      className={`block px-6 py-2 text-sm rounded-lg no-underline ${
                        location.pathname === child.path
                          ? 'text-blue-600 font-medium bg-blue-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-2 text-sm rounded-lg no-underline ${
                    location.pathname === item.path
                      ? 'text-blue-600 font-medium bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
