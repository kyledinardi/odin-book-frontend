import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import styles from '../style/Notification.module.css';

import type { Notification } from '../types';

const NotificationCard = ({ notif }: { notif: Notification }) => {
  const [icon, setIcon] = useState('');
  const [text, setText] = useState('');
  const [linkHref, setLinkHref] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    switch (notif.type) {
      case 'repost':
        setIcon('repeat');
        setText(' reposted your ');

        if (notif.postId) {
          setLinkHref(`/posts/${notif.postId}`);
          setLinkText('post');
        } else {
          setLinkHref(`/comments/${notif.commentId}`);
          setLinkText('comment');
        }

        break;

      case 'like':
        setIcon('heart_plus');
        setText(' liked your ');

        if (notif.postId) {
          setLinkHref(`/posts/${notif.postId}`);
          setLinkText('post');
        } else {
          setLinkHref(`/comments/${notif.commentId}`);
          setLinkText('comment');
        }

        break;

      case 'comment':
        setIcon('add_comment');
        setText(' commented on your ');
        setLinkHref(`/posts/${notif.postId}`);
        setLinkText('post');
        break;

      case 'reply':
        setIcon('reply');
        setText(' replied to your ');
        setLinkHref(`/comments/${notif.commentId}`);
        setLinkText('comment');
        break;

      case 'follow':
        setIcon('group_add');
        setText(' started following you.');
        break;

      case 'message':
        setIcon('forward_to_inbox');
        setText(' sent you a ');
        setLinkHref(`/messages/${notif.sourceUserId}`);
        setLinkText('message');
        break;

      default:
        throw new Error(`Unknown notification type: ${notif.type}`);
    }
  }, [notif]);

  return (
    <div className={styles.notification}>
      <span
        className={`material-symbols-outlined ${styles.icon} ${
          styles[notif.type]
        }`}
      >
        {icon}
      </span>
      <div>
        <Link to={`/users/${notif.sourceUserId}`}>
          <img alt='' className='pfp' src={notif.sourceUser.pfpUrl} />
        </Link>
        <div className={styles.text}>
          <Link to={`/users/${notif.sourceUserId}`}>
            <strong>{notif.sourceUser.displayName}</strong>
          </Link>
          <span>{text}</span>
          <strong>
            {!!linkHref && <Link to={linkHref}>{linkText}</Link>}.
          </strong>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
