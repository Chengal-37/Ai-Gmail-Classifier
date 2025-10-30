// src/components/AuthButton.tsx
'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
        <div className="d-flex justify-content-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  if (session) {
    return (
        <div className="d-flex align-items-center">
            {session.user?.image && (
                <Image 
                    src={session.user.image} 
                    alt={session.user.name || 'User profile'} 
                    width={40} 
                    height={40} 
                    className="rounded-circle me-3 border border-2 border-white shadow-sm"
                />
            )}
            <div className="me-3 text-white">
                <div className="fw-bold">{session.user?.name}</div>
                <div className="small text-white-75">{session.user?.email}</div>
            </div>
            <button
                onClick={() => signOut()} 
                className="btn btn-outline-light d-flex align-items-center">
                <span className="me-2">Sign Out</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2.a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                    <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                </svg>
            </button>
        </div>
    );
  }

  return (
    <button
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className="btn btn-light btn-lg d-flex align-items-center shadow-lg" style={{transition: 'all 0.3s ease-in-out', transform: 'translateY(0)'}}
      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'
    }>
      <Image src="/google-logo.svg" alt="Google logo" width={24} height={24} className="me-3" />
      <span className="fw-bold">Sign in with Google</span>
    </button>
  );
}
