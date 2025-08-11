
import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface AddressDisplayProps {
  address: string;
  type?: 'address' | 'token';
  className?: string;
}

export const AddressDisplay: React.FC<AddressDisplayProps> = ({ address, type = 'address', className = '' }) => {
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

  const solscanUrl = `https://solscan.io/${type}/${address}`;

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      <span className="font-mono">{truncateAddress(address)}</span>
      <button onClick={copyToClipboard} className="hover:text-primary-700 dark:hover:text-darkPrimary-300 transition-colors" aria-label="Copy address">
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
      <a href={solscanUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary-700 dark:hover:text-darkPrimary-300 transition-colors" aria-label="View on Solscan">
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
};