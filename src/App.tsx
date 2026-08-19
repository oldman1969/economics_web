import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import EconomicMachine from '@/pages/economics/EconomicMachine';
import EconomicsHome from '@/pages/economics/EconomicsHome';
import ArticlePage from '@/pages/economics/ArticlePage';
import CompanyHome from '@/pages/economics/CompanyHome';
import MarketHome from '@/pages/economics/MarketHome';
import SelfHome from '@/pages/economics/SelfHome';
import InvestingHome from '@/pages/investing/InvestingHome';
import BeginnerGuide from '@/pages/investing/BeginnerGuide';
import StockQuery from '@/pages/investing/StockQuery';
import StockScreener from '@/pages/investing/StockScreener';
import StockAdvice from '@/pages/investing/StockAdvice';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="economics" element={<EconomicsHome />} />
          <Route path="economics/economic-machine" element={<EconomicMachine />} />
          <Route path="economics/article/:id" element={<ArticlePage />} />
          <Route path="investing/company-essence" element={<CompanyHome />} />
          <Route path="investing/company-essence/:id" element={<ArticlePage />} />
          <Route path="investing/market-essence" element={<MarketHome />} />
          <Route path="investing/market-essence/:id" element={<ArticlePage />} />
          <Route path="investing/self-essence" element={<SelfHome />} />
          <Route path="investing/self-essence/:id" element={<ArticlePage />} />
          <Route path="investing" element={<InvestingHome />} />
          <Route path="investing/beginner-guide" element={<BeginnerGuide />} />
          <Route path="investing/stock-query" element={<StockQuery />} />
          <Route path="investing/stock-screener" element={<StockScreener />} />
          <Route path="investing/stock-advice" element={<StockAdvice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
