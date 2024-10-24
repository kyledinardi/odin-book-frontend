import { useEffect, useState } from 'react';
import Sidebar from './Sidebar.jsx';

function ErrorPage() {
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
      <div className='error'>
        <h1>404</h1>
        <h2>Page not found</h2>
      </div>
    </div>
  );
}

export default ErrorPage;
