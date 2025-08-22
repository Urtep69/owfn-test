import React from 'react';
import { ROADMAP_DATA } from '../constants.ts';
import { useAppContext } from '../contexts/AppContext.tsx';

export default function Roadmap() {
  const { t } = useAppContext();

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-accent-light">{t('roadmap_title')}</h1>
        <p className="mt-4 text-lg text-text-secondary">
          {t('roadmap_subtitle')}
        </p>
      </div>

      <div className="relative container mx-auto px-4">
        <div className="absolute h-full border-l-4 border-surface-light left-1/2 -translate-x-1/2"></div>
        {ROADMAP_DATA.map((phase, index) => (
          <div key={phase.quarter} className={`mb-8 flex justify-between items-center w-full ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
            <div className="order-1 w-5/12"></div>
            <div className="z-20 flex items-center order-1 bg-accent-light shadow-glow-accent w-12 h-12 rounded-full">
              <h1 className="mx-auto font-semibold text-lg text-accent-foreground">{index + 1}</h1>
            </div>
            <div className={`order-1 glassmorphism rounded-lg w-5/12 px-6 py-4 transition-transform transform hover:scale-105 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
              <p className="text-accent-light font-semibold">{phase.quarter}</p>
              <h3 className="mb-3 font-bold text-text-primary text-xl">{t(`${phase.key_prefix}_title`)}</h3>
              <p className="text-sm leading-snug tracking-wide text-text-secondary">
                {t(`${phase.key_prefix}_description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}