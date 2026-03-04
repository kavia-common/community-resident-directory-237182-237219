'use client';

import { useState, useEffect } from 'react';
import { apiClient, Resident, Announcement, Message } from '@/lib/api-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import Card from '@/components/Card';

// PUBLIC_INTERFACE
/**
 * Admin dashboard with overview statistics and recent activity
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalResidents: 0,
    activeResidents: 0,
    totalAnnouncements: 0,
    unreadMessages: 0,
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [residents, announcements, messages] = await Promise.all([
        apiClient.getResidents(),
        apiClient.getAnnouncements(),
        apiClient.getMessages(),
      ]);

      setStats({
        totalResidents: residents.length,
        activeResidents: residents.filter((r: Resident) => r.is_active).length,
        totalAnnouncements: announcements.length,
        unreadMessages: messages.filter((m: Message) => !m.read).length,
      });

      setRecentAnnouncements(announcements.slice(0, 5));
    } catch (err: unknown) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase mb-2">Admin Dashboard</h1>
            <p className="text-[var(--color-text-secondary)] font-bold">
              Overview of community management
            </p>
          </div>

          {loading ? (
            <Card>
              <p className="text-center font-bold">LOADING...</p>
            </Card>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                      {stats.totalResidents}
                    </p>
                    <p className="text-sm font-bold uppercase text-[var(--color-text-secondary)]">
                      Total Residents
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[var(--color-success)] mb-2">
                      {stats.activeResidents}
                    </p>
                    <p className="text-sm font-bold uppercase text-[var(--color-text-secondary)]">
                      Active Residents
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[var(--color-accent)] mb-2">
                      {stats.totalAnnouncements}
                    </p>
                    <p className="text-sm font-bold uppercase text-[var(--color-text-secondary)]">
                      Announcements
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                      {stats.unreadMessages}
                    </p>
                    <p className="text-sm font-bold uppercase text-[var(--color-text-secondary)]">
                      Unread Messages
                    </p>
                  </div>
                </Card>
              </div>

              {/* Recent Announcements */}
              <Card title="📢 Recent Announcements">
                {recentAnnouncements.length === 0 ? (
                  <p className="text-center text-[var(--color-text-secondary)] font-bold">
                    No announcements yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentAnnouncements.map((announcement) => (
                      <div key={announcement.id} className="pb-4 border-b-2 border-[var(--color-border)] last:border-0">
                        <h4 className="font-bold uppercase mb-1">{announcement.title}</h4>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {announcement.content.substring(0, 100)}
                          {announcement.content.length > 100 ? '...' : ''}
                        </p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-2 font-bold">
                          {new Date(announcement.created_at).toLocaleDateString()} • {announcement.author_name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
