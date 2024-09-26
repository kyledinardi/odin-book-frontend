import App from './App.jsx';
import Home from './components/Home.jsx';
import ErrorPage from './components/ErrorPage.jsx';

const routes = [
  {
    path: '/',
    element: <App />,
    children: [{ index: true, element: <Home /> }],
    errorElement: <ErrorPage />,
  },
];

export default routes;
