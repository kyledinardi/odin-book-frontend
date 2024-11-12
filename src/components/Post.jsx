import PropTypes from 'prop-types';
import { Link, useOutletContext } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import Poll from './Poll.jsx';
import styles from '../style/Post.module.css';
import formatDate from '../../ helpers/formatDate';
import backendFetch from '../../ helpers/backendFetch';

function Post({ post, replacePost, removePost, isPostPage }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const editTextarea = useRef(null);
  const deleteModal = useRef(null);
  const imageModal = useRef(null);

  const [setError] = useOutletContext();
  const currentUserId = parseInt(localStorage.getItem('userId'), 10);

  useEffect(() => {
    setIsLiked(post.likes.some((user) => user.id === currentUserId));
  }, [currentUserId, post]);

  useEffect(() => {
    if (editTextarea.current) {
      editTextarea.current.style.height = `${editTextarea.current.scrollHeight}px`;
      editTextarea.current.style.overflowY = 'hidden';
    }
  }, [isEditing]);

  async function submitEdit(e) {
    e.preventDefault();

    const response = await backendFetch(setError, `/posts/${post.id}`, {
      method: 'PUT',
      body: JSON.stringify({ text: e.target[0].value }),
    });

    replacePost({ ...post, text: response.post.text });
    setIsEditing(false);
  }

  async function deletePost() {
    await backendFetch(setError, `/posts/${post.id}`, {
      method: 'DELETE',
    });

    removePost(post.id);
    deleteModal.current.close();
  }

  async function like() {
    const response = await backendFetch(
      setError,
      `/posts/${post.id}/${isLiked ? 'unlike' : 'like'}`,
      { method: 'PUT' },
    );

    replacePost({ ...post, likes: response.post.likes });
  }

  function renderPostPageTimestamp() {
    const timestamp = new Date(post.timestamp);

    const time = Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(
      timestamp,
    );

    const date = Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
      timestamp,
    );

    return `${time}, ${date}`
  }

  return (
    <div className={styles.post}>
      <dialog ref={deleteModal}>
        <h2>Are you sure you want to delete this post?</h2>
        <div className='modalButtons'>
          <button onClick={() => deletePost()}>Delete</button>
          <button onClick={() => deleteModal.current.close()}>Cancel</button>
        </div>
      </dialog>
      <dialog ref={imageModal} className={styles.imageModal}>
        <button
          className='closeButton'
          onClick={() => imageModal.current.close()}
        >
          <span className='material-symbols-outlined closeIcon'>close</span>
        </button>
        <img src={post.imageUrl} alt='' />
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
            <button onClick={() => deleteModal.current.showModal()}>
              <span className='material-symbols-outlined'>delete</span>
            </button>
          </div>
        )}
      </div>
      {isEditing ? (
        <form onSubmit={(e) => submitEdit(e)}>
          <textarea
            className={styles.editTextarea}
            ref={editTextarea}
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
        post.text !== '' && (
          <p
            className={styles.postText}
            style={{ display: isPostPage ? 'block' : '-webkit-box' }}
          >
            {post.text}
          </p>
        )
      )}
      {post.imageUrl && (
        <div className={styles.imageContainer}>
          <img
            src={post.imageUrl}
            alt=''
            onClick={() => imageModal.current.showModal()}
          />
        </div>
      )}
      {post.poll && (
        <Poll post={post} replacePost={(newPost) => replacePost(newPost)} />
      )}
      {isPostPage && <p className='gray'>{renderPostPageTimestamp()}</p>}
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
  isPostPage: PropTypes.bool,
};

export default Post;
