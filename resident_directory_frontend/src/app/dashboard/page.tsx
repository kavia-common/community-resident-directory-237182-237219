'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, Resident } from '@/lib/api-client';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Link from 'next/link';

// PUBLIC_INTERFACE
/**
 * Main dashboard page for residents with directory search and filter
 */
export default function DashboardPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getResidents();
      setResidents(data);
      setFilteredResidents(data);
    } catch (err: unknown) {
      setError((err as { message: string }).message || 'Failed to load residents');
    } finally {
      setLoading(false);
    }
  };

  const filterResidents = useCallback(() => {
    let filtered = [...residents];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.full_name.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term) ||
          r.unit_number?.toLowerCase().includes(term)
      );
    }

    if (floorFilter) {
      filtered = filtered.filter((r) => r.floor === floorFilter);
    }

    if (unitFilter) {
      filtered = filtered.filter((r) => r.unit_number?.includes(unitFilter));
    }

    setFilteredResidents(filtered);
  }, [residents, searchTerm, floorFilter, unitFilter]);

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    filterResidents();
  }, [searchTerm, floorFilter, unitFilter, residents, filterResidents]);

  const uniqueFloors = Array.from(new Set(residents.map((r) => r.floor).filter(Boolean))).sort();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase mb-2">Resident Directory</h1>
            <p className="text-[var(--color-text-secondary)] font-bold">
              Search and connect with your neighbors
            </p>
          </div>

          {/* Search and Filter Panel */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold uppercase mb-4">🔍 Search & Filter</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="text"
                placeholder="Search by name, email, or unit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <select
                className="retro-input"
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
              >
                <option value="">All Floors</option>
                {uniqueFloors.map((floor) => (
                  <option key={floor} value={floor}>
                    Floor {floor}
                  </option>
                ))}
              </select>

              <Input
                type="text"
                placeholder="Filter by unit..."
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
              />
            </div>

            <p className="mt-4 text-sm font-bold text-[var(--color-text-secondary)]">
              Showing {filteredResidents.length} of {residents.length} residents
            </p>
          </Card>

          {/* Residents Grid */}
          {loading ? (
            <Card>
              <p className="text-center font-bold">LOADING RESIDENTS...</p>
            </Card>
          ) : error ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-error)]">{error}</p>
            </Card>
          ) : filteredResidents.length === 0 ? (
            <Card>
              <p className="text-center font-bold text-[var(--color-text-secondary)]">
                No residents found
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResidents.map((resident) => (
                <Link key={resident.id} href={`/residents/${resident.id}`}>
                  <Card className="hover:transform hover:translate-x-1 hover:translate-y-1 transition-transform cursor-pointer h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold uppercase">{resident.full_name}</h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {resident.email}
                        </p>
                      </div>
                      {resident.role === 'admin' && (
                        <span className="retro-badge text-[var(--color-accent)] text-xs">
                          ADMIN
                        </span>
                      )}
                    </div>

                    {(resident.unit_number || resident.floor) && (
                      <div className="mt-3 pt-3 border-t-2 border-[var(--color-border)]">
                        {resident.unit_number && (
                          <p className="text-sm font-bold">
                            📍 Unit: {resident.unit_number}
                          </p>
                        )}
                        {resident.floor && (
                          <p className="text-sm font-bold">
                            🏢 Floor: {resident.floor}
                          </p>
                        )}
                      </div>
                    )}

                    {resident.phone && (
                      <p className="text-sm font-bold mt-2">
                        📞 {resident.phone}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
