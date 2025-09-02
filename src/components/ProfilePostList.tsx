import { Fragment, useState } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOutletContext } from 'react-router-dom';

import CommentCard from './CommentCard.tsx';
import PostCard from './PostCard.tsx';
import {
  GET_IMAGE_POSTS,
  GET_LIKED_POSTS,
  GET_USER_COMMENTS,
  GET_USER_POSTS,
} from '../graphql/queries.ts';
import { profileCache } from '../utils/apolloCache.ts';
import logError from '../utils/logError.ts';

import type { AppContext, FeedItem, Post, User } from '../types.ts';

const ProfilePostList = ({
  user,
  openTab,
}: {
  user: User;
  openTab: string;
}) => {
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [hasMoreImagePosts, setHasMoreImagePosts] = useState(true);
  const [hasMoreLikedPosts, setHasMoreLikedPosts] = useState(true);

  const [currentUser] = useOutletContext<AppContext>();
  const variables = { userId: user.id };

  const postsResult = useQuery(GET_USER_POSTS, { variables });
  const commentsResult = useQuery(GET_USER_COMMENTS, { variables });
  const imagePostsResult = useQuery(GET_IMAGE_POSTS, { variables });
  const likedPostsResult = useQuery(GET_LIKED_POSTS, { variables });

  const results = [
    postsResult,
    commentsResult,
    imagePostsResult,
    likedPostsResult,
  ];

  const posts = postsResult.data?.getUserPosts;
  const comments = commentsResult.data?.getUserComments;
  const imagePosts = imagePostsResult.data?.getImagePosts;
  const likedPosts = likedPostsResult.data?.getLikedPosts;

  const noPostsMessageTemplate =
    user.id === currentUser.id ? 'You have' : `${user.displayName} has`;

  const fetchMorePosts = async () => {
    if (!posts) {
      throw new Error('No posts result');
    }

    const lastPost = [...posts]
      .reverse()
      .find((post) => post.feedItemType === 'post');

    const lastRepost = [...posts]
      .reverse()
      .find((post) => post.feedItemType === 'repost');

    await postsResult.fetchMore({
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
  };

  const fetchMoreComments = async () => {
    if (!comments) {
      throw new Error('No comments result');
    }

    await commentsResult.fetchMore({
      variables: { cursor: comments[comments.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newComments = fetchMoreResult.getUserComments;

        setHasMoreComments(
          newComments.length % 20 === 0 && newComments.length > 0,
        );

        return {
          ...previousData,
          getUserComments: [...previousData.getUserComments, ...newComments],
        };
      },
    });
  };

  const fetchMoreImagePosts = async () => {
    if (!imagePosts) {
      throw new Error('No image posts result');
    }

    await imagePostsResult.fetchMore({
      variables: { cursor: imagePosts[imagePosts.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newImagePosts = fetchMoreResult.getImagePosts;

        setHasMoreImagePosts(
          newImagePosts.length % 20 === 0 && newImagePosts.length > 0,
        );

        return {
          ...previousData,
          getImagePosts: [...previousData.getImagePosts, ...newImagePosts],
        };
      },
    });
  };

  const fetchMoreLikedPosts = async () => {
    if (!likedPosts) {
      throw new Error('No liked posts result');
    }

    await likedPostsResult.fetchMore({
      variables: { cursor: likedPosts[likedPosts.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newLikedPosts = fetchMoreResult.getLikedPosts;

        setHasMoreLikedPosts(
          newLikedPosts.length % 20 === 0 && newLikedPosts.length > 0,
        );

        return {
          ...previousData,
          getLikedPosts: [...previousData.getLikedPosts, ...newLikedPosts],
        };
      },
    });
  };

  const replaceFeedItem = (updatedFeedItem: FeedItem) => {
    profileCache.updatePost(
      [postsResult, commentsResult, imagePostsResult, likedPostsResult],
      updatedFeedItem,
    );
  };

  const removeFeedItem = (
    deletedFeedItemId: string,
    deletedFeedItemType: string,
  ) => {
    profileCache.deletePost(
      [postsResult, commentsResult, imagePostsResult, likedPostsResult],
      deletedFeedItemId,
      deletedFeedItemType,
    );
  };

  const returnPost = (post: Post) => (
    <PostCard
      key={post.id}
      displayType='feed'
      post={post}
      removePost={(deletedPostId) => removeFeedItem(deletedPostId, 'post')}
      replacePost={(updatedPost) => replaceFeedItem(updatedPost)}
    />
  );

  results.forEach((result) => {
    if (result.error) {
      logError(result.error);
    }
  });

  if (!posts || !comments || !imagePosts || !likedPosts) {
    return (
      <div className='loaderContainer'>
        <div className='loader' />
      </div>
    );
  }

  switch (openTab) {
    case 'posts':
      if (posts.length === 0) {
        return <h2>{`${noPostsMessageTemplate} no posts.`}</h2>;
      }

      return (
        <InfiniteScroll
          dataLength={posts.length}
          endMessage={<div />}
          hasMore={hasMorePosts}
          next={fetchMorePosts}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
        >
          {posts.map((post) => {
            if (post.feedItemType === 'repost') {
              return (
                <div key={`r-${post.id}`}>
                  <p className='repostHeading'>
                    <span className='material-symbols-outlined'>repeat</span>
                    <span>{post.user.displayName} reposted</span>
                  </p>
                  {!!post.post && (
                    <PostCard
                      displayType='repost'
                      post={post.post}
                      removePost={(deletedPostId) =>
                        removeFeedItem(deletedPostId, 'post')
                      }
                      replacePost={(updatedPost) =>
                        replaceFeedItem(updatedPost)
                      }
                    />
                  )}
                  {!!post.comment && (
                    <CommentCard
                      comment={post.comment}
                      displayType='repost'
                      removeComment={(deletedCommentId) =>
                        removeFeedItem(deletedCommentId, 'comment')
                      }
                      replaceComment={(updatedComment) =>
                        replaceFeedItem(updatedComment)
                      }
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
          endMessage={<div />}
          hasMore={hasMoreComments}
          next={fetchMoreComments}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
        >
          {comments.map((comment) => (
            <div key={comment.id}>
              <PostCard
                displayType='ancestor'
                post={comment.post}
                replacePost={(updatedPost) => replaceFeedItem(updatedPost)}
                removePost={(deletedPostId) =>
                  removeFeedItem(deletedPostId, 'post')
                }
              />
              {comment.parent ? (
                <Fragment>
                  {comment.parent.parentId ? <div>...</div> : null}
                  <CommentCard
                    comment={comment.parent}
                    displayType='ancestor'
                    removeComment={(deletedCommentId) =>
                      removeFeedItem(deletedCommentId, 'comment')
                    }
                    replaceComment={(updatedComment) =>
                      replaceFeedItem(updatedComment)
                    }
                  />
                </Fragment>
              ) : null}
              <CommentCard
                comment={comment}
                displayType='feed'
                removeComment={(deletedCommentId) =>
                  removeFeedItem(deletedCommentId, 'comment')
                }
                replaceComment={(updatedComment) =>
                  replaceFeedItem(updatedComment)
                }
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
          endMessage={<div />}
          hasMore={hasMoreImagePosts}
          next={fetchMoreImagePosts}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
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
          endMessage={<div />}
          hasMore={hasMoreLikedPosts}
          next={fetchMoreLikedPosts}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
        >
          {likedPosts.map((post) => returnPost(post))}
        </InfiniteScroll>
      );

    default:
      throw new Error(`Invalid tab: ${openTab}`);
  }
};

export default ProfilePostList;
