import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import Post from './Post.jsx';
import UpdateUser from './UpdateUser.jsx';
import styles from '../style/Profile.module.css';
import backendFetch from '../../ helpers/backendFetch';

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [imagePosts, setImagePosts] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [modalType, setModalType] = useState('');
  const [openTab, setOpenTab] = useState('posts');
  const userModal = useRef(null);
  const [setError, currentUser, setCurrentUser] = useOutletContext();
  const userId = parseInt(useParams().userId, 10);

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
    }
  }, [userId, currentUser, setError]);

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

  function renderPosts() {
    const noPostsMessageTemplate =
      userId === currentUser.id ? 'You have' : `${user.username} has`;

    if (openTab === 'posts') {
      if (posts.length === 0) {
        return <h2>{`${noPostsMessageTemplate} no posts.`}</h2>;
      }

      return posts.map((post) => (
        <Post
          key={post.id}
          post={post}
          replacePost={(updatedPost) => replacePost(updatedPost)}
          removePost={(postId) => removePost(postId)}
        />
      ));
    }

    if (openTab === 'images') {
      if (imagePosts.length === 0) {
        return <h2>{`${noPostsMessageTemplate} no images.`}</h2>;
      }

      return imagePosts.map((post) => (
        <Post
          key={post.id}
          post={post}
          replacePost={(updatedPost) => replacePost(updatedPost)}
          removePost={(postId) => removePost(postId)}
        />
      ));
    }

    return null;
  }

  return !user || !posts || !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <UpdateUser userModal={userModal} modalType={modalType} user={user} />
      <div className={styles.heading}>
        <h2>{user.displayName}</h2>
        <p>{posts.length} posts</p>
      </div>
      <div className={styles.pfpAndButton}>
        <img className={styles.profilePagePfp} src={user.pfpUrl} alt='' />
        <div className={styles.topButtons}>
          {user.userame !== 'Guest' &&
            (userId === currentUser.id ? (
              <>
                <button
                  onClick={() => {
                    setModalType('profile');
                    userModal.current.showModal();
                  }}
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setModalType('password');
                    userModal.current.showModal();
                  }}
                >
                  Change Password
                </button>
              </>
            ) : (
              <button onClick={() => follow()}>
                {isFollowed ? 'Unfollow' : 'Follow'}
              </button>
            ))}
        </div>
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
      <button
        className={`categoryButton ${openTab === 'posts' ? 'openTab' : null}`}
        onClick={() => setOpenTab('posts')}
      >
        Posts
      </button>
      <button
        className={`categoryButton ${openTab === 'images' ? 'openTab' : null}`}
        onClick={() => setOpenTab('images')}
      >
        Images
      </button>
      <div>{renderPosts()}</div>
    </main>
  );
}

export default Profile;
