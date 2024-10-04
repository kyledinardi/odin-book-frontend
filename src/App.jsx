import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/users/currentUser', {
      mode: 'cors',

      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())
      .then((response) => setCurrentUser(response.user));
  }, []);

  return (
    <>
      <Sidebar />
      <Outlet context={[currentUser]} />
    </>
  );
}

export default App;
