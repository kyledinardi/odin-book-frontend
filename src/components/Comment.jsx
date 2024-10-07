import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function Comment({ comment }) {
  return (
    <div>
      <Link to={`/users/${comment.userId}`}>
        <img className='pfp' src={comment.user.pfpUrl} alt='' />
        <span>{comment.user.username}</span>
      </Link>
      <span>{new Date(comment.timestamp).toLocaleString()}</span>
      <p>{comment.text}</p>
    </div>
  );
}

Comment.propTypes = {
  comment: PropTypes.object,
};

export default Comment;
