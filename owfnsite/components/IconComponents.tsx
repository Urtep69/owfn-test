
import React, { useState } from 'react';
import { Image } from 'lucide-react';
import { owfnLogo, solanaLogo, usdcLogo, usdtLogo } from '../lib/assets.ts';
import { useAppContext } from '../contexts/AppContext.tsx';

export const OwfnIcon = ({ className = 'w-6 h-6' }: { className?: string }) => {
  const { t } = useAppContext();
  return (
    <img 
      src={owfnLogo} 
      alt={t('alt_owfn_logo')} 
      className={`${className} rounded-full border-2 border-accent-600 dark:border-darkAccent-700 object-cover`} 
    />
  );
};

export const SolIcon = ({ className = 'w-6 h-6' }: { className?: string }) => {
  const { t } = useAppContext();
  return (
    <img 
      src={solanaLogo} 
      alt={t('alt_solana_logo')}
      className={`${className} rounded-full object-cover`} 
    />
  );
};

export const UsdcIcon = ({ className = 'w-6 h-6' }: { className?: string }) => {
  const { t } = useAppContext();
  return (
    <img 
      src={usdcLogo} 
      alt={t('alt_usdc_logo')}
      className={`${className} rounded-full object-cover`} 
    />
  );
};

export const UsdtIcon = ({ className = 'w-6 h-6' }: { className?: string }) => {
  const { t } = useAppContext();
  return (
    <img 
      src={usdtLogo} 
      alt={t('alt_usdt_logo')} 
      className={`${className} rounded-full object-cover`} 
    />
  );
};

export const GenericTokenIcon = ({ uri, className = 'w-6 h-6' }: { uri?: string, className?: string }) => {
    const { t } = useAppContext();
    const [hasError, setHasError] = useState(false);

    if (uri && !hasError) {
        return (
            <img 
                src={uri} 
                alt={t('alt_token_logo')}
                className={`${className} rounded-full object-cover bg-primary-200 dark:bg-darkPrimary-700`} 
                onError={() => setHasError(true)}
            />
        );
    }
    return (
        <div className={`${className} rounded-full bg-primary-200 dark:bg-darkPrimary-700 flex items-center justify-center`}>
            <Image className="w-4/6 h-4/6 text-primary-400 dark:text-darkPrimary-500" />
        </div>
    );
};


export const DiscordIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
        <title>Discord</title>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.446.825-.667 1.288-2.058-.495-4.308-.495-6.366 0-.22-.463-.455-.912-.667-1.288a.077.077 0 0 0-.079-.037A19.791 19.791 0 0 0 2.76 4.37a.07.07 0 0 0-.032.026C.783 8.318-.112 12.174.021 16a.091.091 0 0 0 .093.087c.333-.033.655-.1.966-.2a.076.076 0 0 0 .064-.057c.254-.666.495-1.347.7-2.034a.077.077 0 0 0-.048-.088c-.515-.178-.966-.382-1.392-.606a.075.075 0 0 0-.091.024c-.256.431-.489.886-.695 1.365a.077.077 0 0 0 .004.082c1.469 1.272 3.734 2.02 5.968 2.213a.078.078 0 0 0 .087-.049c.148-.291.285-.592.409-.904a.077.077 0 0 0-.053-.091c-1.056-.388-2.058-.871-2.994-1.448a.075.075 0 0 0-.098.023c-.552.651-1.044 1.345-1.458 2.084a.077.077 0 0 0 .016.089c.951.666 2.247 1.144 3.598 1.448a.077.077 0 0 0 .087-.048c.221-.515.422-1.033.6-1.554a.075.075 0 0 0-.057-.09c-.992-.333-1.936-.733-2.812-1.2a.077.077 0 0 0-.091.027c-.422.54-.819 1.115-1.182 1.715a.077.077 0 0 0 .013.088c2.329 1.491 5.597 1.491 7.926 0a.077.077 0 0 0 .013-.088c-.363-.599-.759-1.175-1.182-1.715a.077.077 0 0 0-.091-.027c-.876.467-1.82.867-2.812 1.2a.075.075 0 0 0-.057.09c.178.521.379 1.039.6 1.554a.077.077 0 0 0 .087.048c1.35.303 2.646.782 3.598 1.448a.077.077 0 0 0 .016-.089c-.414-.739-.906-1.433-1.458-2.084a.075.075 0 0 0-.098-.023c-.936.577-1.938 1.061-2.994 1.448a.077.077 0 0 0-.053.091c.124.312.26.613.409.904a.078.078 0 0 0 .087.049c2.234-.193 4.5-.941 5.968-2.213a.077.077 0 0 0 .004-.082c-.207-.479-.438-.935-.695-1.365a.075.075 0 0 0-.091-.024c-.426.224-.877.427-1.392.606a.077.077 0 0 0-.048.088c.208.687.449 1.367.7 2.034a.076.076 0 0 0 .064.057c.311.1.633.167.966.2a.091.091 0 0 0 .093-.087c.133-3.822-.812-7.676-3.06-11.6a.07.07 0 0 0-.032-.026ZM8.021 13.334c-.941 0-1.711-.802-1.711-1.789s.77-1.789 1.711-1.789c.951 0 1.711.802 1.711 1.789s-.76 1.789-1.711 1.789zm7.958 0c-.941 0-1.711-.802-1.711-1.789s.77-1.789 1.711-1.789c.951 0 1.711.802 1.711 1.789s-.76 1.789-1.711 1.789z"/>
    </svg>
);

export const FacebookIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
        <title>Facebook</title>
        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.494v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.323-1.325z"/>
    </svg>
);


export const WalletManagerIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="5" width="16" height="12" rx="2" fill="#D98425" />
      <path d="M2 7C2 5.89543 2.89543 5 4 5H16C17.1046 5 18 5.89543 18 7V9H2V7Z" fill="#AF6819" />
      <rect x="7" y="3" width="6" height="3" rx="1" fill="#27AE60" />
      <path d="M13.5 13H12V14.5H13.5V16H15V14.5H16.5V13H15V11.5H13.5V13Z" fill="white" fillOpacity="0.8" />
    </svg>
  );