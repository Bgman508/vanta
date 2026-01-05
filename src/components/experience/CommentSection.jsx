import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function CommentSection({ experienceId, user }) {
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const { data: comments, refetch } = useQuery({
    queryKey: ['comments', experienceId],
    queryFn: () => base44.entities.Comment.filter({ experienceId }, '-created_date'),
    initialData: []
  });

  const { data: users } = useQuery({
    queryKey: ['comment-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
    initialData: []
  });

  const handlePost = async () => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    if (!newComment.trim()) return;

    setPosting(true);
    try {
      await base44.entities.Comment.create({
        experienceId,
        userId: user.id,
        content: newComment.trim()
      });

      setNewComment('');
      toast.success('Comment posted');
      refetch();
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await base44.entities.Comment.delete(commentId);
      toast.success('Comment deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getUser = (userId) => users.find(u => u.id === userId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-medium text-white">Comments ({comments.length})</h3>
      </div>

      {user && (
        <div className="flex gap-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={3}
            className="bg-neutral-900 border-neutral-800"
          />
          <Button onClick={handlePost} disabled={posting || !newComment.trim()} className="bg-indigo-600 hover:bg-indigo-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {comments.map(comment => {
          const commentUser = getUser(comment.userId);
          return (
            <div key={comment.id} className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center text-xs">
                    {commentUser?.full_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{commentUser?.full_name}</p>
                    <p className="text-xs text-neutral-500">{format(new Date(comment.created_date), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
                {user?.id === comment.userId && (
                  <Button onClick={() => handleDelete(comment.id)} size="icon" variant="ghost" className="text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-neutral-300">{comment.content}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}