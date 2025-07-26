import { gql } from '@apollo/client';
import { POST_FRAGMENT, REPOST_FRAGMENT } from './fragments';

export const LOCAL_LOGIN = gql`
  mutation localLogin($email: String!, $password: String!) {
    localLogin(email: $email, password: $password) {
      token
    }
  }
`;

export const CREATE_USER = gql`
  mutation createUser(
    $displayName: String
    $username: String!
    $password: String!
    $passwordConfirmation: String!
  ) {
    createUser(
      displayName: $displayName
      username: $username
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      token
      user {
        id
      }
    }
  }
`;

export const CREATE_POST = gql`
  mutation createPost(
    $text: String
    $gifUrl: String
    $pollChoices: [String!]
    $image: Upload
  ) {
    createPost(
      text: $text
      gifUrl: $gifUrl
      pollChoices: $pollChoices
      image: $image
    ) {
      ...PostFragment
    }
  }

  ${POST_FRAGMENT}
`;

export const DELETE_POST = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId) {
      id
    }
  }
`;

export const UPDATE_POST = gql`
  mutation updatePost(
    $postId: ID!
    $text: String
    $gifUrl: String
    $image: Upload
  ) {
    updatePost(postId: $postId, text: $text, gifUrl: $gifUrl, image: $image) {
      ...PostFragment
    }
  }

  ${POST_FRAGMENT}
`;

export const LIKE_POST = gql`
  mutation likePost($postId: ID!) {
    likePost(postId: $postId) {
      ...PostFragment
    }
  }

  ${POST_FRAGMENT}
`;

export const VOTE_IN_POLL = gql`
  mutation voteInPoll($choiceId: ID!) {
    voteInPoll(choiceId: $choiceId) {
      id
      postId
      text
      votes {
        id
      }
    }
  }
`;

export const REPOST = gql`
  mutation repost($id: ID!, $contentType: String!) {
    repost(id: $id, contentType: $contentType) {
      ...RepostFragment
    }
  }

  ${REPOST_FRAGMENT}
`;
