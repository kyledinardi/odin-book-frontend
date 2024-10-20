import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import Post from './Post.jsx';
import styles from '../style/Profile.module.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [newPfpSrc, setNewPfpSrc] = useState('');
  const modalRef = useRef(null);
  const newPfpInput = useRef(null);
  const [currentUser, setCurrentUser] = useOutletContext();
  const userId = parseInt(useParams().userId, 10);

  useEffect(() => {
    if (currentUser) {
      fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}`, {
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

      fetch(`${import.meta.env.VITE_BACKEND_URL}/users/${userId}/posts`, {
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
    formData.append('displayName', e.target[2].value);
    formData.append('bio', e.target[3].value);

    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/profile`,

      {
        method: 'PUT',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },

        body: formData,
      },
    );

    const response = await responseStream.json();
    e.target.reset();
    modalRef.current.close();

    const newCurrentUser = {
      ...currentUser,
      pfpUrl: response.user.pfpUrl,
      displayName: response.user.displayName,
      bio: response.user.bio,
    };

    setCurrentUser(newCurrentUser);
  }

  async function follow() {
    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/${
        isFollowed ? 'unfollow' : 'follow'
      }`,

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

  function removePost(postId) {
    setPosts(posts.filter((post) => post.id !== postId));
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
      <dialog className={styles.modal} ref={modalRef}>
        <button
          className={styles.closeModalButton}
          onClick={() => modalRef.current.close()}
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
          <label htmlFor='pfp'>Profile Picture</label>
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
          <label htmlFor='displayName'>Display Name</label>
          <input
            type='text'
            name='displayName'
            id='displayName'
            defaultValue={currentUser.displayName}
          />
          <label htmlFor='bio'>Bio</label>
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
