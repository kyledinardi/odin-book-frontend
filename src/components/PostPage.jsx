import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom';

import { useEffect, useState } from 'react';
import NewContentForm from './NewContentForm.jsx';
import Post from './Post.jsx';
import Comment from './Comment.jsx';
import styles from '../style/PostPage.module.css';
import backendFetch from '../../ helpers/backendFetch';

function PostPage() {
  const [post, setPost] = useState(null);

  const [setError, currentUser] = useOutletContext();
  const navigate = useNavigate();
  const postId = parseInt(useParams().postId, 10);

  useEffect(() => {
    if (!postId) {
      setError({ status: 404, message: 'Post not found' });
      return;
    }

    backendFetch(setError, `/posts/${postId}`).then((response) =>
      setPost(response.post),
    );
  }, [postId, setError]);

  function replaceComment(updatedComment) {
    const newComments = post.comments.map((comment) =>
      comment.id === updatedComment.id ? updatedComment : comment,
    );

    setPost({ ...post, comments: newComments });
  }

  function removeComment(commentId) {
    const newComments = post.comments.filter(
      (comment) => comment.id !== commentId,
    );

    setPost({ ...post, comments: newComments });
  }

  return !post || !currentUser ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <Post
        key={post.id}
        post={post}
        replacePost={(updatedPost) => setPost(updatedPost)}
        removePost={() => navigate('/')}
        isPostPage={true}
      />
      <div className={styles.formSection}>
        <Link className={styles.currentUserPfp} to={`/users/${currentUser.id}`}>
          <img className='pfp' src={currentUser.pfpUrl} alt='' />
        </Link>
        <NewContentForm
          contentType='comment'
          setContent={(comment) =>
            setPost({ ...post, comments: [comment, ...post.comments] })
          }
          postId={postId}
        />
      </div>
      <div>
        {post.comments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            replaceComment={(updatedComment) => replaceComment(updatedComment)}
            removeComment={(commentId) => removeComment(commentId)}
          />
        ))}
      </div>
    </main>
  );
}

export default PostPage;
