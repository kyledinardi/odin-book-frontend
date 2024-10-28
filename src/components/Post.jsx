import PropTypes from 'prop-types';
import { Link, useOutletContext } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import formatDate from '../formatDate';
import Poll from './Poll.jsx';
import styles from '../style/Post.module.css';

function Post({ post, replacePost, removePost }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const modal = useRef(null);
  const [setError] = useOutletContext()
  const currentUserId = parseInt(localStorage.getItem('userId'), 10);

  useEffect(() => {
    setIsLiked(post.likes.some((user) => user.id === currentUserId));
  }, [currentUserId, post]);

  async function submitEdit(e) {
    e.preventDefault();

    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/posts/${post.id}`,

      {
        method: 'PUT',
        body: JSON.stringify({ text: e.target[0].value }),

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const response = await responseStream.json();

    if (response.error) {
      setError(response.error);
      return;
    }

    replacePost({ ...post, text: response.post.text });
    setIsEditing(false);
  }

  async function deletePost() {
    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/posts/${post.id}`,

      {
        method: 'DELETE',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    const response = responseStream.json();

    if (response.error) {
      setError(response.error);
      return;
    }

    removePost(post.id);
    modal.current.close();
  }

  async function like() {
    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/posts/${post.id}/${
        isLiked ? 'unlike' : 'like'
      }`,

      {
        method: 'PUT',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    const response = await responseStream.json();

    if (response.error) {
      setError(response.error);
      return;
    }

    replacePost({ ...post, likes: response.post.likes });
  }

  return (
    <div className={styles.post}>
      <dialog ref={modal}>
        <h2>Are you sure you want to delete this post?</h2>
        <div className={styles.modalButtons}>
          <button onClick={() => deletePost()}>Delete</button>
          <button onClick={() => modal.current.close()}>Cancel</button>
        </div>
      </dialog>
      <div className={styles.heading}>
        <div className={styles.links}>
          <Link to={`/users/${post.authorId}`}>
            <img className='pfp' src={post.author.pfpUrl} alt='' />
          </Link>
          <Link to={`/users/${post.authorId}`}>
            <strong>{post.author.displayName}</strong>
            <span className='gray'>{` @${post.author.username}`}</span>
          </Link>
          <Link to={`/posts/${post.id}`}>
            <span className='gray'>{formatDate(post.timestamp)}</span>
          </Link>
        </div>
        {post.author.id === currentUserId && (
          <div className={styles.postOptions}>
            <button onClick={() => setIsEditing(true)}>
              <span className='material-symbols-outlined'>edit</span>
            </button>
            <button onClick={() => modal.current.showModal()}>
              <span className='material-symbols-outlined'>delete</span>
            </button>
          </div>
        )}
      </div>
      {isEditing ? (
        <form onSubmit={(e) => submitEdit(e)}>
          <textarea
            className={styles.postEditText}
            name='postEditText'
            id='postEditText'
            defaultValue={post.text}
            maxLength={50000}
            placeholder='Edit Post'
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            required
          ></textarea>
          <div className={styles.editButtons}>
            <button>Edit</button>
            <button type='button' onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p>{post.text}</p>
      )}
      {post.imageUrl && <img src={post.imageUrl} alt='' />}
      {post.poll && (
        <Poll
          post={post}
          replacePost={(newPost) => replacePost(newPost)}
        />
      )}
      <div className={styles.interact}>
        <Link to={`/posts/${post.id}`}>
          <button>
            <span className='material-symbols-outlined'>comment</span>
            <span>{post.comments.length}</span>
          </button>
        </Link>
        <button onClick={() => like()}>
          <div>
            <span
              className='material-symbols-outlined'
              style={{
                fontVariationSettings: `'FILL' ${isLiked ? 1 : 0}`,
                color: isLiked ? '#f0f' : '#777',
              }}
            >
              favorite
            </span>
          </div>
          <span>{post.likes.length}</span>
        </button>
      </div>
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.object,
  replacePost: PropTypes.func,
  removePost: PropTypes.func,
};

export default Post;
