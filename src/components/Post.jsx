import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import formatDate from '../formatDate';
import styles from '../style/Post.module.css';

function Post({ post, replacePost, removePost }) {
  const [isLiked, setIsLiked] = useState(false);
  const modal = useRef(null);

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

  async function deletePost() {
    await fetch(
      `http://localhost:3000/posts/${post.id}`,

      {
        method: 'DELETE',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    removePost(post.id);
    modal.current.close();
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
        {post.author.id === parseInt(localStorage.getItem('userId'), 10) && (
          <div className={styles.postOptions}>
            <button>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='24px'
                viewBox='0 -960 960 960'
                width='24px'
                fill='#808080'
              >
                <path d='M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z' />
              </svg>
            </button>
            <button onClick={() => modal.current.showModal()}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                height='24px'
                viewBox='0 -960 960 960'
                width='24px'
                fill='#808080'
              >
                <path d='M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z' />
              </svg>
            </button>
          </div>
        )}
      </div>

      <p>{post.text}</p>
      {post.imageUrl && <img src={post.imageUrl} alt='' />}
      <div className={styles.interact}>
        <Link to={`/posts/${post.id}`}>
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
            <span>{post.comments.length}</span>
          </button>
        </Link>
        <button onClick={() => like()}>
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
