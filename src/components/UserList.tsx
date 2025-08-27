import { useEffect, useState } from 'react';

import { useQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

import UserCard from './UserCard.tsx';
import { GET_LISTED_USERS } from '../graphql/queries.ts';
import styles from '../style/UserList.module.css';
import logError from '../utils/logError.ts';
import navigateTo from '../utils/navigateTo.ts';

import type { User } from '../types.ts';

const UserList = ({
  currentUser,
  setCurrentUser,
}: {
  currentUser: User;
  setCurrentUser: () => void;
}) => {
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const usersResult = useQuery(GET_LISTED_USERS);

  useEffect(() => {
    setFollowedIds(currentUser.following.map((user) => user.id));
  }, [currentUser.following]);

  if (usersResult.error) {
    logError(usersResult.error);
  }

  return !usersResult.data || !followedIds ? (
    <div className='loaderContainer'>
      <div className='loader' />
    </div>
  ) : (
    <aside className={styles.userList}>
      <form
        className={styles.searchForm}
        onSubmit={(e) => {
          e.preventDefault();
          navigateTo(navigate, `/search?query=${query}`).catch(logError);
        }}
      >
        <span className='material-symbols-outlined'>search</span>
        <input
          id='search'
          name='search'
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search'
          type='search'
          value={query}
        />
      </form>
      <div>
        {usersResult.data.getListedUsers.map((user: User) => (
          <UserCard
            key={user.id}
            bio={false}
            isFollowed={followedIds.includes(user.id)}
            replaceUser={setCurrentUser}
            user={user}
          />
        ))}
      </div>
    </aside>
  );
};

export default UserList;
