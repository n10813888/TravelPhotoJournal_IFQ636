import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NewTrip from './pages/NewTrip';
import TripDetail from './pages/TripDetail';
import Trips from './pages/Trips';
import EditTrip from './pages/EditTrip';
import NewEntry from './pages/NewEntry';
import EditEntry from './pages/EditEntry';
import PublicFeed from './pages/PublicFeed';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/feed" element={<PublicFeed />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/new" element={<NewTrip />} />
        <Route path="/trips/:id" element={<TripDetail />} />
        <Route path="/trips/:id/edit" element={<EditTrip />} />
        <Route path="/trips/:id/entries/new" element={<NewEntry />} />
        <Route
          path="/trips/:id/entries/:entryId/edit"
          element={<EditEntry />}
        />
      </Routes>
    </Router>
  );
}

export default App;
