import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import User from './User.jsx';
import styles from '../style/UserList.module.css';

function UserList({ currentUser, setCurrentUser, setError }) {
  const [users, setUsers] = useState(null);
  const [followedIds, setFollowedIds] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((response) => response.json())

        .then((response) => {
          if (response.error) {
            setError(response.error);
            return;
          }

          setFollowedIds(currentUser.following.map((user) => user.id));
          setUsers(response.users);
        });
    }
  }, [currentUser, setError]);

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
