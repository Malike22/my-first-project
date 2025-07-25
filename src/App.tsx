import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import './App.css';

// Define the shape of login data
interface LoginData {
  email: string;
  password: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<LoginData | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Handle login submission
  const handleLogin = async (data: LoginData) => {
    setLoginLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, accept any email/password combination
      // In a real app, you would validate against a backend
      console.log('Login successful with data:', data);
      
      setUser(data);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  // If user is logged in, show welcome page
  if (isLoggedIn && user) {
    return (
      <div className="app">
        <div className="welcome-container">
          <div className="welcome-card">
            <div className="welcome-header">
              <h1>🎉 Welcome!</h1>
              <p>You have successfully logged in</p>
            </div>
            
            <div className="user-info">
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Login Time:</span>
                <span className="value">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="welcome-actions">
              <button onClick={handleLogout} className="logout-button">
                🚪 Logout
              </button>
            </div>

            <div className="demo-info">
              <h3>Demo Information</h3>
              <p>
                This is a demo React login form with TypeScript. The form includes:
              </p>
              <ul>
                <li>✅ Email and password validation</li>
                <li>✅ Show/hide password functionality</li>
                <li>✅ Loading states and error handling</li>
                <li>✅ Responsive design</li>
                <li>✅ Accessibility features</li>
                <li>✅ TypeScript type safety</li>
              </ul>
              <p>
                <strong>Note:</strong> This demo accepts any email and password for login.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login form
  return (
    <div className="app">
      <LoginForm onLogin={handleLogin} isLoading={loginLoading} />
    </div>
  );
}

export default App;