import { useEffect, useRef, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import Post from './Post.jsx';
import styles from '../style/Profile.module.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [newPfpSrc, setNewPfpSrc] = useState('');
  const modal = useRef(null);
  const newPfpInput = useRef(null);
  const [currentUser, setCurrentUser] = useOutletContext();
  const userId = parseInt(useParams().userId, 10);

  useEffect(() => {
    if (currentUser) {
      fetch(`http://localhost:3000/users/${userId}`, {
        mode: 'cors',

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

      fetch(`http://localhost:3000/posts/user/${userId}`, {
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((response) => response.json())
        .then((response) => setPosts(response.posts));
    }
  }, [userId, currentUser]);

  async function submitProfile(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('pfp', e.target[0].files[0]);
    formData.append('bio', e.target[2].value);

    const responseStream = await fetch('http://localhost:3000/users/profile', {
      method: 'PUT',
      mode: 'cors',

      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },

      body: formData,
    });

    const response = await responseStream.json();
    e.target.reset();
    modal.current.close();

    const newCurrentUser = {
      ...currentUser,
      pfpUrl: response.user.pfpUrl,
      bio: response.user.bio,
    };

    setCurrentUser(newCurrentUser);
  }

  async function follow() {
    const responseStream = await fetch(
      `http://localhost:3000/users/${isFollowed ? 'unfollow' : 'follow'}`,

      {
        method: 'Put',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({ userId: user.id }),
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

  function handleFileInputChange(e) {
    const file = e.target.files[0];

    if (file) {
      setNewPfpSrc(file);
    }
  }

  function cancelNewImage() {
    newPfpInput.current.value = '';
    setNewPfpSrc('');
  }

  return !user || !posts || !currentUser ? (
    <h1>Loading...</h1>
  ) : (
    <main>
      <dialog className={styles.modal} ref={modal}>
        <button
          className={styles.closeModalButton}
          onClick={() => modal.current.close()}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            height='24px'
            viewBox='0 -960 960 960'
            width='24px'
            fill='#000'
          >
            <path d='m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z' />
          </svg>
        </button>
        <form onSubmit={(e) => submitProfile(e)}>
          <input
            type='file'
            name='pfp'
            id='pfp'
            accept='image/*'
            ref={newPfpInput}
            onChange={(e) => handleFileInputChange(e)}
            hidden
          />
          <label htmlFor='pfp'>New Profile Picture</label>
          <div className={styles.newPfpPreview}>
            <label htmlFor='pfp'>
              <img
                className={styles.profilePagePfp}
                src={
                  newPfpSrc === ''
                    ? user.pfpUrl
                    : URL.createObjectURL(newPfpSrc)
                }
                alt=''
              />
            </label>
            <button
              type='button'
              className={styles.cancelNewPfp}
              onClick={() => cancelNewImage()}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='24px'
                viewBox='0 -960 960 960'
                width='24px'
                fill='#fff'
              >
                <path d='m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z' />
              </svg>
            </button>
          </div>
          <label htmlFor='bio'>New Bio</label>
          <textarea
            name='bio'
            id='bio'
            cols='30'
            rows='10'
            defaultValue={currentUser.bio}
          ></textarea>
          <button className={styles.saveProfileButton}>Save Profile</button>
        </form>
      </dialog>
      <div className={styles.heading}>
        <h2>{user.username}</h2>
        <p>{posts.length} posts</p>
      </div>
      <div className={styles.pfpAndButton}>
        <img className={styles.profilePagePfp} src={user.pfpUrl} alt='' />
        {userId === currentUser.id ? (
          <button
            className={styles.topButton}
            onClick={() => modal.current.showModal()}
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
        <h2>{user.username}</h2>
        <p>{user.bio}</p>
        <div className={styles.followStats}>
          <span>
            <strong>{user.following.length}</strong> Following
          </span>
          <span>
            <strong>{user.followers.length}</strong> Followers
          </span>
        </div>
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
            />
          ))
        )}
      </div>
    </main>
  );
}

export default Profile;
