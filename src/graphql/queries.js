import { gql } from '@apollo/client';
import {
  COMMENT_FRAGMENT,
  POST_FRAGMENT,
  REPOST_FRAGMENT,
  USER_FRAGMENT,
} from './fragments';

export const LOCAL_LOGIN = gql`
  mutation localLogin($username: String!, $password: String!) {
    localLogin(username: $username, password: $password) {
      token
      user {
        id
      }
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query getCurrentUser {
    getCurrentUser {
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
