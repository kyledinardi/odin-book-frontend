import { redirect } from 'react-router-dom';

import App from './App.tsx';
import Chat from './pages/Chat.tsx';
import CommentPage from './pages/CommentPage.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import Follows from './pages/Follows.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import NotificationList from './pages/NotificationList.tsx';
import PostPage from './pages/PostPage.tsx';
import Profile from './pages/Profile.tsx';
import RoomList from './pages/RoomList.tsx';
import Search from './pages/Search.tsx';
import SignUp from './pages/SignUp.tsx';

const routes = [
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage error={new Error('404: Page not found')} />,
    loader: () => (localStorage.getItem('token') ? null : redirect('/login')),

    children: [
      { index: true, element: <Home /> },
      { path: 'posts/:postId', element: <PostPage /> },
      { path: 'comments/:commentId', element: <CommentPage /> },
      { path: '/search', element: <Search /> },
      { path: '/notifications', element: <NotificationList /> },
      { path: '/messages', element: <RoomList /> },
      { path: '/messages/:roomId', element: <Chat /> },
      { path: '/users/:userId', element: <Profile /> },
      { path: '/users/:userId/follows', element: <Follows /> },
    ],
  },

  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorPage error={new Error('404: Page not found')} />,
    loader: () => (localStorage.getItem('token') ? redirect('/') : null),
  },

  {
    path: '/sign-up',
    element: <SignUp />,
    errorElement: <ErrorPage error={new Error('404: Page not found')} />,
    loader: () => (localStorage.getItem('token') ? redirect('/') : null),
  },
];

export default routes;
