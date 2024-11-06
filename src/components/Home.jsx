import { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import GifPicker from 'gif-picker-react';
import Post from './Post.jsx';
import NewPostForm from './NewPostForm.jsx';
import styles from '../style/Home.module.css';
import backendFetch from '../../ helpers/backendFetch';

function Home() {
  const [posts, setPosts] = useState(null);
  const [newPostImage, setNewPostImage] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [isModalRendered, setIsModalRendered] = useState(false);
  const [gifUrl, setGifUrl] = useState('');

  const gifModal = useRef(null);
  const [setError, currentUser] = useOutletContext();

  useEffect(() => {
    backendFetch(setError, '/posts/index').then((response) =>
      setPosts(response.posts),
    );
  }, [setError]);

  useEffect(() => {
    if (isModal) {
      setIsModalRendered(true);

      if (isModalRendered) {
        gifModal.current.showModal();
      }
    }
  }, [isModal, isModalRendered]);

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
      {isModal && (
        <dialog
          ref={gifModal}
          onClose={() => {
            setIsModal(false);
            setIsModalRendered(false);
          }}
        >
          <button
            className={styles.closeModalButton}
            onClick={() => gifModal.current.close()}
          >
            <span className='material-symbols-outlined closeButton'>close</span>
          </button>
          <div>
            <GifPicker
              tenorApiKey={import.meta.env.VITE_TENOR_API_KEY}
              theme='dark'
              onGifClick={(selected) => {
                setGifUrl(selected.url);
                setNewPostImage(null);
                gifModal.current.close();
              }}
            />
          </div>
        </dialog>
      )}
      <div className={styles.formSection}>
        <div className={styles.currentUserPfp}>
          <Link to={`/users/${currentUser.id}`}>
            <img className='pfp' src={currentUser.pfpUrl} alt='' />
          </Link>
        </div>
        <NewPostForm
          posts={posts}
          newPostImage={newPostImage}
          gifUrl={gifUrl}
          setPosts={(p) => setPosts(p)}
          setNewPostImage={(src) => setNewPostImage(src)}
          setIsModal={(b) => setIsModal(b)}
          setGifUrl={(url) => setGifUrl(url)}
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
