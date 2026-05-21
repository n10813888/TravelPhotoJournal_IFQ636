import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance, { apiBase } from '../axiosConfig';

const toHandle = (name) =>
  '@' + (name || 'user').toLowerCase().replace(/\s+/g, '');

const Avatar = ({ name }) => (
  <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">
    {(name || '?').trim().charAt(0).toUpperCase()}
  </div>
);

const FeedCard = ({ trip }) => {
  const handle = toHandle(trip.ownerName);
  return (
    <article className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={trip.ownerName} />
          <div className="leading-tight">
            <p className="font-semibold">{handle}</p>
            <p className="text-sm text-gray-500">{trip.destination}</p>
          </div>
        </div>
        <Link
          to={`/trips/${trip._id}`}
          className="text-sm font-medium text-gray-700 hover:text-black"
        >
          View
        </Link>
      </header>

      {trip.coverPhoto ? (
        <img
          src={`${apiBase}${trip.coverPhoto}`}
          alt=""
          className="w-full aspect-square object-cover bg-gray-100"
        />
      ) : (
        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
          No cover photo
        </div>
      )}

      {(trip.title || trip.description) && (
        <div className="px-4 py-3">
          <p className="whitespace-pre-line">
            <span className="font-semibold">{handle}</span>
            {trip.description ? ` ${trip.description}` : ` ${trip.title}`}
          </p>
        </div>
      )}
    </article>
  );
};

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
      <div className="max-w-xl mx-auto mt-10 p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (trips === null) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6">
        <p>Loading…</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-6 text-center">
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
    <div className="max-w-xl mx-auto mt-6 px-4 sm:px-0 space-y-6">
      {trips.map((trip) => (
        <FeedCard key={trip._id} trip={trip} />
      ))}
    </div>
  );
};

export default PublicFeed;
