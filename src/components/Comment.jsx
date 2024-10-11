import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import formatDate from '../formatDate';
import styles from '../style/Comment.module.css';

function Comment({ comment }) {
  return (
    <div className={styles.comment}>
      <div className={styles.heading}>
        <Link to={`/users/${comment.userId}`}>
          <img className='pfp' src={comment.user.pfpUrl} alt='' />
        </Link>
        <Link to={`/users/${comment.userId}`}>
          <strong>{comment.user.displayName}</strong>
          <span className='gray'>{` @${comment.user.username}`}</span>
        </Link>
        <span className='gray'>
          {formatDate(comment.timestamp)}
        </span>
      </div>
      <p>{comment.text}</p>
    </div>
  );
}

Comment.propTypes = {
  comment: PropTypes.object,
};

export default Comment;
