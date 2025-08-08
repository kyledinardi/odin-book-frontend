import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import Comment from './Comment.jsx';
import Post from './Post.jsx';
import {
  GET_USER_POSTS,
  GET_USER_COMMENTS,
  GET_IMAGE_POSTS,
  GET_LIKED_POSTS,
} from '../graphql/queries';
import { profileCache } from '../utils/apolloCache';
import logError from '../utils/logError';

function ProfilePostList({ user, openTab }) {
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [hasMoreImagePosts, setHasMoreImagePosts] = useState(true);
  const [hasMoreLikedPosts, setHasMoreLikedPosts] = useState(true);

  const [currentUser] = useOutletContext();
  const variables = { userId: user.id };

  const postsResult = useQuery(GET_USER_POSTS, { variables });
  const commentsResult = useQuery(GET_USER_COMMENTS, { variables });
  const imagePostsResult = useQuery(GET_IMAGE_POSTS, { variables });
  const likedPostsResult = useQuery(GET_LIKED_POSTS, { variables });

  const posts = postsResult.data?.getUserPosts;
  const comments = commentsResult.data?.getUserComments;
  const imagePosts = imagePostsResult.data?.getImagePosts;
  const likedPosts = likedPostsResult.data?.getLikedPosts;

  const noPostsMessageTemplate =
    user.id === currentUser.id ? 'You have' : `${user.displayName} has`;

  function fetchMorePosts() {
    const lastPost = posts.findLast((post) => post.feedItemType === 'post');
    const lastRepost = posts.findLast((post) => post.feedItemType === 'repost');

    postsResult.fetchMore({
      variables: { postCursor: lastPost?.id, repostCursor: lastRepost?.id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newPosts = fetchMoreResult.getUserPosts;
        setHasMorePosts(newPosts.length % 20 === 0 && newPosts.length > 0);

        return {
          ...previousData,
          getUserPosts: [...previousData.getUserPosts, ...newPosts],
        };
      },
    });
  }

  function fetchMoreComments() {
    commentsResult.fetchMore({
      variables: { cursor: comments[comments.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newComments = fetchMoreResult.getUserComments;

        setHasMoreComments(
          newComments.length % 20 === 0 && newComments.length > 0
        );

        return {
          ...previousData,
          getUserComments: [...previousData.getUserComments, ...newComments],
        };
      },
    });
  }

  function fetchMoreImagePosts() {
    imagePostsResult.fetchMore({
      variables: { cursor: imagePosts[imagePosts.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newImagePosts = fetchMoreResult.getImagePosts;

        setHasMoreImagePosts(
          newImagePosts.length % 20 === 0 && newImagePosts.length > 0
        );

        return {
          ...previousData,
          getImagePosts: [...previousData.getImagePosts, ...newImagePosts],
        };
      },
    });
  }

  function fetchMoreLikedPosts() {
    likedPostsResult.fetchMore({
      variables: { cursor: likedPosts[likedPosts.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newLikedPosts = fetchMoreResult.getLikedPosts;

        setHasMoreLikedPosts(
          newLikedPosts.length % 20 === 0 && newLikedPosts.length > 0
        );

        return {
          ...previousData,
          getLikedPosts: [...previousData.getLikedPosts, ...newLikedPosts],
        };
      },
    });
  }

  function replaceFeedItem(updatedFeedItem) {
    profileCache.updatePost(
      [postsResult, commentsResult, imagePostsResult, likedPostsResult],
      updatedFeedItem
    );
  }

  function removeFeedItem(deletedFeedItemId, deletedFeedItemType) {
    profileCache.deletePost(
      [postsResult, commentsResult, imagePostsResult, likedPostsResult],
      deletedFeedItemId,
      deletedFeedItemType
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

  if (postsResult.error) {
    logError(postsResult.error);
  }

  if (commentsResult.error) {
    logError(commentsResult.error);
  }

  if (imagePostsResult.error) {
    logError(imagePostsResult.error);
  }

  if (likedPostsResult.error) {
    logError(likedPostsResult.error);
  }

  if (posts) {
    switch (openTab) {
      case 'posts':
        if (posts.length === 0) {
          return <h2>{`${noPostsMessageTemplate} no posts.`}</h2>;
        }

        return (
          <InfiniteScroll
            dataLength={posts.length}
            next={() => fetchMorePosts()}
            hasMore={hasMorePosts}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {posts.map((post) => {
              if (post.feedItemType === 'repost') {
                return (
                  <div key={`r-${post.id}`}>
                    <p className='repostHeading'>
                      <span className='material-symbols-outlined'>repeat</span>
                      <span>{post.user.displayName} reposted</span>
                    </p>
                    {post.postId ? (
                      <Post
                        post={post.post}
                        replacePost={(updatedPost) =>
                          replaceFeedItem(updatedPost)
                        }
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
            })}
          </InfiniteScroll>
        );
      case 'comments':
        if (comments.length === 0) {
          return <h2>{`${noPostsMessageTemplate} no comments.`}</h2>;
        }

        return (
          <InfiniteScroll
            dataLength={comments.length}
            next={() => fetchMoreComments()}
            hasMore={hasMoreComments}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {comments.map((comment) => (
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
                  replaceComment={(updatedComment) =>
                    replaceFeedItem(updatedComment)
                  }
                  removeComment={(deletedCommentId) =>
                    removeFeedItem(deletedCommentId, 'comment')
                  }
                  displayType='feed'
                />
              </div>
            ))}
          </InfiniteScroll>
        );
      case 'images':
        if (imagePosts.length === 0) {
          return <h2>{`${noPostsMessageTemplate} no images.`}</h2>;
        }

        return (
          <InfiniteScroll
            dataLength={imagePosts.length}
            next={() => fetchMoreImagePosts()}
            hasMore={hasMoreImagePosts}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {imagePosts.map((post) => returnPost(post))}
          </InfiniteScroll>
        );
      case 'likes':
        if (likedPosts.length === 0) {
          return <h2>{`${noPostsMessageTemplate} not liked any posts`}</h2>;
        }

        return (
          <InfiniteScroll
            dataLength={likedPosts.length}
            next={() => fetchMoreLikedPosts()}
            hasMore={hasMoreLikedPosts}
            loader={
              <div className='loaderContainer'>
                <div className='loader'></div>
              </div>
            }
            endMessage={<div></div>}
          >
            {likedPosts.map((post) => returnPost(post))}
          </InfiniteScroll>
        );
      default:
        return null;
    }
  }
}

ProfilePostList.propTypes = {
  user: PropTypes.object,
  openTab: PropTypes.string,
};

export default ProfilePostList;
