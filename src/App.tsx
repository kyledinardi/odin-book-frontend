import { useEffect, useRef, useState } from 'react';

import { useApolloClient, useQuery } from '@apollo/client';
import { Outlet, useNavigate } from 'react-router-dom';

import ProfileBar from './components/ProfileBar.tsx';
import Sidebar from './components/Sidebar.tsx';
import UserList from './components/UserList.tsx';
import { GET_CURRENT_USER } from './graphql/queries.ts';
import ErrorPage from './pages/ErrorPage.tsx';
import logError from './utils/logError.ts';
import navigateTo from './utils/navigateTo.ts';
import socket from './utils/socket.ts';

const App = () => {
  const [theme, setTheme] = useState('');
  const [notifCount, setNotifCount] = useState(0);
  const logoutModal = useRef<HTMLDialogElement>(null);

  const navigate = useNavigate();
  const currentUserResult = useQuery(GET_CURRENT_USER);
  const client = useApolloClient();

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
    client.reFetchObservableQueries().catch(logError);
  }, [client]);

  useEffect(() => {
    if (currentUserResult.data) {
      const { _count, id } = currentUserResult.data.getCurrentUser;
      socket.emit('joinUserRoom', id);
      setNotifCount(_count.receivedNotifications);
    }
  }, [currentUserResult.data]);

  useEffect(() => {
    function incrementNotifCount() {
      setNotifCount(notifCount + 1);
    }

    socket.on('receiveNotification', incrementNotifCount);

    return () => {
      socket.off('receiveNotification', incrementNotifCount);
    };
  }, [notifCount]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigateTo(navigate, '/login').catch(logError);
  };

  if (currentUserResult.error) {
    logError(currentUserResult.error);
    return <ErrorPage error={currentUserResult.error} />;
  }

  return (
    <div className='themeWrapper' data-theme={theme}>
      {currentUserResult.data ? (
        <div className='app' data-theme={theme}>
          <Sidebar
            currentUser={currentUserResult.data?.getCurrentUser}
            logoutModal={logoutModal}
            notifCount={notifCount}
            setTheme={setTheme}
            theme={theme}
          />
          <div className='main'>
            <div className='profileBar'>
              <ProfileBar
                currentUser={currentUserResult.data?.getCurrentUser}
                logoutModal={logoutModal}
                setTheme={setTheme}
                theme={theme}
              />
            </div>
            <Outlet
              context={[
                currentUserResult.data?.getCurrentUser,
                () => {
                  currentUserResult.refetch().catch(logError);
                },
                notifCount,
                setNotifCount,
              ]}
            />
          </div>
          <UserList
            currentUser={currentUserResult.data?.getCurrentUser}
            setCurrentUser={() => {
              currentUserResult.refetch().catch(logError);
            }}
          />
          <dialog ref={logoutModal}>
            <h2>Are you sure you want to log out?</h2>
            <div className='modalButtons'>
              <button
                type='button'
                onClick={() => {
                  logoutModal.current?.close();
                }}
              >
                Cancel
              </button>
              <button onClick={logout} type='button'>
                Log Out
              </button>
            </div>
          </dialog>
        </div>
      ) : null}
    </div>
  );
};

export default App;
