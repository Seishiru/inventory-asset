import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare, Send, Trash2, Edit2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
}

interface CommentsSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  onEditComment: (id: string, text: string) => void;
  onDeleteComment: (id: string) => void;
  currentUser: string;
}

export function CommentsSection({ comments, onAddComment, onEditComment, onDeleteComment, currentUser }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
      toast.success('Comment added');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      onEditComment(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
      toast.success('Comment updated');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Press Ctrl+Enter to submit</span>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              style={{ backgroundColor: '#06C755' }}
              className="text-white hover:opacity-90"
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <ScrollArea className="h-[300px]">
          {sortedComments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            <div className="space-y-3">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium">{comment.author}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(comment.timestamp).toLocaleString()}
                        {comment.edited && ' (edited)'}
                      </span>
                    </div>
                    {comment.author === currentUser && (
                      <div className="flex gap-1">
                        {editingId !== comment.id && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => startEdit(comment)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                onDeleteComment(comment.id);
                                toast.success('Comment deleted');
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[60px]"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={saveEdit}
                          style={{ backgroundColor: '#06C755' }}
                          className="text-white hover:opacity-90"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
