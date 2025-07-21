import PropTypes from 'prop-types';
import Post from './Post.jsx';
import Comment from './Comment.jsx';
import { GET_INDEX_POSTS } from '../graphql/queries';
import editFeed from '../utils/feedEdit';

function IndexFeedItem({ post, postsResult }) {
  const updateCache = (updated, deletedId, deletedFeedItemType) =>
    postsResult.updateQuery({ GET_INDEX_POSTS }, (previousData) => ({
      getIndexPosts: updated
        ? editFeed.replace(updated, previousData)
        : editFeed.remove(deletedId, deletedFeedItemType, previousData),
    }));

  if (post.postId) {
    return (
      <div key={`repost${post.id}`}>
        <p className='repostHeading'>
          <span className='material-symbols-outlined'>repeat</span>
          <span>{post.user.displayName} reposted</span>
        </p>
        <Post
          post={post.post}
          replacePost={(updatedPost) => updateCache(updatedPost)}
          removePost={(deletedPostId) =>
            updateCache(null, deletedPostId, 'post')
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
          <span>{post.user.displayName} reposted</span>
        </p>
        <Comment
          comment={post.comment}
          replaceComment={(updatedComment) => updateCache(updatedComment)}
          removeComment={(deletedCommentId) =>
            updateCache(null, deletedCommentId, 'comment')
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
      replacePost={(updatedPost) => updateCache(updatedPost, null, 'post')}
      removePost={(deletedPostId) => updateCache(null, deletedPostId, 'post')}
      displayType='feed'
    />
  );
}

IndexFeedItem.propTypes = {
  post: PropTypes.object,
  postsResult: PropTypes.object,
};

export default IndexFeedItem;
