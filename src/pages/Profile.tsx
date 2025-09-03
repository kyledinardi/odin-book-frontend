import { useEffect, useRef, useState } from 'react';

import { useMutation, useQuery } from '@apollo/client';
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import ErrorPage from './ErrorPage.tsx';
import ProfilePostList from '../components/ProfilePostList.tsx';
import UpdatePasswordForm from '../components/UpdatePasswordForm.tsx';
import UpdateProfileForm from '../components/UpdateProfileForm.tsx';
import { FIND_OR_CREATE_ROOM, FOLLOW } from '../graphql/mutations.ts';
import { GET_USER } from '../graphql/queries.ts';
import styles from '../style/Profile.module.css';
import logError from '../utils/logError.ts';
import navigateTo from '../utils/navigateTo.ts';
import socket from '../utils/socket.ts';

import type { AppContext } from '../types.ts';

const Profile = () => {
  const [isFollowed, setIsFollowed] = useState(false);
  const [isUserModal, setIsUserModal] = useState(false);
  const [isUserModalRendered, setIsUserModalRendered] = useState(false);

  const [openTab, setOpenTab] = useState('posts');
  const [userModalType, setUserModalType] = useState('');
  const [imageModalType, setImageModalType] = useState('');
  const userModal = useRef<HTMLDialogElement>(null);
  const imageModal = useRef<HTMLDialogElement>(null);

  const [currentUser, setCurrentUser] = useOutletContext<AppContext>();
  const navigate = useNavigate();
  const { userId } = useParams();
  const userResult = useQuery(GET_USER, { variables: { userId } });
  const user = userResult.data?.getUser;

  const [follow] = useMutation(FOLLOW, {
    onError: logError,

    onCompleted: () => {
      setCurrentUser();
      setIsFollowed(!isFollowed);

      if (!isFollowed && user?.id !== currentUser.id) {
        socket.emit('sendNotification', { userId });
      }
    },
  });

  const [findOrCreateRoom] = useMutation(FIND_OR_CREATE_ROOM, {
    onError: logError,

    onCompleted: (data) => {
      navigateTo(navigate, `/messages/${data.findOrCreateRoom.id}`).catch(
        logError,
      );
    },
  });

  useEffect(() => {
    if (currentUser && userId) {
      const isFollowedTemp = currentUser.following.some(
        (followedUser) => followedUser.id === userId,
      );

      setIsFollowed(isFollowedTemp);
    }
  }, [currentUser, userId]);

  useEffect(() => {
    if (isUserModal) {
      setIsUserModalRendered(true);

      if (isUserModalRendered) {
        userModal.current?.showModal();
      }
    }
  }, [isUserModal, isUserModalRendered]);

  if (userResult.error) {
    logError(userResult.error);
    return <ErrorPage error={userResult.error} />;
  }

  const renderButtons = () => {
    if (!user) {
      throw new Error('No user result');
    }

    if (userId === currentUser.id) {
      return (
        <div className={styles.topButtons}>
          <button
            type='button'
            onClick={() => {
              setUserModalType('profile');
              setIsUserModal(true);
            }}
          >
            Edit Profile
          </button>
          <button
            type='button'
            onClick={() => {
              setUserModalType('password');
              setIsUserModal(true);
            }}
          >
            Change Password
          </button>
        </div>
      );
    }

    return (
      <div className={styles.topButtons}>
        <button
          type='button'
          onClick={() => {
            findOrCreateRoom({ variables: { userId } }).catch(logError);
          }}
        >
          Message
        </button>
        <button
          type='button'
          onClick={() => {
            follow({ variables: { userId } }).catch(logError);
          }}
        >
          {isFollowed ? 'Unfollow' : 'Follow'}
        </button>
      </div>
    );
  };

  return !user || !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader' />
    </div>
  ) : (
    <main>
      {isUserModal ? (
        <dialog
          ref={userModal}
          onClose={() => {
            setIsUserModal(false);
            setIsUserModalRendered(false);
          }}
        >
          <button
            className='closeButton'
            onClick={() => userModal.current?.close()}
            type='button'
          >
            <span className='material-symbols-outlined closeIcon'>close</span>
          </button>
          {userModalType === 'profile' ? (
            <UpdateProfileForm userModal={userModal} />
          ) : (
            <UpdatePasswordForm userModal={userModal} />
          )}
        </dialog>
      ) : null}
      <dialog ref={imageModal} className={styles.imageModal}>
        <button
          className='closeButton'
          onClick={() => imageModal.current?.close()}
          type='button'
        >
          <span className='material-symbols-outlined closeIcon'>close</span>
        </button>
        <img
          alt=''
          src={imageModalType === 'pfp' ? user.pfpUrl : user.headerUrl}
        />
      </dialog>
      <div className={styles.heading}>
        <div>
          <h2>{user.displayName}</h2>
          <p>
            {user._count.posts} post{user._count.posts === 1 ? '' : 's'}
          </p>
        </div>
      </div>
      {user.headerUrl ? (
        <button
          aria-label='header'
          className='imageButton'
          type='button'
          onClick={() => {
            setImageModalType('header');
            imageModal.current?.showModal();
          }}
        >
          <img alt='' className={styles.headerImage} src={user.headerUrl} />
        </button>
      ) : null}
      <div className={styles.pfpAndButtons}>
        <button
          aria-label='pfp'
          className='imageButton'
          type='button'
          onClick={() => {
            setImageModalType('pfp');
            imageModal.current?.showModal();
          }}
        >
          <img alt='' className={styles.profilePagePfp} src={user.pfpUrl} />
        </button>
        {renderButtons()}
      </div>
      <div className={styles.userInfo}>
        <h2>{user.displayName}</h2>
        <span className='gray'>@{user.username}</span>
        <p>{user.bio}</p>
        <div className={styles.userDetails}>
          {user.location ? (
            <div className={styles.detail}>
              <span
                className={`material-symbols-outlined ${styles.profileIcon}`}
              >
                location_on
              </span>
              <span>{user.location}</span>
            </div>
          ) : null}
          {user.website ? (
            <div className={styles.detail}>
              <span
                className={`material-symbols-outlined ${styles.profileIcon}`}
              >
                link
              </span>
              <a
                className={styles.websiteLink}
                rel='noopener noreferrer'
                target='_blank'
                href={
                  user.website.startsWith('http://') ||
                  user.website.startsWith('https://')
                    ? user.website
                    : `https://${user.website}`
                }
              >
                {user.website}
              </a>
            </div>
          ) : null}
          <div className={styles.detail}>
            <span className={`material-symbols-outlined ${styles.profileIcon}`}>
              calendar_month
            </span>
            <span>
              <span>Joined </span>
              {Intl.DateTimeFormat(undefined, {
                month: 'long',
                year: 'numeric',
              }).format(new Date(Number(user.joinDate)))}
            </span>
          </div>
        </div>
        <Link className={styles.followStats} to={`/users/${user.id}/follows`}>
          <span>
            <strong>{user._count.following}</strong>
            <span> Following</span>
          </span>
          <span>
            <strong>{user._count.followers}</strong>
            <span> Follower{user._count.followers === 1 ? '' : 's'}</span>
          </span>
        </Link>
      </div>
      <div className='categoryButtons'>
        <button
          className={`categoryButton ${openTab === 'posts' ? 'openTab' : ''}`}
          onClick={() => setOpenTab('posts')}
          type='button'
        >
          Posts
        </button>
        <button
          onClick={() => setOpenTab('comments')}
          type='button'
          className={`categoryButton ${
            openTab === 'comments' ? 'openTab' : ''
          }`}
        >
          Comments
        </button>
        <button
          className={`categoryButton ${openTab === 'images' ? 'openTab' : ''}`}
          onClick={() => setOpenTab('images')}
          type='button'
        >
          Images
        </button>
        <button
          className={`categoryButton ${openTab === 'likes' ? 'openTab' : ''}`}
          onClick={() => setOpenTab('likes')}
          type='button'
        >
          Likes
        </button>
      </div>
      <ProfilePostList openTab={openTab} user={user} />
    </main>
  );
};

export default Profile;
