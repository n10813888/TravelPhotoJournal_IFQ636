import { Link } from 'react-router-dom';
import { apiBase } from '../axiosConfig';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const EntryCard = ({ entry, tripId, isOwner, onDelete }) => (
  <li className="bg-white shadow rounded-lg overflow-hidden">
    {entry.photos.length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
        {entry.photos.map((url) => (
          <a
            key={url}
            href={`${apiBase}${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <img
              src={`${apiBase}${url}`}
              alt=""
              className="w-full h-32 object-cover hover:opacity-90 transition"
            />
          </a>
        ))}
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">📅 {formatDate(entry.entryDate)}</p>
        {isOwner && (
          <div className="flex gap-3 text-sm">
            <Link
              to={`/trips/${tripId}/entries/${entry._id}/edit`}
              className="text-gray-700 hover:text-black underline"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDelete(entry)}
              className="text-red-600 hover:text-red-800 underline"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {entry.caption && (
        <p className="text-gray-800 mt-2 whitespace-pre-line">{entry.caption}</p>
      )}
    </div>
  </li>
);

export default EntryCard;
