import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import UserList from './components/UserList.jsx';

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
      <Sidebar currentUser={currentUser} />
      <Outlet context={[currentUser, setCurrentUser]} />
      <UserList
        currentUser={currentUser}
        setCurrentUser={(user) => setCurrentUser(user)}
      />
    </div>
  );
}

export default App;
