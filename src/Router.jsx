import { redirect } from 'react-router-dom';
import App from './App.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import Home from './pages/Home.jsx';
import PostPage from './pages/PostPage.jsx';
import CommentPage from './pages/CommentPage.jsx';
import Search from './pages/Search.jsx';
import NotificationList from './pages/NotificationList.jsx';
import RoomList from './pages/RoomList.jsx';
import Chat from './pages/Chat.jsx';
import Profile from './pages/Profile.jsx';
import Follows from './pages/Follows.jsx';

const routes = [
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
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
    errorElement: <ErrorPage />,
    loader: () => (localStorage.getItem('token') ? redirect('/') : null),
  },

  {
    path: '/sign-up',
    element: <SignUp />,
    errorElement: <ErrorPage />,
    loader: () => (localStorage.getItem('token') ? redirect('/') : null),
  },
];

export default routes;
