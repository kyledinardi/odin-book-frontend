import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import ReactDOM from 'react-dom/client';
import React from 'react';
import routes from './Router.jsx';
import apolloCache from './utils/apolloCache';
import './style/index.css';

const router = createBrowserRouter(routes);
const uploadLink = createUploadLink({
  uri: 'http://localhost:3000',
  headers: { 'Apollo-Require-Preflight': 'true' },
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');

  return {
    headers: { ...headers, authorization: token ? `Bearer ${token}` : null },
  };
});

const client = new ApolloClient({
  cache: apolloCache,
  link: authLink.concat(uploadLink),
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </ApolloProvider>
  </React.StrictMode>
);
