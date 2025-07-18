import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import User from './User.jsx';
import backendFetch from '../../utils/backendFetch';
import styles from '../style/UserList.module.css';

function UserList({ currentUser, setCurrentUser, setError }) {
  const [users, setUsers] = useState(null);
  const [followedIds, setFollowedIds] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    if (currentUser) {
      setFollowedIds(currentUser.following.map((user) => user.id));
    }
  }, [currentUser]);

  useEffect(() => {
    if (!users) {
      backendFetch(setError, '/users').then((response) => {
        setUsers(response.users);
      });
    }
  }, [users, setError]);

  return !users || !followedIds ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <aside className={styles.userList}>
      <form
        className={styles.searchForm}
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/search?query=${e.target[0].value}`);
        }}
      >
        <span className='material-symbols-outlined'>search</span>
        <input type='search' name='search' id='search' placeholder='Search' />
      </form>
      <div>
        {users.map((user) => (
          <User
            key={user.id}
            user={user}
            bio={false}
            isFollowed={followedIds.includes(user.id)}
            replaceUser={(u) =>
              setCurrentUser({ ...currentUser, following: u.following })
            }
            setError={(err) => setError(err)}
          />
        ))}
      </div>
    </aside>
  );
}

UserList.propTypes = {
  currentUser: PropTypes.object,
  setCurrentUser: PropTypes.func,
  setError: PropTypes.func,
};

export default UserList;
