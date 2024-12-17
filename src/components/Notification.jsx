import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../style/Notification.module.css';

function Notification({ notification }) {
  const [icon, setIcon] = useState('');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    switch (notification.type) {
      case 'repost':
        setIcon('repeat');
        setText(' reposted your ');

        if (notification.postId) {
          setLink(<Link to={`/posts/${notification.postId}`}>post.</Link>);
        } else {
          setLink(
            <Link to={`/comments/${notification.commentId}`}>comment.</Link>,
          );
        }

        break;
      case 'like':
        setIcon('heart_plus');
        setText(' liked your ');

        if (notification.postId) {
          setLink(<Link to={`/posts/${notification.postId}`}>post.</Link>);
        } else {
          setLink(
            <Link to={`/comments/${notification.commentId}`}>comment.</Link>,
          );
        }

        break;
      case 'comment':
        setIcon('add_comment');
        setText(' commented on your ');
        setLink(<Link to={`/posts/${notification.postId}`}>post.</Link>);
        break;
      case 'reply':
        setIcon('reply');
        setText(' replied to your ');

        setLink(
          <Link to={`/comments/${notification.commentId}`}>comment.</Link>,
        );

        break;
      case 'follow':
        setIcon('group_add');
        setText(' started following you.');
        break;
      case 'message':
        setIcon('forward_to_inbox');
        setText(' sent you a ');

        setLink(
          <Link to={`/messages/${notification.sourceUserId}`}>message.</Link>,
        );

        break;
      default:
    }
  }, [notification]);

  return (
    <div className={styles.notification}>
      <span
        className={`material-symbols-outlined ${styles.icon} ${
          styles[notification.type]
        }`}
      >
        {icon}
      </span>
      <div>
        <Link to={`/users/${notification.sourceUserId}`}>
          <img className='pfp' src={notification.sourceUser.pfpUrl} alt='' />
        </Link>
        <div className={styles.text}>
          <Link to={`/users/${notification.sourceUserId}`}>
            <strong>{notification.sourceUser.displayName}</strong>
          </Link>
          <span>{text}</span>
          <strong>{link}</strong>
        </div>
      </div>
    </div>
  );
}

Notification.propTypes = {
  notification: PropTypes.object,
};

export default Notification;
