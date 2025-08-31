
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext.tsx';
import { AddressDisplay } from './AddressDisplay.tsx';
import { MessageSquare, Send, User, Loader2 } from 'lucide-react';
import type { Comment } from '../types.ts';

interface CommentSectionProps {
    parentId: string;
    title: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ parentId, title }) => {
    const { t, siws, solana, setWalletModalOpen } = useAppContext();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/comments?parentId=${parentId}`);
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setIsLoading(false);
        }
    }, [parentId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handlePostComment = async () => {
        if (!siws.isAuthenticated || !solana.address) {
            if (!solana.connected) {
                setWalletModalOpen(true);
            } else {
                await siws.signIn();
            }
            return;
        }

        if (newComment.trim() === '') return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parentId,
                    authorAddress: solana.address,
                    content: newComment,
                }),
            });
            if (response.ok) {
                const newCommentData = await response.json();
                setComments(prev => [newCommentData, ...prev]);
                setNewComment('');
            } else {
                alert('Failed to post comment.');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            alert('An error occurred while posting your comment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <MessageSquare /> {title} ({comments.length})
            </h3>

            <div className="bg-primary-50 dark:bg-darkPrimary-700/50 p-4 rounded-lg mb-6">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('leave_a_comment_placeholder')}
                    rows={3}
                    className="w-full p-2 bg-white dark:bg-darkPrimary-800 rounded-md focus:ring-2 focus:ring-accent-500 focus:outline-none"
                    disabled={isSubmitting}
                />
                <div className="flex justify-end mt-2">
                    <button
                        onClick={handlePostComment}
                        disabled={!newComment.trim() || isSubmitting}
                        className="flex items-center gap-2 bg-accent-400 text-accent-950 dark:bg-darkAccent-500 dark:text-darkPrimary-950 font-bold py-2 px-4 rounded-lg hover:bg-accent-500 dark:hover:bg-darkAccent-600 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
                        {siws.isAuthenticated ? t('post_comment') : t('connect_to_comment')}
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
                ) : comments.length > 0 ? (
                    comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-4">
                            <div className="bg-primary-100 dark:bg-darkPrimary-700 p-2 rounded-full">
                                <User className="text-primary-500 dark:text-darkPrimary-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 text-sm">
                                    <AddressDisplay address={comment.authorAddress} />
                                    <span className="text-primary-400 dark:text-darkPrimary-500">&bull;</span>
                                    <time className="text-primary-400 dark:text-darkPrimary-500">
                                        {new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </time>
                                </div>
                                <p className="mt-1 text-primary-700 dark:text-darkPrimary-300">{comment.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-primary-500 dark:text-darkPrimary-400 py-4">{t('no_comments_yet')}</p>
                )}
            </div>
        </div>
    );
};
