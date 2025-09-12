import React, { useRef } from 'react';
import { AllocationChart } from '../components/AllocationChart.tsx';
import { TOKEN_DETAILS, TOKEN_ALLOCATIONS, OWFN_LOGO_URL } from '../constants.ts';
import { useAppContext } from '../contexts/AppContext.tsx';
import { OwfnIcon } from '../components/IconComponents.tsx';

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b border-primary-200 dark:border-darkPrimary-700">
        <span className="text-primary-600 dark:text-darkPrimary-400">{label}</span>
        <span className="font-semibold text-primary-900 dark:text-darkPrimary-100 text-right">{value}</span>
    </div>
);

export default function Tokenomics() {
    const { t } = useAppContext();
    const coinRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!coinRef.current) return;
        const rect = coinRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const width = rect.width;
        const height = rect.height;

        const mouseX = x - width / 2;
        const mouseY = y - height / 2;
        const rotateY = (mouseX / (width / 2)) * 15;
        const rotateX = (-mouseY / (height / 2)) * 15;

        const glareX = (x / width) * 100;
        const glareY = (y / height) * 100;

        coinRef.current.style.setProperty('--mx', `${glareX}%`);
        coinRef.current.style.setProperty('--my', `${glareY}%`);
        coinRef.current.style.setProperty('--o', '1');

        const coinElement = coinRef.current.querySelector('.coin') as HTMLElement;
        const shadowElement = coinRef.current.querySelector('.coin-shadow') as HTMLElement;

        if (coinElement) {
            coinElement.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.07, 1.07, 1.07)`;
        }
        if (shadowElement) {
            shadowElement.style.transform = `translateX(-50%) rotateX(90deg) translateZ(-120px) translateY(${mouseY * 0.5}px) translateX(${mouseX * 0.5}px)`;
            shadowElement.style.opacity = '0.5';
        }
    };

    const handleMouseLeave = () => {
        if (!coinRef.current) return;
        
        coinRef.current.style.setProperty('--o', '0');

        const coinElement = coinRef.current.querySelector('.coin') as HTMLElement;
        const shadowElement = coinRef.current.querySelector('.coin-shadow') as HTMLElement;

        if (coinElement) {
            coinElement.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }
        if (shadowElement) {
            shadowElement.style.transform = `translateX(-50%) rotateX(90deg) translateZ(-120px) translateY(0px) translateX(0px)`;
            shadowElement.style.opacity = '0.3';
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('tokenomics_title')}</h1>
                <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400">
                    {t('tokenomics_subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                        <h2 className="text-2xl font-bold mb-6">{t('tokenomics_details_title')}</h2>
                        <div className="space-y-2">
                            <DetailItem 
                                label={t('total_supply')} 
                                value={
                                    <div className="flex items-center justify-end space-x-2">
                                        <span>{TOKEN_DETAILS.totalSupply.toLocaleString()} B</span>
                                        <OwfnIcon className="w-5 h-5" />
                                        <span>OWFN</span>
                                    </div>
                                } 
                            />
                            <DetailItem label={t('token_decimals')} value={TOKEN_DETAILS.decimals} />
                            <DetailItem label={t('token_standard')} value={TOKEN_DETAILS.standard} />
                            <DetailItem label={t('token_extensions')} value={TOKEN_DETAILS.extensions} />
                            <DetailItem label={t('presale_price')} value={TOKEN_DETAILS.presalePrice} />
                            <DetailItem label={t('launch_price')} value={TOKEN_DETAILS.dexLaunchPrice} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                        <h2 className="text-2xl font-bold mb-6">{t('tokenomics_allocation_title')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {TOKEN_ALLOCATIONS.map(alloc => (
                                <div key={alloc.name} className="flex items-center space-x-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: alloc.color }}></div>
                                    <span className="text-sm">{alloc.name} ({alloc.percentage}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                 <div className="lg:col-span-2 hidden lg:flex items-center justify-center">
                    <div
                        ref={coinRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="coin-container coin-perspective w-64 h-64 cursor-pointer"
                    >
                        <div className="relative w-full h-full">
                            <img
                                src={OWFN_LOGO_URL}
                                alt="OWFN Coin"
                                className="coin w-full h-full object-cover rounded-full shadow-3d-lg"
                            />
                            <div className="coin-glare"></div>
                            <div className="coin-shadow"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 bg-white dark:bg-darkPrimary-800 p-8 rounded-lg shadow-3d">
                <h2 className="text-2xl font-bold mb-6 text-center">{t('tokenomics_chart_title')}</h2>
                <AllocationChart />
            </div>
        </div>
    );
}