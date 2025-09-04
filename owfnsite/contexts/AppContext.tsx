import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useTheme } from '../hooks/useTheme.ts';
import { useLocalization } from '../hooks/useLocalization.ts';
import { useSolana } from '../hooks/useSolana.ts';
import type { Theme, Language, SocialCase, Token, VestingSchedule, GovernanceProposal, CommunityUser, ChatConversation, CommunityMessage, GroupPermissions, Attachment } from '../types.ts';
import { INITIAL_SOCIAL_CASES, SUPPORTED_LANGUAGES, MAINTENANCE_MODE_ACTIVE } from '../constants.ts';
import { translateText } from '../services/geminiService.ts';

// --- MOCK DATA FOR COMMUNITY HUB ---
const MOCK_USERS: CommunityUser[] = [
    { id: '1', username: 'Admin', avatar: '/assets/owfn.png', isOnline: true, bio: 'Administrator and guardian of the OWFN Community.', followers: ['2', '3'], following: ['2', '3'] },
    { id: '2', username: 'Alice', avatar: 'https://i.pravatar.cc/150?u=alice', isOnline: true, bio: 'Early supporter & active community member. Believer in a better world.', followers: ['1'], following: ['1', '3'] },
    { id: '3', username: 'Bob', avatar: 'https://i.pravatar.cc/150?u=bob', isOnline: false, bio: 'Here to learn and contribute to social causes.', followers: ['1', '2'], following: ['1'] },
    { id: 'OWFN_Bot', username: 'OWFN Bot', avatar: '/assets/owfn.png', isOnline: true, isBot: true, bio: 'I am the official bot for the Official World Family Network.', followers: [], following: [] },
];

const MOCK_CHAT_CONVERSATIONS: ChatConversation[] = [
    {
        id: 'group-1',
        type: 'group',
        name: '#general-chat',
        description: 'Discuții generale despre proiectul OWFN și comunitate.',
        image: '/assets/owfn.png',
        participants: MOCK_USERS.map(u => u.id),
        ownerId: '1',
        moderatorIds: [],
        permissions: {
            canSendMessage: 'member',
            canAddMembers: 'moderator',
            canPinMessages: 'moderator',
            canChangeGroupInfo: 'moderator',
            canDeleteMessages: 'moderator',
        },
        messages: [
            { id: 'msg-g1-1', senderId: 'OWFN_Bot', content: 'Bun venit în hub-ul comunitar OWFN! Vă rugăm să fiți respectuoși.', timestamp: new Date(Date.now() - 1000 * 60 * 5), reactions: { '❤️': ['1', '2', '3'] }, status: 'read' },
            { id: 'msg-g1-2', senderId: '2', content: 'Salutare tuturor! Încântată să fiu aici.', timestamp: new Date(Date.now() - 1000 * 60 * 4), reactions: { '👍': ['1', '3'] }, status: 'read' },
            { id: 'msg-g1-3', senderId: '3', content: 'Hey Alice! Ce mai faci?', timestamp: new Date(Date.now() - 1000 * 60 * 3), replyToMessageId: 'msg-g1-2', status: 'read' },

        ],
        typingUserIds: [],
    },
    {
        id: 'channel-1',
        type: 'channel',
        name: '#announcements',
        description: 'Anunțuri oficiale de la echipa OWFN.',
        image: '/assets/owfn.png',
        participants: MOCK_USERS.map(u => u.id),
        ownerId: '1',
        moderatorIds: [],
        permissions: {
            canSendMessage: 'owner', // Only owner can post
            canAddMembers: 'owner',
            canPinMessages: 'owner',
            canChangeGroupInfo: 'owner',
            canDeleteMessages: 'owner',
        },
        messages: [
            { id: 'msg-c1-1', senderId: '1', content: 'Prevânzarea este LIVE! Participați acum pe pagina de prevânzare.', timestamp: new Date(Date.now() - 1000 * 60 * 10), status: 'read' },
        ],
        pinnedMessageId: 'msg-c1-1',
        typingUserIds: [],
    },
    {
        id: 'group-2',
        type: 'group',
        name: '#owfn-holders-club',
        description: 'Grup exclusiv pentru deținătorii a peste 100.000 OWFN.',
        image: '/assets/owfn.png',
        participants: ['1', 'OWFN_Bot'],
        isTokenGated: true,
        requiredTokenAmount: 100000,
        ownerId: '1',
        moderatorIds: [],
        permissions: {
            canSendMessage: 'member',
            canAddMembers: 'member',
            canPinMessages: 'moderator',
            canChangeGroupInfo: 'moderator',
            canDeleteMessages: 'moderator',
        },
        messages: [
            { id: 'msg-g2-1', senderId: 'OWFN_Bot', content: 'Bun venit în clubul exclusiv al deținătorilor! Aici discutăm strategii și viitorul proiectului.', timestamp: new Date(), status: 'read' },
        ],
        typingUserIds: [],
    },
    {
        id: 'dm-1',
        type: 'dm',
        participants: ['2', '3'], // Alice and Bob
        messages: [
            { id: 'msg-dm1-1', senderId: '2', content: 'Salut Bob! Ai văzut ultimele noutăți?', timestamp: new Date(Date.now() - 1000 * 60 * 2), reactions: { '👍': ['3'] }, status: 'read' },
            { id: 'msg-dm1-2', senderId: '3', content: 'Salut Alice! Da, pare promițător!', timestamp: new Date(Date.now() - 1000 * 60 * 1), status: 'read' },
        ],
        typingUserIds: [],
    },
];

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  setLang: (langCode: string) => void;
  currentLanguage: Language;
  supportedLanguages: Language[];
  solana: ReturnType<typeof useSolana>;
  socialCases: SocialCase[];
  addSocialCase: (newCase: SocialCase) => void;
  vestingSchedules: VestingSchedule[];
  addVestingSchedule: (schedule: VestingSchedule) => void;
  proposals: GovernanceProposal[];
  addProposal: (proposal: { title: string; description: string; endDate: Date }) => Promise<void>;
  voteOnProposal: (proposalId: string, vote: 'for' | 'against') => void;
  isMaintenanceActive: boolean;
  setWalletModalOpen: (open: boolean) => void;
  // Community Hub State
  communityUsers: CommunityUser[];
  chats: ChatConversation[];
  sendMessage: (chatId: string, content: string, attachment?: Attachment, replyToMessageId?: string) => void;
  isProfileModalOpen: boolean;
  viewingProfileId: string | null;
  openProfileModal: (userId: string) => void;
  closeProfileModal: () => void;
  isGroupSettingsModalOpen: boolean;
  openGroupSettingsModal: () => void;
  closeGroupSettingsModal: () => void;
  toggleFollow: (userIdToFollow: string) => void;
  startDirectMessage: (otherUserId: string) => string | null;
  toggleMessageReaction: (chatId: string, messageId: string, emoji: string) => void;
  updateUserBio: (userId: string, newBio: string) => void;
  updateGroupInfo: (chatId: string, newInfo: { name: string; description: string; image: string }) => void;
  updateGroupPermissions: (chatId: string, newPermissions: GroupPermissions) => void;
  promoteToModerator: (chatId: string, userId: string) => void;
  demoteToMember: (chatId: string, userId: string) => void;
  removeUserFromGroup: (chatId: string, userId: string) => void;
  pinMessage: (chatId: string, messageId: string) => void;
  editMessage: (chatId: string, messageId: string, newContent: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  markMessagesAsRead: (chatId: string) => void;
  setUserTyping: (chatId: string, isTyping: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, toggleTheme] = useTheme();
  const { t, setLang, currentLanguage, supportedLanguages } = useLocalization();
  const solana = useSolana();
  const { setVisible: setWalletModalOpen } = useWalletModal();

  const [socialCases, setSocialCases] = useState<SocialCase[]>(INITIAL_SOCIAL_CASES);
  const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>([]);
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const isMaintenanceActive = MAINTENANCE_MODE_ACTIVE;

  // --- Community Hub State Management ---
  const [communityUsers, setCommunityUsers] = useState<CommunityUser[]>(MOCK_USERS);
  const [chats, setChats] = useState<ChatConversation[]>(MOCK_CHAT_CONVERSATIONS);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isGroupSettingsModalOpen, setGroupSettingsModalOpen] = useState(false);
  
  const openProfileModal = (userId: string) => {
    setViewingProfileId(userId);
    setProfileModalOpen(true);
  };
  const closeProfileModal = () => setProfileModalOpen(false);
  const openGroupSettingsModal = () => setGroupSettingsModalOpen(true);
  const closeGroupSettingsModal = () => setGroupSettingsModalOpen(false);

  const sendMessage = useCallback((chatId: string, content: string, attachment?: Attachment, replyToMessageId?: string) => {
      if (!solana.address) return;

      const newMessage: CommunityMessage = {
          id: `msg-${Date.now()}`,
          senderId: solana.address!,
          content,
          timestamp: new Date(),
          replyToMessageId,
          attachment,
          status: 'sending',
      };

      setChats(prevChats => prevChats.map(chat => 
          chat.id === chatId ? { ...chat, messages: [...chat.messages, newMessage] } : chat
      ));

      // Simulate sending
      setTimeout(() => {
          setChats(prevChats => prevChats.map(chat => {
              if (chat.id === chatId) {
                  return {
                      ...chat,
                      messages: chat.messages.map(msg => 
                          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
                      )
                  };
              }
              return chat;
          }));
      }, 500);

  }, [solana.address]);

  const editMessage = useCallback((chatId: string, messageId: string, newContent: string) => {
      setChats(prev => prev.map(chat => {
          if (chat.id !== chatId) return chat;
          return {
              ...chat,
              messages: chat.messages.map(msg => 
                  msg.id === messageId ? { ...msg, content: newContent, isEdited: true } : msg
              )
          }
      }))
  }, []);

  const deleteMessage = useCallback((chatId: string, messageId: string) => {
     setChats(prev => prev.map(chat => {
          if (chat.id !== chatId) return chat;
          return {
              ...chat,
              messages: chat.messages.map(msg => 
                  msg.id === messageId ? { ...msg, content: 'Acest mesaj a fost șters.', attachment: undefined, isDeleted: true } : msg
              )
          }
      }))
  }, []);

  const toggleFollow = useCallback((userIdToFollow: string) => {
    if (!solana.address) return;
    const currentUserId = solana.address;

    setCommunityUsers(prev => prev.map(user => {
        if (user.id === userIdToFollow) {
            const isFollowing = user.followers.includes(currentUserId);
            return { ...user, followers: isFollowing ? user.followers.filter(id => id !== currentUserId) : [...user.followers, currentUserId] };
        }
        if (user.id === currentUserId) {
            const isFollowing = user.following.includes(userIdToFollow);
            return { ...user, following: isFollowing ? user.following.filter(id => id !== userIdToFollow) : [...user.following, userIdToFollow] };
        }
        return user;
    }));
  }, [solana.address]);

  const startDirectMessage = useCallback((otherUserId: string): string | null => {
      if (!solana.address || solana.address === otherUserId) return null;
      
      const existingDm = chats.find(c => 
          c.type === 'dm' &&
          c.participants.includes(solana.address!) &&
          c.participants.includes(otherUserId)
      );
      
      if (existingDm) {
          return existingDm.id;
      }
      
      const newDm: ChatConversation = {
          id: `dm-${Date.now()}`,
          type: 'dm',
          participants: [solana.address, otherUserId],
          messages: [],
      };
      
      setChats(prev => [newDm, ...prev]);
      return newDm.id;
  }, [solana.address, chats]);

  const toggleMessageReaction = useCallback((chatId: string, messageId: string, emoji: string) => {
    if (!solana.address) return;
    const userId = solana.address;

    setChats(prevChats => prevChats.map(chat => {
        if (chat.id !== chatId) return chat;
        return {
            ...chat,
            messages: chat.messages.map(message => {
                if (message.id !== messageId) return message;
                const reactions = { ...(message.reactions || {}) };
                const userList = reactions[emoji] || [];
                if (userList.includes(userId)) {
                    reactions[emoji] = userList.filter(id => id !== userId);
                    if (reactions[emoji].length === 0) delete reactions[emoji];
                } else {
                    reactions[emoji] = [...userList, userId];
                }
                return { ...message, reactions };
            })
        };
    }));
  }, [solana.address]);

  const updateUserBio = useCallback((userId: string, newBio: string) => {
    setCommunityUsers(prev => prev.map(user => user.id === userId ? { ...user, bio: newBio } : user));
  }, []);
  
  const updateGroupInfo = useCallback((chatId: string, newInfo: { name: string; description: string; image: string }) => {
      setChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, ...newInfo } : chat));
  }, []);

  const updateGroupPermissions = useCallback((chatId: string, newPermissions: GroupPermissions) => {
      setChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, permissions: newPermissions } : chat));
  }, []);

  const promoteToModerator = useCallback((chatId: string, userId: string) => {
      setChats(prev => prev.map(chat => {
          if (chat.id === chatId && chat.ownerId !== userId) {
              return { ...chat, moderatorIds: [...(chat.moderatorIds || []), userId] };
          }
          return chat;
      }));
  }, []);

  const demoteToMember = useCallback((chatId: string, userId: string) => {
       setChats(prev => prev.map(chat => {
          if (chat.id === chatId) {
              return { ...chat, moderatorIds: (chat.moderatorIds || []).filter(id => id !== userId) };
          }
          return chat;
      }));
  }, []);

  const removeUserFromGroup = useCallback((chatId: string, userId: string) => {
      setChats(prev => prev.map(chat => {
          if (chat.id === chatId && chat.ownerId !== userId) {
              return {
                  ...chat,
                  participants: chat.participants.filter(id => id !== userId),
                  moderatorIds: (chat.moderatorIds || []).filter(id => id !== userId),
              };
          }
          return chat;
      }));
  }, []);
  
  const pinMessage = useCallback((chatId: string, messageId: string) => {
      setChats(prev => prev.map(chat => chat.id === chatId ? { ...chat, pinnedMessageId: messageId } : chat));
  }, []);

  const markMessagesAsRead = useCallback((chatId: string) => {
    if (!solana.address) return;
    const userId = solana.address;
    setChats(prev => prev.map(chat => {
        if (chat.id !== chatId) return chat;
        return {
            ...chat,
            messages: chat.messages.map(msg => 
                (msg.senderId !== userId && msg.status !== 'read') ? { ...msg, status: 'read' } : msg
            )
        };
    }));
  }, [solana.address]);

  const setUserTyping = useCallback((chatId: string, isTyping: boolean) => {
    if (!solana.address) return;
    const userId = solana.address;
    setChats(prev => prev.map(chat => {
        if (chat.id !== chatId) return chat;
        const typingIds = chat.typingUserIds || [];
        const isAlreadyTyping = typingIds.includes(userId);
        if (isTyping && !isAlreadyTyping) {
            return { ...chat, typingUserIds: [...typingIds, userId] };
        }
        if (!isTyping && isAlreadyTyping) {
            return { ...chat, typingUserIds: typingIds.filter(id => id !== userId) };
        }
        return chat;
    }));
  }, [solana.address]);

  // Effect to add the connected user to the mock users list
   useEffect(() => {
    if (solana.connected && solana.address) {
      setCommunityUsers(prevUsers => {
        if (prevUsers.some(u => u.id === solana.address)) {
          return prevUsers.map(u => u.id === solana.address ? { ...u, isOnline: true } : u);
        }
        const newUser: CommunityUser = {
          id: solana.address,
          username: `${solana.address.slice(0, 4)}...${solana.address.slice(-4)}`,
          avatar: `https://i.pravatar.cc/150?u=${solana.address}`,
          isOnline: true,
          bio: 'Exploring the OWFN universe!',
          followers: [],
          following: [],
        };
        return [...prevUsers, newUser];
      });
    } else if (solana.address) {
         setCommunityUsers(prevUsers => {
            return prevUsers.map(u => u.id === solana.address ? { ...u, isOnline: false } : u);
         });
    }
  }, [solana.connected, solana.address]);

  // Effect for Bot simulation
  useEffect(() => {
    if (!solana.address) return;
    
    const lastMessageInGeneralChat = chats.find(c => c.id === 'group-1')?.messages.slice(-1)[0];
    
    if (lastMessageInGeneralChat && lastMessageInGeneralChat.senderId === solana.address) {
        const botId = 'OWFN_Bot';
        const chatId = 'group-1';

        // 1. Mark as read
        setTimeout(() => {
            markMessagesAsRead(chatId);
        }, 800);

        // 2. Simulate typing
        setTimeout(() => {
             setChats(prev => prev.map(c => c.id === chatId ? { ...c, typingUserIds: [...(c.typingUserIds || []), botId] } : c));
        }, 1200);

        // 3. Send reply & stop typing
        setTimeout(() => {
            const botMessage: CommunityMessage = {
                id: `msg-bot-${Date.now()}`,
                senderId: botId,
                content: 'Mulțumim pentru mesaj! Comunitatea apreciază contribuția ta.',
                timestamp: new Date(),
                status: 'sent',
            };
             setChats(prev => prev.map(c => {
                 if (c.id === chatId) {
                     return { 
                         ...c, 
                         messages: [...c.messages, botMessage],
                         typingUserIds: (c.typingUserIds || []).filter(id => id !== botId)
                     };
                 }
                 return c;
             }));
        }, 2500 + Math.random() * 1000); // random delay
    }
  }, [chats, solana.address]);


  const addSocialCase = (newCase: SocialCase) => {
    setSocialCases(prevCases => [newCase, ...prevCases]);
  };
  
  const addVestingSchedule = (schedule: VestingSchedule) => {
    setVestingSchedules(prev => [schedule, ...prev]);
  };

  const addProposal = useCallback(async (proposalData: { title: string; description: string; endDate: Date; }) => {
    const newTitleTranslations: Record<string, string> = { en: proposalData.title };
    const newDescriptionTranslations: Record<string, string> = { en: proposalData.description };

    const languagesToTranslate = SUPPORTED_LANGUAGES.filter(lang => lang.code !== 'en');
    
    try {
        const translationPromises = languagesToTranslate.flatMap(lang => [
            translateText(proposalData.title, lang.name),
            translateText(proposalData.description, lang.name),
        ]);

        const translations = await Promise.all(translationPromises);

        languagesToTranslate.forEach((lang, index) => {
            newTitleTranslations[lang.code] = translations[index * 2] || proposalData.title;
            newDescriptionTranslations[lang.code] = translations[index * 2 + 1] || proposalData.description;
        });
    } catch (error) {
        console.error("Translation failed for proposal:", error);
        languagesToTranslate.forEach(lang => {
            newTitleTranslations[lang.code] = proposalData.title;
            newDescriptionTranslations[lang.code] = proposalData.description;
        });
    }
    
    const newProposal: GovernanceProposal = {
        id: `prop${Date.now()}`,
        title: newTitleTranslations,
        description: newDescriptionTranslations,
        endDate: proposalData.endDate,
        proposer: solana.address || 'Anonymous',
        status: 'active',
        votesFor: 0,
        votesAgainst: 0,
    };
    setProposals(prev => [newProposal, ...prev]);
  }, [solana.address]);
  
  const voteOnProposal = useCallback((proposalId: string, vote: 'for' | 'against') => {
    setProposals(prev => prev.map(p => {
        if (p.id === proposalId) {
            const votePower = 1000000;
            return {
                ...p,
                votesFor: vote === 'for' ? p.votesFor + votePower : p.votesFor,
                votesAgainst: vote === 'against' ? p.votesAgainst + votePower : p.votesAgainst,
            }
        }
        return p;
    }));
  }, []);

  const value: AppContextType = {
    theme,
    toggleTheme,
    t,
    setLang,
    currentLanguage,
    supportedLanguages,
    solana,
    socialCases,
    addSocialCase,
    vestingSchedules,
    addVestingSchedule,
    proposals,
    addProposal,
    voteOnProposal,
    isMaintenanceActive,
    setWalletModalOpen,
    // Community Hub values
    communityUsers,
    chats,
    sendMessage,
    isProfileModalOpen,
    viewingProfileId,
    openProfileModal,
    closeProfileModal,
    isGroupSettingsModalOpen,
    openGroupSettingsModal,
    closeGroupSettingsModal,
    toggleFollow,
    startDirectMessage,
    toggleMessageReaction,
    updateUserBio,
    updateGroupInfo,
    updateGroupPermissions,
    promoteToModerator,
    demoteToMember,
    removeUserFromGroup,
    pinMessage,
    editMessage,
    deleteMessage,
    markMessagesAsRead,
    setUserTyping,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};