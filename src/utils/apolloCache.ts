import { InMemoryCache } from '@apollo/client';

import editFeed from './feedEdit';

import type { QueryResult } from '@apollo/client';

import type { Comment, FeedItem, Message, Post, Room } from '../types';

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getIndexPosts: { merge: (_, incoming: unknown) => incoming },
        searchPosts: { merge: (_, incoming: unknown) => incoming },
        getUserPosts: { merge: (_, incoming: unknown) => incoming },
        getImagePosts: { merge: (_, incoming: unknown) => incoming },
        getLikedPosts: { merge: (_, incoming: unknown) => incoming },
        getUserComments: { merge: (_, incoming: unknown) => incoming },
      },
    },

    Post: {
      fields: {
        likes: { merge: (_, incoming: unknown) => incoming },
        comments: { merge: (_, incoming: unknown) => incoming },
        reposts: { merge: (_, incoming: unknown) => incoming },
      },
    },

    Comment: {
      fields: {
        likes: { merge: (_, incoming: unknown) => incoming },
        replies: { merge: (_, incoming: unknown) => incoming },
        reposts: { merge: (_, incoming: unknown) => incoming },
      },
    },

    Room: {
      fields: {
        messages: { merge: (_, incoming: unknown) => incoming },
      },
    },
  },
});

export default cache;

const replace = (
  updatedItem: Post | Comment | Message,
  list: Post[] | Comment[] | Message[],
) => list.map((item) => (item.id === updatedItem.id ? updatedItem : item));

const remove = (deletedItemid: string, list: Post[] | Comment[] | Message[]) =>
  list.filter((item) => item.id !== deletedItemid);

export const indexFeedCache = {
  create: (result: QueryResult, created: Post) =>
    result.updateQuery(({ getIndexPosts }: { getIndexPosts: Post[] }) => ({
      getIndexPosts: [created, ...getIndexPosts],
    })),

  update: (result: QueryResult, updated: FeedItem) =>
    result.updateQuery(({ getIndexPosts }: { getIndexPosts: FeedItem[] }) => ({
      getIndexPosts: editFeed.replace(updated, getIndexPosts),
    })),

  delete: (
    result: QueryResult,
    deletedId: string,
    deletedFeedItemType: string,
  ) =>
    result.updateQuery(({ getIndexPosts }: { getIndexPosts: FeedItem[] }) => ({
      getIndexPosts: editFeed.remove(
        deletedId,
        deletedFeedItemType,
        getIndexPosts,
      ),
    })),
};

export const searchChache = {
  updatePost: (result: QueryResult, updatedPost: Post) =>
    result.updateQuery(({ searchPosts }: { searchPosts: Post[] }) => ({
      searchPosts: replace(updatedPost, searchPosts),
    })),

  deletePost: (result: QueryResult, deletedPostId: string) =>
    result.updateQuery(({ searchPosts }: { searchPosts: Post[] }) => ({
      searchPosts: remove(deletedPostId, searchPosts),
    })),
};

export const postPageCache = {
  updatePost: (result: QueryResult, updatedPost: Post) =>
    result.updateQuery(() => ({ getPost: updatedPost })),

  createComment: (result: QueryResult, createdComment: Comment) =>
    result.updateQuery(({ getPost }: { getPost: Post }) => ({
      getPost: { ...getPost, comments: [createdComment, ...getPost.comments] },
    })),

  updateComment: (result: QueryResult, updatedComment: Comment) =>
    result.updateQuery(({ getPost }: { getPost: Post }) => ({
      getPost: {
        ...getPost,
        comments: replace(updatedComment, getPost.comments),
      },
    })),

  deleteComment: (result: QueryResult, deletedCommentId: string) =>
    result.updateQuery(({ getPost }: { getPost: Post }) => ({
      getPost: {
        ...getPost,
        comments: remove(deletedCommentId, getPost.comments),
      },
    })),
};

export const commentPageCache = {
  updatePost: (result: QueryResult, updatedPost: Post) =>
    result.updateQuery(({ getComment }: { getComment: Comment }) => ({
      getComment: { ...getComment, post: updatedPost },
    })),

  updateComment: (result: QueryResult, updatedComment: Comment) =>
    result.updateQuery(() => ({ getComment: updatedComment })),

  updateAncestor: (result: QueryResult, updatedAncestor: Comment) =>
    result.updateQuery(({ getComment }: { getComment: Comment }) => ({
      getComment: {
        ...getComment,
        commentChain: replace(updatedAncestor, getComment.commentChain),
      },
    })),

  createReply: (result: QueryResult, createdComment: Comment) =>
    result.updateQuery(({ getComment }: { getComment: Comment }) => ({
      getComment: {
        ...getComment,
        replies: [createdComment, ...getComment.replies],
      },
    })),

  updateReply: (result: QueryResult, updatedReply: Comment) =>
    result.updateQuery(({ getComment }: { getComment: Comment }) => ({
      getComment: {
        ...getComment,
        replies: replace(updatedReply, getComment.replies),
      },
    })),

  deleteReply: (result: QueryResult, deletedReplyId: string) =>
    result.updateQuery(({ getComment }: { getComment: Comment }) => ({
      getComment: {
        ...getComment,
        replies: remove(deletedReplyId, getComment.replies),
      },
    })),
};

export const chatCache = {
  createMessage: (result: QueryResult, createdMessage: Message) =>
    result.updateQuery(({ getRoom }: { getRoom: Room }) => ({
      getRoom: { ...getRoom, messages: [createdMessage, ...getRoom.messages] },
    })),

  updateMessage: (result: QueryResult, updatedMessage: Message) =>
    result.updateQuery(({ getRoom }: { getRoom: Room }) => ({
      getRoom: {
        ...getRoom,
        messages: replace(updatedMessage, getRoom.messages),
      },
    })),

  deleteMessage: (result: QueryResult, deletedMessageId: string) =>
    result.updateQuery(({ getRoom }: { getRoom: Room }) => ({
      getRoom: {
        ...getRoom,
        messages: remove(deletedMessageId, getRoom.messages),
      },
    })),
};

export const profileCache = {
  updatePost: (results: QueryResult[], updated: FeedItem) =>
    results.forEach((result) =>
      result.updateQuery((query: Record<string, FeedItem[]>) => {
        const queryName = Object.keys(query)[0];
        return { [queryName]: editFeed.replace(updated, query[queryName]) };
      }),
    ),

  deletePost: (
    results: QueryResult[],
    deletedId: string,
    deletedFeedItemType: string,
  ) =>
    results.forEach((result) =>
      result.updateQuery((query: Record<string, FeedItem[]>) => {
        const queryName = Object.keys(query)[0];

        return {
          [queryName]: editFeed.remove(
            deletedId,
            deletedFeedItemType,
            query[queryName],
          ),
        };
      }),
    ),
};
