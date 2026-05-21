import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import TripCard from '../components/TripCard';

const Trips = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState(location.state?.flash || '');

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(''), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.get('/api/trips', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!cancelled) setTrips(response.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load trips.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p className="text-red-600">You must be logged in to view your trips.</p>
      </div>
    );
  }

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
          🗺
        </div>
        <h1 className="text-2xl font-bold mb-2">No trips yet</h1>
        <p className="text-gray-600 mb-6">
          Start documenting your adventures — your photos and memories all in one place.
        </p>
        <Link
          to="/trips/new"
          className="inline-block bg-black text-white px-5 py-2 rounded-lg"
        >
          + Create your first trip
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      {flash && (
        <div
          role="status"
          className="mb-4 bg-green-100 text-green-800 px-4 py-2 rounded"
        >
          {flash}
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <Link
          to="/trips/new"
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          + New Trip
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <TripCard key={trip._id} trip={trip} />
        ))}
      </div>
    </div>
  );
};

export default Trips;
