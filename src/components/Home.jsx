import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import NewContentForm from './NewContentForm.jsx';
import Post from './Post.jsx';
import backendFetch from '../../ helpers/backendFetch';
import Comment from './Comment.jsx';

function Home() {
  const [posts, setPosts] = useState(null);
  const [setError, currentUser] = useOutletContext();

  useEffect(() => {
    backendFetch(setError, '/posts').then((response) => {
      setPosts(response.posts);
    });
  }, [setError]);

  function replacePost(updatedPost) {
    const newPosts = posts.map((post) => {
      switch (updatedPost.id) {
        case post.postId:
          return { ...post, post: updatedPost };
        case post.commentId:
          return { ...post, comment: updatedPost };
        case post.id:
          return updatedPost;
        default:
          return post;
      }
    });

    setPosts(newPosts);
  }

  function removePost(postId) {
    setPosts(
      posts.filter(
        (post) =>
          post.postId !== postId &&
          post.commentId !== postId &&
          post.id !== postId,
      ),
    );
  }

  function renderPost(post) {
    if (post.postId) {
      return (
        <Post
          key={`repost${post.id}`}
          post={post.post}
          replacePost={(updatedPost) => replacePost(updatedPost)}
          removePost={(postId) => removePost(postId)}
          repostedBy={post.user.username}
        />
      );
    }

    if (post.commentId) {
      return (
        <Comment
          key={`repost${post.id}`}
          comment={post.comment}
          replaceComment={(updatedComment) => replacePost(updatedComment)}
          removeComment={(commentId) => removePost(commentId)}
          displayType='focused'
          repostedBy={post.user.username}
        />
      );
    }

    return (
      <Post
        key={post.id}
        post={post}
        replacePost={(updatedPost) => replacePost(updatedPost)}
        removePost={(postId) => removePost(postId)}
        repostedBy=''
      />
    );
  }

  return !currentUser || !posts ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <NewContentForm
        contentType={'post'}
        setContent={(post) => setPosts([post, ...posts])}
        currentUser={currentUser}
      />
      <div>
        {posts.length === 0 ? (
          <h2>You and your followers have no posts</h2>
        ) : (
          posts.map((post) => renderPost(post))
        )}
      </div>
    </main>
  );
}

export default Home;
