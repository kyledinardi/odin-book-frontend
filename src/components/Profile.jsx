import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import UpdateProfileForm from './UpdateProfileForm.jsx';
import UpdatePasswordForm from './UpdatePasswordForm.jsx';
import Post from './Post.jsx';
import ThemeSwitch from './ThemeSwitch.jsx';
import backendFetch from '../../ helpers/backendFetch';
import styles from '../style/Profile.module.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [imagePosts, setImagePosts] = useState(null);
  const [likedPosts, setLikedPosts] = useState(null);

  const [isFollowed, setIsFollowed] = useState(false);
  const [isUserModal, setIsUserModal] = useState(false);
  const [isUserModalRendered, setIsUserModalRendered] = useState(false);

  const [openTab, setOpenTab] = useState('posts');
  const [userModalType, setUserModalType] = useState('');
  const [imageModalType, setImageModalType] = useState('');

  const userModal = useRef(null);
  const imageModal = useRef(null);
  const userId = parseInt(useParams().userId, 10);

  const [setError, currentUser, setCurrentUser, theme, setTheme] =
    useOutletContext();

  useEffect(() => {
    if (!userId) {
      setError({ status: 404, message: 'User not found' });
      return;
    }

    if (currentUser) {
      backendFetch(setError, `/users/${userId}`).then((response) => {
        const isFollowedTemp = currentUser.following.some(
          (followedUser) => followedUser.id === userId,
        );

        setIsFollowed(isFollowedTemp);
        setUser(response.user);
      });

      backendFetch(setError, `/users/${userId}/posts`).then((response) => {
        setPosts(response.posts);
        setImagePosts(response.posts.filter((post) => post.imageUrl));
      });

      backendFetch(setError, `/users/${userId}/likes`).then((response) =>
        setLikedPosts(response.posts),
      );
    }
  }, [userId, currentUser, setError]);

  useEffect(() => {
    if (isUserModal) {
      setIsUserModalRendered(true);

      if (isUserModalRendered) {
        userModal.current.showModal();
      }
    }
  }, [isUserModal, isUserModalRendered]);

  async function follow() {
    const response = await backendFetch(
      setError,
      `/users/${isFollowed ? 'unfollow' : 'follow'}`,
      { method: 'PUT', body: JSON.stringify({ userId: user.id }) },
    );

    setCurrentUser({ ...currentUser, following: response.user.following });
    setIsFollowed(!isFollowed);
  }

  function replacePost(updatedPost) {
    const newPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );

    const newImagePosts = imagePosts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );

    setPosts(newPosts);
    setImagePosts(newImagePosts);
  }

  function removePost(postId) {
    setPosts(posts.filter((post) => post.id !== postId));
    setImagePosts(imagePosts.filter((post) => post.id !== postId));
  }

  function returnPost(postToReturn) {
    return (
      <Post
        key={postToReturn.id}
        post={postToReturn}
        replacePost={(updatedPost) => replacePost(updatedPost)}
        removePost={(postId) => removePost(postId)}
      />
    );
  }

  function renderPosts() {
    const noPostsMessageTemplate =
      userId === currentUser.id ? 'You have' : `${user.displayName} has`;

    switch (openTab) {
      case 'posts':
        if (posts.length === 0) {
          return <h2>{`${noPostsMessageTemplate} no posts.`}</h2>;
        }

        return posts.map((post) => returnPost(post));

      case 'images':
        if (imagePosts.length === 0) {
          return <h2>{`${noPostsMessageTemplate} no images.`}</h2>;
        }

        return imagePosts.map((post) => returnPost(post));

      case 'likes': {
        if (likedPosts.length === 0) {
          return <h2>{`${noPostsMessageTemplate} not liked any posts`}</h2>;
        }

        return likedPosts.map((post) => returnPost(post));
      }

      default:
        return null;
    }
  }

  return !user || !posts || !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      {isUserModal && (
        <dialog
          ref={userModal}
          onClose={() => {
            setIsUserModal(false);
            setIsUserModalRendered(false);
          }}
        >
          <button
            className='closeButton'
            onClick={() => userModal.current.close()}
          >
            <span className='material-symbols-outlined closeIcon'>close</span>
          </button>
          {userModalType === 'profile' ? (
            <UpdateProfileForm userModal={userModal} />
          ) : (
            <UpdatePasswordForm userModal={userModal} />
          )}
        </dialog>
      )}
      <dialog ref={imageModal} className={styles.imageModal}>
        <button
          className='closeButton'
          onClick={() => imageModal.current.close()}
        >
          <span className='material-symbols-outlined closeIcon'>close</span>
        </button>
        <img
          src={imageModalType === 'pfp' ? user.pfpUrl : user.headerUrl}
          alt=''
        />
      </dialog>
      <div className={styles.heading}>
        <div>
          <h2>{user.displayName}</h2>
          <p>{posts.length} posts</p>
        </div>
        <div className={styles.switch}>
          <ThemeSwitch theme={theme} setTheme={(t) => setTheme(t)} />
        </div>
      </div>
      {user.headerUrl && (
        <img
          className={styles.headerImage}
          src={user.headerUrl}
          alt=''
          onClick={() => {
            setImageModalType('header');
            imageModal.current.showModal();
          }}
        />
      )}
      <div className={styles.pfpAndButtons}>
        <img
          className={styles.profilePagePfp}
          src={user.pfpUrl}
          alt=''
          onClick={() => {
            setImageModalType('pfp');
            imageModal.current.showModal();
          }}
        />
        <div className={styles.topButtons}>
          {userId === currentUser.id ? (
            <>
              <button
                onClick={() => {
                  setUserModalType('profile');
                  setIsUserModal(true);
                }}
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  setUserModalType('password');
                  setIsUserModal(true);
                }}
              >
                Change Password
              </button>
            </>
          ) : (
            <button onClick={() => follow()}>
              {isFollowed ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>
      <div className={styles.userInfo}>
        <h2>{user.displayName}</h2>
        <span className='gray'>{`@${user.username}`}</span>
        <p>{user.bio}</p>
        <p className={styles.joinDate}>
          <span className={`material-symbols-outlined ${styles.calendarIcon}`}>
            calendar_month
          </span>
          <span>
            <span className=''>Joined </span>
            {Intl.DateTimeFormat(undefined, {
              month: 'long',
              year: 'numeric',
            }).format(new Date(user.joinDate))}
          </span>
        </p>
        <Link className={styles.followStats} to={`/users/${user.id}/follows`}>
          <span>
            <strong>{user.following.length}</strong> Following
          </span>
          <span>
            <strong>{user.followers.length}</strong> Followers
          </span>
        </Link>
      </div>
      <button
        className={`categoryButton ${openTab === 'posts' ? 'openTab' : ''}`}
        onClick={() => setOpenTab('posts')}
      >
        Posts
      </button>
      <button
        className={`categoryButton ${openTab === 'images' ? 'openTab' : ''}`}
        onClick={() => setOpenTab('images')}
      >
        Images
      </button>
      <button
        className={`categoryButton ${openTab === 'likes' ? 'openTab' : ''}`}
        onClick={() => setOpenTab('likes')}
      >
        Likes
      </button>
      <div>{renderPosts()}</div>
    </main>
  );
}

export default Profile;
