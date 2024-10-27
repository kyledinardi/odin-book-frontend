import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorPage from './ErrorPage.jsx';
import styles from '../style/Login.module.css';

function SignUp() {
  const [unexpectedError, setUnexpectedError] = useState(null);
  const [errorArray, setErrorArray] = useState(null);
  const navigate = useNavigate();

  async function submitLogin(e) {
    e.preventDefault();

    const responseStream = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users`,

      {
        method: 'Post',
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
          displayName: e.target[0].value,
          username: e.target[1].value,
          password: e.target[2].value,
          passwordConfirmation: e.target[3].value,
        }),
      },
    );

    const response = await responseStream.json();

    if (response.expectedErrors) {
      e.target.reset();
      setErrorArray(response.expectedErrors);
    } else if (response.error) {
      setUnexpectedError(response.error);
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
      <h1>Sign up for FakeSocial</h1>
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
            <input type='text' name='displayName' id='displayName' />
          </div>
          <div>
            <label htmlFor='username'>Username</label>
            <input type='text' name='username' id='username' required />
          </div>
          <div>
            <label htmlFor='password'>Password</label>
            <input type='password' name='password' id='password' required />
          </div>
          <div>
            <label htmlFor='passwordConfirmation'>Confirm Password</label>
            <input
              type='password'
              name='passwordConfirmation'
              id='passwordConfirmation'
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
