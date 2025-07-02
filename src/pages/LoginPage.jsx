import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login, loginWithMagicLink, signup, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const { error } = await login(email, password);
    if (error) setError(error.message);
    else navigate('/app');
    setIsLoading(false);
  };

  const handleMagic = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const { error } = await loginWithMagicLink(email);
    if (error) setError(error.message);
    else setMagicSent(true);
    setIsLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSignUpSuccess(false);
    const { error } = await signup(email, password);
    if (error) setError(error.message);
    else setSignUpSuccess(true);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form
        className="w-full max-w-sm p-8 bg-white rounded shadow"
        onSubmit={isSignUp ? handleSignUp : handleLogin}
      >
        <h2 className="mb-4 text-2xl font-bold">{isSignUp ? 'Sign Up' : 'Login'}</h2>
        <input
          className="w-full p-2 mb-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-2 mb-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {isSignUp ? (
          <button
            className="w-full p-2 mb-2 text-white bg-blue-600 rounded disabled:opacity-50"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        ) : (
          <>
            <button
              className="w-full p-2 mb-2 text-white bg-blue-600 rounded disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
            <button
              className="w-full p-2 mb-2 text-white bg-green-600 rounded disabled:opacity-50"
              type="button"
              onClick={handleMagic}
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </>
        )}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="text-blue-600 hover:underline text-sm"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSignUpSuccess(false);
            }}
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
        </div>
        {magicSent && !isSignUp && <div className="mb-2 text-green-600">Magic link sent! Check your email.</div>}
        {signUpSuccess && isSignUp && <div className="mb-2 text-green-600">Sign up successful! Check your email to confirm your account.</div>}
        {error && <div className="mb-2 text-red-600">{error}</div>}
      </form>
    </div>
  );
} 