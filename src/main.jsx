import { setContext } from '@apollo/client/link/context';
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import React from 'react';
import routes from './Router.jsx';
import './style/index.css';

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');

  return {
    headers: { ...headers, authorization: token ? `Bearer ${token}` : null },
  };
});

const httpLink = createHttpLink({ uri: 'http://localhost:3000' });

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </ApolloProvider>
  </React.StrictMode>
);
