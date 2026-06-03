import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex bg-primary-600 text-white p-3 rounded-2xl shadow-lg mb-4">
          <FileText size={32} />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
          Create an account
        </h2>
        <p className="mt-2 text-sm text-dark-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
            Sign in instead
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-dark-800/50 backdrop-blur-md border border-dark-700 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
