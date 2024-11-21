import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import Poll from './Poll.jsx';
import backendFetch from '../../ helpers/backendFetch';
import formatDate from '../../ helpers/formatDate';
import styles from '../style/Content.module.css';

function Post({ post, replacePost, removePost, page, repostedBy }) {
  const [repostId, setRepostId] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const editTextarea = useRef(null);
  const deleteModal = useRef(null);
  const imageModal = useRef(null);
  const [setError, currentUser] = useOutletContext();

  useEffect(() => {
    const repostTemp = post.reposts.find(
      (repostObj) => repostObj.userId === currentUser.id,
    );

    setRepostId(repostTemp ? repostTemp.id : 0);

    setIsLiked(post.likes.some((user) => user.id === currentUser.id));
  }, [currentUser, post]);

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

  async function repost() {
    if (repostId === 0) {
      const response = await backendFetch(setError, '/reposts', {
        method: 'Post',
        body: JSON.stringify({ contentType: 'post', id: post.id }),
      });

      replacePost({ ...post, reposts: [...post.reposts, response.repost] });
    } else {
      const response = await backendFetch(setError, '/reposts', {
        method: 'Delete',
        body: JSON.stringify({ id: repostId }),
      });

      const newReposts = post.reposts.filter(
        (repostObj) => repostObj.id !== response.repost.id,
      );

      replacePost({ ...post, reposts: newReposts });
    }
  }

  async function like() {
    const response = await backendFetch(
      setError,
      `/posts/${post.id}/${isLiked ? 'unlike' : 'like'}`,
      { method: 'PUT' },
    );

    replacePost({ ...post, likes: response.post.likes });
  }

  return (
    <div>
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
      {repostedBy && (
        <p className={`gray ${styles.repostHeading}`}>
          <span className='material-symbols-outlined'>repeat</span>
          <span>{repostedBy} reposted</span>
        </p>
      )}
      <div
        className={`${styles.content} ${
          page === 'comment' ? styles.ancestor : styles.focused
        }`}
      >
        <Link className={styles.pfp} to={`/users/${post.userId}`}>
          <img className='pfp' src={post.user.pfpUrl} alt='' />
        </Link>
        <div className={styles.heading}>
          <div className={styles.namesAndTimestamp}>
            <Link to={`/users/${post.userId}`}>
              <strong>{post.user.displayName}</strong>
            </Link>
            <Link to={`/users/${post.userId}`}>
              <span className='gray'>{`@${post.user.username}`}</span>
            </Link>
            <Link to={`/posts/${post.id}`}>
              <span className='gray'>{formatDate.short(post.timestamp)}</span>
            </Link>
          </div>
          {post.userId === currentUser.id && (
            <div className={styles.options}>
              <button onClick={() => setIsEditing(true)}>
                <span className='material-symbols-outlined'>edit</span>
              </button>
              <button onClick={() => deleteModal.current.showModal()}>
                <span className='material-symbols-outlined'>delete</span>
              </button>
            </div>
          )}
        </div>
        <div className={styles.line}></div>
        <div className={styles.mainContent}>
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
                className={styles.text}
                style={{ display: page === 'post' ? 'block' : '-webkit-box' }}
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
          {page === 'post' && (
            <p className='gray'>{formatDate.long(post.timestamp)}</p>
          )}
        </div>
        <div className={styles.interact}>
          <Link to={`/posts/${post.id}`}>
            <button>
              <span className='material-symbols-outlined'>comment</span>
              <span>{post.comments.length}</span>
            </button>
          </Link>
          <button onClick={() => repost()}>
            <span
              className='material-symbols-outlined'
              style={{ color: repostId > 0 ? '#008A00' : 'gray' }}
            >
              repeat
            </span>
            <span>{post.reposts.length}</span>
          </button>
          <button onClick={() => like()}>
            <div>
              <span
                className='material-symbols-outlined'
                style={{
                  fontVariationSettings: `'FILL' ${isLiked ? 1 : 0}`,
                  color: isLiked ? '#f0f' : 'gray',
                }}
              >
                favorite
              </span>
            </div>
            <span>{post.likes.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.object,
  replacePost: PropTypes.func,
  removePost: PropTypes.func,
  page: PropTypes.string,
  repostedBy: PropTypes.string,
};

export default Post;
