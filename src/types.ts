export interface LoginResponse {
  __typename: 'LoginResponse';
  token: string;
  user: { __typename: 'User'; id: string };
}

export interface UserBase {
  __typename: 'User';
  id: string;
  username: string;
  displayName: string;
  pfpUrl: string;
}

export interface User extends UserBase {
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
  comments: Comment[];

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
  post: Post | null;
  parent: Comment | null;
  replies: Comment[];
  commentChain: Comment[];

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
  commentId: string | null;
  contentType: string | null;
  user: { displayName: string };
  post: Post | null;
  comment: Comment | null;
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

export interface CreateContentVariables {
  text: string;
  gifUrl: string;
  image: File | null;
  pollChoices?: string[];
  postId?: string;
  commentId?: string;
  parentId?: string;
}

export type AppContext = [User, () => void, number, (count: number) => void];
export type Content = Post | Comment | undefined;
export type FeedItem = Post | Comment | Repost;
export type PostOrRepost = Post | Repost;
export type IdResult<T extends string> = Record<T, { id: string }>;

export type LoginResponseResult<T extends string> = Record<T, LoginResponse>;
export type UserResult<T extends string> = Record<T, User>;
export type ChoiceResult<T extends string> = Record<T, Choice>;
export type PostResult<T extends string> = Record<T, Post>;
export type CommentResult<T extends string> = Record<T, Comment>;
export type RepostResult<T extends string> = Record<T, Repost>;
export type RoomResult<T extends string> = Record<T, Room>;
export type MessageResult<T extends string> = Record<T, Message>;
export type PostOrRepostResult<T extends string> = Record<T, PostOrRepost>;

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
