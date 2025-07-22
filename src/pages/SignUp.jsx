import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import ErrorPage from './ErrorPage.jsx';
import { CREATE_USER } from '../graphql/mutations';
import styles from '../style/Login.module.css';

function SignUp() {
  const [unexpectedError, setUnexpectedError] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [theme, setTheme] = useState('');
  const navigate = useNavigate();

  const [createUser, createUserResult] = useMutation(CREATE_USER, {
    onError: (err) => {
      if (err.graphQLErrors[0].extensions.code === 'BAD_USER_INPUT') {
        setErrorMessage(err.graphQLErrors[0].message);
      } else {
        setUnexpectedError(err);
      }
    },
  });

  useEffect(() => {
    let themeName = localStorage.getItem('theme');

    if (!themeName) {
      const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
      themeName = isDark ? 'dark' : 'light';
      localStorage.setItem('theme', themeName);
    }

    setTheme(themeName);
  }, []);

  useEffect(() => {
    if (createUserResult.data) {
      const { token, user } = createUserResult.data.createUser;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      navigate('/');
    }
  }, [createUserResult.data, navigate]);

  async function submitSignUp(e) {
    e.preventDefault();

    createUser({
      variables: {
        displayName: e.target[0].value,
        username: e.target[1].value,
        password: e.target[2].value,
        passwordConfirmation: e.target[3].value,
      },
    });

    e.target[2].value = '';
    e.target[3].value = '';
  }

  return (
    <div className='themeWrapper' data-theme={theme}>
      {unexpectedError ? (
        <ErrorPage error={unexpectedError} />
      ) : (
        <div className={styles.flexWrapper}>
          <div>
            <Link to='/login'>
              <span
                className={`material-symbols-outlined ${styles.backButton}`}
              >
                arrow_back
              </span>
            </Link>
            <h1>Sign up for Odin-Book</h1>
          </div>
          <div className={styles.loginForms}>
            {errorMessage !== '' && (
              <div className={styles.error}>
                <span>{errorMessage}</span>
              </div>
            )}
            <form className={styles.flexForm} onSubmit={(e) => submitSignUp(e)}>
              <div>
                <label htmlFor='displayName'>Display Name (optional)</label>
                <input
                  type='text'
                  name='displayName'
                  id='displayName'
                  maxLength={50}
                />
              </div>
              <div>
                <label htmlFor='username'>Username</label>
                <input
                  type='text'
                  name='username'
                  id='username'
                  maxLength={50}
                  required
                />
              </div>
              <div>
                <label htmlFor='password'>Password</label>
                <input
                  type='password'
                  name='password'
                  id='password'
                  maxLength={50}
                  required
                />
              </div>
              <div>
                <label htmlFor='passwordConfirmation'>Confirm Password</label>
                <input
                  type='password'
                  name='passwordConfirmation'
                  id='passwordConfirmation'
                  maxLength={50}
                  required
                />
              </div>
              <button>Sign Up</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignUp;
