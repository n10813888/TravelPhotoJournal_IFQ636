import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import TripForm from '../components/TripForm';

const NewTrip = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p className="text-red-600">You must be logged in to create a trip.</p>
      </div>
    );
  }

  const submit = async (formData) => {
    const response = await axiosInstance.post('/api/trips', formData, {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    navigate(`/trips/${response.data._id}`);
  };

  return (
    <TripForm
      title="New Trip"
      submitLabel="Create Trip"
      submittingLabel="Creating…"
      onSubmit={submit}
    />
  );
};

export default NewTrip;
