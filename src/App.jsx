import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import StudentPortal from './pages/StudentPortal';
import Login from './pages/Login';

function AppContent() {
  const location = useLocation();

  return (
    <div className='min-h-screen flex flex-col'>
      {/* Cacher le header et footer sur la page d'accueil */}
      {location.pathname !== '/' && <Header />}
      <main className='grow'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/student' element={<StudentPortal />} />
          <Route path='/login' element={<Login />} />
        </Routes>
      </main>
      {/* Cacher le footer sur la page d'accueil */}
      {location.pathname !== '/' && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
