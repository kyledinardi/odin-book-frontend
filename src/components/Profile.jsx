import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import Post from './Post.jsx';
import styles from '../style/Profile.module.css';
import UpdateProfile from './UpdateProfile.jsx';

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const modalRef = useRef(null);
  const [currentUser, setCurrentUser] = useOutletContext();
  const userId = parseInt(useParams().userId, 10);

  useEffect(() => {
    if (currentUser) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((response) => response.json())

        .then((response) => {
          const isFollowedTemp = currentUser.following.some(
            (followedUser) => followedUser.id === userId,
          );

          setIsFollowed(isFollowedTemp);
          setUser(response.user);
        });

      fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}/posts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((response) => response.json())
        .then((response) => setPosts(response.posts));
    }
  }, [userId, currentUser]);

  async function follow() {
    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/${
        isFollowed ? 'unfollow' : 'follow'
      }`,

      {
        method: 'Put',
        body: JSON.stringify({ userId: user.id }),

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const response = await responseStream.json();
    setCurrentUser({ ...currentUser, following: response.user.following });
    setIsFollowed(!isFollowed);
  }

  function replacePost(updatedPost) {
    const newPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );

    setPosts(newPosts);
  }

  function removePost(postId) {
    setPosts(posts.filter((post) => post.id !== postId));
  }

  return !user || !posts || !currentUser ? (
    <h1>Loading...</h1>
  ) : (
    <main>
      <UpdateProfile
        modalRef={modalRef}
        user={user}
        currentUser={currentUser}
        setCurrentUser={(u) => setCurrentUser(u)}
      />
      <div className={styles.heading}>
        <h2>{user.displayName}</h2>
        <p>{posts.length} posts</p>
      </div>
      <div className={styles.pfpAndButton}>
        <img className={styles.profilePagePfp} src={user.pfpUrl} alt='' />
        {userId === currentUser.id ? (
          <button
            className={styles.topButton}
            onClick={() => modalRef.current.showModal()}
          >
            Set up profile
          </button>
        ) : (
          <button className={styles.topButton} onClick={() => follow()}>
            {isFollowed ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
      <div className={styles.userInfo}>
        <h2>{user.displayName}</h2>
        <span className='gray'>{`@${user.username}`}</span>
        <p>{user.bio}</p>
        <Link className={styles.followStats} to={`/users/${user.id}/follows`}>
          <span>
            <strong>{user.following.length}</strong> Following
          </span>
          <span>
            <strong>{user.followers.length}</strong> Followers
          </span>
        </Link>
      </div>
      <h3 className={styles.postHeading}>Posts</h3>
      <div>
        {posts.length === 0 ? (
          <h2 className='nothingHere'>{`${
            userId === currentUser.id ? 'You have' : `${user.username} has`
          } no posts.`}</h2>
        ) : (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              replacePost={(updatedPost) => replacePost(updatedPost)}
              removePost={(postId) => removePost(postId)}
            />
          ))
        )}
      </div>
    </main>
  );
}

export default Profile;
