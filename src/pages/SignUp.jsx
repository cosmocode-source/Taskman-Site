import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Pages.css';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: ''
  });

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: '' };

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complexity checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Determine strength
    if (score <= 2) {
      return { score, label: 'Weak', color: '#e74c3c' };
    } else if (score <= 4) {
      return { score, label: 'Medium', color: '#f39c12' };
    } else {
      return { score, label: 'Strong', color: '#27ae60' };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');

    // Update password strength on password change
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      setError('Username must be 3-20 characters and can only contain letters, numbers, and underscores');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate to dashboard
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    setError(`${provider} signup is not yet implemented`);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card signup-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Sign up to get started with TaskMan</p>
          </div>

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div >
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div >
                <i className="fas fa-at"></i>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  disabled={loading}
                />
              </div>
              <p className="field-hint">3-20 characters, letters, numbers, and underscores only</p>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div >
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div >
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  disabled={loading}
                />
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{ 
                        width: `${(passwordStrength.score / 6) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <span className="strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              <p className="field-hint">Must be at least 8 characters</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div >
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  disabled={loading}
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="inline-link">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="inline-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <div className="social-login">
            <button 
              className="social-btn google-btn"
              onClick={() => handleSocialSignup('Google')}
              disabled={loading}
            >
              <i className="fab fa-google"></i>
              Sign up with Google
            </button>
            <button 
              className="social-btn github-btn"
              onClick={() => handleSocialSignup('GitHub')}
              disabled={loading}
            >
              <i className="fab fa-github"></i>
              Sign up with GitHub
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/signin" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
