import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Post from './Post.jsx';
import NewPostForm from './NewPostForm.jsx';

function Home() {
  const [posts, setPosts] = useState(null);
  const [setError, currentUser] = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/index`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((response) => response.json())

      .then((response) => {
        if (response.error) {
          setError(response.error);
          return;
        }

        setPosts(response.posts);
      });
  }, [setError, navigate]);

  function replacePost(updatedPost) {
    const newPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );

    setPosts(newPosts);
  }

  function removePost(postId) {
    setPosts(posts.filter((post) => post.id !== postId));
  }

  return !currentUser || !posts ? (
    <h1>Loading...</h1>
  ) : (
    <main>
      <NewPostForm
        posts={posts}
        setPosts={(p) => setPosts(p)}
      />
      <div>
        {posts.length === 0 ? (
          <h2 className='nothingHere'>You and your followers have no posts.</h2>
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

export default Home;
