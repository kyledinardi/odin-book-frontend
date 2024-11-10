import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import UserList from './components/UserList.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import backendFetch from '../ helpers/backendFetch';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('');
  const logoutModal = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let themeName = localStorage.getItem('theme');

    if (!themeName) {
      const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
      themeName = isDark ? 'dark' : 'light';
      localStorage.setItem('theme', themeName);
    }

    setTheme(themeName);
  }, []);

  useEffect(() => {
    if (!error) {
      backendFetch(setError, '/users/currentUser').then((response) =>
        setCurrentUser(response.user),
      );
    }
  }, [error]);

  return (
    <div className='themeWrapper' data-theme={theme}>
      {error ? (
        <ErrorPage
          data-theme={theme}
          error={error}
          setError={(err) => setError(err)}
        />
      ) : (
        <div className='app' data-theme={theme}>
          <Sidebar
            currentUser={currentUser}
            logoutModal={logoutModal}
            theme={theme}
            setTheme={(t) => setTheme(t)}
          />
          <Outlet
            context={[setError, currentUser, setCurrentUser, theme, setTheme]}
          />
          <UserList
            currentUser={currentUser}
            setCurrentUser={(user) => setCurrentUser(user)}
            setError={(err) => setError(err)}
          />
          <dialog ref={logoutModal}>
            <h2>Are you sure you want to log out?</h2>
            <div className='modalButtons'>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('userId');
                  navigate('/login');
                }}
              >
                Log Out
              </button>
              <button onClick={() => logoutModal.current.close()}>
                Cancel
              </button>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}

export default App;
