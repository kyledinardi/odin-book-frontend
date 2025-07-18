import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import Poll from './Poll.jsx';
import ContentForm from './ContentForm.jsx';
import backendFetch from '../../utils/backendFetch';
import formatDate from '../../utils/formatDate';
import socket from '../../utils/socket';
import styles from '../style/Content.module.css';

function Post({ post, replacePost, removePost, displayType }) {
  const [currentUserRepostId, setCurrentUserRepostId] = useState(null);
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

    setCurrentUserRepostId(repostTemp ? repostTemp.id : null);

    setIsLiked(post.likes.some((user) => user.id === currentUser.id));
  }, [currentUser, post]);

  useEffect(() => {
    if (editTextarea.current) {
      editTextarea.current.style.height = `${editTextarea.current.scrollHeight}px`;
      editTextarea.current.style.overflowY = 'hidden';
    }
  }, [isEditing]);

  async function deletePost() {
    await backendFetch(setError, `/posts/${post.id}`, {
      method: 'DELETE',
    });

    removePost(post.id);
    deleteModal.current.close();
  }

  async function repost() {
    if (!currentUserRepostId) {
      const response = await backendFetch(setError, '/reposts', {
        method: 'Post',
        body: JSON.stringify({ contentType: 'post', id: post.id }),
      });

      replacePost({ ...post, reposts: [...post.reposts, response.repost] });
      socket.emit('sendNotification', { userId: post.userId });
    } else {
      const response = await backendFetch(setError, '/reposts', {
        method: 'Delete',
        body: JSON.stringify({ id: currentUserRepostId }),
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

    if (!isLiked) {
      socket.emit('sendNotification', { userId: post.userId });
    }
  }

  return (
    <div>
      <dialog ref={deleteModal}>
        <h2>Are you sure you want to delete this post?</h2>
        <div className='modalButtons'>
          <button onClick={() => deleteModal.current.close()}>Cancel</button>
          <button onClick={() => deletePost()}>Delete</button>
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
      <div className={`${styles.content} ${styles[displayType]}`}>
        <Link className={styles.pfp} to={`/users/${post.userId}`}>
          <img className='pfp' src={post.user.pfpUrl} alt='' />
        </Link>
        <div className={styles.heading}>
          <div className={styles.namesAndTimestamp}>
            <Link to={`/users/${post.userId}`}>
              <strong>{post.user.displayName}</strong>
            </Link>
            <Link to={`/users/${post.userId}`}>
              <span className='gray'>@{post.user.username}</span>
            </Link>
            <Link to={`/posts/${post.id}`}>
              <span className='gray'>{formatDate.short(post.timestamp)}</span>
            </Link>
          </div>
          {post.userId === currentUser.id && (
            <div className={styles.options}>
              <button onClick={() => setIsEditing(!isEditing)}>
                <span className='material-symbols-outlined'>edit</span>
              </button>
              <button onClick={() => deleteModal.current.showModal()}>
                <span className='material-symbols-outlined'>delete</span>
              </button>
            </div>
          )}
        </div>
        {displayType === 'ancestor' && <div className={styles.line}></div>}
        <div className={styles.mainContent}>
          {isEditing ? (
            <ContentForm
              contentType='post'
              setContent={(updatedPost) => {
                replacePost(updatedPost);
                setIsEditing(false);
              }}
              contentToEdit={post}
            />
          ) : (
            post.text !== '' && <p className={styles.text}>{post.text}</p>
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
          {displayType === 'focused' && (
            <p className='gray'>{formatDate.long(post.timestamp)}</p>
          )}
        </div>
        <div className={styles.interact}>
          <Link to={`/posts/${post.id}`}>
            <button>
              <span className='material-symbols-outlined'>comment</span>
              <span>
                {post._count ? post._count.comments : post.comments.length}
              </span>
            </button>
          </Link>
          <button onClick={() => repost()}>
            <span
              className={`material-symbols-outlined ${
                currentUserRepostId ? styles.reposted : ''
              }`}
            >
              repeat
            </span>
            <span>{post.reposts.length}</span>
          </button>
          <button onClick={() => like()}>
            <div>
              <span
                className={`material-symbols-outlined ${
                  isLiked ? styles.liked : ''
                }`}
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
  displayType: PropTypes.string,
};

export default Post;
