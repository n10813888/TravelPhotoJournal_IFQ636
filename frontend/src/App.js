import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NewTrip from './pages/NewTrip';
import TripDetail from './pages/TripDetail';
import Trips from './pages/Trips';
import EditTrip from './pages/EditTrip';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/new" element={<NewTrip />} />
        <Route path="/trips/:id" element={<TripDetail />} />
        <Route path="/trips/:id/edit" element={<EditTrip />} />
      </Routes>
    </Router>
  );
}

export default App;
