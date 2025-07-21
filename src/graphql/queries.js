import { gql } from '@apollo/client';
import { POST_FRAGMENT, REPOST_FRAGMENT, USER_FRAGMENT } from './fragments';

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
` 

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
