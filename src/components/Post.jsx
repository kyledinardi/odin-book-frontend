import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

function Post({ post, replacePost }) {
  async function like() {
    const currentUserId = parseInt(localStorage.getItem('userId'), 10);
    const isLiked = post.likes.some((user) => user.id === currentUserId);

    const responseStream = await fetch(
      `http://localhost:3000/posts/${post.id}/${isLiked ? 'unlike' : 'like'}`,

      {
        method: 'Put',
        mode: 'cors',

        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    );

    const response = await responseStream.json();
    replacePost({ ...post, likes: response.post.likes });
  }

  return (
    <div>
      <Link to={`/users/${post.authorId}`}>
        <img className='pfp' src={post.author.pfpUrl} alt='' />
        <span>{post.author.username}</span>
      </Link>
      <Link to={`/posts/${post.id}`}>
        <span>{new Date(post.timestamp).toLocaleString()}</span>
      </Link>
      <p>{post.text}</p>
      {post.imageUrl && <img src={post.imageUrl} alt='' />}
      <div>
        <Link to={`/posts/${post.id}`}>
          <button>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              height='24px'
              viewBox='0 -960 960 960'
              width='24px'
              fill='#000'
            >
              <path d='M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z' />
            </svg>
            <span>{post.comments.length}</span>
          </button>
        </Link>
        <button onClick={() => like()}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            height='24px'
            viewBox='0 -960 960 960'
            width='24px'
            fill='#000'
          >
            <path d='m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z' />
          </svg>
          <span>{post.likes.length}</span>
        </button>
      </div>
    </div>
  );
}

Post.propTypes = {
  post: PropTypes.object,
  replacePost: PropTypes.func,
};

export default Post;
