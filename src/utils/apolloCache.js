import { InMemoryCache } from '@apollo/client';

export default new InMemoryCache({
  typePolicies: {
    Query: {
      fields: { getIndexPosts: { merge: (_, incoming) => incoming } },
    },

    Post: {
      fields: {
        likes: { merge: (_, incoming) => incoming },
        reposts: { merge: (_, incoming) => incoming },
      },
    },
  },
});
