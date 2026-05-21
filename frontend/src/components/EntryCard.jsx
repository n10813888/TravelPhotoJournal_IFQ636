import { apiBase } from '../axiosConfig';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const EntryCard = ({ entry }) => (
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
      <p className="text-sm text-gray-500">📅 {formatDate(entry.entryDate)}</p>
      {entry.caption && (
        <p className="text-gray-800 mt-1 whitespace-pre-line">{entry.caption}</p>
      )}
    </div>
  </li>
);

export default EntryCard;
