import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, FileWarning, AlertTriangle, Info, ChevronLeft, ChevronRight, X } from 'lucide-react';

const messages = [
  {
    id: 'domain',
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'text-green-500 dark:text-green-400',
    text: 'Domain Verification: Please confirm you are visiting the official domain [owfn.org]. Beware of fake websites stealing assets.',
    highlight: 'Domain Verification:',
    linkText: '[owfn.org]',
    linkHref: 'https://owfn.org'
  },
  {
    id: 'openSource',
    icon: <Info className="w-5 h-5" />,
    color: 'text-blue-500 dark:text-blue-400',
    text: 'Open Source Declaration: All tools are personally provided on the chain. Do not use similar tools through third-party links.',
    highlight: 'Open Source Declaration:',
    linkText: null,
    linkHref: null
  },
  {
    id: 'riskWarning',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-yellow-500 dark:text-yellow-400',
    text: 'Risk Warning: Recently, multiple fake platforms have appeared with low-price bait to attract users into paying for private key theft; please be extremely vigilant.',
    highlight: 'Risk Warning:',
    linkText: null,
    linkHref: null
  },
  {
    id: 'riskDescription',
    icon: <FileWarning className="w-5 h-5" />,
    color: 'text-red-500 dark:text-red-400',
    text: 'Risk Description: OWFN has not conducted a Telegram audit; please do not trust private messages or accounts. Do not click on unofficial or browser links.',
    highlight: 'Risk Description:',
    linkText: null,
    linkHref: null
  }
];

const renderMessage = (msg: typeof messages[0]) => {
    const textWithoutHighlight = msg.text.replace(msg.highlight, '').trim();
    
    if (!msg.linkText) {
        return <><span className={`${msg.color} font-semibold mr-1`}>{msg.highlight}</span> {textWithoutHighlight}</>
    }
    
    const parts = textWithoutHighlight.split(msg.linkText);
    const linkRendered = (
        <a href={msg.linkHref} target="_blank" rel="noopener noreferrer" className="underline font-semibold mx-1">
            {msg.linkText.replace(/\[|\]/g, '')}
        </a>
    );

    return (
        <>
            <span className={`${msg.color} font-semibold mr-1`}>{msg.highlight}</span>
            {parts[0]}
            {linkRendered}
            {parts[1]}
        </>
    );
}

export const TopBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const startInterval = useCallback(() => {
    intervalRef.current = window.setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 8000); // Change message every 8 seconds
  }, []);
  
  const resetInterval = useCallback(() => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
    startInterval();
  }, [startInterval]);

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startInterval]);

  if (!isVisible) return null;

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % messages.length);
    resetInterval();
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length);
    resetInterval();
  };
  
  const currentMessage = messages[currentIndex];

  return (
    <div className="bg-primary-200 dark:bg-darkPrimary-900 text-primary-800 dark:text-darkPrimary-200 hidden md:block">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm h-10">
        <div className="flex items-center gap-3 overflow-hidden">
            <span className={currentMessage.color}>
                {currentMessage.icon}
            </span>
            <div className="flex-1 min-w-0">
                 <p className="truncate">
                    {renderMessage(currentMessage)}
                 </p>
            </div>
        </div>
        <div className="flex items-center flex-shrink-0 ml-4">
            <div className="flex items-center gap-1.5">
                {messages.map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => {
                            setCurrentIndex(index);
                            resetInterval();
                        }} 
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${currentIndex === index ? 'bg-primary-700 dark:bg-white' : 'bg-primary-400 dark:bg-gray-500 hover:bg-primary-500 dark:hover:bg-gray-400'}`}
                        aria-label={`Go to message ${index + 1}`}
                    />
                ))}
            </div>
            <div className="flex items-center border-l border-primary-300 dark:border-darkPrimary-700 ml-3 pl-2 gap-1">
                <button onClick={goPrev} aria-label="Previous message" className="p-1 rounded-md hover:bg-primary-300/50 dark:hover:bg-darkPrimary-800"><ChevronLeft size={16}/></button>
                <button onClick={goNext} aria-label="Next message" className="p-1 rounded-md hover:bg-primary-300/50 dark:hover:bg-darkPrimary-800"><ChevronRight size={16}/></button>
                <button onClick={() => setIsVisible(false)} aria-label="Close banner" className="p-1 rounded-md hover:bg-primary-300/50 dark:hover:bg-darkPrimary-800"><X size={16}/></button>
            </div>
        </div>
      </div>
    </div>
  );
};