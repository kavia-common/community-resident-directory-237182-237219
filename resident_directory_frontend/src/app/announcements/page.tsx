'use client';

import { useState, useEffect } from 'react';
import { apiClient, Announcement } from '@/lib/api-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';

// PUBLIC_INTERFACE
/**
 * Announcements page showing community announcements and updates
 */
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-[var(--color-error)]';
      case 'high':
        return 'text-[var(--color-accent)]';
      default:
        return 'text-[var(--color-primary)]';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '🚨';
      case 'high':
        return '⚠️';
      default:
        return '📢';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase mb-2">Announcements</h1>
            <p className="text-[var(--color-text-secondary)] font-bold">
              Stay updated with community news
            </p>
          </div>

          {loading ? (
            <Card>
              <p className="text-center font-bold">LOADING ANNOUNCEMENTS...</p>
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
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <Card key={announcement.id}>
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-bold uppercase flex items-center gap-2">
                      <span className={getPriorityColor(announcement.priority)}>
                        {getPriorityIcon(announcement.priority)}
                      </span>
                      {announcement.title}
                    </h2>
                    <span className={`retro-badge ${getPriorityColor(announcement.priority)} text-xs`}>
                      {announcement.priority.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-base leading-relaxed mb-4">{announcement.content}</p>

                  <div className="retro-divider" />

                  <div className="flex justify-between items-center text-sm text-[var(--color-text-secondary)] font-bold">
                    <span>By: {announcement.author_name}</span>
                    <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
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
