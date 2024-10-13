import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import formatDate from '../formatDate';
import styles from '../style/Comment.module.css';

function Comment({ comment, replaceComment, removeComment }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const modal = useRef(null);

  useEffect(() => {
    const currentUserId = parseInt(localStorage.getItem('userId'), 10);
    setIsLiked(comment.likes.some((user) => user.id === currentUserId));
  }, [comment]);

  async function deleteComment() {
    await fetch(
      `http://localhost:3000/comments/${comment.id}`,

      {
        method: 'DELETE',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    removeComment(comment.id);
    modal.current.close();
  }

  async function submitEdit(e) {
    e.preventDefault();

    const responseStream = await fetch(
      `http://localhost:3000/comments/${comment.id}`,

      {
        method: 'PUT',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({ text: e.target[0].value }),
      },
    );

    const response = await responseStream.json();
    replaceComment({ ...comment, text: response.comment.text });
    setIsEditing(false);
  }

  async function like() {
    const responseStream = await fetch(
      `http://localhost:3000/comments/${comment.id}/${
        isLiked ? 'unlike' : 'like'
      }`,

      {
        method: 'Put',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    const response = await responseStream.json();
    replaceComment({ ...comment, likes: response.comment.likes });
  }

  function resetTextareaHeight(e) {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  }

  return (
    <div className={styles.comment}>
      <dialog ref={modal}>
        <h2>Are you sure you want to delete this comment?</h2>
        <div className={styles.modalButtons}>
          <button onClick={() => deleteComment()}>Delete</button>
          <button onClick={() => modal.current.close()}>Cancel</button>
        </div>
      </dialog>
      <div className={styles.heading}>
        <div className={styles.links}>
          <Link to={`/users/${comment.userId}`}>
            <img className='pfp' src={comment.user.pfpUrl} alt='' />
          </Link>
          <Link to={`/users/${comment.userId}`}>
            <strong>{comment.user.displayName}</strong>
            <span className='gray'>{` @${comment.user.username}`}</span>
          </Link>
          <span className='gray'>{formatDate(comment.timestamp)}</span>
        </div>
        {comment.user.id === parseInt(localStorage.getItem('userId'), 10) && (
          <div className={styles.commentOptions}>
            <button onClick={() => setIsEditing(true)}>
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
      {isEditing ? (
        <form onSubmit={(e) => submitEdit(e)}>
          <textarea
            className={styles.commentEditText}
            name='commentEditText'
            id='commentEditText'
            defaultValue={comment.text}
            maxLength={1000}
            placeholder='Edit Comment'
            onInput={(e) => resetTextareaHeight(e)}
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
        <p>{comment.text}</p>
      )}
      <div className={styles.interact}>
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
          <span>{comment.likes.length}</span>
        </button>
      </div>
    </div>
  );
}

Comment.propTypes = {
  comment: PropTypes.object,
  replaceComment: PropTypes.func,
  removeComment: PropTypes.func,
};

export default Comment;
