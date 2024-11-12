import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Post from './Post.jsx';
import styles from '../style/Home.module.css';
import backendFetch from '../../ helpers/backendFetch';
import NewContentForm from './NewContentForm.jsx';

function Home() {
  const [posts, setPosts] = useState(null);
  const [setError, currentUser] = useOutletContext();

  useEffect(() => {
    backendFetch(setError, '/posts/index').then((response) =>
      setPosts(response.posts),
    );
  }, [setError]);

  function replacePost(updatedPost) {
    const newPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post,
    );

    setPosts(newPosts);
  }

  return !currentUser || !posts ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <div className={styles.formSection}>
        <div className={styles.currentUserPfp}>
          <Link to={`/users/${currentUser.id}`}>
            <img className='pfp' src={currentUser.pfpUrl} alt='' />
          </Link>
        </div>
        <NewContentForm
          contentType={'post'}
          setContent={(post) => setPosts([post, ...posts])}
        />
      </div>
      <div>
        {posts.length === 0 ? (
          <h2>You and your followers have no posts</h2>
        ) : (
          posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              replacePost={(updatedPost) => replacePost(updatedPost)}
              removePost={(postId) =>
                setPosts(posts.filter((p) => p.id !== postId))
              }
            />
          ))
        )}
      </div>
    </main>
  );
}

export default Home;
