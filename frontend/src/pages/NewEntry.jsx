import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import axiosInstance from '../axiosConfig';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB - matches backend multer limit
const ACCEPTED = /^image\/(jpeg|png|webp|gif)$/;

const today = () => new Date().toISOString().slice(0, 10);

const NewEntry = () => {
  const { id: tripId } = useParams();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [caption, setCaption] = useState('');
  const [entryDate, setEntryDate] = useState(today());
  const [photos, setPhotos] = useState([]); // [{ file, previewUrl }]
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.previewUrl)), [photos]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p className="text-red-600">You must be logged in to add an entry.</p>
      </div>
    );
  }

  const onFileChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    const accepted = [];
    const rejections = [];
    incoming.forEach((file) => {
      if (!ACCEPTED.test(file.type)) {
        rejections.push(`${file.name} — unsupported type`);
      } else if (file.size > MAX_FILE_BYTES) {
        rejections.push(`${file.name} — exceeds 10 MB`);
      } else {
        accepted.push({ file, previewUrl: URL.createObjectURL(file) });
      }
    });
    if (rejections.length > 0) {
      showAlert(rejections.join('\n'), 'Some photos were skipped');
    }
    setPhotos((prev) => [...prev, ...accepted]);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = {};
    if (!entryDate) fieldErrors.entryDate = 'Entry date is required';
    if (photos.length === 0) fieldErrors.photos = 'At least one photo is required';
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const data = new FormData();
    data.append('caption', caption);
    data.append('entryDate', entryDate);
    photos.forEach(({ file }) => data.append('photos', file));

    setSubmitting(true);
    try {
      await axiosInstance.post(`/api/trips/${tripId}/entries`, data, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate(`/trips/${tripId}`, { state: { flash: 'Entry added.' } });
    } catch (err) {
      showAlert(
        err.response?.data?.message || 'Failed to add entry. Please try again.',
        'Error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <Link
        to={`/trips/${tripId}`}
        className="text-gray-700 hover:text-black inline-block mb-4"
      >
        ← Back to trip
      </Link>

      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg" noValidate>
        <h1 className="text-2xl font-bold mb-6">New Journal Entry</h1>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">Caption</span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="What happened today?"
          />
        </label>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">Entry date *</span>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          {errors.entryDate && (
            <span className="text-red-600 text-sm">{errors.entryDate}</span>
          )}
        </label>

        <div className="mb-6">
          <span className="block mb-1 font-medium">Photos *</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            className="block mb-3"
          />
          {errors.photos && (
            <p className="text-red-600 text-sm mb-2">{errors.photos}</p>
          )}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <div key={p.previewUrl} className="relative">
                  <img
                    src={p.previewUrl}
                    alt={`preview ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-black bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white p-3 rounded-lg disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add Entry'}
        </button>
      </form>
    </div>
  );
};

export default NewEntry;
