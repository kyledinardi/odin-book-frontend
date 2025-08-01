import { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorPage from './ErrorPage.jsx';
import ContentForm from '../components/ContentForm.jsx';
import Post from '../components/Post.jsx';
import Comment from '../components/Comment.jsx';
import { GET_COMMENT } from '../graphql/queries';
import { commentPageCache } from '../utils/apolloCache';
import logError from '../utils/logError';
import socket from '../utils/socket';

function CommentPage() {
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [currentUser] = useOutletContext();
  const navigate = useNavigate();
  const commentId = Number(useParams().commentId);

  const commentResult = useQuery(GET_COMMENT, { variables: { commentId } });
  const comment = commentResult.data?.getComment;
  const replies = comment?.replies;

  function fetchMoreReplies() {
    commentResult.fetchMore({
      variables: { cursor: replies[replies.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newReplies = fetchMoreResult.getComment.replies;

        setHasMoreReplies(
          newReplies.length % 20 === 0 && newReplies.length > 0
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
  }

  function navigateToAncestor(chainComment) {
    if (chainComment.parentId) {
      navigate(`/comments/${chainComment.parentId}`);
    } else {
      navigate(`/posts/${comment.postId}`);
    }
  }

  function handleNewReply(newReply) {
    commentPageCache.createReply(commentResult, newReply);

    if (comment.userId !== Number(currentUser.id)) {
      socket.emit('sendNotification', { userId: comment.userId });
    }
  }

  if (commentResult.error) {
    logError(commentResult.error);
    return <ErrorPage error={commentResult.error} />;
  }

  return !comment || !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <Post
        post={comment.post}
        replacePost={(updatedPost) =>
          commentPageCache.updatePost(commentResult, updatedPost)
        }
        removePost={() => navigate('/')}
        displayType='ancestor'
      />
      {comment.commentChain.map((ancestor) => (
        <Comment
          key={ancestor.id}
          comment={ancestor}
          replaceComment={(updatedComment) =>
            commentPageCache.updateAncestor(commentResult, updatedComment)
          }
          removeComment={() => navigateToAncestor(ancestor)}
          displayType='ancestor'
        />
      ))}
      <Comment
        comment={comment}
        replaceComment={(updatedComment) =>
          commentPageCache.updateComment(commentResult, updatedComment)
        }
        removeComment={() => navigateToAncestor(comment)}
        isCommentPage={true}
        displayType='focused'
      />
      <ContentForm
        contentType='reply'
        setContent={(newReply) => handleNewReply(newReply)}
        parentId={commentId}
      />
      <InfiniteScroll
        dataLength={comment.replies.length}
        next={() => fetchMoreReplies()}
        hasMore={hasMoreReplies}
        loader={
          <div className='loaderContainer'>
            <div className='loader'></div>
          </div>
        }
        endMessage={<div></div>}
      >
        {comment.replies.map((reply) => (
          <Comment
            key={reply.id}
            comment={reply}
            replaceComment={(updatedReply) =>
              commentPageCache.updateReply(commentResult, updatedReply)
            }
            removeComment={(replyId) =>
              commentPageCache.deleteReply(commentResult, replyId)
            }
            displayType='reply'
          />
        ))}
      </InfiniteScroll>
    </main>
  );
}

export default CommentPage;
