import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ContractChecker from '@/components/ContractChecker';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContractChecker />
  </StrictMode>
);
