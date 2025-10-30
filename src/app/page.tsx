
'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import EmailList from '@/components/EmailList';
import { FiLogOut, FiMail, FiLoader, FiKey } from 'react-icons/fi';
import Image from 'next/image';

export default function Home() {
  const { data: session, status } = useSession();
  
  // State for the sign-in form
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  // State for the authenticated view
  const [userApiKey, setUserApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState('');

  const isLoading = status === 'loading';

  useEffect(() => {
    if (status === 'authenticated') {
      const storedKey = localStorage.getItem('openai_api_key');
      if (storedKey) {
        setUserApiKey(storedKey);
        setNewApiKey(storedKey);
      }
    }
  }, [status]);

  const handleSignIn = () => {
    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key.');
      return;
    }
    localStorage.setItem('openai_api_key', apiKey);
    signIn('google');
  };

  const handleUpdateApiKey = () => {
    if (!newApiKey.trim()) {
      // Basic validation
      return;
    }
    localStorage.setItem('openai_api_key', newApiKey);
    setUserApiKey(newApiKey);
    setIsApiKeyModalOpen(false);
  };

  if (isLoading) {
    return (
      <main className="min-vh-100 d-flex align-items-center justify-content-center text-light bg-animated-gradient">
        <div className="text-center">
          <FiLoader className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 fs-5">Initializing session...</p>
        </div>
      </main>
    );
  }

  if (status !== 'authenticated') {
    return (
      <main className="min-vh-100 d-flex align-items-center justify-content-center p-4 bg-animated-gradient">
        <div className="col-xl-4 col-lg-6 col-md-8 mx-auto text-center bg-light bg-opacity-10 p-5 rounded-4 shadow-lg" style={{ backdropFilter: 'blur(12px)' }}>
          <div className="mb-4">
            <FiMail className="text-primary" style={{ fontSize: '6rem' }} />
          </div>
          <h1 className="fw-bolder mb-3 text-white">AI Email Classifier</h1>
          <p className="text-white-50 mb-4">
            Sign in with Google and provide your OpenAI key to let AI classify your emails.
          </p>

          <div className="mb-4 position-relative">
            <FiKey className="position-absolute top-50 translate-middle-y text-white-50" style={{ left: '1rem', zIndex: 2 }} />
            <input
              type="password"
              className="form-control form-control-lg bg-dark text-white border-secondary ps-5"
              placeholder="Enter your OpenAI API key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (error) setError(null);
              }}
            />
            {error && <div className="invalid-feedback d-block text-start mt-2">{error}</div>}
          </div>

          <button
            onClick={handleSignIn}
            className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2 shadow-lg"
          >
            <Image src="/google-logo.svg" alt="Google logo" width={22} height={22} />
            <span className="fw-bold">Sign in with Google</span>
          </button>

          <p className="text-white-50 mt-4" style={{ fontSize: '0.8rem' }}>
            Your API key is stored locally and securely. We respect your privacy.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-vh-100 p-lg-4 bg-animated-gradient">
      <div className="container-fluid">
        <header className="d-flex justify-content-between align-items-center mb-5 p-3 rounded-3 bg-light bg-opacity-10 shadow-sm" style={{ backdropFilter: 'blur(10px)' }}>
          <div className="d-flex align-items-center gap-3">
            {session.user?.image && (
              <Image src={session.user.image} alt="User profile" width={45} height={45} className="rounded-circle border border-primary border-2 shadow-sm" />
            )}
            <div>
              <span className="fw-semibold text-white d-none d-md-inline">{session.user?.name}</span>
              <p className="text-white-50 mb-0 d-none d-md-block" style={{ fontSize: '0.8rem' }}>{session.user?.email}</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
             <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="btn btn-outline-primary d-flex align-items-center gap-2 shadow-sm"
                title="Update API Key"
              >
                <FiKey />
                <span className="d-none d-sm-inline">Update Key</span>
            </button>
            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn btn-outline-danger d-flex align-items-center gap-2 shadow-sm"
            >
                <FiLogOut />
                <span className="d-none d-sm-inline">Sign out</span>
            </button>
          </div>
        </header>

        <EmailList session={session} apiKey={userApiKey} />
      </div>

      {isApiKeyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          backdropFilter: 'blur(5px)',
        }}>
          <div className="modal-dialog" style={{ minWidth: '500px' }}>
            <div className="modal-content bg-dark text-white shadow-lg border-secondary rounded-4">
              <div className="modal-header border-0 px-4 pt-4">
                <h5 className="modal-title d-flex align-items-center gap-2"><FiKey/> Update OpenAI API Key</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsApiKeyModalOpen(false)}></button>
              </div>
              <div className="modal-body p-4">
                <p className='text-white-50 mb-4'>Enter your new OpenAI API key. It will be stored securely in your browser's local storage.</p>
                <div className="position-relative">
                  <FiKey className="position-absolute top-50 translate-middle-y text-white-50" style={{ left: '1rem', zIndex: 2 }} />
                  <input
                    type="password"
                    className="form-control form-control-lg bg-dark text-white border-secondary ps-5"
                    placeholder="sk-..."
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer border-0 px-4 pb-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsApiKeyModalOpen(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={handleUpdateApiKey}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
