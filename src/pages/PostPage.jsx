import { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import InfiniteScroll from 'react-infinite-scroll-component';
import ErrorPage from './ErrorPage.jsx';
import ContentForm from '../components/ContentForm.jsx';
import Post from '../components/Post.jsx';
import Comment from '../components/Comment.jsx';
import { GET_POST } from '../graphql/queries';
import { postPageCache } from '../utils/apolloCache';
import logError from '../utils/logError';
import socket from '../utils/socket';

function PostPage() {
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [currentUser] = useOutletContext();
  const navigate = useNavigate();
  const postId = Number(useParams().postId);

  const postResult = useQuery(GET_POST, { variables: { postId } });
  const post = postResult.data?.getPost;
  const comments = post?.comments;

  function fetchMoreComments() {
    postResult.fetchMore({
      variables: { cursor: comments[comments.length - 1].id },

      updateQuery: (previousData, { fetchMoreResult }) => {
        const newComments = fetchMoreResult.getPost.comments;

        setHasMoreComments(
          newComments.length % 20 === 0 && newComments.length > 0
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
  }

  if (postResult.error) {
    logError(postResult.error);
    return <ErrorPage error={postResult.error} />;
  }

  return !currentUser || !post ? (
    <div className='loaderContainer'>
      <div className='loader'></div>
    </div>
  ) : (
    <main>
      <Post
        post={post}
        replacePost={(updatedPost) =>
          postPageCache.updatePost(postResult, updatedPost)
        }
        removePost={() => navigate('/')}
        displayType='focused'
      />
      <ContentForm
        contentType='comment'
        setContent={(createdComment) => {
          postPageCache.createComment(postResult, createdComment);
          socket.emit('sendNotification', { userId: post.userId });
        }}
        parentId={postId}
      />
      <div>
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
            <Comment
              key={comment.id}
              comment={comment}
              replaceComment={(updatedComment) =>
                postPageCache.updateComment(postResult, updatedComment)
              }
              removeComment={(commentId) =>
                postPageCache.deleteComment(postResult, commentId)
              }
              displayType='reply'
            />
          ))}
        </InfiniteScroll>
      </div>
    </main>
  );
}

export default PostPage;
