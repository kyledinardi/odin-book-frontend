import { Fragment, useEffect, useRef, useState } from 'react';

import { useMutation } from '@apollo/client';
import { Link, useOutletContext } from 'react-router-dom';

import ContentForm from './ContentForm.tsx';
import { DELETE_COMMENT, LIKE_COMMENT, REPOST } from '../graphql/mutations.ts';
import styles from '../style/Content.module.css';
import formatDate from '../utils/formatDate.ts';
import logError from '../utils/logError.ts';
import socket from '../utils/socket.ts';

import type { AppContext, Comment } from '../types.ts';

const CommentCard = ({
  comment,
  replaceComment,
  removeComment,
  displayType,
}: {
  comment: Comment;
  replaceComment: (comment: Comment) => void;
  removeComment: (commentId: string) => void;
  displayType: string;
}) => {
  const [currentUserRepostId, setCurrentUserRepostId] = useState<string | null>(
    null,
  );

  const [isLiked, setIsLiked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const deleteModal = useRef<HTMLDialogElement>(null);
  const imageModal = useRef<HTMLDialogElement>(null);
  const editTextarea = useRef<HTMLTextAreaElement>(null);
  const [currentUser] = useOutletContext<AppContext>();

  const [likeComment] = useMutation(LIKE_COMMENT, {
    onError: logError,

    onCompleted: () => {
      if (!isLiked && comment.userId !== currentUser.id) {
        socket.emit('sendNotification', { userId: comment.userId });
      }
    },
  });

  const [repost] = useMutation(REPOST, {
    onError: logError,

    onCompleted: () => {
      if (!currentUserRepostId && comment.userId !== currentUser.id) {
        socket.emit('sendNotification', { userId: comment.userId });
      } else {
        const newReposts = comment.reposts.filter(
          (repostObj) => repostObj.id !== currentUserRepostId,
        );

        replaceComment({ ...comment, reposts: newReposts });
      }
    },
  });

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    onError: logError,

    onCompleted: () => {
      removeComment(comment.id);
      deleteModal.current?.close();
    },
  });

  useEffect(() => {
    const repostTemp = comment.reposts.find(
      (repostObj) => repostObj.userId === currentUser.id,
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
          <button onClick={() => deleteModal.current?.close()} type='button'>
            Cancel
          </button>
          <button
            type='button'
            onClick={() => {
              deleteComment({ variables: { commentId: comment.id } }).catch(
                logError,
              );
            }}
          >
            Delete
          </button>
        </div>
      </dialog>
      <dialog ref={imageModal} className={styles.imageModal}>
        <button
          className='closeButton'
          onClick={() => imageModal.current?.close()}
          type='button'
        >
          <span className='material-symbols-outlined closeIcon'>close</span>
        </button>
        <img alt='' src={comment.imageUrl || undefined} />
      </dialog>
      <div className={`${styles.content} ${styles[displayType]}`}>
        <Link className={styles.pfp} to={`/users/${comment.userId}`}>
          <img alt='' className='pfp' src={comment.user.pfpUrl} />
        </Link>
        <div className={styles.heading}>
          <div className={styles.namesAndTimestamp}>
            <Link to={`/users/${comment.userId}`}>
              <strong>{comment.user.displayName}</strong>
            </Link>
            <Link to={`/users/${comment.userId}`}>
              <span className='gray'>{` @${comment.user.username}`}</span>
            </Link>
            <Link className='gray' to={`/comments/${comment.id}`}>
              <span className='gray'>
                {formatDate.short(comment.timestamp)}
              </span>
            </Link>
          </div>
          {comment.userId === currentUser.id && (
            <div className={styles.options}>
              <button onClick={() => setIsEditing(!isEditing)} type='button'>
                <span className='material-symbols-outlined'>edit</span>
              </button>
              <button
                onClick={() => deleteModal.current?.showModal()}
                type='button'
              >
                <span className='material-symbols-outlined'>delete</span>
              </button>
            </div>
          )}
        </div>
        {displayType === 'ancestor' && <div className={styles.line} />}
        <div className={styles.mainContent}>
          {displayType === 'repost' && (
            <p>
              <span>Replying to </span>
              <Link
                className={styles.replyLink}
                to={`/users/${comment.post?.userId}`}
              >
                @{comment.post?.user.username}
              </Link>
              {comment.parent ? (
                <Fragment>
                  <span> and </span>
                  <Link
                    className={styles.replyLink}
                    to={`/users/${comment.parent.userId}`}
                  >
                    @{comment.parent.user.username}
                  </Link>
                </Fragment>
              ) : null}
            </p>
          )}
          {isEditing ? (
            <ContentForm
              contentToEdit={comment}
              contentType='comment'
              setContent={() => setIsEditing(false)}
            />
          ) : (
            <p className={styles.text}>{comment.text}</p>
          )}
          {comment.imageUrl ? (
            <div className={styles.imageContainer}>
              <button
                aria-label='View image'
                className='imageButton'
                onClick={() => imageModal.current?.showModal()}
                type='button'
              >
                <img alt='' src={comment.imageUrl} />
              </button>
            </div>
          ) : null}
          {displayType === 'focused' && (
            <p className='gray'>{formatDate.long(comment.timestamp)}</p>
          )}
        </div>
        <div className={styles.interact}>
          <Link to={`/comments/${comment.id}`}>
            <button type='button'>
              <span className='material-symbols-outlined'>comment</span>
              <span>{comment._count.replies}</span>
            </button>
          </Link>
          <button
            type='button'
            onClick={() => {
              repost({
                variables: { id: comment.id, contentType: 'comment' },
              }).catch(logError);
            }}
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
            type='button'
            onClick={() => {
              likeComment({ variables: { commentId: comment.id } }).catch(
                logError,
              );
            }}
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
};

export default CommentCard;
