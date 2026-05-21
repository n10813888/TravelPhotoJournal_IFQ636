import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect width="28" height="28" rx="6" fill="black" />
    <path
      d="M9 11h2l1-1.5h4l1 1.5h2a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z"
      stroke="white"
      strokeWidth="1.4"
      fill="none"
    />
    <circle cx="14" cy="15" r="2.2" stroke="white" strokeWidth="1.4" fill="none" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 font-semibold text-black">
        <Logo />
        <span>Travel Photo Journal</span>
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/trips" className="text-gray-700 hover:text-black">
              My Trips
            </Link>
            <Link to="/profile" className="text-gray-700 hover:text-black">
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-black">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
