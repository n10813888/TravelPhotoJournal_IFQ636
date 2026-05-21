import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import axiosInstance from '../axiosConfig';
import ConfirmDialog from '../components/ConfirmDialog';

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

const AdminUsers = () => {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(null); // { type: 'deactivate'|'delete', user }
  const [busy, setBusy] = useState(false);

  const authHeaders = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await axiosInstance.get('/api/admin/users', {
          headers: authHeaders,
        });
        if (!cancelled) setUsers(response.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to load users.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAction = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.type === 'deactivate') {
        await axiosInstance.patch(
          `/api/admin/users/${pending.user._id}/deactivate`,
          {},
          { headers: authHeaders }
        );
        setUsers((prev) =>
          prev.map((u) =>
            u._id === pending.user._id ? { ...u, isActive: false } : u
          )
        );
      } else {
        await axiosInstance.delete(`/api/admin/users/${pending.user._id}`, {
          headers: authHeaders,
        });
        setUsers((prev) => prev.filter((u) => u._id !== pending.user._id));
      }
      setPending(null);
    } catch (err) {
      showAlert(err.response?.data?.message || 'Action failed.', 'Error');
    } finally {
      setBusy(false);
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (users === null) return <p>Loading…</p>;

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const isSelf = u._id === user.id || u._id === user._id;
              return (
                <tr key={u._id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">
                    {u.isActive === false ? (
                      <span className="text-gray-500">Deactivated</span>
                    ) : (
                      <span className="text-green-700">Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isSelf && (
                      <div className="flex gap-3 justify-end">
                        {u.isActive !== false && (
                          <button
                            type="button"
                            onClick={() =>
                              setPending({ type: 'deactivate', user: u })
                            }
                            className="text-gray-700 hover:text-black underline"
                          >
                            Deactivate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setPending({ type: 'delete', user: u })
                          }
                          className="text-red-600 hover:text-red-800 underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!pending}
        title={pending?.type === 'delete' ? 'Delete user?' : 'Deactivate user?'}
        message={
          pending?.type === 'delete'
            ? `This will permanently delete ${pending?.user?.name} and all their trips and entries.`
            : `${pending?.user?.name} will no longer be able to log in.`
        }
        confirmLabel={pending?.type === 'delete' ? 'Delete' : 'Deactivate'}
        busy={busy}
        onConfirm={runAction}
        onCancel={() => setPending(null)}
      />
    </>
  );
};

export default AdminUsers;
