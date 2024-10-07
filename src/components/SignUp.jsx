import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../style/Login.module.css';

function SignUp() {
  const [errorArray, setErrorArray] = useState(null);
  const navigate = useNavigate();

  async function submitLogin(e) {
    e.preventDefault();

    const responseStream = await fetch('http://localhost:3000/users', {
      method: 'Post',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({
        username: e.target[0].value,
        password: e.target[1].value,
        passwordConfirmation: e.target[2].value,
      }),
    });

    const response = await responseStream.json();

    if (!response.user) {
      e.target.reset();
      setErrorArray(response.errors);
    } else {
      navigate('/');
    }
  }

  return (
    <div className={styles.flexWrapper}>
      <h1>Sign up for FakeSocial</h1>
      <div className={styles.loginForms}>
        <form className={styles.flexForm} onSubmit={(e) => submitLogin(e)}>
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
          {errorArray && (
            <div className={styles.error}>
              {errorArray.map((error) => (
                <p key={error.msg}>{error.msg}</p>
              ))}
            </div>
          )}
          <button>Sign Up</button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
