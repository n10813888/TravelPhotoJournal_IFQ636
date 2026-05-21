import { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import TripCard from '../components/TripCard';

const PublicFeed = () => {
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.get('/api/trips/public');
        if (!cancelled) setTrips(response.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load feed.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (trips === null) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p>Loading…</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-6 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-3xl">
          🌍
        </div>
        <h1 className="text-2xl font-bold mb-2">No public trips yet</h1>
        <p className="text-gray-600">
          Public trips shared by other travellers will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">Public Feed</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <TripCard key={trip._id} trip={trip} />
        ))}
      </div>
    </div>
  );
};

export default PublicFeed;
