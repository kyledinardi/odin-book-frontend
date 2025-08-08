import { InMemoryCache } from '@apollo/client';
import editFeed from './feedEdit';

export default new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getIndexPosts: { merge: (_, incoming) => incoming },
        searchPosts: { merge: (_, incoming) => incoming },
        getUserPosts: { merge: (_, incoming) => incoming },
        getImagePosts: { merge: (_, incoming) => incoming },
        getLikedPosts: { merge: (_, incoming) => incoming },
        getUserComments: { merge: (_, incoming) => incoming },
      },
    },

    Post: {
      fields: {
        likes: { merge: (_, incoming) => incoming },
        comments: { merge: (_, incoming) => incoming },
        reposts: { merge: (_, incoming) => incoming },
      },
    },

    Comment: {
      fields: {
        likes: { merge: (_, incoming) => incoming },
        replies: { merge: (_, incoming) => incoming },
        reposts: { merge: (_, incoming) => incoming },
      },
    },

    Room: {
      fields: {
        messages: { merge: (_, incoming) => incoming },
      },
    },
  },
});

const replace = (updatedItem, list) =>
  list.map((item) => (item.id === updatedItem.id ? updatedItem : item));

const remove = (deletedItemid, list) =>
  list.filter((item) => item.id !== deletedItemid);

export const indexFeedCache = {
  create: (result, created) =>
    result.updateQuery(({ getIndexPosts }) => ({
      getIndexPosts: [created, ...getIndexPosts],
    })),

  update: (result, updated) =>
    result.updateQuery(({ getIndexPosts }) => ({
      getIndexPosts: editFeed.replace(updated, getIndexPosts),
    })),

  delete: (result, deletedId, deletedFeedItemType) =>
    result.updateQuery(({ getIndexPosts }) => ({
      getIndexPosts: editFeed.remove(
        deletedId,
        deletedFeedItemType,
        getIndexPosts
      ),
    })),
};

export const searchChache = {
  updatePost: (result, updatedPost) =>
    result.updateQuery(({ searchPosts }) => ({
      searchPosts: replace(updatedPost, searchPosts),
    })),

  deletePost: (result, deletedPostId) =>
    result.updateQuery(({ searchPosts }) => ({
      searchPosts: remove(deletedPostId, searchPosts),
    })),
};

export const postPageCache = {
  updatePost: (result, updatedPost) =>
    result.updateQuery(() => ({ getPost: updatedPost })),

  createComment: (result, createdComment) =>
    result.updateQuery(({ getPost }) => ({
      getPost: { ...getPost, comments: [createdComment, ...getPost.comments] },
    })),

  updateComment: (result, updatedComment) =>
    result.updateQuery(({ getPost }) => ({
      getPost: {
        ...getPost,
        comments: replace(updatedComment, getPost.comments),
      },
    })),

  deleteComment: (result, deletedCommentId) =>
    result.updateQuery(({ getPost }) => ({
      getPost: {
        ...getPost,
        comments: remove(deletedCommentId, getPost.comments),
      },
    })),
};

export const commentPageCache = {
  updatePost: (result, updatedPost) =>
    result.updateQuery(({ getComment }) => ({
      getComment: { ...getComment, post: updatedPost },
    })),

  updateComment: (result, updatedComment) =>
    result.updateQuery(() => ({ getComment: updatedComment })),

  updateAncestor: (result, updatedAncestor) =>
    result.updateQuery(({ getComment }) => ({
      getComment: {
        ...getComment,
        commentChain: replace(updatedAncestor, getComment.commentChain),
      },
    })),

  createReply: (result, createdComment) =>
    result.updateQuery(({ getComment }) => ({
      getComment: {
        ...getComment,
        replies: [createdComment, ...getComment.replies],
      },
    })),

  updateReply: (result, updatedReply) =>
    result.updateQuery(({ getComment }) => ({
      getComment: {
        ...getComment,
        replies: replace(updatedReply, getComment.replies),
      },
    })),

  deleteReply: (result, deletedReplyId) =>
    result.updateQuery(({ getComment }) => ({
      getComment: {
        ...getComment,
        replies: remove(deletedReplyId, getComment.replies),
      },
    })),
};

export const chatCache = {
  createMessage: (result, createdMessage) =>
    result.updateQuery(({ getRoom }) => ({
      getRoom: { ...getRoom, messages: [createdMessage, ...getRoom.messages] },
    })),

  updateMessage: (result, updatedMessage) =>
    result.updateQuery(({ getRoom }) => ({
      getRoom: {
        ...getRoom,
        messages: replace(updatedMessage, getRoom.messages),
      },
    })),

  deleteMessage: (result, deletedMessageId) =>
    result.updateQuery(({ getRoom }) => ({
      getRoom: {
        ...getRoom,
        messages: remove(deletedMessageId, getRoom.messages),
      },
    })),
};

export const profileCache = {
  updatePost: (results, updatedPost) =>
    results.forEach((result) =>
      result.updateQuery((query) => {
        const list = Object.keys(query)[0];
        return { [list]: editFeed.replace(updatedPost, query[list]) };
      })
    ),

  deletePost: (results, deletedPostId, deletedFeedItemType) =>
    results.forEach((result) =>
      result.updateQuery((query) => {
        const list = Object.keys(query)[0];

        return {
          [list]: editFeed.remove(
            deletedPostId,
            deletedFeedItemType,
            query[list]
          ),
        };
      })
    ),
};
