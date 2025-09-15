
import React from 'react';
import { KeyStats } from '../components/dashboard/KeyStats.js';
import { AiSecurityPanel } from '../components/dashboard/AiSecurityPanel.js';
import { PriceChart } from '../components/dashboard/PriceChart.js';
import { LiveFeed } from '../components/dashboard/LiveFeed.js';


export default function TokenDashboard() {
    return (
        <div className="animate-fade-in space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Main panel */}
                <div className="lg:col-span-2 space-y-4">
                    <PriceChart />
                    <KeyStats />
                </div>

                {/* Side panel */}
                <div className="space-y-4">
                    <AiSecurityPanel />
                    <LiveFeed />
                </div>
            </div>
        </div>
    );
}