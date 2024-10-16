import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/users/currentUser`, {
      mode: 'cors',

      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())
      .then((response) => setCurrentUser(response.user));
  }, []);

  return (
    <div className='app'>
      <div className='sidebarContainer'>
        <Sidebar currentUser={currentUser} />
      </div>
      <Outlet context={[currentUser, setCurrentUser]} />
    </div>
  );
}

export default App;
