import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import styles from '../style/Follows.module.css';
import FollowList from './FollowList.jsx';

function Follows() {
  const [user, setUser] = useState(null);
  const [followedIds, setFollowedIds] = useState(null);
  const [openTab, setOpenTab] = useState('following');
  const [setError, currentUser] = useOutletContext();
  const userId = parseInt(useParams().userId, 10);

  useEffect(() => {
    if (currentUser) {
      setFollowedIds(
        currentUser.following.map((followedUser) => followedUser.id),
      );
    }
  }, [currentUser]);

  useEffect(() => {
    if (!userId) {
      setError({ status: 404, message: 'User not found' });
      return;
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())

      .then((response) => {
        if (response.error) {
          setError(response.error);
        }

        setUser(response.user);
      });
  }, [userId, setError]);

  return !user || !currentUser || !followedIds ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <div className={styles.heading}>
        <h2>{user.displayName}</h2>
        <p>{`@${user.username}`}</p>
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
        {userId !== currentUser.id && (
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
