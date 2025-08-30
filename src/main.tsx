import React from 'react';

import { ApolloClient, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import routes from './Router.tsx';
import './style/index.css';
import apolloCache from './utils/apolloCache.ts';

const router = createBrowserRouter(routes);
const uploadLink = createUploadLink({
  uri: 'http://localhost:3000',
  headers: { 'Apollo-Require-Preflight': 'true' },
});

const authLink = setContext(
  (_, { headers }: { headers?: Record<string, string> }) => {
    const token = localStorage.getItem('token');

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  },
);

const client = new ApolloClient({
  cache: apolloCache,
  link: authLink.concat(uploadLink),
});

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>,
);
