import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import UpdateProfileForm from './UpdateProfileForm.jsx';
import UpdatePasswordForm from './UpdatePasswordForm.jsx';
import ThemeSwitch from './ThemeSwitch.jsx';
import ProfilePostList from './ProfilePostList.jsx';
import backendFetch from '../../ helpers/backendFetch';
import styles from '../style/Profile.module.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [comments, setComments] = useState(null);
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
      Promise.all([
        backendFetch(setError, `/users/${userId}`),
        backendFetch(setError, `/users/${userId}/posts`),
        backendFetch(setError, `/users/${userId}/comments`),
        backendFetch(setError, `/users/${userId}/posts/images`),
        backendFetch(setError, `/users/${userId}/posts/likes`),
      ]).then((responses) => {
        const isFollowedTemp = currentUser.following.some(
          (followedUser) => followedUser.id === userId,
        );

        setIsFollowed(isFollowedTemp);
        setUser(responses[0].user);
        setPosts(responses[1].posts);
        setComments(responses[2].comments);
        setImagePosts(responses[3].posts);
        setLikedPosts(responses[4].posts);
      });
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
          <p>
            {posts.length} post{posts.length === 1 ? '' : 's'}
          </p>
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
        <div className={styles.userDetails}>
          {user.location && (
            <div className={styles.detail}>
              <span
                className={`material-symbols-outlined ${styles.profileIcon}`}
              >
                location_on
              </span>
              <span>{user.location}</span>
            </div>
          )}
          {user.website && (
            <div className={styles.detail}>
              <span
                className={`material-symbols-outlined ${styles.profileIcon}`}
              >
                link
              </span>
              <a
                className={styles.websiteLink}
                href={
                  user.website.startsWith('http://') ||
                  user.website.startsWith('https://')
                    ? user.website
                    : `https://${user.website}`
                }
                target='_blank'
                rel='noopener noreferrer'
              >
                {user.website}
              </a>
            </div>
          )}
          <div className={styles.detail}>
            <span className={`material-symbols-outlined ${styles.profileIcon}`}>
              calendar_month
            </span>
            <span>
              <span>Joined </span>
              {Intl.DateTimeFormat(undefined, {
                month: 'long',
                year: 'numeric',
              }).format(new Date(user.joinDate))}
            </span>
          </div>
        </div>
        <Link className={styles.followStats} to={`/users/${user.id}/follows`}>
          <span>
            <strong>{user.following.length}</strong>
            <span> Following</span>
          </span>
          <span>
            <strong>{user.followers.length}</strong>
            <span> Follower{user.followers.length === 1 ? '' : 's'}</span>
          </span>
        </Link>
      </div>
      <div className='categoryButtons'>
        <button
          className={`categoryButton ${openTab === 'posts' ? 'openTab' : ''}`}
          onClick={() => setOpenTab('posts')}
        >
          Posts
        </button>
        <button
          className={`categoryButton ${
            openTab === 'comments' ? 'openTab' : ''
          }`}
          onClick={() => setOpenTab('comments')}
        >
          Comments
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
      </div>
      <ProfilePostList
        user={user}
        posts={posts}
        comments={comments}
        imagePosts={imagePosts}
        likedPosts={likedPosts}
        setPosts={(newPosts) => setPosts(newPosts)}
        setComments={(newComments) => setComments(newComments)}
        setImagePosts={(newPosts) => setImagePosts(newPosts)}
        setLikedPosts={(newPosts) => setLikedPosts(newPosts)}
        openTab={openTab}
      />
    </main>
  );
}

export default Profile;
