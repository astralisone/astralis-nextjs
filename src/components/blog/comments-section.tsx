'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ApiComment } from '@/types/blog';
import { formatRelativeTime } from '@/lib/utils';
import { useApiMutation } from '@/hooks/useApi';

interface CommentsSectionProps {
  postSlug: string;
  comments: ApiComment[];
  onCommentAdded?: (comment: ApiComment) => void;
}

interface CommentFormProps {
  postSlug: string;
  onCommentAdded?: (comment: ApiComment) => void;
}

function CommentForm({ postSlug, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is logged in
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const isLoggedIn = !!user;

  const { mutate: submitComment } = useApiMutation<ApiComment>(`/api/blog/${postSlug}/comments`, {
    onSuccess: (newComment) => {
      setContent('');
      onCommentAdded?.(newComment);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isLoggedIn) return;

    setIsSubmitting(true);
    try {
      await submitComment({
        content: content.trim(),
      });
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="glass-card border border-white/10 rounded-lg p-6 text-center">
        <MessageCircle className="w-8 h-8 text-primary-400 mx-auto mb-3" />
        <p className="text-gray-300 mb-4">Join the conversation! Sign in to leave a comment.</p>
        <Button asChild className="bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-400 hover:to-blue-400">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="glass-card border-white/10">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="flex-shrink-0">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-primary-500/20 text-primary-300">{user.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>

          <form onSubmit={handleSubmit} className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="glass-backdrop border-white/20 focus:border-primary-400 resize-none mb-4"
              rows={3}
            />

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{content.length}/500 characters</span>
              <Button
                type="submit"
                disabled={!content.trim() || isSubmitting || content.length > 500}
                className="bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-400 hover:to-blue-400 disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Posting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function CommentItem({ comment }: { comment: ApiComment }) {
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-card border border-white/10 rounded-lg p-6"
    >
      <div className="flex gap-4">
        <Avatar className="flex-shrink-0">
          <AvatarImage src={comment.author.avatar || undefined} />
          <AvatarFallback className="bg-primary-500/20 text-primary-300">{comment.author.name?.[0] || 'A'}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-white">{comment.author.name || 'Anonymous'}</h4>
            <span className="text-sm text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
          </div>

          <p className="text-gray-300 mb-3 leading-relaxed">{comment.content}</p>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLiked(!liked)}
              className={`text-gray-400 hover:text-red-400 ${liked ? 'text-red-400' : ''}`}
            >
              <Heart className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
              {liked ? 'Liked' : 'Like'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CommentsSection({ postSlug, comments, onCommentAdded }: CommentsSectionProps) {
  const [localComments, setLocalComments] = useState<ApiComment[]>(comments);

  const handleCommentAdded = (newComment: ApiComment) => {
    setLocalComments((prev) => [newComment, ...prev]);
    onCommentAdded?.(newComment);
  };

  return (
    <section className="mt-16">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-6 h-6 text-primary-400" />
        <h2 className="text-2xl font-bold text-white">Comments ({localComments.length})</h2>
      </div>

      <div className="space-y-6">
        <CommentForm postSlug={postSlug} onCommentAdded={handleCommentAdded} />

        {localComments.length > 0 ? (
          <div className="space-y-4">
            {localComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </section>
  );
}
