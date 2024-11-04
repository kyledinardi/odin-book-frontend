import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import UserList from './components/UserList.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import backendFetch from '../ helpers/backendFetch';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const logoutModal = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!error) {
      backendFetch(setError, '/users/currentUser').then((response) =>
        setCurrentUser(response.user),
      );
    }
  }, [error]);

  return error ? (
    <ErrorPage error={error} setError={(err) => setError(err)} />
  ) : (
    <div className='app'>
      <Sidebar currentUser={currentUser} logoutModal={logoutModal} />
      <Outlet context={[setError, currentUser, setCurrentUser]} />
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
              logoutModal.current.close();
              localStorage.clear();
              navigate('/login');
            }}
          >
            Log Out
          </button>
          <button onClick={() => logoutModal.current.close()}>Cancel</button>
        </div>
      </dialog>
    </div>
  );
}

export default App;
