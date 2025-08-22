import React from 'react';
import { ShieldCheck, Percent, Clock, Zap, HelpCircle } from 'lucide-react';
import type { TokenDetails } from '../types.ts';

interface TokenSecurityInfoProps {
    token: Partial<TokenDetails>;
}

const InfoCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="glassmorphism p-6 rounded-lg shadow-card">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-text-primary font-display">{icon}{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const InfoRow = ({ label, children, tooltip }: { label: string, children: React.ReactNode, tooltip?: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-border-color/50 last:border-b-0">
        <div className="flex items-center gap-1.5 group relative">
            <span className="text-sm text-text-secondary">{label}</span>
            {tooltip && <HelpCircle size={14} className="text-text-secondary/50 cursor-help" />}
            {tooltip && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-text-primary text-background text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{tooltip}</div>}
        </div>
        <div className="text-sm font-semibold text-text-primary text-right break-all">{children}</div>
    </div>
);

// Helper to format fee basis points
const formatFee = (feeBasisPoints: number, decimals: number): string => {
    return `${(feeBasisPoints / 100).toFixed(2)}%`;
};

// Helper to format interest rate
const formatInterestRate = (rate: number): string => {
    return `${(rate / 100).toFixed(2)}% APY`;
};

export const TokenSecurityInfo: React.FC<TokenSecurityInfoProps> = ({ token }) => {

    const transferFee = token.tokenExtensions?.find(ext => ext.extension === 'TransferFeeConfig')?.state;
    const interest = token.tokenExtensions?.find(ext => ext.extension === 'InterestBearingConfig')?.state;

    if (!transferFee && !interest) {
        return null; // Don't render if no interesting extensions are found
    }

    return (
        <InfoCard title="Token Features" icon={<Zap />}>
            {transferFee && (
                 <InfoRow label="Transfer Fee" tooltip="A fee applied to every token transfer, often used for funding project treasuries or burning tokens.">
                    <div className="flex items-center gap-1.5">
                        <Percent size={14} />
                        <span>{formatFee(transferFee.newerTransferFee.transferFeeBasisPoints, token.decimals!)}</span>
                    </div>
                </InfoRow>
            )}
             {interest && (
                 <InfoRow label="Interest Bearing" tooltip="This token automatically accrues interest over time for its holders, directly increasing their balance.">
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{formatInterestRate(interest.rate)}</span>
                    </div>
                </InfoRow>
            )}
            
            <InfoRow label="Mutable Metadata" tooltip="Indicates if the token's name, symbol, or other metadata can be changed by the update authority. Immutable metadata is generally safer.">
                {token.updateAuthority ? <span className="text-danger font-bold">Yes</span> : <span className="text-success font-bold">No (Immutable)</span>}
            </InfoRow>

        </InfoCard>
    );
};
