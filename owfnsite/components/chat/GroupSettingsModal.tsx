import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import type { ChatConversation, GroupPermissions } from '../../types.ts';
import { X, User, Shield, Users, ArrowDown, ArrowUp, Trash2, Info, Lock } from 'lucide-react';

type Tab = 'info' | 'members' | 'permissions';

const PermissionRow = ({ label, value, onChange, options }: { label: string; value: string; onChange: (newValue: string) => void; options: {value: string; label: string}[] }) => {
    return (
        <div className="flex justify-between items-center py-2 border-b border-primary-200 dark:border-darkPrimary-700">
            <span className="text-sm font-medium">{label}</span>
            <select value={value} onChange={e => onChange(e.target.value)} className="bg-primary-100 dark:bg-darkPrimary-600 text-sm rounded-md p-1 border border-primary-300 dark:border-darkPrimary-500">
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
};

export default function GroupSettingsModal({ chat, onClose }: { chat: ChatConversation; onClose: () => void }) {
    const { t, communityUsers, updateGroupInfo, updateGroupPermissions, promoteToModerator, demoteToMember, removeUserFromGroup } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('info');
    
    // Local state for edits
    const [name, setName] = useState(chat.name || '');
    const [description, setDescription] = useState(chat.description || '');
    const [image, setImage] = useState(chat.image || '');
    const [permissions, setPermissions] = useState<GroupPermissions>(chat.permissions || {
        canSendMessage: 'member', canAddMembers: 'moderator', canPinMessages: 'moderator', canChangeGroupInfo: 'moderator', canDeleteMessages: 'moderator'
    });

    const handleSave = () => {
        updateGroupInfo(chat.id, { name, description, image });
        updateGroupPermissions(chat.id, permissions);
        onClose();
    };
    
    const permissionOptions = [
        { value: 'owner', label: t('role_owner') },
        { value: 'moderator', label: t('role_moderator') },
        { value: 'member', label: t('role_member') },
    ];
    
    const owner = communityUsers.find(u => u.id === chat.ownerId);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-darkPrimary-800 rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col shadow-2xl animate-fade-in-up" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-primary-200 dark:border-darkPrimary-700">
                    <h2 className="text-xl font-bold">{t('group_settings_title')}</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                </header>
                
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar for tabs */}
                    <aside className="w-48 border-r border-primary-200 dark:border-darkPrimary-700 p-2">
                        <nav className="flex flex-col gap-1">
                            <button onClick={() => setActiveTab('info')} className={`flex items-center gap-2 p-2 rounded-md text-sm ${activeTab === 'info' ? 'bg-primary-100 dark:bg-darkPrimary-700 font-semibold' : ''}`}><Info size={16}/> {t('tab_info')}</button>
                            <button onClick={() => setActiveTab('members')} className={`flex items-center gap-2 p-2 rounded-md text-sm ${activeTab === 'members' ? 'bg-primary-100 dark:bg-darkPrimary-700 font-semibold' : ''}`}><Users size={16}/> {t('tab_members')}</button>
                            <button onClick={() => setActiveTab('permissions')} className={`flex items-center gap-2 p-2 rounded-md text-sm ${activeTab === 'permissions' ? 'bg-primary-100 dark:bg-darkPrimary-700 font-semibold' : ''}`}><Lock size={16}/> {t('tab_permissions')}</button>
                        </nav>
                    </aside>
                    
                    {/* Content */}
                    <main className="flex-1 p-6 overflow-y-auto">
                        {activeTab === 'info' && (
                            <div className="space-y-4">
                                <div><label className="text-sm font-medium">{t('group_name')}</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md"/></div>
                                <div><label className="text-sm font-medium">{t('group_description')}</label><textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md h-24"></textarea></div>
                                <div><label className="text-sm font-medium">{t('group_image_url')}</label><input type="text" value={image} onChange={e => setImage(e.target.value)} className="w-full mt-1 p-2 bg-primary-100 dark:bg-darkPrimary-700 rounded-md"/></div>
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="space-y-2">
                                {owner && <div className="flex items-center gap-3 p-2"><img src={owner.avatar} className="w-8 h-8 rounded-full" /><span className="font-semibold">{owner.username}</span><span className="ml-auto text-xs font-bold text-yellow-500">{t('role_owner')}</span></div>}
                                {chat.moderatorIds?.map(id => {
                                    const user = communityUsers.find(u => u.id === id);
                                    if(!user) return null;
                                    return <div key={id} className="flex items-center gap-3 p-2 rounded-md hover:bg-primary-100 dark:hover:bg-darkPrimary-700"><img src={user.avatar} className="w-8 h-8 rounded-full" /><span className="font-semibold">{user.username}</span><span className="ml-auto text-xs font-bold text-blue-500">{t('role_moderator')}</span><button onClick={() => demoteToMember(chat.id, id)} title={t('action_demote')} className="p-1.5 hover:bg-black/10 rounded-full"><ArrowDown size={14}/></button><button onClick={() => removeUserFromGroup(chat.id, id)} title={t('action_remove')} className="p-1.5 hover:bg-red-500/10 rounded-full"><Trash2 size={14} className="text-red-500"/></button></div>
                                })}
                                {chat.participants.filter(id => id !== chat.ownerId && !chat.moderatorIds?.includes(id)).map(id => {
                                     const user = communityUsers.find(u => u.id === id);
                                     if(!user) return null;
                                     return <div key={id} className="flex items-center gap-3 p-2 rounded-md hover:bg-primary-100 dark:hover:bg-darkPrimary-700"><img src={user.avatar} className="w-8 h-8 rounded-full" /><span>{user.username}</span><div className="ml-auto flex items-center gap-1"><button onClick={() => promoteToModerator(chat.id, id)} title={t('action_promote')} className="p-1.5 hover:bg-black/10 rounded-full"><ArrowUp size={14}/></button><button onClick={() => removeUserFromGroup(chat.id, id)} title={t('action_remove')} className="p-1.5 hover:bg-red-500/10 rounded-full"><Trash2 size={14} className="text-red-500"/></button></div></div>
                                })}
                            </div>
                        )}
                        
                        {activeTab === 'permissions' && (
                             <div className="space-y-2">
                                 <h3 className="font-bold mb-2">{t('permissions_title')}</h3>
                                 <PermissionRow label={t('permission_send_messages')} value={permissions.canSendMessage} onChange={val => setPermissions(p => ({...p, canSendMessage: val as any}))} options={permissionOptions} />
                                 <PermissionRow label={t('permission_add_members')} value={permissions.canAddMembers} onChange={val => setPermissions(p => ({...p, canAddMembers: val as any}))} options={permissionOptions.filter(o => o.value !== 'owner')} />
                                 <PermissionRow label={t('permission_pin_messages')} value={permissions.canPinMessages} onChange={val => setPermissions(p => ({...p, canPinMessages: val as any}))} options={permissionOptions.filter(o => o.value !== 'member')} />
                                 <PermissionRow label={t('permission_change_info')} value={permissions.canChangeGroupInfo} onChange={val => setPermissions(p => ({...p, canChangeGroupInfo: val as any}))} options={permissionOptions.filter(o => o.value !== 'member')} />
                                 <PermissionRow label={t('permission_delete_messages')} value={permissions.canDeleteMessages} onChange={val => setPermissions(p => ({...p, canDeleteMessages: val as any}))} options={permissionOptions.filter(o => o.value !== 'member')} />
                             </div>
                        )}
                    </main>
                </div>

                <footer className="p-4 border-t border-primary-200 dark:border-darkPrimary-700 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-primary-200 dark:bg-darkPrimary-700 rounded-md">{t('cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold bg-accent-500 text-white dark:bg-darkAccent-500 rounded-md">{t('save_changes')}</button>
                </footer>
            </div>
        </div>
    );
}