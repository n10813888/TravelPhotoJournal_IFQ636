import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance, { apiBase } from '../axiosConfig';
import ConfirmDialog from '../components/ConfirmDialog';

const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const TripDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState(location.state?.flash || '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.get(`/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!cancelled) setTrip(response.data);
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 404) {
          setError('Trip not found.');
        } else {
          setError(err.response?.data?.message || 'Failed to load trip.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, id]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(''), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate('/trips', { state: { flash: 'Trip deleted.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete trip.');
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p className="text-red-600">You must be logged in to view this trip.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p className="text-red-600">{error}</p>
        <Link to="/trips" className="text-black underline mt-4 inline-block">
          ← Back to trips
        </Link>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p>Loading…</p>
      </div>
    );
  }

  const isOwner = user.id === trip.userId || user._id === trip.userId;
  const dateRange = [formatDate(trip.startDate), formatDate(trip.endDate)]
    .filter(Boolean)
    .join(' – ');

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4 sm:p-6">
      <Link to="/trips" className="text-gray-700 hover:text-black inline-block mb-4">
        ← Back to trips
      </Link>

      {flash && (
        <div
          role="status"
          className="mb-4 bg-green-100 text-green-800 px-4 py-2 rounded"
        >
          {flash}
        </div>
      )}

      {trip.coverPhoto && (
        <img
          src={`${apiBase}${trip.coverPhoto}`}
          alt={trip.title}
          className="w-full h-56 sm:h-80 object-cover rounded mb-6"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">{trip.title}</h1>
              <p className="text-gray-700">{trip.destination}</p>
              <p className="text-gray-500 text-sm mt-1">{dateRange}</p>
            </div>
            <span
              className={`inline-block px-3 py-1 text-sm rounded-full ${
                trip.isPublic
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {trip.isPublic ? 'Public' : 'Private'}
            </span>
          </div>

          {trip.description && (
            <p className="text-gray-800 whitespace-pre-line mb-6">
              {trip.description}
            </p>
          )}

          <section className="bg-gray-50 border border-dashed border-gray-300 rounded p-6 text-center text-gray-500">
            Journal entries coming soon.
          </section>
        </div>

        {isOwner && (
          <aside className="lg:col-span-1">
            <div className="bg-white shadow rounded p-4 space-y-3">
              <h2 className="font-semibold">Actions</h2>
              <Link
                to={`/trips/${trip._id}/edit`}
                className="block w-full text-center bg-black text-white px-4 py-2 rounded-lg"
              >
                Edit Trip
              </Link>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="block w-full bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete Trip
              </button>
            </div>
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete trip?"
        message="This will permanently delete the trip and all its journal entries."
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default TripDetail;
