import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../style/Notification.module.css';

function Notification({ notif }) {
  const [icon, setIcon] = useState('');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    switch (notif.type) {
      case 'repost':
        setIcon('repeat');
        setText(' reposted your ');

        if (notif.postId) {
          setLink(<Link to={`/posts/${notif.postId}`}>post</Link>);
        } else {
          setLink(
            <Link to={`/comments/${notif.commentId}`}>comment</Link>
          );
        }

        break;

      case 'like':
        setIcon('heart_plus');
        setText(' liked your ');

        if (notif.postId) {
          setLink(<Link to={`/posts/${notif.postId}`}>post</Link>);
        } else {
          setLink(
            <Link to={`/comments/${notif.commentId}`}>comment</Link>
          );
        }

        break;

      case 'comment':
        setIcon('add_comment');
        setText(' commented on your ');
        setLink(<Link to={`/posts/${notif.postId}`}>post</Link>);
        break;

      case 'reply':
        setIcon('reply');
        setText(' replied to your ');

        setLink(
          <Link to={`/comments/${notif.commentId}`}>comment</Link>
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
          <Link to={`/messages/${notif.sourceUserId}`}>message</Link>
        );

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
          <img className='pfp' src={notif.sourceUser.pfpUrl} alt='' />
        </Link>
        <div className={styles.text}>
          <Link to={`/users/${notif.sourceUserId}`}>
            <strong>{notif.sourceUser.displayName}</strong>
          </Link>
          <span>{text}</span>
          <strong>{link}.</strong>
        </div>
      </div>
    </div>
  );
}

Notification.propTypes = {
  notif: PropTypes.object,
};

export default Notification;
