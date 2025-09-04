import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { X, MessageSquare, UserPlus, UserCheck, Loader2, Sparkles, HandHeart, Vote, Gem } from 'lucide-react';
import { useLocation } from 'wouter';
import type { ImpactBadge } from '../../types.ts';

const MOCK_BADGES: ImpactBadge[] = [
    { id: 'badge1', titleKey: 'badge_first_donation', descriptionKey: 'badge_first_donation_desc', icon: <HandHeart /> },
    { id: 'badge2', titleKey: 'badge_community_voter', descriptionKey: 'badge_community_voter_desc', icon: <Vote /> },
    { id: 'badge3', titleKey: 'badge_diverse_donor', descriptionKey: 'badge_diverse_donor_desc', icon: <Gem /> },
];

async function generateBio(username: string): Promise<string> {
    try {
        const response = await fetch('/api/generate-bio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });
        if (!response.ok) return "Nu s-a putut genera biografia.";
        const data = await response.json();
        return data.bio || "Nu s-a putut genera biografia.";
    } catch (error) {
        console.error("Bio generation API call failed:", error);
        return "Eroare la generarea biografiei.";
    }
}


export default function UserProfileModal({ userId, onClose }: { userId: string, onClose: () => void }) {
    const { communityUsers, solana, toggleFollow, startDirectMessage, updateUserBio, t } = useAppContext();
    const [, setLocation] = useLocation();
    const [isGeneratingBio, setIsGeneratingBio] = useState(false);

    const user = communityUsers.find(u => u.id === userId);
    const currentUser = communityUsers.find(u => u.id === solana.address);
    const isCurrentUserProfile = user?.id === solana.address;
    const isFollowing = currentUser?.following.includes(user?.id || '') || false;

    if (!user) return null;

    const handleFollow = () => {
        toggleFollow(user.id);
    };

    const handleMessage = () => {
        const chatId = startDirectMessage(user.id);
        if (chatId) {
            setLocation(`/community/${chatId}`);
            onClose();
        }
    };
    
    const handleGenerateBio = async () => {
        setIsGeneratingBio(true);
        const newBio = await generateBio(user.username);
        updateUserBio(user.id, newBio);
        setIsGeneratingBio(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-darkPrimary-800 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                <div className="h-28 bg-gradient-to-r from-accent-400 to-yellow-400 dark:from-darkAccent-500 dark:to-yellow-600 rounded-t-2xl relative">
                    <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-black/20 text-white hover:bg-black/40 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 pt-0">
                    <div className="-mt-16 flex items-end gap-4">
                        <img src={user.avatar} alt={user.username} className="w-32 h-32 rounded-full border-4 border-white dark:border-darkPrimary-800 shadow-lg" />
                        <div className="flex-grow flex justify-end items-center gap-2 pb-2">
                             {!isCurrentUserProfile && (
                                <>
                                    <button onClick={handleMessage} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary-200 dark:bg-darkPrimary-700 hover:bg-primary-300 dark:hover:bg-darkPrimary-600 rounded-full transition-colors">
                                        <MessageSquare size={16} /> {t('community_profile_modal_message')}
                                    </button>
                                    <button onClick={handleFollow} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${isFollowing ? 'bg-primary-200 dark:bg-darkPrimary-700' : 'bg-accent-500 text-white dark:bg-darkAccent-500'}`}>
                                        {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                                        {isFollowing ? t('community_profile_modal_unfollow') : t('community_profile_modal_follow')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold">{user.username}</h2>
                        <div className="flex items-center gap-4 text-sm text-primary-500 dark:text-darkPrimary-400 mt-2">
                            <span><span className="font-bold text-primary-800 dark:text-darkPrimary-200">{user.following.length}</span> {t('community_profile_modal_following')}</span>
                            <span><span className="font-bold text-primary-800 dark:text-darkPrimary-200">{user.followers.length}</span> {t('community_profile_modal_followers')}</span>
                        </div>
                         <p className="text-sm text-primary-600 dark:text-darkPrimary-300 mt-3 min-h-[40px]">{user.bio || t('community_profile_modal_no_bio')}</p>
                         {isCurrentUserProfile && (
                             <button onClick={handleGenerateBio} disabled={isGeneratingBio} className="flex items-center gap-2 text-xs font-semibold p-2 mt-2 rounded-lg bg-accent-100/50 hover:bg-accent-100 dark:bg-darkAccent-900/50 dark:hover:bg-darkAccent-900 transition-colors disabled:opacity-50">
                                {isGeneratingBio ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} className="text-accent-500" />}
                                <span>{t('community_profile_modal_generate_bio')}</span>
                             </button>
                         )}
                    </div>
                     <div className="mt-6 pt-4 border-t border-primary-200 dark:border-darkPrimary-700">
                        <h3 className="text-sm font-bold uppercase text-primary-500 dark:text-darkPrimary-400 mb-3">{t('community_impact_badges')}</h3>
                        <div className="flex flex-wrap gap-4">
                             {MOCK_BADGES.map(badge => (
                                 <div key={badge.id} className="group relative flex flex-col items-center text-center w-20">
                                    <div className="bg-primary-100 dark:bg-darkPrimary-700 rounded-full p-3 text-accent-500 dark:text-darkAccent-400 group-hover:scale-110 transition-transform">
                                        {React.cloneElement(badge.icon as React.ReactElement<{ size: number }>, { size: 28 })}
                                    </div>
                                    <p className="text-xs font-semibold mt-2">{t(badge.titleKey)}</p>
                                    <div className="absolute bottom-full mb-2 w-40 bg-primary-900 text-white dark:bg-darkPrimary-950 text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {t(badge.descriptionKey)}
                                        <svg className="absolute text-primary-900 dark:text-darkPrimary-950 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}