'use client';

import { useState, useEffect, FormEvent } from 'react';
import { apiClient, Announcement } from '@/lib/api-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';

// PUBLIC_INTERFACE
/**
 * Admin page for managing community announcements
 */
export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'high' | 'urgent',
  });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAnnouncements();
      setAnnouncements(data);
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      if (editingId) {
        const updated = await apiClient.updateAnnouncement(editingId, formData);
        setAnnouncements((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
        setEditingId(null);
      } else {
        const newAnnouncement = await apiClient.createAnnouncement(formData);
        setAnnouncements((prev) => [newAnnouncement, ...prev]);
      }
      setFormData({ title: '', content: '', priority: 'normal' });
    } catch (err: unknown) {
      alert((err as { message: string }).message || 'Failed to save announcement');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
    });
    setEditingId(announcement.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      await apiClient.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (err: unknown) {
      alert((err as { message: string }).message || 'Failed to delete announcement');
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase mb-2">Announcement Management</h1>
            <p className="text-[var(--color-text-secondary)] font-bold">
              Create and manage community announcements
            </p>
          </div>

          {/* Create/Edit Form */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-4">
              {editingId ? '✏️ Edit Announcement' : '📢 Create New Announcement'}
            </h2>
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Announcement title..."
                required
              />

              <div className="mb-4">
                <label className="block mb-2 font-bold text-sm uppercase text-[var(--color-text)]">
                  Content
                </label>
                <textarea
                  className="retro-input min-h-32"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Announcement content..."
                  rows={4}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 font-bold text-sm uppercase text-[var(--color-text)]">
                  Priority
                </label>
                <select
                  className="retro-input"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, priority: e.target.value as 'normal' | 'high' | 'urgent' }))
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={creating}>
                  {creating ? 'SAVING...' : editingId ? 'UPDATE' : 'CREATE'}
                </Button>
                {editingId && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ title: '', content: '', priority: 'normal' });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Announcements List */}
          {loading ? (
            <Card>
              <p className="text-center font-bold">LOADING...</p>
            </Card>
          ) : error ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-error)]">{error}</p>
            </Card>
          ) : announcements.length === 0 ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-text-secondary)]">
                No announcements yet
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold uppercase">{announcement.title}</h3>
                        <span className="retro-badge text-[var(--color-accent)] text-xs">
                          {announcement.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-base mb-3">{announcement.content}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] font-bold">
                        By: {announcement.author_name} • {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button variant="secondary" onClick={() => handleEdit(announcement)} className="text-xs py-2 px-3">
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => handleDelete(announcement.id)} className="text-xs py-2 px-3">
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
