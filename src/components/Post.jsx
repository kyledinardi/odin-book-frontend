import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from '../style/Post.module.css';

function Post({ post, replacePost, isPostPage }) {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const currentUserId = parseInt(localStorage.getItem('userId'), 10);
    setIsLiked(post.likes.some((user) => user.id === currentUserId));
  }, [post]);

  async function like() {
    const responseStream = await fetch(
      `http://localhost:3000/posts/${post.id}/${isLiked ? 'unlike' : 'like'}`,

      {
        method: 'Put',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    const response = await responseStream.json();
    replacePost({ ...post, likes: response.post.likes });
  }

  function formatDate(date) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;

    const current = new Date();
    const timestamp = new Date(date);
    const elapsed = current.getTime() - timestamp.getTime();

    if (elapsed < 1) {
      return '0s';
    }

    if (elapsed < msPerMinute) {
      return `${Math.round(elapsed / 1000)}s`;
    }

    if (elapsed < msPerHour) {
      return `${Math.round(elapsed / msPerMinute)}m`;
    }

    if (elapsed < msPerDay) {
      return `${Math.round(elapsed / msPerHour)}h`;
    }

    if (timestamp.getFullYear() === current.getFullYear()) {
      return timestamp.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    }

    return timestamp.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className={styles.post}>
      {!isPostPage && (
        <Link to={`/posts/${post.id}`}>
          <span className={styles.postLink}></span>
        </Link>
      )}
      <div className={styles.heading}>
        <Link className={styles.userLink} to={`/users/${post.authorId}`}>
          <img className='pfp' src={post.author.pfpUrl} alt='' />
        </Link>
        <Link className={styles.userLink} to={`/users/${post.authorId}`}>
          <strong>{post.author.username}</strong>
        </Link>
        <span className={styles.timestamp}>{formatDate(post.timestamp)}</span>
      </div>
      <p>{post.text}</p>
      {post.imageUrl && <img src={post.imageUrl} alt='' />}
      <div className={styles.interact}>
        <button>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            height='24px'
            viewBox='0 -960 960 960'
            width='24px'
            fill='#777'
          >
            <path d='M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z' />
          </svg>
          <span className={styles.interactNumber}>{post.comments.length}</span>
        </button>
        <button className={styles.likeButton} onClick={() => like()}>
          <div
            style={{
              fontVariationSettings: `'FILL' ${isLiked ? 1 : 0}`,
              color: isLiked ? '#f0f' : '#777',
            }}
          >
            <span className={`material-symbols-outlined ${styles.likeSVG}`}>
              favorite
            </span>
          </div>
          <span className={styles.interactNumber}>{post.likes.length}</span>
        </button>
      </div>
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.object,
  replacePost: PropTypes.func,
  isPostPage: PropTypes.bool,
};

export default Post;
