
import React from 'react';
import { ROADMAP_DATA } from '../constants.ts';
import { useAppContext } from '../contexts/AppContext.tsx';

export default function Roadmap() {
  const { t } = useAppContext();

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-accent-600 dark:text-darkAccent-400">{t('roadmap_title')}</h1>
        <p className="mt-4 text-lg text-primary-600 dark:text-darkPrimary-400">
          {t('roadmap_subtitle')}
        </p>
      </div>

      <div className="relative container mx-auto px-4">
        <div className="absolute h-full border-l-4 border-primary-200 dark:border-darkPrimary-700 left-1/2 -translate-x-1/2"></div>
        {ROADMAP_DATA.map((phase, index) => (
          <div key={phase.quarter} className={`mb-8 flex justify-between items-center w-full ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
            <div className="order-1 w-5/12"></div>
            <div className="z-20 flex items-center order-1 bg-accent-400 dark:bg-darkAccent-500 shadow-xl w-12 h-12 rounded-full">
              <h1 className="mx-auto font-semibold text-lg text-accent-950 dark:text-darkPrimary-950">{index + 1}</h1>
            </div>
            <div className={`order-1 bg-white dark:bg-darkPrimary-800 rounded-lg shadow-3d w-5/12 px-6 py-4 transition-transform transform hover:scale-105 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
              <p className="text-accent-500 dark:text-darkAccent-400 font-semibold">{phase.quarter}</p>
              <h3 className="mb-3 font-bold text-primary-900 dark:text-darkPrimary-100 text-xl">{t(`${phase.key_prefix}_title`)}</h3>
              <p className="text-sm leading-snug tracking-wide text-primary-600 dark:text-darkPrimary-400">
                {t(`${phase.key_prefix}_description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}