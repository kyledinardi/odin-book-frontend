import { useOutletContext } from 'react-router-dom';
import PropTypes from 'prop-types';
import Comment from './Comment.jsx';
import Post from './Post.jsx';
import editFeed from '../../ helpers/feedEdit';

function ProfilePostList({
  user,
  openTab,
  posts,
  comments,
  imagePosts,
  likedPosts,
  setPosts,
  setComments,
  setImagePosts,
  setLikedPosts,
}) {
  const [, currentUser] = useOutletContext();

  const noPostsMessageTemplate =
    user.id === currentUser.id ? 'You have' : `${user.displayName} has`;

  function replaceFeedItem(updatedFeedItem) {
    setPosts(editFeed.replace(updatedFeedItem, posts));
    setComments(editFeed.replace(updatedFeedItem, comments));
    setImagePosts(editFeed.replace(updatedFeedItem, imagePosts));
    setLikedPosts(editFeed.replace(updatedFeedItem, likedPosts));
  }

  function removeFeedItem(deletedFeedItemId, deletedFeedItemType) {
    setPosts(editFeed.remove(deletedFeedItemId, deletedFeedItemType, posts));
    setComments(
      editFeed.remove(deletedFeedItemId, deletedFeedItemType, comments),
    );
    setImagePosts(
      editFeed.remove(deletedFeedItemId, deletedFeedItemType, imagePosts),
    );
    setLikedPosts(
      editFeed.remove(deletedFeedItemId, deletedFeedItemType, likedPosts),
    );
  }

  function returnPost(post) {
    return (
      <Post
        key={post.id}
        post={post}
        replacePost={(updatedPost) => replaceFeedItem(updatedPost)}
        removePost={(deletedPostId) => removeFeedItem(deletedPostId, 'post')}
        displayType='feed'
      />
    );
  }

  switch (openTab) {
    case 'posts':
      if (posts.length === 0) {
        return <h2>{`${noPostsMessageTemplate} no posts.`}</h2>;
      }

      return posts.map((post) => {
        if (post.feedItemType === 'repost') {
          return (
            <div key={`repost${post.id}`}>
              <p className='repostHeading'>
                <span className='material-symbols-outlined'>repeat</span>
                <span>{post.user.displayName} reposted</span>
              </p>
              {post.postId ? (
                <Post
                  post={post.post}
                  replacePost={(updatedPost) => replaceFeedItem(updatedPost)}
                  removePost={(deletedPostId) =>
                    removeFeedItem(deletedPostId, 'post')
                  }
                  displayType='repost'
                />
              ) : (
                <Comment
                  comment={post.comment}
                  replaceComment={(updatedComment) =>
                    replaceFeedItem(updatedComment)
                  }
                  removeComment={(deletedCommentId) =>
                    removeFeedItem(deletedCommentId, 'comment')
                  }
                  displayType='repost'
                />
              )}
            </div>
          );
        }

        return returnPost(post);
      });

    case 'comments':
      if (comments.length === 0) {
        return <h2>{`${noPostsMessageTemplate} no comments.`}</h2>;
      }

      return comments.map((comment) => (
        <div key={comment.id}>
          <Post
            post={comment.post}
            replacePost={(updatedPost) => replaceFeedItem(updatedPost)}
            removePost={(deletedPostId) =>
              removeFeedItem(deletedPostId, 'post')
            }
            displayType='ancestor'
          />
          {comment.parent && (
            <>
              {comment.parent.parentId && <div>...</div>}
              <Comment
                comment={comment.parent}
                replaceComment={(updatedComment) =>
                  replaceFeedItem(updatedComment)
                }
                removeComment={(deletedCommentId) =>
                  removeFeedItem(deletedCommentId, 'comment')
                }
                displayType='ancestor'
              />
            </>
          )}
          <Comment
            comment={comment}
            replaceComment={(updatedComment) => replaceFeedItem(updatedComment)}
            removeComment={(deletedCommentId) =>
              removeFeedItem(deletedCommentId, 'comment')
            }
            displayType='feed'
          />
        </div>
      ));

    case 'images':
      if (imagePosts.length === 0) {
        return <h2>{`${noPostsMessageTemplate} no images.`}</h2>;
      }

      return imagePosts.map((post) => returnPost(post));

    case 'likes': {
      if (likedPosts.length === 0) {
        return <h2>{`${noPostsMessageTemplate} not liked any posts`}</h2>;
      }

      return likedPosts.map((post) => returnPost(post));
    }

    default:
      return null;
  }
}

ProfilePostList.propTypes = {
  user: PropTypes.object,
  openTab: PropTypes.string,
  posts: PropTypes.arrayOf(PropTypes.object),
  comments: PropTypes.arrayOf(PropTypes.object),
  imagePosts: PropTypes.arrayOf(PropTypes.object),
  likedPosts: PropTypes.arrayOf(PropTypes.object),
  setPosts: PropTypes.func,
  setComments: PropTypes.func,
  setImagePosts: PropTypes.func,
  setLikedPosts: PropTypes.func,
};

export default ProfilePostList;
