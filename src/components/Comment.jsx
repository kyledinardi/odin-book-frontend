import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import PropTypes from 'prop-types';
import ContentForm from './ContentForm.jsx';
import { LIKE_COMMENT, REPOST, DELETE_COMMENT } from '../graphql/mutations';
import formatDate from '../utils/formatDate';
import logError from '../utils/logError';
import socket from '../utils/socket';
import styles from '../style/Content.module.css';

function Comment({ comment, replaceComment, removeComment, displayType }) {
  const [currentUserRepostId, setCurrentUserRepostId] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const editTextarea = useRef(null);
  const deleteModal = useRef(null);
  const imageModal = useRef(null);
  const [currentUser] = useOutletContext();

  const [likeComment] = useMutation(LIKE_COMMENT, {
    onError: logError,

    onCompleted: () => {
      if (!isLiked && comment.userId !== Number(currentUser.id)) {
        socket.emit('sendNotification', { userId: comment.userId });
      }
    },
  });

  const [repost] = useMutation(REPOST, {
    onError: logError,

    onCompleted: () => {
      if (!currentUserRepostId && comment.userId !== Number(currentUser.id)) {
        socket.emit('sendNotification', { userId: comment.userId });
      } else {
        const newReposts = comment.reposts.filter(
          (repostObj) => repostObj.id !== currentUserRepostId
        );

        replaceComment({ ...comment, reposts: newReposts });
      }
    },
  });

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    onError: logError,

    onCompleted: () => {
      removeComment(comment.id);
      deleteModal.current.close();
    },
  });

  useEffect(() => {
    const repostTemp = comment.reposts.find(
      (repostObj) => repostObj.userId === Number(currentUser.id)
    );

    setCurrentUserRepostId(repostTemp ? repostTemp.id : null);
    setIsLiked(comment.likes.some((user) => user.id === currentUser.id));
  }, [comment, currentUser]);

  useEffect(() => {
    if (editTextarea.current) {
      editTextarea.current.style.height = `${editTextarea.current.scrollHeight}px`;
      editTextarea.current.style.overflowY = 'hidden';
    }
  }, [isEditing]);

  return (
    <div>
      <dialog ref={deleteModal}>
        <h2>Are you sure you want to delete this comment?</h2>
        <div className='modalButtons'>
          <button onClick={() => deleteModal.current.close()}>Cancel</button>
          <button
            onClick={() =>
              deleteComment({ variables: { commentId: comment.id } })
            }
          >
            Delete
          </button>
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
            <Link to={`/comments/${comment.id}`} className='gray'>
              <span className='gray'>
                {formatDate.short(comment.timestamp)}
              </span>
            </Link>
          </div>
          {comment.userId === Number(currentUser.id) && (
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
          {displayType === 'repost' && (
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
            <ContentForm
              contentType='comment'
              setContent={() => setIsEditing(false)}
              contentToEdit={comment}
            />
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
          {displayType === 'focused' && (
            <p className='gray'>{formatDate.long(comment.timestamp)}</p>
          )}
        </div>
        <div className={styles.interact}>
          <Link to={`/comments/${comment.id}`}>
            <button>
              <span className='material-symbols-outlined'>comment</span>
              <span>{comment._count.replies}</span>
            </button>
          </Link>
          <button
            onClick={() =>
              repost({ variables: { id: comment.id, contentType: 'comment' } })
            }
          >
            <span
              className={`material-symbols-outlined ${
                currentUserRepostId ? styles.reposted : ''
              }`}
            >
              repeat
            </span>
            <span>{comment.reposts.length}</span>
          </button>
          <button
            onClick={() =>
              likeComment({ variables: { commentId: comment.id } })
            }
          >
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
};

export default Comment;
