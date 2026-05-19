import { useState } from 'react';

const toDateInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const buildInitialForm = (trip) => ({
  title: trip?.title || '',
  destination: trip?.destination || '',
  startDate: toDateInput(trip?.startDate),
  endDate: toDateInput(trip?.endDate),
  description: trip?.description || '',
  isPublic: !!trip?.isPublic,
});

const validate = ({ title, destination, startDate, endDate }) => {
  const errors = {};
  if (!title.trim()) errors.title = 'Title is required';
  if (!destination.trim()) errors.destination = 'Destination is required';
  if (!startDate) errors.startDate = 'Start date is required';
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    errors.endDate = 'End date must be on or after start date';
  }
  return errors;
};

const TripForm = ({
  title,
  trip,
  submitLabel,
  submittingLabel,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => buildInitialForm(trip));
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const update = (field) => (e) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const data = new FormData();
    data.append('title', form.title.trim());
    data.append('destination', form.destination.trim());
    data.append('startDate', form.startDate);
    data.append('endDate', form.endDate || '');
    data.append('description', form.description || '');
    data.append('isPublic', form.isPublic ? 'true' : 'false');
    if (coverPhoto) data.append('coverPhoto', coverPhoto);

    setSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Failed to save trip. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-md rounded"
        noValidate
      >
        <h1 className="text-2xl font-bold mb-6">{title}</h1>

        {serverError && (
          <p className="text-red-600 mb-4" role="alert">
            {serverError}
          </p>
        )}

        <label className="block mb-4">
          <span className="block mb-1 font-medium">Title *</span>
          <input
            type="text"
            value={form.title}
            onChange={update('title')}
            className="w-full p-2 border rounded"
          />
          {errors.title && (
            <span className="text-red-600 text-sm">{errors.title}</span>
          )}
        </label>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">Destination *</span>
          <input
            type="text"
            value={form.destination}
            onChange={update('destination')}
            className="w-full p-2 border rounded"
          />
          {errors.destination && (
            <span className="text-red-600 text-sm">{errors.destination}</span>
          )}
        </label>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <label className="block">
            <span className="block mb-1 font-medium">Start date *</span>
            <input
              type="date"
              value={form.startDate}
              onChange={update('startDate')}
              className="w-full p-2 border rounded"
            />
            {errors.startDate && (
              <span className="text-red-600 text-sm">{errors.startDate}</span>
            )}
          </label>

          <label className="block">
            <span className="block mb-1 font-medium">End date</span>
            <input
              type="date"
              value={form.endDate}
              onChange={update('endDate')}
              className="w-full p-2 border rounded"
            />
            {errors.endDate && (
              <span className="text-red-600 text-sm">{errors.endDate}</span>
            )}
          </label>
        </div>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">
            {trip ? 'Replace cover photo' : 'Cover photo'}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
          />
        </label>

        <label className="block mb-4">
          <span className="block mb-1 font-medium">Description</span>
          <textarea
            value={form.description}
            onChange={update('description')}
            rows={4}
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={update('isPublic')}
          />
          <span>Make this trip public</span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </form>
    </div>
  );
};

export default TripForm;
