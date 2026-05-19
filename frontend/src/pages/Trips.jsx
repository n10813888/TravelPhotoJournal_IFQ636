import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Trips = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.get('/api/trips', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (cancelled) return;
        if (!response.data || response.data.length === 0) {
          navigate('/trips/new', { replace: true });
          return;
        }
        setTrips(response.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load trips.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, navigate]);

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

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Trips</h1>
        <Link
          to="/trips/new"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          New Trip
        </Link>
      </div>
      <ul className="space-y-3">
        {trips.map((trip) => (
          <li key={trip._id} className="bg-white p-4 shadow rounded">
            <Link
              to={`/trips/${trip._id}`}
              className="text-lg font-semibold text-blue-700"
            >
              {trip.title}
            </Link>
            <p className="text-gray-600">{trip.destination}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Trips;
