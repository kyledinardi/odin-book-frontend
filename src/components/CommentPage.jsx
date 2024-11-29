import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import NewContentForm from './NewContentForm.jsx';
import Post from './Post.jsx';
import Comment from './Comment.jsx';
import backendFetch from '../../ helpers/backendFetch';

function CommentPage() {
  const [comment, setComment] = useState(null);
  const [setError, currentUser] = useOutletContext();
  const navigate = useNavigate();
  const commentId = parseInt(useParams().commentId, 10);

  useEffect(() => {
    if (!commentId) {
      setError({ status: 404, message: 'Comment not found' });
    } else {
      backendFetch(setError, `/comments/${commentId}`).then((response) => {
        setComment(response.comment);
      });
    }
  }, [commentId, setError]);

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

  function addReply(newReply) {
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
      <NewContentForm
        contentType='reply'
        setContent={(newReply) => {
          addReply(newReply);
        }}
        currentUser={currentUser}
        parentId={comment.id}
      />
      {comment.replies.map((reply) => (
        <Comment
          key={reply.id}
          comment={reply}
          replaceComment={(updatedReply) => replaceReply(updatedReply)}
          removeComment={(replyId) => removeReply(replyId)}
          displayType='reply'
        />
      ))}
    </main>
  );
}

export default CommentPage;
