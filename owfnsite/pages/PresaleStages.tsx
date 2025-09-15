import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.js';
import { PRESALE_STAGES, QUICKNODE_RPC_URL } from '../lib/constants.js';
import type { PresaleStage } from '../lib/types.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { Loader2, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, ConfirmedSignatureInfo } from '@solana/web3.js';

const fetchStageTotal = async (stage: PresaleStage): Promise<number> => {
    if (stage.status !== 'completed' || !stage.distributionWallet) return 0;
    try {
        const connection = new Connection(QUICKNODE_RPC_URL, 'confirmed');
        const publicKey = new PublicKey(stage.distributionWallet);
        const presaleStart = Math.floor(new Date(stage.startDate).getTime() / 1000);
        const presaleEnd = Math.floor(new Date(stage.endDate).getTime() / 1000);

        let allSignatures: ConfirmedSignatureInfo[] = [];
        let lastSignature: string | undefined = undefined;
        let reachedStart = false;

        while (!reachedStart) {
            const signatures = await connection.getSignaturesForAddress(publicKey, { until: lastSignature, limit: 1000 });
            if (signatures.length === 0) break;
            
            for (const sig of signatures) {
                if (!sig.blockTime) continue;
                if (sig.blockTime > presaleEnd) continue; 
                if (sig.blockTime < presaleStart) { reachedStart = true; break; }
                allSignatures.push(sig);
            }
            if (reachedStart || signatures.length < 1000) break;
            lastSignature = signatures[signatures.length - 1].signature;
        }

        let totalContributed = 0;
        const signatureStrings = allSignatures.map(s => s.signature);
        const BATCH_SIZE = 100;
        for (let i = 0; i < signatureStrings.length; i += BATCH_SIZE) {
            const batchSignatures = signatureStrings.slice(i, i + BATCH_SIZE);
            const transactionsData = await connection.getParsedTransactions(batchSignatures, { maxSupportedTransactionVersion: 0 });
            
            transactionsData.forEach(tx => {
                if (tx) {
                    tx.transaction.message.instructions.forEach(inst => {
                        if ('parsed' in inst && inst.program === 'system' && inst.parsed?.type === 'transfer' && inst.parsed.info.destination === stage.distributionWallet) {
                            totalContributed += inst.parsed.info.lamports / LAMPORTS_PER_SOL;
                        }
                    });
                }
            });
        }
        return totalContributed;
    } catch (error) {
        console.error(`Failed to fetch total for phase ${stage.phase}:`, error);
        return 0;
    }
};


const StageCard = ({ stage, index, totalRaised }: { stage: PresaleStage, index: number, totalRaised: number | null }) => {
    const { t } = useAppContext();
    const isEven = index % 2 === 0;

    const [status, setStatus] = useState<'upcoming' | 'active' | 'completed'>('upcoming');
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const startDate = new Date(stage.startDate);
            const endDate = new Date(stage.endDate);
            
            let currentStatus: 'upcoming' | 'active' | 'completed' = 'upcoming';
            let difference = 0;
            let targetDate: Date;

            if (now < startDate) { currentStatus = 'upcoming'; targetDate = startDate; difference = +targetDate - +now;
            } else if (now >= startDate && now < endDate) { currentStatus = 'active'; targetDate = endDate; difference = +targetDate - +now;
            } else { currentStatus = 'completed'; }

            setStatus(currentStatus);

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); if (currentStatus === 'completed') clearInterval(timer); }
        }, 1000);

        return () => clearInterval(timer);
    }, [stage.startDate, stage.endDate]);

    const StatusBadge = () => {
        switch (status) {
            case 'completed': return <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full bg-dextools-border text-dextools-text-secondary">{t('status_completed')}</div>;
            case 'active': return <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full bg-dextools-accent-green/20 text-dextools-accent-green flex items-center gap-1.5"><div className="w-2 h-2 bg-dextools-accent-green rounded-full animate-pulse"></div>{t('status_active')}</div>;
            case 'upcoming': return <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full bg-dextools-accent-blue/20 text-dextools-accent-blue">{t('status_upcoming')}</div>;
        }
    };
    
    const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="flex justify-between items-center text-sm py-2 border-b border-dextools-border/50 last:border-b-0">
            <span className="text-dextools-text-secondary">{label}</span>
            <span className="font-semibold text-dextools-text-primary">{value}</span>
        </div>
    );
    
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    const cardClasses = `relative w-full lg:w-5/12 p-6 rounded-md bg-dextools-card border border-dextools-border ${isEven ? 'lg:mr-auto' : 'lg:ml-auto'}`;
    const activeBorderClasses = status === 'active' ? 'border-dextools-accent-blue shadow-lg shadow-dextools-special/20' : '';

    const bonusTiers = stage.bonusTiers;
    const minBonus = bonusTiers[0];
    const maxBonus = bonusTiers[bonusTiers.length - 1];
    const bonusText = t('bonus_range_text', { minPercentage: minBonus.percentage, minThreshold: minBonus.threshold, maxPercentage: maxBonus.percentage, maxThreshold: maxBonus.threshold });

    return (
        <div className={`${cardClasses} ${activeBorderClasses}`}>
            <StatusBadge />
            <h3 className="text-2xl font-bold mb-4 text-dextools-text-primary">{t(stage.titleKey)}</h3>
            <div className="space-y-3">
                <DetailRow label={t('period')} value={`${formatDate(stage.startDate)} - ${formatDate(stage.endDate)}`} />
                <DetailRow label={t('token_price')} value={`1 SOL = ${stage.rate.toLocaleString()} OWFN`} />
                <DetailRow label={t('bonuses')} value={bonusText} />
            </div>
            <div className="mt-6 text-center bg-dextools-background p-4 rounded-lg">
                <p className="text-sm font-semibold text-dextools-text-secondary">
                    {status === 'upcoming' && t('presale_sale_starts_in')}
                    {status === 'active' && t('presale_public_ending_in')}
                    {status === 'completed' && t('presale_sale_ended')}
                </p>
                {status !== 'completed' ? (<p className="text-4xl font-mono font-bold text-dextools-accent-blue mt-1">{`${String(timeLeft.days).padStart(2, '0')}:${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}</p>) : (<p className="text-4xl font-mono font-bold text-dextools-text-secondary mt-1">--:--:--:--</p>)}
            </div>
            {status === 'completed' && (<div className="mt-4 text-center bg-dextools-background p-4 rounded-lg"><p className="text-sm font-semibold text-dextools-text-secondary">{t('total_raised')}</p>{totalRaised === null ? (<Loader2 className="w-8 h-8 mx-auto animate-spin text-dextools-accent-blue my-2" />) : (<p className="text-3xl font-bold text-dextools-accent-green mt-1">{totalRaised.toLocaleString(undefined, {maximumFractionDigits: 2})} SOL</p>)}</div>)}
            {status !== 'completed' && (<div className="mt-4"><p className="text-sm font-semibold text-dextools-text-secondary mb-2">{t('live_progress')}</p><ProgressBar progress={0} /><div className="flex justify-between mt-1 text-sm text-dextools-text-secondary"><span>0 SOL</span><span>{stage.hardCap.toLocaleString()} SOL</span></div></div>)}
            {status === 'active' && (<Link to="/presale"><a className="mt-6 block w-full text-center bg-dextools-special text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">{t('participate_now')}</a></Link>)}
        </div>
    );
};

export default function PresaleStages() {
    const { t } = useAppContext();
    const [stageTotals, setStageTotals] = useState<Record<number, number | null>>({});

    useEffect(() => {
        const fetchAllCompletedTotals = async () => {
            const completedStages = PRESALE_STAGES.filter(s => new Date() > new Date(s.endDate));
            for (const stage of completedStages) {
                setStageTotals(prev => ({ ...prev, [stage.phase]: null }));
                const total = await fetchStageTotal(stage);
                setStageTotals(prev => ({ ...prev, [stage.phase]: total }));
            }
        };
        fetchAllCompletedTotals();
    }, []);
    
    const timelineIcons: { [key: string]: React.ReactNode } = {
        'completed': <CheckCircle className="w-full h-full text-white" />,
        'active': <PlayCircle className="w-full h-full text-white" />,
        'upcoming': <Clock className="w-full h-full text-white" />
    };

    return (
        <div className="animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-dextools-accent-blue">{t('presale_stages_title')}</h1>
                <p className="mt-4 text-lg text-dextools-text-secondary max-w-2xl mx-auto">{t('presale_stages_subtitle')}</p>
            </div>
            <div className="relative container mx-auto px-4 py-8">
                <div className="absolute h-full border-l-2 border-dashed border-dextools-border/50 left-1/2 -translate-x-1/2 hidden lg:block"></div>
                <div className="space-y-12">
                    {PRESALE_STAGES.map((stage, index) => (
                        <div key={stage.phase} className="flex flex-col lg:flex-row items-center justify-between w-full">
                            {index % 2 !== 0 && <div className="hidden lg:block w-5/12"></div>}
                            <div className="z-10 flex items-center justify-center bg-dextools-special shadow-lg w-12 h-12 rounded-full p-2.5 my-4 lg:my-0">
                               {stage.status === 'completed' && new Date() < new Date(stage.endDate) ? timelineIcons['active'] : timelineIcons[stage.status]}
                            </div>
                            <StageCard stage={stage} index={index} totalRaised={stageTotals[stage.phase] ?? null} />
                            {index % 2 === 0 && <div className="hidden lg:block w-5/12"></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}