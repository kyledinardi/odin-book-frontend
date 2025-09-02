import { useState } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

import ErrorPage from './ErrorPage.tsx';
import CommentCard from '../components/CommentCard.tsx';
import ContentForm from '../components/ContentForm.tsx';
import PostCard from '../components/PostCard.tsx';
import { GET_POST } from '../graphql/queries.ts';
import { postPageCache } from '../utils/apolloCache.ts';
import logError from '../utils/logError.ts';
import navigateTo from '../utils/navigateTo.ts';
import socket from '../utils/socket.ts';

import type { AppContext, Content } from '../types.ts';

const PostPage = () => {
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [currentUser] = useOutletContext<AppContext>();
  const navigate = useNavigate();
  const { postId } = useParams();

  const postResult = useQuery(GET_POST, { variables: { postId } });
  const post = postResult.data?.getPost;
  const comments = post?.comments;

  const fetchMoreComments = async () => {
    if (!comments) {
      throw new Error('No comments');
    }

    await postResult.fetchMore({
      variables: { cursor: comments[comments.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newComments = fetchMoreResult.getPost.comments;

        setHasMoreComments(
          newComments.length % 20 === 0 && newComments.length > 0,
        );

        return {
          ...previousData,

          getPost: {
            ...previousData.getPost,
            comments: [...previousData.getPost.comments, ...newComments],
          },
        };
      },
    });
  };

  const handleNewComment = (createdComment: Content) => {
    if (createdComment?.feedItemType !== 'comment') {
      throw new Error('Invalid comment');
    }

    if (!post) {
      throw new Error('No post');
    }

    postPageCache.createComment(postResult, createdComment);

    if (post.userId !== currentUser.id) {
      socket.emit('sendNotification', { userId: post.userId });
    }
  };

  if (postResult.error) {
    logError(postResult.error);
    return <ErrorPage error={postResult.error} />;
  }

  return !currentUser || !comments ? (
    <div className='loaderContainer'>
      <div className='loader' />
    </div>
  ) : (
    <main>
      <PostCard
        displayType='focused'
        post={post}
        removePost={() => {
          navigateTo(navigate, '/').catch(logError);
        }}
        replacePost={(updatedPost) =>
          postPageCache.updatePost(postResult, updatedPost)
        }
      />
      <ContentForm
        contentType='comment'
        parentId={postId}
        setContent={(createdComment) => handleNewComment(createdComment)}
      />
      <div>
        {comments.length === 0 ? (
          <h2>No comments yet</h2>
        ) : (
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
              <CommentCard
                key={comment.id}
                comment={comment}
                displayType='reply'
                removeComment={(commentId) =>
                  postPageCache.deleteComment(postResult, commentId)
                }
                replaceComment={(updatedComment) =>
                  postPageCache.updateComment(postResult, updatedComment)
                }
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </main>
  );
};

export default PostPage;
