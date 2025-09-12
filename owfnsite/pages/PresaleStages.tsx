import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { useAppContext } from '../contexts/AppContext.tsx';
import { PRESALE_STAGES, QUICKNODE_RPC_URL } from '../constants.ts';
import type { PresaleStage } from '../types.ts';
import { ProgressBar } from '../components/ProgressBar.tsx';
import { Loader2, Calendar, CheckCircle, Clock, PlayCircle } from 'lucide-react';
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
                if (sig.blockTime < presaleStart) {
                    reachedStart = true;
                    break;
                }
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

            if (now < startDate) {
                currentStatus = 'upcoming';
                targetDate = startDate;
                difference = +targetDate - +now;
            } else if (now >= startDate && now < endDate) {
                currentStatus = 'active';
                targetDate = endDate;
                difference = +targetDate - +now;
            } else {
                currentStatus = 'completed';
            }

            setStatus(currentStatus);

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                if (currentStatus === 'completed') {
                    clearInterval(timer);
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [stage.startDate, stage.endDate]);


    const StatusBadge = () => {
        switch (status) {
            case 'completed': return <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full bg-primary-200 dark:bg-darkPrimary-700 text-primary-700 dark:text-darkPrimary-300">{t('status_completed')}</div>;
            case 'active': return <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/20 text-green-500 flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>{t('status_active')}</div>;
            case 'upcoming': return <div className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400">{t('status_upcoming')}</div>;
        }
    };
    
    const DetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="flex justify-between items-center text-sm py-2 border-b border-primary-200/50 dark:border-darkPrimary-700/50 last:border-b-0">
            <span className="text-primary-600 dark:text-darkPrimary-400">{label}</span>
            <span className="font-semibold text-primary-800 dark:text-darkPrimary-200">{value}</span>
        </div>
    );
    
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

    const cardClasses = `presale-card relative w-full lg:w-5/12 p-6 rounded-xl shadow-3d-lg bg-white/30 dark:bg-darkPrimary-800/50 backdrop-blur-md border border-primary-200/30 dark:border-darkPrimary-700/50 ${isEven ? 'lg:mr-auto' : 'lg:ml-auto'}`;
    const activeBorderClasses = status === 'active' ? 'border-accent-500/50 dark:border-darkAccent-400/50 animate-active-glow' : '';

    const bonusTiers = stage.bonusTiers;
    const minBonus = bonusTiers[0];
    const maxBonus = bonusTiers[bonusTiers.length - 1];
    const bonusText = t('bonus_range_text', {
        minPercentage: minBonus.percentage,
        minThreshold: minBonus.threshold,
        maxPercentage: maxBonus.percentage,
        maxThreshold: maxBonus.threshold
    });

    return (
        <div className={cardClasses}>
            <div className={`absolute -inset-px rounded-xl pointer-events-none transition-shadow duration-300 ${activeBorderClasses}`}></div>
            <StatusBadge />
            <h3 className="text-2xl font-bold mb-4 text-primary-900 dark:text-darkPrimary-100">{t(stage.titleKey)}</h3>
            <div className="space-y-3">
                <DetailRow label={t('period')} value={`${formatDate(stage.startDate)} - ${formatDate(stage.endDate)}`} />
                <DetailRow label={t('token_price')} value={`1 SOL = ${stage.rate.toLocaleString()} OWFN`} />
                <DetailRow label={t('bonuses')} value={bonusText} />
            </div>

            <div className="mt-6 text-center bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-primary-700 dark:text-darkPrimary-300">
                    {status === 'upcoming' && t('presale_sale_starts_in')}
                    {status === 'active' && t('presale_public_ending_in')}
                    {status === 'completed' && t('presale_sale_ended')}
                </p>
                {status !== 'completed' ? (
                     <p className="text-4xl font-mono font-bold text-accent-600 dark:text-darkAccent-400 mt-1">
                        {`${String(timeLeft.days).padStart(2, '0')}:${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`}
                    </p>
                ) : (
                    <p className="text-4xl font-mono font-bold text-primary-600 dark:text-darkPrimary-400 mt-1">--:--:--:--</p>
                )}
            </div>

            {status === 'completed' && (
                <div className="mt-4 text-center bg-primary-100 dark:bg-darkPrimary-700/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-primary-700 dark:text-darkPrimary-300">{t('total_raised')}</p>
                    {totalRaised === null ? (
                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-accent-500 dark:text-darkAccent-400 my-2" />
                    ) : (
                        <p className="text-3xl font-bold text-accent-600 dark:text-darkAccent-400 mt-1">{totalRaised.toLocaleString(undefined, {maximumFractionDigits: 2})} SOL</p>
                    )}
                </div>
            )}
            
            {status !== 'completed' && (
                 <div className="mt-4">
                    <p className="text-sm font-semibold text-primary-700 dark:text-darkPrimary-300 mb-2">{t('live_progress')}</p>
                    <ProgressBar progress={0} />
                    <div className="flex justify-between mt-1 text-sm text-primary-700 dark:text-darkPrimary-300">
                        <span>0 SOL</span>
                        <span>{stage.hardCap.toLocaleString()} SOL</span>
                    </div>
                 </div>
            )}
            
             {status === 'active' && (
                <Link to="/presale">
                    <a className="mt-6 block w-full text-center bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-3 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 transition-colors">
                        {t('participate_now')}
                    </a>
                </Link>
             )}
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
                setStageTotals(prev => ({ ...prev, [stage.phase]: null })); // Set to loading
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
        <div className="animate-fade-in-up">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('presale_stages_title')}</h1>
                <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400 max-w-2xl mx-auto">
                    {t('presale_stages_subtitle')}
                </p>
            </div>

            <div className="relative container mx-auto px-4 py-8">
                {/* Vertical Timeline */}
                <div className="absolute h-full border-l-2 border-dashed border-accent-400/30 dark:border-darkAccent-500/30 left-1/2 -translate-x-1/2 hidden lg:block"></div>
                
                <div className="space-y-12">
                    {PRESALE_STAGES.map((stage, index) => (
                        <div key={stage.phase} className="flex flex-col lg:flex-row items-center justify-between w-full">
                            {/* Card - Render based on position */}
                             {index % 2 !== 0 && <div className="hidden lg:block w-5/12"></div>}
                            
                            {/* Timeline Icon */}
                            <div className="z-10 flex items-center justify-center bg-accent-500 dark:bg-darkAccent-600 shadow-xl w-12 h-12 rounded-full p-2.5 my-4 lg:my-0">
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