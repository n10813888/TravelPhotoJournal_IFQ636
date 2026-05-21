import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `block px-3 py-2 rounded-lg text-sm ${
    isActive ? 'bg-gray-100 font-semibold text-black' : 'text-gray-700 hover:bg-gray-50'
  }`;

const AdminLayout = ({ children }) => (
  <div className="flex">
    <aside className="w-48 shrink-0 border-r border-gray-200 min-h-[80vh] p-4">
      <p className="text-xs text-gray-500 font-semibold tracking-wider mb-3">
        ADMIN
      </p>
      <nav className="space-y-1">
        <NavLink to="/admin" end className={linkClass}>
          Overview
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          Users
        </NavLink>
        <NavLink to="/admin/moderation" className={linkClass}>
          Moderation
        </NavLink>
      </nav>
    </aside>
    <main className="flex-1 p-6">{children}</main>
  </div>
);

export default AdminLayout;
