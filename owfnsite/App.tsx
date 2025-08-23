import React, { useMemo, useEffect } from 'react';
import { Router, Switch, Route } from 'wouter';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { AppProvider, useAppContext } from './contexts/AppContext.tsx';
import { Layout } from './components/Layout.tsx';
import { ADMIN_WALLET_ADDRESS, HELIUS_RPC_URL } from './constants.ts';
import { WalletConnectModal } from './components/WalletConnectModal.tsx';
import { SignatureModal } from './components/SignatureModal.tsx';

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
  const { isMaintenanceActive, solana, isWalletModalOpen, setWalletModalOpen, isSignatureRequired, setSignatureRequired } = useAppContext();
  const { connected, address } = solana;
  const isAdmin = connected && address === ADMIN_WALLET_ADDRESS;

  useEffect(() => {
    // 3D card hover effect logic
    const cards = document.querySelectorAll('.card-3d-hover');
    cards.forEach(card => {
        const htmlCard = card as HTMLElement;
        htmlCard.onmousemove = (e) => {
            const rect = htmlCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateY = -1 / 15 * (x - rect.width / 2);
            const rotateX = 1 / 15 * (y - rect.height / 2);
            htmlCard.style.setProperty('--rotateY', `${rotateY}deg`);
            htmlCard.style.setProperty('--rotateX', `${rotateX}deg`);
        };
        htmlCard.onmouseleave = () => {
            htmlCard.style.setProperty('--rotateY', '0deg');
            htmlCard.style.setProperty('--rotateX', '0deg');
        };
    });
  }, []); // Run only once

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
          <Route path="/staking"><Staking /></Route>
          <Route path="/vesting"><Vesting /></Route>
          <Route path="/airdrop"><Airdrop /></Route>
          <Route path="/donations"><Donations /></Route>
          <Route path="/dashboard/token/:mint"><TokenDetail /></Route>
          <Route path="/dashboard"><Dashboard /></Route>
          <Route path="/profile"><Profile /></Route>
          <Route path="/impact/case/:id"><ImpactCaseDetail /></Route>
          <Route path="/impact/category/:category"><ImpactCategory /></Route>
          <Route path="/impact"><ImpactPortal /></Route>
          <Route path="/partnerships"><Partnerships /></Route>
          <Route path="/faq"><FAQ /></Route>
          <Route path="/contact"><Contact /></Route>
          <Route path="/governance"><Governance /></Route>
          {isAdmin && <Route path="/admin/presale"><AdminPresale /></Route>}
          <Route path="/maintenance"><Maintenance /></Route>
          <Route path="/"><Home /></Route>
        </Switch>
      </Layout>
      <WalletConnectModal isOpen={isWalletModalOpen} onClose={() => setWalletModalOpen(false)} />
      <SignatureModal isOpen={isSignatureRequired} onClose={() => setSignatureRequired(false)} />
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