'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, AuditLog } from '@/lib/api-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminSidebar from '@/components/AdminSidebar';
import Card from '@/components/Card';
import Input from '@/components/Input';

// PUBLIC_INTERFACE
/**
 * Admin page for viewing audit logs of system activities
 */
export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAuditLogs({ limit: 100 });
      setLogs(data);
      setFilteredLogs(data);
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = useCallback(() => {
    let filtered = [...logs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.user_email.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.resource_type.toLowerCase().includes(term)
      );
    }

    if (actionFilter) {
      filtered = filtered.filter((log) => log.action === actionFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, actionFilter, logs, filterLogs]);

  const uniqueActions = Array.from(new Set(logs.map((log) => log.action))).sort();

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-[var(--color-background)]">
        <AdminSidebar />
        
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase mb-2">Audit Logs</h1>
            <p className="text-[var(--color-text-secondary)] font-bold">
              Track all system activities and changes
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-4">🔍 Filter Logs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Search by user, action, or resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="retro-input"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">All Actions</option>
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-4 text-sm font-bold text-[var(--color-text-secondary)]">
              Showing {filteredLogs.length} of {logs.length} logs
            </p>
          </Card>

          {/* Logs List */}
          {loading ? (
            <Card>
              <p className="text-center font-bold">LOADING...</p>
            </Card>
          ) : error ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-error)]">{error}</p>
            </Card>
          ) : filteredLogs.length === 0 ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-text-secondary)]">
                No logs found
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <Card key={log.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold uppercase text-sm">{log.action}</h4>
                        <span className="retro-badge text-[var(--color-accent)] text-xs">
                          {log.resource_type}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        User: {log.user_email}
                      </p>
                      {log.resource_id && (
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                          Resource ID: {log.resource_id}
                        </p>
                      )}
                      {log.ip_address && (
                        <p className="text-xs text-[var(--color-text-secondary)]">
                          IP: {log.ip_address}
                        </p>
                      )}
                      {log.details && (
                        <pre className="text-xs mt-2 p-2 bg-[var(--color-background)] border-2 border-[var(--color-border)] overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] whitespace-nowrap ml-4">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
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
