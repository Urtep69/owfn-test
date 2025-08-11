

import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Twitter, Send, Globe, ChevronDown, Info, Loader2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OwfnIcon, SolIcon } from '../components/IconComponents.tsx';
import { 
    TOKEN_DETAILS, 
    PRESALE_DETAILS, 
    OWFN_MINT_ADDRESS, 
    PROJECT_LINKS, 
    OWFN_LOGO_URL, 
    TOKEN_ALLOCATIONS, 
    ROADMAP_DATA,
    DISTRIBUTION_WALLETS,
    HELIUS_API_BASE_URL,
    HELIUS_API_KEY,
} from '../constants.ts';
import { AddressDisplay } from '../components/AddressDisplay.tsx';
import type { PresaleTransaction } from '../types.ts';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const LivePresaleFeed = ({ newTransaction }: { newTransaction: PresaleTransaction | null }) => {
    const { t } = useAppContext();
    const [transactions, setTransactions] = useState<PresaleTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (newTransaction) {
            setTransactions(prev => [newTransaction, ...prev.slice(0, 19)]);
        }
    }, [newTransaction]);
    
    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const url = `${HELIUS_API_BASE_URL}/v0/addresses/${DISTRIBUTION_WALLETS.presale}/transactions?api-key=${HELIUS_API_KEY}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch transactions');
                const data = await response.json();
                
                const parsedTxs: PresaleTransaction[] = data
                    .filter((tx: any) => 
                        tx.type === 'NATIVE_TRANSFER' && 
                        tx.nativeTransfers[0]?.toUserAccount === DISTRIBUTION_WALLETS.presale
                    )
                    .map((tx: any) => ({
                        id: tx.signature,
                        address: tx.nativeTransfers[0].fromUserAccount,
                        solAmount: tx.nativeTransfers[0].amount / LAMPORTS_PER_SOL,
                        owfnAmount: (tx.nativeTransfers[0].amount / LAMPORTS_PER_SOL) * PRESALE_DETAILS.rate,
                        time: new Date(tx.timestamp * 1000),
                    }));
                
                setTransactions(parsedTxs.slice(0, 20));
            } catch (error) {
                console.error("Failed to fetch presale transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
        const interval = setInterval(fetchTransactions, 30000); // refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);


    return (
        <div className="bg-white dark:bg-darkPrimary-950 border border-primary-200 dark:border-darkPrimary-700/50 rounded-lg p-4 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-primary-900 dark:text-darkPrimary-100 font-bold">{t('live_presale_feed')}</h3>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-primary-500 dark:text-darkPrimary-400 pb-2 border-b border-primary-200 dark:border-darkPrimary-700 font-semibold">
                <span className="col-span-2">{t('wallet')}</span>
                <span className="text-right">{t('sol_spent')}</span>
                <span className="text-right">{t('owfn_received')}</span>
            </div>
            <div className="flex-grow overflow-y-auto space-y-1 pr-1 -mr-2 mt-2">
                {loading ? (
                     <div className="flex justify-center items-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-accent-500 dark:text-darkAccent-500" />
                    </div>
                ) : transactions.map((tx) => (
                    <div key={tx.id} className={`grid grid-cols-4 gap-2 items-center text-sm p-1.5 rounded-md animate-fade-in-up ${tx.time.getTime() > Date.now() - 5000 ? 'bg-accent-100/50 dark:bg-darkAccent-500/10' : ''}`}>
                        <div className="col-span-2 flex items-center gap-2">
                           <AddressDisplay address={tx.address} className="text-xs" />
                        </div>
                        <div className="text-right font-mono flex items-center justify-end gap-1">
                            <SolIcon className="w-3.5 h-3.5" /> {tx.solAmount.toFixed(2)}
                        </div>
                        <div className="text-right font-mono flex items-center justify-end gap-1">
                             <OwfnIcon className="w-3.5 h-3.5" /> {(tx.owfnAmount / 1_000_000).toFixed(2)}M
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AccordionSection = ({ title, children, isOpen: defaultIsOpen = false }: { title: string, children: React.ReactNode, isOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  return (
    <div className="border border-accent-400/20 dark:border-darkAccent-500/20 bg-primary-100/30 dark:bg-darkPrimary-800/30 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4"
      >
        <h3 className="font-bold text-md text-primary-900 dark:text-darkPrimary-100">{title}</h3>
        <ChevronDown className={`w-5 h-5 text-primary-500 dark:text-darkPrimary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-primary-600 dark:text-darkPrimary-400 animate-fade-in-up" style={{animationDuration: '300ms'}}>
          {children}
        </div>
      )}
    </div>
  );
};

const ProjectInfoRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-primary-200/50 dark:border-darkPrimary-700/50">
    <span className="text-primary-500 dark:text-darkPrimary-400 mb-1 sm:mb-0">{label}</span>
    <div className="font-semibold text-primary-800 dark:text-darkPrimary-100 text-left sm:text-right break-all w-full sm:w-auto">{value}</div>
  </div>
);


const calculateTimeLeft = (endDate: Date) => {
    const difference = +endDate - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }
    return timeLeft;
};

export default function Presale() {
  const { t, solana } = useAppContext();
  const { connection } = useConnection();
  const [solAmount, setSolAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(PRESALE_DETAILS.endDate));
  const [error, setError] = useState('');
  const [latestPurchase, setLatestPurchase] = useState<PresaleTransaction | null>(null);
  const [soldSOL, setSoldSOL] = useState(0);
  
  useEffect(() => {
    const fetchPresaleBalance = async () => {
        try {
            const publicKey = new PublicKey(DISTRIBUTION_WALLETS.presale);
            const balance = await connection.getBalance(publicKey);
            setSoldSOL(balance / LAMPORTS_PER_SOL);
        } catch (error) {
            console.error("Failed to fetch presale balance:", error);
        }
    };
    fetchPresaleBalance();
    const interval = setInterval(fetchPresaleBalance, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [connection]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(PRESALE_DETAILS.endDate));
    }, 1000);
    return () => clearTimeout(timer);
  });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSolAmount(value);

    if (value === '' || isNaN(parseFloat(value))) {
        setError('');
        return;
    }

    const numValue = parseFloat(value);
    if (numValue > PRESALE_DETAILS.maxBuy) {
        setError(t('presale_max_amount_error', { max: PRESALE_DETAILS.maxBuy.toFixed(2) }));
    } else {
        setError('');
    }
  };

  const owfnAmount = parseFloat(solAmount) * PRESALE_DETAILS.rate;
  const saleProgress = (soldSOL / PRESALE_DETAILS.hardCap) * 100;
  const isAmountInvalid = error !== '' || isNaN(parseFloat(solAmount)) || parseFloat(solAmount) <= 0;

  const handleBuy = async () => {
        if (!solana.connected) {
            // The WalletMultiButton in the header will handle connection.
            // We could add a pop-up here, but it's better UX to rely on the main button.
            alert(t('connect_wallet_first'));
            return;
        }

        const numAmount = parseFloat(solAmount);
        if (isAmountInvalid) return;

        const owfnToReceive = numAmount * PRESALE_DETAILS.rate;
        const result = await solana.sendTransaction(DISTRIBUTION_WALLETS.presale, numAmount, 'SOL');

        if (result.success && result.signature) {
            alert(t('presale_purchase_success_alert', { 
                amount: numAmount.toFixed(2), 
                owfnAmount: owfnToReceive.toLocaleString() 
            }));
            const newTx: PresaleTransaction = {
                id: result.signature,
                address: solana.address!,
                solAmount: numAmount,
                owfnAmount: owfnToReceive,
                time: new Date(),
            };
            setLatestPurchase(newTx);
            setSolAmount('');
            // Manually update SOL collected to give instant feedback
            setSoldSOL(prev => prev + numAmount);
        } else {
            alert(t(result.messageKey));
        }
    };


  const formatSaleDate = (date: Date) => {
    return date.toUTCString().replace('GMT', 'GMT');
  };
  
  const saleStartDate = new Date(PRESALE_DETAILS.endDate.getTime() - (30 * 24 * 60 * 60 * 1000));

  return (
    <div className="bg-primary-50 dark:bg-darkPrimary-950 text-primary-700 dark:text-darkPrimary-300 min-h-screen -m-8 p-4 md:p-8 flex justify-center font-sans">
      <div className="w-full max-w-screen-2xl">
        <div className="mb-4">
            <Link to="/" className="text-primary-500 dark:text-darkPrimary-400 hover:text-accent-500 dark:hover:text-darkAccent-400 transition-colors">
                <ArrowLeft size={24} />
            </Link>
        </div>
        
        <div className="bg-primary-100 dark:bg-darkPrimary-900 rounded-xl p-6 md:p-10 border border-primary-200 dark:border-darkPrimary-700/50 shadow-3d-lg">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img src={OWFN_LOGO_URL} alt="Token Logo" className="w-20 h-20 rounded-full border-2 border-accent-400 dark:border-darkAccent-400"/>
                <div className="flex-grow">
                    <h1 className="text-2xl font-bold text-primary-900 dark:text-darkPrimary-100">{t('presale_join_title')}</h1>
                    <h2 className="text-lg text-primary-700 dark:text-darkPrimary-300">{t('presale_header_subtitle')}</h2>
                </div>
                <div className="flex items-center gap-3 text-primary-500 dark:text-darkPrimary-400">
                    <a href={PROJECT_LINKS.x} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-colors"><Twitter size={20}/></a>
                    <a href={PROJECT_LINKS.telegramGroup} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-colors"><Send size={20}/></a>
                    <a href={PROJECT_LINKS.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-primary-200 dark:hover:bg-darkPrimary-700 transition-colors"><Globe size={20}/></a>
                </div>
            </div>

            {/* Description */}
            <p className="text-primary-600 dark:text-darkPrimary-400 text-sm leading-relaxed mt-4">{t('about_mission_desc')}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
                {/* Left Column: Info */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Progress Bar */}
                    <div className="w-full">
                        <div className="text-primary-800 dark:text-darkPrimary-100 text-sm mb-1">
                            <span>{t('presale_sold_progress', { progress: saleProgress.toFixed(2) })}</span>
                        </div>
                        <div className="w-full bg-accent-200/70 dark:bg-darkAccent-900/70 rounded-full h-2.5">
                            <div className="bg-accent-400 dark:bg-darkAccent-400 h-2.5 rounded-full" style={{width: `${saleProgress}%`}}></div>
                        </div>
                        <div className="flex justify-between mt-1 text-sm text-primary-700 dark:text-darkPrimary-300">
                            <span>{soldSOL.toFixed(2)} SOL</span>
                            <span>{PRESALE_DETAILS.hardCap.toFixed(2)} SOL</span>
                        </div>
                    </div>

                    {/* Timers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-darkPrimary-950 border border-primary-200 dark:border-darkPrimary-700/50 rounded-lg p-4 text-center">
                            <p className="text-primary-500 dark:text-darkPrimary-400 text-sm">{t('presale_whitelist_finished')}</p>
                            <p className="text-primary-800 dark:text-darkPrimary-100 text-2xl font-mono font-bold">--:--:--:--</p>
                        </div>
                        <div className="bg-white dark:bg-darkPrimary-950 border border-primary-200 dark:border-darkPrimary-700/50 rounded-lg p-4 text-center">
                            <p className="text-primary-500 dark:text-darkPrimary-400 text-sm">{t('presale_public_ending_in')}</p>
                            <p className="text-primary-800 dark:text-darkPrimary-100 text-2xl font-mono font-bold">
                                {String(timeLeft.days).padStart(2, '0')}:{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                            </p>
                        </div>
                    </div>
                     {/* Accordions */}
                     <div className="space-y-4">
                        <AccordionSection title={t('presale_project_info_title')} isOpen={true}>
                            <div className="space-y-1 text-sm">
                                <ProjectInfoRow label={t('token_name_label')} value="Official World Family Network" />
                                <ProjectInfoRow 
                                    label={t('token_symbol_label')} 
                                    value={
                                        <div className="flex items-center gap-2 justify-start sm:justify-end">
                                            <OwfnIcon className="w-5 h-5" />
                                            <span>$OWFN</span>
                                        </div>
                                    } 
                                />
                                <ProjectInfoRow 
                                    label={t('token_supply_label')}
                                    value={
                                        <div className="flex items-center gap-2 justify-start sm:justify-end">
                                            <span>{TOKEN_DETAILS.totalSupply.toLocaleString('de-DE')}</span>
                                            <OwfnIcon className="w-5 h-5" />
                                            <span>OWFN</span>
                                        </div>
                                    } 
                                />
                                <ProjectInfoRow label={t('presale_sale_rate_label')} value={`1 SOL = ${PRESALE_DETAILS.rate.toLocaleString()} $OWFN`} />
                                <ProjectInfoRow label={t('presale_listing_rate_label')} value={TOKEN_DETAILS.dexLaunchPrice} />
                                <ProjectInfoRow label={t('presale_softcap_label')} value={`${PRESALE_DETAILS.softCap} SOL`} />
                                <ProjectInfoRow label={t('presale_hardcap_label')} value={`${PRESALE_DETAILS.hardCap} SOL`} />
                                <ProjectInfoRow label={t('token_decimals')} value={TOKEN_DETAILS.decimals} />
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-primary-200/50 dark:border-darkPrimary-700/50">
                                    <span className="text-primary-500 dark:text-darkPrimary-400 mb-1 sm:mb-0">{t('presale_token_address_label')}</span>
                                    <AddressDisplay address={OWFN_MINT_ADDRESS} type="token" />
                                </div>
                                <ProjectInfoRow label={t('presale_start_time_label')} value={formatSaleDate(saleStartDate)} />
                                <ProjectInfoRow label={t('presale_end_time_label')} value={formatSaleDate(PRESALE_DETAILS.endDate)} />
                            </div>
                        </AccordionSection>
                        <AccordionSection title={t('tokenomics_allocation_title')}>
                            <div className="space-y-2">
                                {TOKEN_ALLOCATIONS.map(alloc => (
                                    <div key={alloc.name} className="flex items-center space-x-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: alloc.color }}></div>
                                        <span className="text-sm text-primary-700 dark:text-darkPrimary-300">{alloc.name} ({alloc.percentage}%)</span>
                                    </div>
                                ))}
                                <Link to="/tokenomics" className="text-accent-600 dark:text-darkAccent-400 hover:underline pt-2 inline-block">{t('view_full_details')}</Link>
                            </div>
                        </AccordionSection>
                        <AccordionSection title={t('roadmap_title')}>
                            <div className="space-y-3">
                                {ROADMAP_DATA.map(phase => (
                                    <div key={phase.key_prefix}>
                                        <h4 className="font-bold text-primary-800 dark:text-darkPrimary-100">{t(`${phase.key_prefix}_title`)} ({phase.quarter})</h4>
                                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400">{t(`${phase.key_prefix}_description`)}</p>
                                    </div>
                                ))}
                                <Link to="/roadmap" className="text-accent-600 dark:text-darkAccent-400 hover:underline pt-2 inline-block">{t('view_full_details')}</Link>
                            </div>
                        </AccordionSection>
                        <AccordionSection title={t('presale_dyor_nfa_title')}>
                            <p>{t('presale_dyor_nfa_desc')}</p>
                        </AccordionSection>
                    </div>
                </div>

                {/* Right Column: Buy & Feed */}
                <div className="lg:col-span-2 space-y-6 flex flex-col">
                     {/* Buy Section */}
                    <div className="bg-white dark:bg-darkPrimary-950 border border-primary-200 dark:border-darkPrimary-700/50 rounded-lg p-6">
                        <p className="text-sm text-primary-700 dark:text-darkPrimary-300 mb-2 text-center">
                            {t('presale_buy_info_max_only', { max: PRESALE_DETAILS.maxBuy.toFixed(2) })}
                        </p>
                        <div className="flex gap-2">
                            <div className="flex-grow relative">
                                <input 
                                    id="buy-amount"
                                    type="number"
                                    value={solAmount}
                                    onChange={handleAmountChange}
                                    className={`w-full bg-primary-100 dark:bg-darkPrimary-800 border rounded-lg p-3 text-primary-900 dark:text-darkPrimary-100 focus:ring-2 focus:border-accent-500 placeholder-primary-400 dark:placeholder-darkPrimary-500 ${error ? 'border-red-500 focus:ring-red-500' : 'border-primary-300 dark:border-darkPrimary-600 focus:ring-accent-500'}`}
                                    placeholder="0.00"
                                />
                            </div>
                            <button 
                                onClick={handleBuy}
                                className="bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 px-8 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                disabled={solana.loading || (solana.connected && isAmountInvalid)}
                            >
                                {solana.loading ? t('processing') : (solana.connected ? t('buy') : t('connect_wallet'))}
                            </button>
                        </div>
                        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-center">{error}</p>}
                        <p className="text-sm text-primary-600 dark:text-darkPrimary-400 mt-2 text-center flex items-center justify-center">
                            {t('presale_buying_owfn', { amount: isNaN(owfnAmount) ? '0.00' : owfnAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) })}
                            <span className="ml-1.5 cursor-pointer" title={t('presale_estimate_tooltip')}>
                                <Info size={14} />
                            </span>
                        </p>
                    </div>
                    {/* Live Feed */}
                    <div className="flex-grow">
                        <LivePresaleFeed newTransaction={latestPurchase} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}