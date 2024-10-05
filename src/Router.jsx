import { redirect } from 'react-router-dom';
import App from './App.jsx';
import Home from './components/Home.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import Login from './components/Login.jsx';
import SignUp from './components/SignUp.jsx';
import PostPage from './components/PostPage.jsx';
import UserList from './components/UserList.jsx';
import Profile from './components/Profile.jsx';

const routes = [
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    loader: () => (localStorage.getItem('token') ? null : redirect('/login')),

    children: [
      { index: true, element: <Home /> },
      { path: 'posts/:postId', element: <PostPage /> },
      { path: '/users', element: <UserList /> },
      { path: '/users/:userId', element: <Profile /> },
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
