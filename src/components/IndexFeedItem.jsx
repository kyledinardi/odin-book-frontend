import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Post from './Post.jsx';
import Comment from './Comment.jsx';
import { indexFeedCache } from '../utils/apolloCache';

function IndexFeedItem({ post, postsResult }) {
  if (post.postId) {
    return (
      <div key={`repost${post.id}`}>
        <p className='repostHeading'>
          <span className='material-symbols-outlined'>repeat</span>
          <Link to={`/users/${post.userId}`}>
            {post.user.displayName} reposted
          </Link>
        </p>
        <Post
          post={post.post}
          replacePost={(updatedPost) =>
            indexFeedCache.update(postsResult, updatedPost)
          }
          removePost={(deletedPostId) =>
            indexFeedCache.delete(postsResult, deletedPostId, 'post')
          }
          displayType='repost'
        />
      </div>
    );
  }

  if (post.commentId) {
    return (
      <div key={`repost${post.id}`}>
        <p className='repostHeading'>
          <span className='material-symbols-outlined'>repeat</span>
          <Link to={`/users/${post.userId}`}>
            {post.user.displayName} reposted
          </Link>
        </p>
        <Comment
          comment={post.comment}
          replaceComment={(updatedPost) =>
            indexFeedCache.update(postsResult, updatedPost)
          }
          removeComment={(deletedPostId) =>
            indexFeedCache.delete(postsResult, deletedPostId, 'post')
          }
          displayType='repost'
          repostedBy={post.user.username}
        />
      </div>
    );
  }

  return (
    <Post
      key={post.id}
      post={post}
      replacePost={(updatedPost) =>
        indexFeedCache.update(postsResult, updatedPost)
      }
      removePost={(deletedPostId) =>
        indexFeedCache.delete(postsResult, deletedPostId, 'post')
      }
      displayType='feed'
    />
  );
}

IndexFeedItem.propTypes = {
  post: PropTypes.object,
  postsResult: PropTypes.object,
};

export default IndexFeedItem;
