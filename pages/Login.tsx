import React, { useState } from 'react';
import { User } from '../types';
import { Button, Card, Input } from '../components/UI';
import { storageService } from '../services/storageService';
import { Icons } from '../components/Icons';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const users = await storageService.getUsers();
      // Simple username matching (case-insensitive)
      const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      
      if (user) {
        onLogin(user);
      } else {
        setError('User not found. Please check your username.');
      }
    } catch (err) {
      setError('Failed to connect to login service.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <Icons.Book />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to TeacherConnect</h1>
          <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input 
            label="Username" 
            type="text" 
            placeholder="Enter your username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
};