import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import ContentForm from '../components/ContentForm.jsx';
import Post from '../components/Post.jsx';
import Comment from '../components/Comment.jsx';
import backendFetch from '../../utils/backendFetch';
import socket from '../../utils/socket';

function CommentPage() {
  const [comment, setComment] = useState(null);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const [setError, currentUser] = useOutletContext();
  const navigate = useNavigate();
  const commentId = parseInt(useParams().commentId, 10);

  useEffect(() => {
    if (!commentId) {
      setError({ status: 404, message: 'Comment not found' });
    } else {
      backendFetch(setError, `/comments/${commentId}`).then((response) => {
        setComment(response.comment);
        setHasMoreReplies(response.comment.replies.length === 20);
      });
    }
  }, [commentId, setError]);

  async function addMoreReplies() {
    const response = await backendFetch(
      setError,

      `/comments/${commentId}/replies?replyId=${
        comment.replies[comment.replies.length - 1].id
      }`,
    );
    const newComment = {
      ...comment,
      replies: [...comment.replies, ...response.replies],
    };

    setComment(newComment);
    setHasMoreReplies(response.replies.length === 20);
  }

  function removeChainComment(chainComment) {
    if (chainComment.parentId) {
      navigate(`/comments/${chainComment.parentId}`);
    } else {
      navigate(`/posts/${comment.postId}`);
    }
  }

  function replaceAncestor(updatedAncestor) {
    const newCommentChain = comment.commentChain.map((ancestor) =>
      ancestor.id === updatedAncestor.id ? updatedAncestor : ancestor,
    );

    setComment({ ...comment, commentChain: newCommentChain });
  }

  function replaceReply(updatedReply) {
    const newReplies = comment.replies.map((reply) =>
      reply.id === updatedReply.id ? updatedReply : reply,
    );

    setComment({ ...comment, replies: newReplies });
  }

  function addNewReply(newReply) {
    const newComment = { ...comment, replies: [newReply, ...comment.replies] };
    setComment(newComment);
  }

  function removeReply(replyId) {
    const newReplies = comment.replies.filter((reply) => reply.id !== replyId);
    setComment({ ...comment, replies: newReplies });
  }

  return !comment || !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <Post
        post={comment.post}
        replacePost={(updated) => setComment({ ...comment, post: updated })}
        removePost={() => navigate('/')}
        displayType='ancestor'
      />
      {comment.commentChain.map((ancestor) => (
        <Comment
          key={ancestor.id}
          comment={ancestor}
          replaceComment={(updatedAncestor) => replaceAncestor(updatedAncestor)}
          removeComment={() => removeChainComment(ancestor)}
          displayType='ancestor'
        />
      ))}
      <Comment
        comment={comment}
        replaceComment={(updatedComment) => setComment(updatedComment)}
        removeComment={() => removeChainComment(comment)}
        isCommentPage={true}
        displayType='focused'
      />
      <ContentForm
        contentType='reply'
        setContent={(newReply) => {
          addNewReply(newReply);
          socket.emit('sendNotification', { userId: comment.userId });
        }}
        parentId={comment.id}
      />
      <InfiniteScroll
        dataLength={comment.replies.length}
        next={() => addMoreReplies()}
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
            replaceComment={(updatedReply) => replaceReply(updatedReply)}
            removeComment={(replyId) => removeReply(replyId)}
            displayType='reply'
          />
        ))}
      </InfiniteScroll>
    </main>
  );
}

export default CommentPage;
