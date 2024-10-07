import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function User({ user, isFollowed, replaceUser }) {
  async function follow() {
    const responseStream = await fetch(
      `http://localhost:3000/users/${isFollowed ? 'unfollow' : 'follow'}`,

      {
        method: 'Put',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({ userId: user.id }),
      },
    );

    const response = await responseStream.json();
    replaceUser(response.user);
  }

  return (
    <div>
      <Link to={`/users/${user.id}`}>
        <img className='pfp' src={user.pfpUrl} alt='' />
        <span>{user.username}</span>
      </Link>
      <button onClick={() => follow()}>
        {isFollowed ? 'Unfollow' : 'Follow'}
      </button>
      <p>{user.bio}</p>
    </div>
  );
}

User.propTypes = {
  user: PropTypes.object,
  isFollowed: PropTypes.bool,
  replaceUser: PropTypes.func,
};

export default User;
