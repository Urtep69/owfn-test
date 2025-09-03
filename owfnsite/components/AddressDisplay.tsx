
import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext.tsx';

interface AddressDisplayProps {
  address: string;
  type?: 'address' | 'token' | 'tx';
  className?: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, type = 'address', className = '' }) => {
  const { t } = useAppContext();
  const [copied, setCopied] = useState(false);

  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getPath = () => {
      switch (type) {
          case 'token':
              return 'token';
          case 'tx':
              return 'tx';
          case 'address':
          default:
              return 'account';
      }
  };

  const solscanUrl = `https://solscan.io/${getPath()}/${address}`;

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      <span className="font-mono">{truncateAddress(address)}</span>
      <button onClick={copyToClipboard} className="hover:text-primary-700 dark:hover:text-darkPrimary-300 transition-colors" aria-label={t('copy_address_aria_label')}>
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
      <a href={solscanUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary-700 dark:hover:text-darkPrimary-300 transition-colors" aria-label={t('view_on_solscan_aria_label')}>
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
};