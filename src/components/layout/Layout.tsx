import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>经济与投资学习平台 — 帮助每个人理解经济、学会投资</p>
          <p className="mt-1">数据来源：东方财富 | 内容仅供参考，不构成投资建议</p>
        </div>
      </footer>
    </div>
  );
}
