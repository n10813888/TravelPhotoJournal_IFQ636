import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import StatTile from '../components/StatTile';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!cancelled) setStats(response.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load stats.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Overview</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total users" value={stats?.users} />
        <StatTile label="Active trips" value={stats?.trips} />
        <StatTile label="Journal entries" value={stats?.entries} />
        <StatTile label="Public trips" value={stats?.publicTrips} />
      </div>
    </div>
  );
};

export default AdminDashboard;
