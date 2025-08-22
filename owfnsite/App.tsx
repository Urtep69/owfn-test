import React, { useMemo, useEffect } from 'react';
import { Router, Switch, Route } from 'wouter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { AppProvider, useAppContext } from './contexts/AppContext.tsx';
import { Layout } from './components/Layout.tsx';
import { ADMIN_WALLET_ADDRESS, HELIUS_RPC_URL } from './constants.ts';
import { ComingSoonWrapper } from './components/ComingSoonWrapper.tsx';
import { WalletConnectModal } from './components/WalletConnectModal.tsx';

import Home from './pages/Home.tsx';
import Presale from './pages/Presale.tsx';
import About from './pages/About.tsx';
import Tokenomics from './pages/Tokenomics.tsx';
import Roadmap from './pages/Roadmap.tsx';
import Staking from './pages/Staking.tsx';
import Vesting from './pages/Vesting.tsx';
import Donations from './pages/Donations.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Profile from './pages/Profile.tsx';
import ImpactPortal from './pages/ImpactPortal.tsx';
import ImpactCaseDetail from './pages/ImpactCaseDetail.tsx';
import ImpactCategory from './pages/ImpactCategory.tsx';
import Partnerships from './pages/Partnerships.tsx';
import FAQ from './pages/FAQ.tsx';
import TokenDetail from './pages/TokenDetail.tsx';
import Whitepaper from './pages/Whitepaper.tsx';
import Airdrop from './pages/Airdrop.tsx';
import Governance from './pages/Governance.tsx';
import Maintenance from './pages/Maintenance.tsx';
import AdminPresale from './pages/AdminPresale.tsx';
import Contact from './pages/Contact.tsx';

const AppContent = () => {
  const { isMaintenanceActive, solana, isWalletModalOpen, setWalletModalOpen } = useAppContext();
  const { connected, address } = solana;
  const isAdmin = connected && address === ADMIN_WALLET_ADDRESS;

  if (isMaintenanceActive && !isAdmin) {
    return <Maintenance />;
  }

  return (
    <Router>
      <Layout>
        <Switch>
          <Route path="/presale"><Presale /></Route>
          <Route path="/about"><About /></Route>
          <Route path="/whitepaper"><Whitepaper /></Route>
          <Route path="/tokenomics"><Tokenomics /></Route>
          <Route path="/roadmap"><Roadmap /></Route>
          <Route path="/staking">
            <ComingSoonWrapper>
              <Staking />
            </ComingSoonWrapper>
          </Route>
          <Route path="/vesting">
            <ComingSoonWrapper>
              <Vesting />
            </ComingSoonWrapper>
          </Route>
          <Route path="/airdrop">
            <ComingSoonWrapper>
              <Airdrop />
            </ComingSoonWrapper>
          </Route>
          <Route path="/donations"><Donations /></Route>
          <Route path="/dashboard/token/:mint">
            <ComingSoonWrapper>
              <TokenDetail />
            </ComingSoonWrapper>
          </Route>
          <Route path="/dashboard"><Dashboard /></Route>
          <Route path="/profile"><Profile /></Route>
          <Route path="/impact/case/:id"><ImpactCaseDetail /></Route>
          <Route path="/impact/category/:category"><ImpactCategory /></Route>
          <Route path="/impact"><ImpactPortal /></Route>
          <Route path="/partnerships"><Partnerships /></Route>
          <Route path="/faq"><FAQ /></Route>
          <Route path="/contact"><Contact /></Route>
          <Route path="/governance">
            <ComingSoonWrapper>
              <Governance />
            </ComingSoonWrapper>
          </Route>
          {isAdmin && <Route path="/admin/presale"><AdminPresale /></Route>}
          <Route path="/maintenance"><Maintenance /></Route>
          <Route path="/"><Home /></Route>
        </Switch>
      </Layout>
      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </Router>
  );
};

const WalletWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => HELIUS_RPC_URL, []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );
  
  return (
     <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  )
}


function App() {
  return (
    <WalletWrapper>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </WalletWrapper>
  );
}

export default App;
