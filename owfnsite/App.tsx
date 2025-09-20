import React, { useMemo, useEffect } from 'react';
import { Router, Switch, Route } from 'wouter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { AppProvider, useAppContext } from './contexts/AppContext.js';
import { Layout } from './components/Layout.js';
import { ADMIN_WALLET_ADDRESS, QUICKNODE_RPC_URL } from './lib/constants.js';
import { ComingSoonWrapper } from './components/ComingSoonWrapper.js';
import { NotificationModal } from './components/NotificationModal.js';

import Home from './pages/Home.js';
import Presale from './pages/Presale.js';
import PresaleStages from './pages/PresaleStages.js';
import About from './pages/About.js';
import Tokenomics from './pages/Tokenomics.js';
import Roadmap from './pages/Roadmap.js';
import Staking from './pages/Staking.js';
import Vesting from './pages/Vesting.js';
import Donations from './pages/Donations.js';
import Dashboard from './pages/Dashboard.js';
import Profile from './pages/Profile.js';
import ImpactPortal from './pages/ImpactPortal.js';
import ImpactCaseDetail from './pages/ImpactCaseDetail.js';
import ImpactCategory from './pages/ImpactCategory.js';
import Partnerships from './pages/Partnerships.js';
import FAQ from './pages/FAQ.js';
import TokenDetail from './pages/TokenDetail.js';
import Whitepaper from './pages/Whitepaper.js';
import Airdrop from './pages/Airdrop.js';
import Governance from './pages/Governance.js';
import Maintenance from './pages/Maintenance.js';
import AdminPresale from './pages/AdminPresale.js';
import AdminAirdrop from './pages/AdminAirdrop.js';
import Contact from './pages/Contact.js';
import { Analytics } from "@vercel/analytics/react";

const AppContent = () => {
  const { isMaintenanceActive, isAdmin, notification } = useAppContext();

  if (isMaintenanceActive) {
    return <Maintenance />;
  }

  return (
    <>
      <Router>
        <Layout>
          <Switch>
            <Route path="/presale"><Presale /></Route>
            <Route path="/presale-info"><PresaleStages /></Route>
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
            <Route path="/airdrop"><Airdrop /></Route>
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
            {isAdmin && <Route path="/admin/airdrop"><AdminAirdrop /></Route>}
            <Route path="/maintenance"><Maintenance /></Route>
            <Route path="/"><Home /></Route>
          </Switch>
        </Layout>
      </Router>
      {notification && <NotificationModal />}
    </>
  );
};

const WalletWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => QUICKNODE_RPC_URL, []);
  
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
        <WalletModalProvider>
            {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}


function App() {
  return (
    <WalletWrapper>
      <AppProvider>
        <AppContent />
        <Analytics />
      </AppProvider>
    </WalletWrapper>
  );
}

export default App;