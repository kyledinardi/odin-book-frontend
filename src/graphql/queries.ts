import { gql } from '@apollo/client';

import {
  COMMENT_FRAGMENT,
  POST_FRAGMENT,
  REPOST_FRAGMENT,
  USER_FRAGMENT,
} from './fragments';

export const GET_CURRENT_USER = gql`
  query getCurrentUser {
    getCurrentUser {
      ...UserFragment
    }
  }

  ${USER_FRAGMENT}
`;

export const GET_USER = gql`
  query getUser($userId: ID!) {
    getUser(userId: $userId) {
      ...UserFragment
    }
  }

  ${USER_FRAGMENT}
`;

export const GET_LISTED_USERS = gql`
  query getListedUsers {
    getListedUsers {
      ...UserFragment
    }
  }

  ${USER_FRAGMENT}
`;

export const SEARCH_USERS = gql`
  query searchUsers($query: String!, $cursor: ID) {
    searchUsers(query: $query, cursor: $cursor) {
      ...UserFragment
    }
  }

  ${USER_FRAGMENT}
`;

export const GET_FOLLOWING = gql`
  query getFollowing($userId: ID!, $cursor: ID) {
    getFollowing(userId: $userId, cursor: $cursor) {
      ...UserFragment
    }
  }

  ${USER_FRAGMENT}
`;

export const GET_FOLLOWERS = gql`
  query getFollowers($userId: ID!, $cursor: ID) {
    getFollowers(userId: $userId, cursor: $cursor) {
      ...UserFragment
    }
  }

  ${USER_FRAGMENT}
`;

export const GET_MUTUALS = gql`
  query getMutuals($userId: ID!, $cursor: ID) {
    getMutuals(userId: $userId, cursor: $cursor) {
      ...UserFragment
    }
  }

  ${USER_FRAGMENT}
`;

export const GET_FOLLOWED_FOLLOWERS = gql`
  query getFollowedFollowers($userId: ID!, $cursor: ID) {
    getFollowedFollowers(userId: $userId, cursor: $cursor) {
      ...UserFragment
    }
  }

  ${USER_FRAGMENT}
`;

export const GET_INDEX_POSTS = gql`
  query getIndexPosts($postCursor: ID, $repostCursor: ID, $timestamp: String) {
    getIndexPosts(
      postCursor: $postCursor
      repostCursor: $repostCursor
      timestamp: $timestamp
    ) {
      ... on Post {
        ...PostFragment
      }
      ... on Repost {
        ...RepostFragment
      }
    }
  }

  ${POST_FRAGMENT}
  ${REPOST_FRAGMENT}
`;

export const SEARCH_POSTS = gql`
  query searchPosts($query: String!, $cursor: ID) {
    searchPosts(query: $query, cursor: $cursor) {
      ...PostFragment
    }
  }

  ${POST_FRAGMENT}
`;

export const GET_POST = gql`
  query getPost($postId: ID!, $cursor: ID) {
    getPost(postId: $postId, cursor: $cursor) {
      ...PostFragment
      comments {
        ...CommentFragment
      }
    }
  }

  ${POST_FRAGMENT}
  ${COMMENT_FRAGMENT}
`;

export const GET_USER_POSTS = gql`
  query getUserPosts($userId: ID!, $postCursor: ID, $repostCursor: ID) {
    getUserPosts(
      userId: $userId
      postCursor: $postCursor
      repostCursor: $repostCursor
    ) {
      ... on Post {
        ...PostFragment
      }
      ... on Repost {
        ...RepostFragment
      }
    }
  }

  ${POST_FRAGMENT}
  ${REPOST_FRAGMENT}
`;

export const GET_IMAGE_POSTS = gql`
  query getImagePosts($userId: ID!, $cursor: ID) {
    getImagePosts(userId: $userId, cursor: $cursor) {
      ...PostFragment
    }
  }

  ${POST_FRAGMENT}
`;

export const GET_LIKED_POSTS = gql`
  query getLikedPosts($userId: ID!, $cursor: ID) {
    getLikedPosts(userId: $userId, cursor: $cursor) {
      ...PostFragment
    }
  }

  ${POST_FRAGMENT}
`;

export const GET_COMMENT = gql`
  query getComment($commentId: ID!, $cursor: ID) {
    getComment(commentId: $commentId, cursor: $cursor) {
      ...CommentFragment
      post {
        ...PostFragment
      }
      parent {
        ...CommentFragment
      }
      commentChain {
        ...CommentFragment
      }
      replies {
        ...CommentFragment
      }
    }
  }

  ${POST_FRAGMENT}
  ${COMMENT_FRAGMENT}
`;

export const GET_USER_COMMENTS = gql`
  query getUserComments($userId: ID!, $cursor: ID) {
    getUserComments(userId: $userId, cursor: $cursor) {
      ...CommentFragment
      post {
        ...PostFragment
      }
      parent {
        ...CommentFragment
      }
    }
  }

  ${POST_FRAGMENT}
  ${COMMENT_FRAGMENT}
`;

export const GET_NOTIFICATIONS = gql`
  query getNotifications($cursor: ID, $timestamp: String) {
    getNotifications(cursor: $cursor, timestamp: $timestamp) {
      id
      timestamp
      type
      isRead
      sourceUserId
      targetUserId
      postId
      commentId
      sourceUser {
        displayName
        pfpUrl
      }
    }
  }
`;

export const GET_ALL_ROOMS = gql`
  query getAllRooms($cursor: ID) {
    getAllRooms(cursor: $cursor) {
      id
      lastUpdated
      users {
        id
        username
        displayName
        pfpUrl
      }
      messages {
        text
      }
    }
  }
`;

export const GET_ROOM = gql`
  query getRoom($roomId: ID!, $cursor: ID) {
    getRoom(roomId: $roomId, cursor: $cursor) {
      id
      lastUpdated
      users {
        id
        username
        displayName
        pfpUrl
      }
      messages {
        id
        timestamp
        text
        imageUrl
        userId
      }
    }
  }
`;
