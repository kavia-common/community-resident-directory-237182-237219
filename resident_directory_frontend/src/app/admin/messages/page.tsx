'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiClient, Message, Resident } from '@/lib/api-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

// PUBLIC_INTERFACE
/**
 * Admin page for sending and managing messages
 */
export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    recipient_id: '',
    subject: '',
    content: '',
    is_broadcast: false,
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [messagesData, residentsData] = await Promise.all([
        apiClient.getMessages(),
        apiClient.getResidents(),
      ]);
      setMessages(messagesData);
      setResidents(residentsData);
    } catch (err: unknown) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const newMessage = await apiClient.sendMessage({
        recipient_id: formData.is_broadcast ? undefined : formData.recipient_id || undefined,
        subject: formData.subject,
        content: formData.content,
        is_broadcast: formData.is_broadcast,
      });
      setMessages((prev) => [newMessage, ...prev]);
      setFormData({ recipient_id: '', subject: '', content: '', is_broadcast: false });
    } catch (err: unknown) {
      alert((err as { message: string }).message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase mb-2">Message Management</h1>
            <p className="text-[var(--color-text-secondary)] font-bold">
              Send messages to residents
            </p>
          </div>

          {/* Send Message Form */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-4">✉️ Send New Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.is_broadcast}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_broadcast: e.target.checked }))
                    }
                    className="w-5 h-5"
                  />
                  <span className="font-bold uppercase text-sm">Broadcast to All Residents</span>
                </label>

                {!formData.is_broadcast && (
                  <div>
                    <label className="block mb-2 font-bold text-sm uppercase text-[var(--color-text)]">
                      Recipient
                    </label>
                    <select
                      className="retro-input"
                      value={formData.recipient_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, recipient_id: e.target.value }))}
                      required={!formData.is_broadcast}
                    >
                      <option value="">Select a resident...</option>
                      {residents.map((resident) => (
                        <option key={resident.id} value={resident.id}>
                          {resident.full_name} ({resident.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <Input
                type="text"
                label="Subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Message subject..."
                required
              />

              <div className="mb-4">
                <label className="block mb-2 font-bold text-sm uppercase text-[var(--color-text)]">
                  Message
                </label>
                <textarea
                  className="retro-input min-h-32"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Message content..."
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" disabled={sending}>
                {sending ? 'SENDING...' : 'SEND MESSAGE'}
              </Button>
            </form>
          </Card>

          {/* Sent Messages */}
          <Card title="📬 Sent Messages">
            {loading ? (
              <p className="text-center font-bold">LOADING...</p>
            ) : messages.length === 0 ? (
              <p className="text-center font-bold text-[var(--color-text-secondary)]">
                No messages yet
              </p>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="pb-4 border-b-2 border-[var(--color-border)] last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold uppercase">{message.subject}</h4>
                          {message.is_broadcast && (
                            <span className="retro-badge text-[var(--color-primary)] text-xs">
                              BROADCAST
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          To: {message.recipient_name || 'All Residents'}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[var(--color-text-secondary)]">
                        {new Date(message.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
