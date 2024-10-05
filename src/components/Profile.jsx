import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import Post from './Post.jsx';

function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [isFollowed, setIsFollowed] = useState(false);
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

  async function submitProfile(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('pfp', e.target[0].files[0]);
    formData.append('bio', e.target[1].value);

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

    const newCurrentUser = {
      ...currentUser,
      pfpUrl: response.user.pfpUrl,
      bio: response.user.bio,
    };

    setCurrentUser(newCurrentUser);
  }

  function replacePost(updatedPost) {
    const newPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );

    setPosts(newPosts);
  }

  return !user || !posts || !currentUser ? (
    <h1>Loading...</h1>
  ) : (
    <main>
      <div>
        <h2>{user.username}</h2>
        <p>{posts.length} posts</p>
      </div>
      <div>
        <img src={user.pfpUrl} alt='' />
        {userId === currentUser.id ? (
          <button>Set up profile</button>
        ) : (
          <button onClick={() => follow()}>
            {isFollowed ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
      <h2>{user.username}</h2>
      <p>{user.bio}</p>
      <div>
        <span>
          <strong>{user.following.length}</strong> Following
        </span>
        <span>
          <strong>{user.followers.length}</strong> Followers
        </span>
      </div>
      <form onSubmit={(e) => submitProfile(e)}>
        <input type='file' name='pfp' id='pfp' />
        <label htmlFor='pfp'>New Profile Picture</label>
        <label htmlFor='bio'>New Bio</label>
        <textarea
          name='bio'
          id='bio'
          cols='30'
          rows='10'
          defaultValue={user.bio}
        ></textarea>
        <button>Save Profile</button>
      </form>
      <h3>Posts</h3>
      <div>
        {posts.length === 0 ? (
          <h2>{`${
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
