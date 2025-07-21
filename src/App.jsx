import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import ErrorPage from './pages/ErrorPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import UserList from './components/UserList.jsx';
import ProfileBar from './components/ProfileBar.jsx';
import { GET_CURRENT_USER } from './graphql/queries';
import socket from '../utils/socket';

function App() {
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const logoutModal = useRef(null);
  const navigate = useNavigate();
  const currentUserResult = useQuery(GET_CURRENT_USER);

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
    if (currentUserResult.data && !error) {
      const { _count, id } = currentUserResult.data.getCurrentUser;
      setNotificationCount(_count.receivedNotifications);
      socket.emit('joinUserRoom', id);
    }
  }, [currentUserResult.data, error]);

  useEffect(() => {
    function incrementNotificationCount() {
      setNotificationCount(notificationCount + 1);
    }

    socket.on('receiveNotification', incrementNotificationCount);
    return () => socket.off('receiveNotification', incrementNotificationCount);
  }, [notificationCount]);

  useEffect(() => {
    function handleNavigation() {
      setError(null);
    }

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  return (
    <div className='themeWrapper' data-theme={theme}>
      {currentUserResult.error ? (
        <ErrorPage
          data-theme={theme}
          error={currentUserResult.error}
          setError={(err) => setError(err)}
        />
      ) : (
        <div className='app' data-theme={theme}>
          <Sidebar
            currentUser={currentUserResult.data?.getCurrentUser}
            logoutModal={logoutModal}
            notificationCount={notificationCount}
            theme={theme}
            setTheme={(newTheme) => setTheme(newTheme)}
          />
          <div className='main'>
            <div className='profileBar'>
              <ProfileBar
                currentUser={currentUserResult.data?.getCurrentUser}
                logoutModal={logoutModal}
                theme={theme}
                setTheme={setTheme}
              />
            </div>
            <Outlet
              context={[
                setError,
                currentUserResult.data?.getCurrentUser,
                currentUserResult.refetch(),
                notificationCount,
                setNotificationCount,
              ]}
            />
          </div>
          <UserList
            currentUser={currentUserResult.data?.getCurrentUser}
            setCurrentUser={() => currentUserResult.refetch()}
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
