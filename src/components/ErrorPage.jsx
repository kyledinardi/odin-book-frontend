import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import styles from '../style/ErrorPage.module.css';

function ErrorPage({ error, setError }) {
  const navigate = useNavigate();

  return (
    <div className={styles.error}>
      <h1>
        {error
          ? `${error.status}: ${
              Math.floor(error.status / 100) === 5
                ? 'Internal Server Error'
                : error.message
            }`
          : '404: Page not found'}
      </h1>
      <div>
        <button
          onClick={() => {
            setError(null);
            navigate('/');
          }}
        >
          Go Home
        </button>
        <button
          onClick={() => {
            setError(null);
            navigate(-1);
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

ErrorPage.propTypes = { error: PropTypes.object, setError: PropTypes.func };
export default ErrorPage;
