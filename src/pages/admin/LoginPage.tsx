import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import styles from './LoginPage.module.css';

interface LocationState {
  from?: Location;
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isAuthenticated, signIn } = useAdmin();
  const location = useLocation();
  const state = location.state as LocationState;

  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = state?.from?.pathname || '/admin';
    return <Navigate to={from} replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (!result.success) {
        setError(result.error || 'Login failed');
      }
      // If successful, the useAdmin context will handle the redirect
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.email.trim() && formData.password.trim();

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🏥</span>
            <h1 className={styles.logoText}>OneCell Admin</h1>
          </div>
          <p className={styles.subtitle}>Sign in to manage your clinic</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="admin@onecellclinic.com"
              required
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.loadingSpinner}></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p className={styles.helpText}>
            Admin access only. Contact your system administrator for access.
          </p>
        </div>
      </div>

      <div className={styles.backgroundPattern}></div>
    </div>
  );
};

export default LoginPage;