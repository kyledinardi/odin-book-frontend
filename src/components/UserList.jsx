import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import User from './User.jsx';
import styles from '../style/UserList.module.css';

function UserList({ currentUser, setCurrentUser }) {
  const [users, setUsers] = useState(null);
  const [followedIds, setFollowedIds] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/users`, {
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((response) => response.json())
        .then((response) => {
          setFollowedIds(currentUser.following.map((user) => user.id));
          setUsers(response.users);
        });
    }
  }, [currentUser]);

  function submitSearch(e) {
    e.preventDefault();
    navigate(`/search?query=${e.target[0].value}`);
  }

  return !users || !followedIds ? (
    <h1>Loading...</h1>
  ) : (
    <aside className={styles.userListContainer}>
      <div className={styles.userList}>
        <form className={styles.searchForm} onSubmit={(e) => submitSearch(e)}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            height='24px'
            viewBox='0 -960 960 960'
            width='24px'
            fill='#808080'
          >
            <path d='M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z' />
          </svg>
          <input type='search' name='search' id='search' placeholder='Search' />
        </form>
        <div>
          {users.map((user) => (
            <User
              key={user.id}
              user={user}
              bio={false}
              isFollowed={followedIds.includes(user.id)}
              replaceUser={(updatedUser) =>
                setCurrentUser({
                  ...currentUser,
                  following: updatedUser.following,
                })
              }
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

UserList.propTypes = {
  currentUser: PropTypes.object,
  setCurrentUser: PropTypes.func,
};

export default UserList;
