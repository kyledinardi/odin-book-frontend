import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import backendFetch from '../../ helpers/backendFetch';
import formatDate from '../../ helpers/formatDate';
import styles from '../style/Content.module.css';

function Comment({
  comment,
  replaceComment,
  removeComment,
  displayType,
  repostedBy,
}) {
  const [repostId, setRepostId] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const editTextarea = useRef(null);
  const deleteModal = useRef(null);
  const imageModal = useRef(null);
  const [setError, currentUser] = useOutletContext();

  useEffect(() => {
    const repostTemp = comment.reposts.find(
      (repostObj) => repostObj.userId === currentUser.id,
    );

    setRepostId(repostTemp ? repostTemp.id : 0);
    setIsLiked(comment.likes.some((user) => user.id === currentUser.id));
  }, [comment, currentUser]);

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

  async function repost() {
    if (repostId === 0) {
      const response = await backendFetch(setError, '/reposts', {
        method: 'Post',
        body: JSON.stringify({ contentType: 'comment', id: comment.id }),
      });

      const newComment = {
        ...comment,
        reposts: [...comment.reposts, response.repost],
      };

      replaceComment(newComment);
    } else {
      const response = await backendFetch(setError, '/reposts', {
        method: 'Delete',
        body: JSON.stringify({ id: repostId }),
      });

      const newReposts = comment.reposts.filter(
        (repostObj) => repostObj.id !== response.repost.id,
      );

      replaceComment({ ...comment, reposts: newReposts });
    }
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
    <div>
      <dialog ref={deleteModal}>
        <h2>Are you sure you want to delete this comment?</h2>
        <div className='modalButtons'>
          <button onClick={() => deleteComment()}>Delete</button>
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
        <img src={comment.imageUrl} alt='' />
      </dialog>
      {repostedBy && (
        <p className={`gray ${styles.repostHeading}`}>
          <span className='material-symbols-outlined'>repeat</span>
          <span>{repostedBy} reposted</span>
        </p>
      )}
      <div className={`${styles.content} ${styles[displayType]}`}>
        <Link className={styles.pfp} to={`/users/${comment.userId}`}>
          <img className='pfp' src={comment.user.pfpUrl} alt='' />
        </Link>
        <div className={styles.heading}>
          <div className={styles.namesAndTimestamp}>
            <Link to={`/users/${comment.userId}`}>
              <strong>{comment.user.displayName}</strong>
            </Link>
            <Link to={`/users/${comment.userId}`}>
              <span className='gray'>{` @${comment.user.username}`}</span>
            </Link>
            <span className='gray'>{formatDate.short(comment.timestamp)}</span>
          </div>
          {comment.user.id === parseInt(localStorage.getItem('userId'), 10) && (
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
          {repostedBy && (
            <p>
              <span>Replying to </span>
              <Link
                className={styles.replyLink}
                to={`/users/${comment.post.userId}`}
              >
                @{comment.post.user.username}
              </Link>
              {comment.parent && (
                <>
                  <span> and </span>
                  <Link
                    className={styles.replyLink}
                    to={`/users/${comment.parent.userId}`}
                  >
                    @{comment.parent.user.username}
                  </Link>
                </>
              )}
            </p>
          )}
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
            <p className={styles.text}>{comment.text}</p>
          )}
          {comment.imageUrl && (
            <div className={styles.imageContainer}>
              <img
                src={comment.imageUrl}
                alt=''
                onClick={() => imageModal.current.showModal()}
              />
            </div>
          )}
          {displayType === 'focused' && !repostedBy && (
            <p className='gray'>{formatDate.long(comment.timestamp)}</p>
          )}
        </div>
        <div className={styles.interact}>
          <Link to={`/comments/${comment.id}`}>
            <button>
              <span className='material-symbols-outlined'>comment</span>
              <span>{comment.replies.length}</span>
            </button>
          </Link>
          <button onClick={() => repost()}>
            <span
              className={`material-symbols-outlined ${
                repostId !== 0 ? styles.reposted : ''
              }`}
            >
              repeat
            </span>
            <span>{comment.reposts.length}</span>
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
            <span>{comment.likes.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

Comment.propTypes = {
  comment: PropTypes.object,
  replaceComment: PropTypes.func,
  removeComment: PropTypes.func,
  displayType: PropTypes.string,
  repostedBy: PropTypes.string,
};

export default Comment;
