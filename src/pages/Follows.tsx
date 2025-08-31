import { useEffect, useState } from 'react';

import { useQuery } from '@apollo/client';
import { useOutletContext, useParams } from 'react-router-dom';

import ErrorPage from './ErrorPage.tsx';
import FollowList from '../components/FollowList.tsx';
import { GET_USER } from '../graphql/queries.ts';
import styles from '../style/Follows.module.css';
import logError from '../utils/logError.ts';

import type { AppContext } from '../types.ts';

const Follows = () => {
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [openTab, setOpenTab] = useState('following');
  const [currentUser] = useOutletContext<AppContext>();

  const { userId } = useParams();
  const userResult = useQuery(GET_USER, { variables: { userId } });
  const user = userResult.data?.getUser;

  useEffect(() => {
    if (currentUser) {
      setFollowedIds(
        currentUser.following.map((followedUser) => followedUser.id),
      );
    }
  }, [currentUser]);

  if (userResult.error) {
    logError(userResult.error);
    return <ErrorPage error={userResult.error} />;
  }

  return !user || !currentUser || !followedIds ? (
    <div className='loaderContainer'>
      <div className='loader' />
    </div>
  ) : (
    <main className={styles.followContainer}>
      <div className={styles.heading}>
        <h2>{user.displayName}</h2>
        <p>@{user.username}</p>
      </div>
      <div>
        <button
          onClick={() => setOpenTab('following')}
          type='button'
          className={`${styles.categoryButton} ${
            openTab === 'following' ? styles.openTab : null
          }`}
        >
          Following
        </button>
        <button
          onClick={() => setOpenTab('followers')}
          type='button'
          className={`${styles.categoryButton} ${
            openTab === 'followers' ? styles.openTab : null
          }`}
        >
          Followers
        </button>
        <button
          onClick={() => setOpenTab('mutuals')}
          type='button'
          className={`${styles.categoryButton} ${
            openTab === 'mutuals' ? styles.openTab : null
          }`}
        >
          Mutuals
        </button>
        {user.id !== currentUser.id && (
          <button
            onClick={() => setOpenTab('followedFollowers')}
            type='button'
            className={`${styles.categoryButton} ${
              openTab === 'followedFollowers' ? styles.openTab : null
            }`}
          >
            Followers you follow
          </button>
        )}
      </div>
      <FollowList followedIds={followedIds} openTab={openTab} user={user} />
    </main>
  );
};

export default Follows;
