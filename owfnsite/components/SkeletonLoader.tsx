import React from 'react';

export const SkeletonLoader = ({ className = '' }: { className?: string }) => (
    <div className={`bg-primary-200 dark:bg-darkPrimary-700 rounded-md animate-pulse ${className}`} />
);
