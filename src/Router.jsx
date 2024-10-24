import { redirect } from 'react-router-dom';
import App from './App.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import Home from './components/Home.jsx';
import PostPage from './components/PostPage.jsx';
import Search from './components/Search.jsx';
import Profile from './components/Profile.jsx';
import Follows from './components/Follows.jsx';

const errorElement = <ErrorPage />;

const routes = [
  {
    path: '/',
    element: <App />,
    errorElement,
    loader: () => (localStorage.getItem('token') ? null : redirect('/login')),

    children: [
      { index: true, element: <Home /> },
      { path: 'posts/:postId', element: <PostPage /> },
      { path: '/search', element: <Search /> },
      { path: '/users/:userId', element: <Profile /> },
      { path: '/users/:userId/follows', element: <Follows /> },
    ],
  },

  {
    path: '/login',
    element: <Login />,
    errorElement,
    loader: () => (localStorage.getItem('token') ? redirect('/') : null),
  },

  {
    path: '/sign-up',
    element: <SignUp />,
    errorElement,
    loader: () => (localStorage.getItem('token') ? redirect('/') : null),
  },
];

export default routes;
