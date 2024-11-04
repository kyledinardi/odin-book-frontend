import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorPage from './ErrorPage.jsx';
import styles from '../style/Login.module.css';
import backendFetch from '../../ helpers/backendFetch';

function SignUp() {
  const [unexpectedError, setUnexpectedError] = useState(null);
  const [errorArray, setErrorArray] = useState(null);
  const navigate = useNavigate();

  async function submitLogin(e) {
    e.preventDefault();

    const response = await backendFetch(setUnexpectedError, '/users', {
      hasBearer: false,
      method: 'POST',

      body: JSON.stringify({
        displayName: e.target[0].value,
        username: e.target[1].value,
        password: e.target[2].value,
        passwordConfirmation: e.target[3].value,
      }),
    });

    if (response.expectedErrors) {
      e.target.reset();
      setErrorArray(response.expectedErrors);
    } else {
      navigate('/');
    }
  }

  return unexpectedError ? (
    <ErrorPage
      error={unexpectedError}
      setError={(err) => setUnexpectedError(err)}
    />
  ) : (
    <div className={styles.flexWrapper}>
      <div>
        <Link to='/login'>
          <span className={`material-symbols-outlined ${styles.backButton}`}>
            arrow_back
          </span>
        </Link>
        <h1>Sign up for FakeSocial</h1>
      </div>
      <div className={styles.loginForms}>
        {errorArray && (
          <div className={styles.error}>
            {errorArray.map((error) => (
              <span key={error.msg}>{error.msg}</span>
            ))}
          </div>
        )}
        <form className={styles.flexForm} onSubmit={(e) => submitLogin(e)}>
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
  );
}

export default SignUp;
