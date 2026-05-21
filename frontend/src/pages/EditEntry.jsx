import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import axiosInstance, { apiBase } from '../axiosConfig';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED = /^image\/(jpeg|png|webp|gif)$/;

const toDateInput = (iso) => {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
};

const EditEntry = () => {
  const { id: tripId, entryId } = useParams();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const [caption, setCaption] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [removedPhotos, setRemovedPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.get(`/api/trips/${tripId}/entries`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (cancelled) return;
        const entry = response.data.find((e) => e._id === entryId);
        if (!entry) {
          setLoadError('Entry not found.');
          return;
        }
        setCaption(entry.caption || '');
        setEntryDate(toDateInput(entry.entryDate));
        setExistingPhotos(entry.photos || []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.response?.data?.message || 'Failed to load entry.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, tripId, entryId]);

  useEffect(
    () => () => newPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl)),
    [newPhotos]
  );

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6">
        <p className="text-red-600">You must be logged in.</p>
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
    setNewPhotos((prev) => [...prev, ...accepted]);
    e.target.value = '';
  };

  const removeExisting = (url) => {
    setExistingPhotos((prev) => prev.filter((p) => p !== url));
    setRemovedPhotos((prev) => [...prev, url]);
  };

  const removeNew = (idx) => {
    setNewPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (existingPhotos.length + newPhotos.length === 0) {
      showAlert('At least one photo is required.', 'Cannot save');
      return;
    }

    const data = new FormData();
    data.append('caption', caption);
    data.append('entryDate', entryDate);
    if (removedPhotos.length > 0) {
      data.append('removePhotos', JSON.stringify(removedPhotos));
    }
    newPhotos.forEach(({ file }) => data.append('photos', file));

    setSubmitting(true);
    try {
      await axiosInstance.put(
        `/api/trips/${tripId}/entries/${entryId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      navigate(`/trips/${tripId}`, { state: { flash: 'Entry updated.' } });
    } catch (err) {
      showAlert(
        err.response?.data?.message || 'Failed to save entry. Please try again.',
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

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-md rounded-lg"
        noValidate
      >
        <h1 className="text-2xl font-bold mb-6">Edit Journal Entry</h1>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">Caption</span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg"
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
        </label>

        <div className="mb-4">
          <span className="block mb-2 font-medium">Existing photos</span>
          {existingPhotos.length === 0 ? (
            <p className="text-gray-500 text-sm">All existing photos removed.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {existingPhotos.map((url) => (
                <div key={url} className="relative">
                  <img
                    src={`${apiBase}${url}`}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeExisting(url)}
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

        <div className="mb-6">
          <span className="block mb-2 font-medium">Add more photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            className="block mb-3"
          />
          {newPhotos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {newPhotos.map((p, i) => (
                <div key={p.previewUrl} className="relative">
                  <img
                    src={p.previewUrl}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNew(i)}
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
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditEntry;
