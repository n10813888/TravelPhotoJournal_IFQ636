import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import axiosInstance from '../axiosConfig';
import ConfirmDialog from '../components/ConfirmDialog';

const tabClass = (active) =>
  `px-4 py-2 -mb-px border-b-2 ${
    active
      ? 'border-black text-black font-semibold'
      : 'border-transparent text-gray-500 hover:text-black'
  }`;

const AdminModeration = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [tab, setTab] = useState('trips');
  const [trips, setTrips] = useState(null);
  const [entries, setEntries] = useState(null);
  const [pending, setPending] = useState(null); // { type: 'trip'|'entry', item }
  const [busy, setBusy] = useState(false);

  const authHeaders = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tripsRes, entriesRes] = await Promise.all([
          axiosInstance.get('/api/admin/trips', { headers: authHeaders }),
          axiosInstance.get('/api/admin/entries', { headers: authHeaders }),
        ]);
        if (cancelled) return;
        setTrips(tripsRes.data);
        setEntries(entriesRes.data);
      } catch (err) {
        if (!cancelled) {
          showAlert(
            err.response?.data?.message || 'Failed to load moderation data.',
            'Error'
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runDelete = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.type === 'trip') {
        await axiosInstance.delete(`/api/admin/trips/${pending.item._id}`, {
          headers: authHeaders,
        });
        setTrips((prev) => prev.filter((t) => t._id !== pending.item._id));
        // Cascaded entries vanish from the entries tab too
        setEntries((prev) =>
          prev.filter((e) => e.tripId !== pending.item._id)
        );
      } else {
        await axiosInstance.delete(`/api/admin/entries/${pending.item._id}`, {
          headers: authHeaders,
        });
        setEntries((prev) => prev.filter((e) => e._id !== pending.item._id));
      }
      setPending(null);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Delete failed.', 'Error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Moderation</h1>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          type="button"
          className={tabClass(tab === 'trips')}
          onClick={() => setTab('trips')}
        >
          All Trips
        </button>
        <button
          type="button"
          className={tabClass(tab === 'entries')}
          onClick={() => setTab('entries')}
        >
          All Entries
        </button>
      </div>

      {tab === 'trips' &&
        (trips === null ? (
          <p>Loading…</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Visibility</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t._id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3">{t.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.ownerName || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {t.isPublic ? 'Public' : 'Private'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setPending({ type: 'trip', item: t })}
                        className="text-red-600 hover:text-red-800 underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {trips.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      No trips.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'entries' &&
        (entries === null ? (
          <p>Loading…</p>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Caption</th>
                  <th className="px-4 py-3 font-medium">Trip</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e._id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 max-w-xs truncate">
                      {e.caption || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {e.tripTitle || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {e.ownerName || '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setPending({ type: 'entry', item: e })}
                        className="text-red-600 hover:text-red-800 underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      No entries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}

      <ConfirmDialog
        open={!!pending}
        title={pending?.type === 'trip' ? 'Delete trip?' : 'Delete entry?'}
        message={
          pending?.type === 'trip'
            ? 'This will permanently delete the trip and all its journal entries.'
            : 'This will permanently delete the entry and all its photos.'
        }
        confirmLabel="Delete"
        busy={busy}
        onConfirm={runDelete}
        onCancel={() => setPending(null)}
      />
    </>
  );
};

export default AdminModeration;
