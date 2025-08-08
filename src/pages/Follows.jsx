import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import ErrorPage from './ErrorPage.jsx';
import FollowList from '../components/FollowList.jsx';
import { GET_USER } from '../graphql/queries';
import logError from '../utils/logError';
import styles from '../style/Follows.module.css';

function Follows() {
  const [followedIds, setFollowedIds] = useState(null);
  const [openTab, setOpenTab] = useState('following');
  const [currentUser] = useOutletContext();

  const userId = Number(useParams().userId);
  const userResult = useQuery(GET_USER, { variables: { userId } });
  const user = userResult.data?.getUser;

  useEffect(() => {
    if (currentUser) {
      setFollowedIds(
        currentUser.following.map((followedUser) => Number(followedUser.id))
      );
    }
  }, [currentUser]);

  if (userResult.error) {
    logError(userResult.error);
    return <ErrorPage error={userResult.error} />;
  }

  return !user || !currentUser || !followedIds ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main className={styles.followContainer}>
      <div className={styles.heading}>
        <h2>{user.displayName}</h2>
        <p>@{user.username}</p>
      </div>
      <div>
        <button
          className={`${styles.categoryButton} ${
            openTab === 'following' ? styles.openTab : null
          }`}
          onClick={() => setOpenTab('following')}
        >
          Following
        </button>
        <button
          className={`${styles.categoryButton} ${
            openTab === 'followers' ? styles.openTab : null
          }`}
          onClick={() => setOpenTab('followers')}
        >
          Followers
        </button>
        <button
          className={`${styles.categoryButton} ${
            openTab === 'mutuals' ? styles.openTab : null
          }`}
          onClick={() => setOpenTab('mutuals')}
        >
          Mutuals
        </button>
        {user.id !== currentUser.id && (
          <button
            className={`${styles.categoryButton} ${
              openTab === 'followedFollowers' ? styles.openTab : null
            }`}
            onClick={() => setOpenTab('followedFollowers')}
          >
            Followers you follow
          </button>
        )}
      </div>
      <FollowList openTab={openTab} user={user} followedIds={followedIds} />
    </main>
  );
}

export default Follows;
