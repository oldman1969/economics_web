import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import EconomicMachine from '@/pages/economics/EconomicMachine';
import EconomicsHome from '@/pages/economics/EconomicsHome';
import ArticlePage from '@/pages/economics/ArticlePage';
import CompanyHome from '@/pages/economics/CompanyHome';
import MarketHome from '@/pages/economics/MarketHome';
import SelfHome from '@/pages/economics/SelfHome';
import Resources from '@/pages/Resources';
import InvestingHome from '@/pages/investing/InvestingHome';
import BeginnerGuide from '@/pages/investing/BeginnerGuide';
import StockQuery from '@/pages/investing/StockQuery';
import StockScreener from '@/pages/investing/StockScreener';
import StockAdvice from '@/pages/investing/StockAdvice';
import AiHome from '@/pages/ai/AiHome';
import AiCategoryPage from '@/pages/ai/AiCategoryPage';
import AiArticlePage from '@/pages/ai/AiArticlePage';
import AiCodePage from '@/pages/ai/AiCodePage';

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
          <Route path="resources" element={<Resources />} />
          <Route path="resources/note/:id" element={<ArticlePage />} />
          <Route path="investing" element={<InvestingHome />} />
          <Route path="investing/beginner-guide" element={<BeginnerGuide />} />
          <Route path="investing/stock-query" element={<StockQuery />} />
          <Route path="investing/stock-screener" element={<StockScreener />} />
          <Route path="investing/stock-advice" element={<StockAdvice />} />
          <Route path="ai" element={<AiHome />} />
          <Route path="ai/notes" element={<AiCategoryPage category="notes" />} />
          <Route path="ai/deep-dives" element={<AiCategoryPage category="deep-dives" />} />
          <Route path="ai/agent" element={<AiCategoryPage category="agent" />} />
          <Route path="ai/multimodal" element={<AiCategoryPage category="multimodal" />} />
          <Route path="ai/references" element={<AiCategoryPage category="references" />} />
          <Route path="ai/article/:id" element={<AiArticlePage />} />
          <Route path="ai/code" element={<AiCodePage />} />
          <Route path="ai/code/:id" element={<AiCodePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
