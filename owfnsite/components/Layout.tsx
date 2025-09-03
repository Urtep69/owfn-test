import React, { useState } from 'react';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { Chatbot } from './Chatbot.tsx';
import { Sidebar } from './Sidebar.tsx';
import { TabBar } from './TabBar.tsx';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-primary-100 text-primary-800 dark:bg-darkPrimary-950 dark:text-darkPrimary-200 font-sans transition-colors duration-300">
      <div className="flex">
        {/* Sidebar for Desktop */}
        <div className="hidden md:flex">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        </div>
        
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out md:${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <Header toggleSidebar={() => setSidebarOpen(prev => !prev)} isSidebarOpen={isSidebarOpen} />
          <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
            {children}
          </main>
          <Footer />
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden">
         <TabBar />
      </div>

      <Chatbot />
    </div>
  );
};