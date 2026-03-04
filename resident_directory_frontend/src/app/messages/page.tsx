'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, Message } from '@/lib/api-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Button from '@/components/Button';

// PUBLIC_INTERFACE
/**
 * Messages page for viewing received messages
 */
export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMessages();
      setMessages(data);
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.markMessageAsRead(id);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg))
      );
    } catch (err: unknown) {
      console.error('Failed to mark message as read:', err);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold uppercase mb-2">Messages</h1>
              <p className="text-[var(--color-text-secondary)] font-bold">
                {unreadCount > 0 ? `${unreadCount} unread messages` : 'All messages read'}
              </p>
            </div>
            <Button onClick={() => router.push('/messages/new')}>
              ✉️ New Message
            </Button>
          </div>

          {loading ? (
            <Card>
              <p className="text-center font-bold">LOADING MESSAGES...</p>
            </Card>
          ) : error ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-error)]">{error}</p>
            </Card>
          ) : messages.length === 0 ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-text-secondary)]">
                No messages yet
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMarkAsRead(message.id)}
                  className="cursor-pointer"
                >
                  <Card
                    className={!message.read ? 'border-[var(--color-accent)]' : ''}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {!message.read && (
                            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                          )}
                          <h3 className="text-lg font-bold uppercase">{message.subject}</h3>
                          {message.is_broadcast && (
                            <span className="retro-badge text-[var(--color-primary)] text-xs">
                              BROADCAST
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)] font-bold">
                          From: {message.sender_name}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-base leading-relaxed mt-3">{message.content}</p>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
