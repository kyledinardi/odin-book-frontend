import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import UserList from './components/UserList.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import ProfileBar from './components/ProfileBar.jsx';
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

  useEffect(() => {
    function handleNavigation() {
      setError(null);
    }

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

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
            setTheme={(newTheme) => setTheme(newTheme)}
          />
          <div className='main'>
            <div className='profileBar'>
              <ProfileBar
                currentUser={currentUser}
                logoutModal={logoutModal}
                theme={theme}
                setTheme={setTheme}
              />
            </div>
            <Outlet context={[setError, currentUser, setCurrentUser]} />
          </div>
          <UserList
            currentUser={currentUser}
            setCurrentUser={(user) => setCurrentUser(user)}
            setError={(err) => setError(err)}
          />
          <dialog ref={logoutModal}>
            <h2>Are you sure you want to log out?</h2>
            <div className='modalButtons'>
              <button onClick={() => logoutModal.current.close()}>
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('userId');
                  navigate('/login');
                }}
              >
                Log Out
              </button>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}

export default App;
