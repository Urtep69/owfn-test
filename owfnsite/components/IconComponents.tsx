
import React, { useState } from 'react';
import { Image } from 'lucide-react';
import { owfnLogo, solanaLogo, usdcLogo, usdtLogo } from '../lib/assets.ts';

export const OwfnIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <img 
    src={owfnLogo} 
    alt="OWFN Logo" 
    className={`${className} rounded-full border-2 border-primary-500/50 dark:border-primary-400/50 object-cover`} 
  />
);

export const SolIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <img 
    src={solanaLogo} 
    alt="Solana Logo" 
    className={`${className} rounded-full object-cover`} 
  />
);

export const UsdcIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <img 
    src={usdcLogo} 
    alt="USD Coin Logo" 
    className={`${className} rounded-full object-cover`} 
  />
);

export const UsdtIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <img 
    src={usdtLogo} 
    alt="Tether Logo" 
    className={`${className} rounded-full object-cover`} 
  />
);

export const GenericTokenIcon = ({ uri, className = 'w-6 h-6' }: { uri?: string, className?: string }) => {
    const [hasError, setHasError] = useState(false);

    if (uri && !hasError) {
        return (
            <img 
                src={uri} 
                alt="Token Logo" 
                className={`${className} rounded-full object-cover bg-slate-200 dark:bg-slate-700`} 
                onError={() => setHasError(true)}
            />
        );
    }
    return (
        <div className={`${className} rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center`}>
            <Image className="w-4/6 h-4/6 text-slate-400 dark:text-slate-500" />
        </div>
    );
};


export const DiscordIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
        <title>Discord</title>
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.446.825-.667 1.288-2.058-.495-4.308-.495-6.366 0-.22-.463-.455-.912-.667-1.288a.077.077 0 0 0-.079-.037A19.791 19.791 0 0 0 2.76 4.37a.07.07 0 0 0-.032.026C.783 8.318-.112 12.174.021 16a.091.091 0 0 0 .093.087c.333-.033.655-.1.966-.2a.076.076 0 0 0 .064-.057c.254-.666.495-1.347.7-2.034a.077.077 0 0 0-.048-.088c-.515-.178-.966-.382-1.392-.606a.075.075 0 0 0-.091.024c-.256.431-.489.886-.695 1.365a.077.077 0 0 0 .004.082c1.469 1.272 3.734 2.02 5.968 2.213a.078.078 0 0 0 .087-.049c.148-.291.285-.592.409-.904a.077.077 0 0 0-.053-.091c-1.056-.388-2.058-.871-2.994-1.448a.075.075 0 0 0-.098.023c-.552.651-1.044 1.345-1.458 2.084a.077.077 0 0 0 .016.089c.951.666 2.247 1.144 3.598 1.448a.077.077 0 0 0 .087-.048c.221-.515.422-1.033.6-1.554a.075.075 0 0 0-.057-.09c-.992-.333-1.936-.733-2.812-1.2a.077.077 0 0 0-.091.027c-.422.54-.819 1.115-1.182 1.715a.077.077 0 0 0 .013.088c2.329 1.491 5.597 1.491 7.926 0a.077.077 0 0 0 .013-.088c-.363-.599-.759-1.175-1.182-1.715a.077.077 0 0 0-.091-.027c-.876.467-1.82.867-2.812 1.2a.075.075 0 0 0-.057.09c.178.521.379 1.039.6 1.554a.077.077 0 0 0 .087.048c1.35.303 2.646.782 3.598 1.448a.077.077 0 0 0 .016-.089c-.414-.739-.906-1.433-1.458-2.084a.075.075 0 0 0-.098-.023c-.936.577-1.938 1.061-2.994 1.448a.077.077 0 0 0-.053.091c.124.312.26.613.409.904a.078.078 0 0 0 .087.049c2.234-.193 4.5-.941 5.968-2.213a.077.077 0 0 0 .004-.082c-.207-.479-.438-.935-.695-1.365a.075.075 0 0 0-.091-.024c-.426.224-.877.427-1.392.606a.077.077 0 0 0-.048.088c.208.687.449 1.367.7 2.034a.076.076 0 0 0 .064.057c.311.1.633.167.966.2a.091.091 0 0 0 .093-.087c.133-3.822-.812-7.676-3.06-11.6a.07.07 0 0 0-.032-.026ZM8.021 13.334c-.941 0-1.711-.802-1.711-1.789s.77-1.789 1.711-1.789c.951 0 1.711.802 1.711 1.789s-.76 1.789-1.711 1.789zm7.958 0c-.941 0-1.711-.802-1.711-1.789s.77-1.789 1.711-1.789c.951 0 1.711.802 1.711 1.789s-.76 1.789-1.711 1.789z"/>
    </svg>
);

export const WalletManagerIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </svg>
  );