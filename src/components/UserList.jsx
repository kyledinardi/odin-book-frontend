import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import User from './User.jsx';
import { GET_LISTED_USERS } from '../graphql/queries';
import logError from '../utils/logError';
import styles from '../style/UserList.module.css';

function UserList({ currentUser, setCurrentUser }) {
  const [followedIds, setFollowedIds] = useState(null);
  const navigate = useNavigate();
  const usersResult = useQuery(GET_LISTED_USERS);

  useEffect(() => {
    setFollowedIds(currentUser.following.map((user) => user.id));
  }, [currentUser.following]);

  if (usersResult.error) {
    logError(usersResult.error);
  }

  return usersResult.loading || !followedIds ? (
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
        {usersResult.data.getListedUsers.map((user) => (
          <User
            key={user.id}
            user={user}
            replaceUser={() => setCurrentUser()}
            isFollowed={followedIds.includes(user.id)}
          />
        ))}
      </div>
    </aside>
  );
}

UserList.propTypes = {
  currentUser: PropTypes.object,
  setCurrentUser: PropTypes.func,
};

export default UserList;
