import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: messages, refetch } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: () => user ? base44.entities.Message.list('-created_date', 500) : [],
    enabled: !!user,
    initialData: []
  });

  const threads = messages.reduce((acc, msg) => {
    const otherId = msg.fromUserId === user?.id ? msg.toUserId : msg.fromUserId;
    if (!acc[otherId]) acc[otherId] = [];
    acc[otherId].push(msg);
    return acc;
  }, {});

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    try {
      await base44.entities.Message.create({
        fromUserId: user.id,
        toUserId: selectedThread,
        content: newMessage.trim(),
        threadId: [user.id, selectedThread].sort().join('-')
      });
      setNewMessage('');
      refetch();
    } catch (error) {
      toast.error('Failed to send');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="w-8 h-8 text-indigo-500" />
          <h1 className="text-4xl font-light">Messages</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 h-[600px]">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-4">Conversations</h3>
            <div className="space-y-2">
              {Object.keys(threads).map(otherId => (
                <button
                  key={otherId}
                  onClick={() => setSelectedThread(otherId)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedThread === otherId ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'
                  }`}
                >
                  <p className="text-sm text-white truncate">{otherId}</p>
                  <p className="text-xs text-neutral-500 truncate">{threads[otherId][0]?.content}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg flex flex-col">
            {selectedThread ? (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {threads[selectedThread]?.map(msg => (
                      <div key={msg.id} className={`flex ${msg.fromUserId === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg ${
                          msg.fromUserId === user.id ? 'bg-indigo-600' : 'bg-neutral-800'
                        }`}>
                          <p className="text-sm text-white">{msg.content}</p>
                          <p className="text-xs text-neutral-400 mt-1">{format(new Date(msg.created_date), 'h:mm a')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-neutral-800 flex gap-3">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="bg-neutral-800 border-neutral-700"
                  />
                  <Button onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}