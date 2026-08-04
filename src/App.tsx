import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import EconomicMachine from '@/pages/economics/EconomicMachine';
import InvestingHome from '@/pages/investing/InvestingHome';
import BeginnerGuide from '@/pages/investing/BeginnerGuide';
import StockQuery from '@/pages/investing/StockQuery';
import StockAdvice from '@/pages/investing/StockAdvice';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="economics/economic-machine" element={<EconomicMachine />} />
          <Route path="investing" element={<InvestingHome />} />
          <Route path="investing/beginner-guide" element={<BeginnerGuide />} />
          <Route path="investing/stock-query" element={<StockQuery />} />
          <Route path="investing/stock-advice" element={<StockAdvice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
