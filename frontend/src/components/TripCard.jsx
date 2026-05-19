import { Link } from 'react-router-dom';

const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const dateRange = (start, end) => {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s} – ${e}`;
  return s || '';
};

const apiBase = 'http://localhost:5001';

const TripCard = ({ trip }) => (
  <Link
    to={`/trips/${trip._id}`}
    className="block bg-white shadow rounded overflow-hidden hover:shadow-md transition"
  >
    {trip.coverPhoto ? (
      <img
        src={`${apiBase}${trip.coverPhoto}`}
        alt={trip.title}
        className="w-full h-40 object-cover"
      />
    ) : (
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-400">
        No cover photo
      </div>
    )}
    <div className="p-4">
      <h2 className="text-lg font-semibold truncate">{trip.title}</h2>
      <p className="text-gray-600 truncate">{trip.destination}</p>
      <p className="text-sm text-gray-500 mt-1">
        {dateRange(trip.startDate, trip.endDate)}
      </p>
    </div>
  </Link>
);

export default TripCard;
