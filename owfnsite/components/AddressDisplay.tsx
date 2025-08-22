import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface AddressDisplayProps {
  address: string;
  type?: 'address' | 'token' | 'tx';
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
  
  const getPath = () => {
      switch (type) {
          case 'token':
              return 'token';
          case 'tx':
              return 'tx';
          case 'address':
          default:
              return 'address';
      }
  };

  const solscanUrl = `https://solscan.io/${getPath()}/${address}`;

  return (
    <div className={`flex items-center space-x-2 text-sm text-text-secondary ${className}`}>
      <span className="font-mono">{truncateAddress(address)}</span>
      <button onClick={copyToClipboard} className="hover:text-text-primary transition-colors" aria-label="Copy address">
        {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
      </button>
      <a href={solscanUrl} target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors" aria-label="View on Solscan">
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
};