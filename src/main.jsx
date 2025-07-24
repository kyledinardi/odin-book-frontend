import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, ApolloProvider, createHttpLink } from '@apollo/client';
import ReactDOM from 'react-dom/client';
import React from 'react';
import routes from './Router.jsx';
import apolloCache from './utils/apolloCache';
import './style/index.css';

const router = createBrowserRouter(routes);
const httpLink = createHttpLink({ uri: 'http://localhost:3000' });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');

  return {
    headers: { ...headers, authorization: token ? `Bearer ${token}` : null },
  };
});

const client = new ApolloClient({
  cache: apolloCache,
  link: authLink.concat(httpLink),
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </ApolloProvider>
  </React.StrictMode>
);
