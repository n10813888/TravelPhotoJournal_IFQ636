import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import TripForm from '../components/TripForm';

const EditTrip = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.get(`/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!cancelled) {
          if (response.data.userId !== user.id && response.data.userId !== user._id) {
            setLoadError('You can only edit your own trips.');
          } else {
            setTrip(response.data);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err.response?.status === 404
            ? 'Trip not found.'
            : err.response?.data?.message || 'Failed to load trip.'
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, id]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p className="text-red-600">You must be logged in to edit a trip.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p className="text-red-600">{loadError}</p>
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

  const submit = async (formData) => {
    await axiosInstance.put(`/api/trips/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    navigate(`/trips/${id}`, { state: { flash: 'Trip updated.' } });
  };

  return (
    <TripForm
      title="Edit Trip"
      trip={trip}
      submitLabel="Save Changes"
      submittingLabel="Saving…"
      onSubmit={submit}
    />
  );
};

export default EditTrip;
