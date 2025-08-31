import { useState } from 'react';

import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';

import ErrorPage from './ErrorPage.tsx';
import CommentCard from '../components/CommentCard.tsx';
import ContentForm from '../components/ContentForm.tsx';
import PostCard from '../components/PostCard.tsx';
import { GET_COMMENT } from '../graphql/queries.ts';
import { commentPageCache } from '../utils/apolloCache.ts';
import logError from '../utils/logError.ts';
import navigateTo from '../utils/navigateTo.ts';
import socket from '../utils/socket.ts';

import type { AppContext, Comment, Content } from '../types.ts';

const CommentPage = () => {
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [currentUser] = useOutletContext<AppContext>();
  const navigate = useNavigate();
  const { commentId } = useParams();

  const commentResult = useQuery(GET_COMMENT, { variables: { commentId } });
  const comment = commentResult.data?.getComment;
  const replies = comment?.replies;

  const fetchMoreReplies = async () => {
    if (!replies) {
      throw new Error('No replies');
    }

    await commentResult.fetchMore({
      variables: { cursor: replies[replies.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newReplies = fetchMoreResult.getComment.replies;

        setHasMoreReplies(
          newReplies.length % 20 === 0 && newReplies.length > 0,
        );

        return {
          ...previousData,

          getComment: {
            ...previousData.getComment,
            replies: [...previousData.getComment.replies, ...newReplies],
          },
        };
      },
    });
  };

  const navigateToAncestor = (chainComment: Comment) => {
    if (!comment) {
      throw new Error('No comment');
    }

    if (chainComment.parentId) {
      navigateTo(navigate, `/comments/${chainComment.parentId}`).catch(
        logError,
      );
    } else {
      navigateTo(navigate, `/posts/${comment.postId}`).catch(logError);
    }
  };

  const handleNewReply = (newReply: Content) => {
    if (newReply?.feedItemType !== 'comment') {
      throw new Error('Invalid reply');
    }

    if (!comment) {
      throw new Error('No comment');
    }

    commentPageCache.createReply(commentResult, newReply);

    if (comment.userId !== currentUser.id) {
      socket.emit('sendNotification', { userId: comment.userId });
    }
  };

  if (commentResult.error) {
    logError(commentResult.error);
    return <ErrorPage error={commentResult.error} />;
  }

  return !currentUser || !comment?.post || !replies ? (
    <div className='loaderContainer'>
      <div className='loader' />
    </div>
  ) : (
    <main>
      <PostCard
        displayType='ancestor'
        post={comment.post}
        removePost={() => {
          navigateTo(navigate, '/').catch(logError);
        }}
        replacePost={(updatedPost) =>
          commentPageCache.updatePost(commentResult, updatedPost)
        }
      />
      {comment.commentChain.map((ancestor) => (
        <CommentCard
          key={ancestor.id}
          comment={ancestor}
          displayType='ancestor'
          removeComment={() => navigateToAncestor(ancestor)}
          replaceComment={(updatedComment) =>
            commentPageCache.updateAncestor(commentResult, updatedComment)
          }
        />
      ))}
      <CommentCard
        comment={comment}
        displayType='focused'
        removeComment={() => navigateToAncestor(comment)}
        replaceComment={(updatedComment) =>
          commentPageCache.updateComment(commentResult, updatedComment)
        }
      />
      <ContentForm
        contentType='reply'
        parentId={commentId}
        setContent={(newReply) => handleNewReply(newReply)}
      />
      {replies.length === 0 ? (
        <h2>No replies yet</h2>
      ) : (
        <InfiniteScroll
          dataLength={comment.replies.length}
          endMessage={<div />}
          hasMore={hasMoreReplies}
          next={() => fetchMoreReplies()}
          loader={
            <div className='loaderContainer'>
              <div className='loader' />
            </div>
          }
        >
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              displayType='reply'
              removeComment={(replyId) =>
                commentPageCache.deleteReply(commentResult, replyId)
              }
              replaceComment={(updatedReply) =>
                commentPageCache.updateReply(commentResult, updatedReply)
              }
            />
          ))}
        </InfiniteScroll>
      )}
    </main>
  );
};

export default CommentPage;
