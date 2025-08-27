export interface LoginResponse {
  __typename: 'LoginResponse';
  token: string;
  user: { __typename: 'User'; id: string };
}

export interface User {
  __typename: 'User';
  id: string;
  username: string;
  displayName: string;
  pfpUrl: string;
  joinDate: string;
  headerUrl: string;
  bio: string;
  location: string;
  website: string;
  following: { __typename: 'User'; id: string }[];

  _count: {
    __typename: 'UserCounts';
    posts: number;
    followers: number;
    following: number;
    receivedNotifications: number;
  };
}

export interface Choice {
  __typename: 'Choice';
  id: string;
  text: string;
  votes: { __typename: 'User'; id: string }[];
}

export interface Post {
  __typename: 'Post';
  id: string;
  timestamp: string;
  text: string;
  feedItemType: 'post';
  imageUrl: string | null;
  userId: string;

  user: {
    __typename: 'User';
    username: string;
    displayName: string;
    pfpUrl: string;
  };

  pollChoices: Choice[];
  reposts: { __typename: 'Repost'; id: string; userId: string }[];
  likes: { __typename: 'User'; id: string }[];
  _count: { __typename: 'PostCounts'; comments: number };
}

export interface Comment {
  __typename: 'Comment';
  id: string;
  timestamp: string;
  text: string;
  feedItemType: 'comment';
  imageUrl: string | null;
  userId: string;
  postId: string;
  parentId: string | null;

  user: {
    __typename: 'User';
    username: string;
    displayName: string;
    pfpUrl: string;
  };

  likes: { __typename: 'User'; id: string }[];
  reposts: { __typename: 'Repost'; id: string; userId: string }[];
  _count: { __typename: 'CommentCounts'; replies: number };
}

export interface Repost {
  __typename: 'Repost';
  id: string;
  timestamp: string;
  feedItemType: 'repost';
  userId: string;
  postId: string | null;
  contentType: string | null;
  user: { username: string };
  post: Post | null;

  comment:
    | (Comment & {
        post: {
          __typename: 'Post';
          userId: string;
          user: { username: string };
        };
        parent: {
          __typename: 'Comment';
          userId: string;
          user: { username: string };
        } | null;
      })
    | null;
}

export interface Notification {
  __typename: 'Notification';
  id: string;
  timestamp: string;
  type: string;
  isRead: boolean;
  sourceUserId: string;
  targetUserId: string;
  postId: string | null;
  commentId: string | null;

  sourceUser: {
    __typename: 'User';
    displayName: string;
    pfpUrl: string;
  };
}

export interface Room {
  __typename: 'Room';
  id: string;
  lastUpdated: string;

  users: {
    __typename: 'User';
    id: string;
    username: string;
    displayName: string;
    pfpUrl: string;
  }[];

  messages: {
    __typename: 'Message';
    id: string;
    timestamp: string;
    text: string;
    imageUrl: string | null;
    userId: string;
  }[];
}

export interface Message {
  __typename: 'Message';
  id: string;
  timestamp: string;
  text: string;
  imageUrl: string | null;
  userId: string;
}

export interface UserId {
  __typename: 'User';
  id: string;
}

export type PostOrRepost = Post | Repost;

export type LoginResponseResult<T extends string> = Record<T, LoginResponse>;
export type UserResult<T extends string> = Record<T, User>;
export type ChoiceResult<T extends string> = Record<T, Choice>;
export type PostResult<T extends string> = Record<T, Post>;
export type CommentResult<T extends string> = Record<T, Comment>;
export type RepostResult<T extends string> = Record<T, Repost>;
export type RoomResult<T extends string> = Record<T, Room>;
export type MessageResult<T extends string> = Record<T, Message>;

export type UserArrayResult<T extends string> = Record<T, User[]>;
export type PostArrayResult<T extends string> = Record<T, Post[]>;
export type CommentArrayResult<T extends string> = Record<T, Comment[]>;
export type RoomArrayResult<T extends string> = Record<T, Room[]>;

export type NotificationArrayResult<T extends string> = Record<
  T,
  Notification[]
>;

export type PostOrRepostArrayResult<T extends string> = Record<
  T,
  PostOrRepost[]
>;
