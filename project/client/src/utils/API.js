const graphQLFetch = async (query, variables = {}) => {
  const token = localStorage.getItem('id_token');  // or wherever you store the token

  const response = await fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ query, variables }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    throw new Error(errors.map((error) => error.message).join('\n'));
  }

  return data;
};

// Get logged in user's info
export const getMe = () => {
  const query = `
    query {
      me {
        _id
        username
        email
        savedBooks {
          bookId
          title
          authors
          description
          image
          link
        }
      }
    }
  `;
  
  return graphQLFetch(query);
};

// Create a new user (sign up)
export const createUser = (userData) => {
  const mutation = `
    mutation createUser($username: String!, $email: String!, $password: String!) {
      createUser(username: $username, email: $email, password: $password) {
        token
        user {
          _id
          username
          email
        }
      }
    }
  `;
  
  return graphQLFetch(mutation, userData);
};

// Log in a user
export const loginUser = (userData) => {
  const mutation = `
    mutation login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          _id
          username
          email
        }
      }
    }
  `;
  
  return graphQLFetch(mutation, userData);
};

// Save a book to the user's savedBooks
export const saveBook = (bookData) => {
  const mutation = `
    mutation saveBook($bookData: BookInput!) {
      saveBook(bookData: $bookData) {
        _id
        username
        savedBooks {
          bookId
          title
          authors
          description
          image
          link
        }
      }
    }
  `;
  
  return graphQLFetch(mutation, { bookData });
};

// Remove a saved book from the user's savedBooks
export const deleteBook = (bookId) => {
  const mutation = `
    mutation removeBook($bookId: String!) {
      removeBook(bookId: $bookId) {
        _id
        username
        savedBooks {
          bookId
          title
          authors
          description
          image
          link
        }
      }
    }
  `;
  
  return graphQLFetch(mutation, { bookId });
};

// Search for books from the Google Books API
export const searchGoogleBooks = (query) => {
  return fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
};