import PropTypes from 'prop-types';
import { Link, useOutletContext } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import styles from '../style/Comment.module.css';
import formatDate from '../../ helpers/formatDate';
import backendFetch from '../../ helpers/backendFetch';

function Comment({ comment, replaceComment, removeComment }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [setError] = useOutletContext();
  const editTextarea = useRef(null);
  const deleteModal = useRef(null);

  useEffect(() => {
    const currentUserId = parseInt(localStorage.getItem('userId'), 10);
    setIsLiked(comment.likes.some((user) => user.id === currentUserId));
  }, [comment]);

  useEffect(() => {
    if (editTextarea.current) {
      editTextarea.current.style.height = `${editTextarea.current.scrollHeight}px`;
      editTextarea.current.style.overflowY = 'hidden';
    }
  }, [isEditing]);

  async function deleteComment() {
    await backendFetch(setError, `/comments/${comment.id}`, {
      method: 'DELETE',
    });

    removeComment(comment.id);
    deleteModal.current.close();
  }

  async function submitEdit(e) {
    e.preventDefault();

    const response = await backendFetch(setError, `/comments/${comment.id}`, {
      method: 'PUT',
      body: JSON.stringify({ text: e.target[0].value }),
    });

    replaceComment({ ...comment, text: response.comment.text });
    setIsEditing(false);
  }

  async function like() {
    const response = await backendFetch(
      setError,
      `/comments/${comment.id}/${isLiked ? 'unlike' : 'like'}`,
      { method: 'PUT' },
    );

    replaceComment({ ...comment, likes: response.comment.likes });
  }

  return (
    <div className={styles.comment}>
      <dialog ref={deleteModal}>
        <h2>Are you sure you want to delete this comment?</h2>
        <div className='modalButtons'>
          <button onClick={() => deleteComment()}>Delete</button>
          <button onClick={() => deleteModal.current.close()}>Cancel</button>
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
            className={styles.commentEditText}
            ref={editTextarea}
            name='commentEditText'
            id='commentEditText'
            defaultValue={comment.text}
            maxLength={10000}
            placeholder='Edit Comment'
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
        <p className={styles.commentText}>{comment.text}</p>
      )}
      <div className={styles.interact}>
        <button className={styles.likeButton} onClick={() => like()}>
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
