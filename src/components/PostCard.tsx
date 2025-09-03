import { useEffect, useRef, useState } from 'react';

import { useMutation } from '@apollo/client';
import { Link, useOutletContext } from 'react-router-dom';

import ContentForm from './ContentForm.tsx';
import Poll from './Poll.tsx';
import { DELETE_POST, LIKE_POST, REPOST } from '../graphql/mutations.ts';
import styles from '../style/Content.module.css';
import formatDate from '../utils/formatDate.ts';
import logError from '../utils/logError.ts';
import socket from '../utils/socket.ts';

import type { AppContext, Post } from '../types.ts';

const PostCard = ({
  post,
  replacePost,
  removePost,
  displayType,
}: {
  post: Post;
  replacePost: (updatedPost: Post) => void;
  removePost: (deletedPostId: string) => void;
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

  const [likePost] = useMutation(LIKE_POST, {
    onError: logError,

    onCompleted: () => {
      if (!isLiked && post.userId !== currentUser.id) {
        socket.emit('sendNotification', { userId: post.userId });
      }
    },
  });

  const [repost] = useMutation(REPOST, {
    onError: logError,

    onCompleted: () => {
      if (!currentUserRepostId && post.userId !== currentUser.id) {
        socket.emit('sendNotification', { userId: post.userId });
      } else {
        const newReposts = post.reposts.filter(
          (repostObj) => repostObj.id !== currentUserRepostId,
        );

        replacePost({ ...post, reposts: newReposts });
      }
    },
  });

  const [deletePost] = useMutation(DELETE_POST, {
    onError: logError,

    onCompleted: () => {
      removePost(post.id);
      deleteModal.current?.close();
    },
  });

  useEffect(() => {
    const repostTemp = post.reposts.find(
      (repostObj) => repostObj.userId === currentUser.id,
    );

    setCurrentUserRepostId(repostTemp ? repostTemp.id : null);
    setIsLiked(post.likes.some((user) => user.id === currentUser.id));
  }, [currentUser.id, post]);

  useEffect(() => {
    if (editTextarea.current) {
      editTextarea.current.style.height = `${editTextarea.current.scrollHeight}px`;
      editTextarea.current.style.overflowY = 'hidden';
    }
  }, [isEditing]);

  return (
    <div>
      <dialog ref={deleteModal}>
        <h2>Are you sure you want to delete this post?</h2>
        <div className='modalButtons'>
          <button onClick={() => deleteModal.current?.close()} type='button'>
            Cancel
          </button>
          <button
            type='button'
            onClick={() => {
              deletePost({ variables: { postId: post.id } }).catch(logError);
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
        <img alt='' src={post.imageUrl || undefined} />
      </dialog>
      <div className={`${styles.content} ${styles[displayType]}`}>
        <Link className={styles.pfp} to={`/users/${post.userId}`}>
          <img alt='' className='pfp' src={post.user.pfpUrl} />
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
          {isEditing ? (
            <ContentForm
              contentToEdit={post}
              contentType='post'
              setContent={() => setIsEditing(false)}
            />
          ) : (
            post.text !== '' && <p className={styles.text}>{post.text}</p>
          )}
          {post.imageUrl ? (
            <div className={styles.imageContainer}>
              <button
                aria-label='View image'
                className='imageButton'
                onClick={() => imageModal.current?.showModal()}
                type='button'
              >
                <img alt='' src={post.imageUrl} />
              </button>
            </div>
          ) : null}
          {post.pollChoices.length > 1 && <Poll post={post} />}
          {displayType === 'focused' && (
            <p className='gray'>{formatDate.long(post.timestamp)}</p>
          )}
        </div>
        <div className={styles.interact}>
          <Link to={`/posts/${post.id}`}>
            <button type='button'>
              <span className='material-symbols-outlined'>comment</span>
              <span>
                {post._count ? post._count.comments : post.comments.length}
              </span>
            </button>
          </Link>
          <button
            type='button'
            onClick={() => {
              repost({ variables: { id: post.id, contentType: 'post' } }).catch(
                logError,
              );
            }}
          >
            <span
              className={`material-symbols-outlined ${
                currentUserRepostId ? styles.reposted : ''
              }`}
            >
              repeat
            </span>
            <span>{post.reposts.length}</span>
          </button>
          <button
            type='button'
            onClick={() => {
              likePost({ variables: { postId: post.id } }).catch(logError);
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
            <span>{post.likes.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
