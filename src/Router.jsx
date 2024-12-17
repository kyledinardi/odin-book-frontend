import { redirect } from 'react-router-dom';
import App from './App.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import Home from './components/Home.jsx';
import PostPage from './components/PostPage.jsx';
import CommentPage from './components/CommentPage.jsx';
import Search from './components/Search.jsx';
import Profile from './components/Profile.jsx';
import Follows from './components/Follows.jsx';
import NotificationList from './components/NotificationList.jsx';

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
