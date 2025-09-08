import React from 'react';

const SkeletonPrimitive = ({ className }: { className?: string }) => (
    <div className={`bg-primary-200 dark:bg-darkPrimary-700 rounded animate-pulse ${className}`} />
);

export const WalletCardSkeleton = () => (
    <div className="bg-white dark:bg-darkPrimary-800 p-6 rounded-2xl shadow-3d flex flex-col">
        <div className="flex flex-col flex-grow">
            <SkeletonPrimitive className="h-6 w-3/5 mb-2" />
            <SkeletonPrimitive className="h-4 w-4/5 mb-4" />
            
            <div>
                <SkeletonPrimitive className="h-4 w-1/4 mb-2" />
                <SkeletonPrimitive className="h-10 w-1/2 mb-1" />
                <SkeletonPrimitive className="h-4 w-1/3" />
            </div>

            <div className="mt-4 pt-4 border-t border-primary-200 dark:border-darkPrimary-700/50 flex-grow flex flex-col">
                <SkeletonPrimitive className="h-4 w-20 mb-3" />
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 w-1/2">
                            <SkeletonPrimitive className="w-6 h-6 rounded-full" />
                            <SkeletonPrimitive className="h-5 w-16" />
                        </div>
                        <div className="flex flex-col items-end w-1/3">
                             <SkeletonPrimitive className="h-5 w-full mb-1" />
                             <SkeletonPrimitive className="h-3 w-3/4" />
                        </div>
                    </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 w-1/2">
                            <SkeletonPrimitive className="w-6 h-6 rounded-full" />
                            <SkeletonPrimitive className="h-5 w-12" />
                        </div>
                        <div className="flex flex-col items-end w-1/3">
                             <SkeletonPrimitive className="h-5 w-full mb-1" />
                             <SkeletonPrimitive className="h-3 w-3/4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


export const TokenRowSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-center p-3">
        <div className="flex items-center space-x-4 col-span-1">
            <SkeletonPrimitive className="w-10 h-10 rounded-full" />
            <div>
                <SkeletonPrimitive className="h-5 w-16 mb-1" />
                <SkeletonPrimitive className="h-4 w-24 hidden md:block" />
            </div>
        </div>
        <div className="text-right font-mono hidden md:block">
            <SkeletonPrimitive className="h-5 w-20 ml-auto" />
        </div>
        <div className="text-right">
            <SkeletonPrimitive className="h-5 w-24 ml-auto" />
        </div>
    </div>
);