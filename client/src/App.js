import { Route, Routes } from 'react-router-dom';

import Home from './views/Home';
import Login from './views/user/Login';
import Profile from './views/user/Profile';
import Register from './views/user/Register';

import Navbar from './components/Navbar';
import NotFound from './components/NotFound';
import PrivateRoute from './components/PrivateRouter';

function App() {
  return (
    <div className="App">
      <header>
        <Navbar/>
      </header>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="*" element={<NotFound/>}/>
      </Routes>
    </div>
  );
}

export default App;
