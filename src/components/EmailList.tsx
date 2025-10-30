
'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import EmailDetail from './EmailDetail';
import { FiAlertTriangle, FiLoader } from 'react-icons/fi';

// Define the structure of an email object
interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
}

// Define the structure for a full email object with body
interface FullEmail extends Email {
    date: string;
    body: string;
}

// Define the structure for a classification result
interface Classification {
  id: string;
  category: string;
  confidence: number;
  reasoning: string;
}

// Helper to get a Bootstrap color based on the category
const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Important: 'success',
    Promotional: 'info',
    Social: 'primary',
    Spam: 'danger',
  };
  return colors[category] || 'secondary';
};

export default function EmailList({ session, apiKey: initialApiKey }: { session: Session | null, apiKey: string | null }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [classifications, setClassifications] = useState<Record<string, Classification>>({});
  const [loading, setLoading] = useState(true);
  const [isClassifying, setIsClassifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailCount, setEmailCount] = useState(15);
  const [inputValue, setInputValue] = useState(String(emailCount));
  
  const [selectedEmail, setSelectedEmail] = useState<FullEmail | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(initialApiKey);

  useEffect(() => {
    setApiKey(initialApiKey);
  }, [initialApiKey]);

  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    const fetchEmails = async () => {
      if (!accessToken) {
        setError('Google access token not found. Please sign in again.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, maxResults: emailCount }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to fetch emails.');
        }

        const data = await response.json();
        setEmails(data.emails || []);
        setClassifications({}); // Clear old classifications
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
        fetchEmails();
    }
  }, [accessToken, emailCount, session]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', isPanelOpen);
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isPanelOpen]);

  const handleClassifyEmails = async () => {
    if (emails.length === 0) return;
    if (!apiKey) {
        setError("OpenAI API key not found. Please update it in your profile.");
        return;
    }

    setIsClassifying(true);
    setError(null);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, apiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to classify emails.');
      }

      const result = await response.json();
      const newClassifications = result.classifications.reduce((acc: any, c: Classification) => {
        acc[c.id] = c;
        return acc;
      }, {});

      setClassifications(prev => ({ ...prev, ...newClassifications }));

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsClassifying(false);
    }
  };
  
  const handleFetch = () => {
    const newCount = Number(inputValue);
    if (newCount > 0) {
      setEmailCount(newCount);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFetch();
    }
  };
  
    const handleEmailClick = async (emailId: string) => {
        if (!accessToken) {
            setError("Cannot fetch email details: Google access token is missing.");
            return;
        }
        setIsFetchingDetail(true);
        setError(null);

        try {
            const response = await fetch(`/api/email/${emailId}` , {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || 'Failed to fetch email details.');
            }

            const emailData = await response.json();
            setSelectedEmail(emailData);
            setIsPanelOpen(true);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsFetchingDetail(false);
        }
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
        setTimeout(() => setSelectedEmail(null), 300); // Delay for animation
    };

  if (loading) {
    return (
      <div className="text-center text-light py-5">
        <FiLoader className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 fs-5">Fetching your latest emails...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}
      
      {isFetchingDetail && (
         <div className="position-fixed top-50 start-50 translate-middle text-center text-light p-4 rounded-3" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1100 }}>
            <FiLoader className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} />
            <p>Fetching email content...</p>
        </div>
      )}

      {!apiKey && (
        <div className="alert alert-warning d-flex align-items-center" role="alert">
            <FiAlertTriangle className="me-3" size={24} />
            <div>
                Your OpenAI API key is not set. Please use the 'Update Key' button to add it.
            </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white">Your Latest Emails</h2>
        <div className="d-flex align-items-center">
          <input 
            type="number"
            className="form-control bg-light bg-opacity-25 text-white border-0 me-2"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            min="1"
            max="50"
            aria-label="Number of emails to fetch"
          />
          <button className='btn btn-secondary me-2' onClick={handleFetch}>Fetch</button>
          <button 
              className="btn btn-primary" 
              onClick={handleClassifyEmails}
              disabled={isClassifying || emails.length === 0 || !apiKey}
          >
              {isClassifying ? (
                  <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span className="ms-2">Classifying...</span>
                  </>
              ) : (
                  'Classify Emails'
              )}
          </button>
        </div>
      </div>

      <div className="list-group">
        {emails.length > 0 ? (
          emails.map(email => {
            const classification = classifications[email.id];
            return (
              <div key={email.id} className="list-group-item list-group-item-action bg-light bg-opacity-10 text-white mb-2 border-0 rounded-3 shadow-sm p-3 email-list-item" onClick={() => handleEmailClick(email.id)} style={{cursor: 'pointer'}}>
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1 text-primary fw-bold">{email.sender.split('<')[0].trim()}</h5>
                  {classification && (
                    <span className={`badge bg-${getCategoryColor(classification.category)}`}>
                      {classification.category}
                    </span>
                  )}
                </div>
                <p className="mb-1">{email.subject}</p>
                <small className="text-white-50 d-block mb-2">{email.snippet}</small>
                {classification && (
                  <div className="mt-2 p-2 rounded-2" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <p className="mb-1 small text-white-75"><strong>Reasoning:</strong> {classification.reasoning}</p>
                    <div className="progress" style={{ height: '5px' }}>
                      <div 
                        className={`progress-bar bg-${getCategoryColor(classification.category)}`}
                        role="progressbar" 
                        style={{ width: `${classification.confidence * 100}%`}} 
                        aria-valuenow={classification.confidence * 100}
                        aria-valuemin={0} 
                        aria-valuemax={100}></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center text-light py-5">
            <p>No emails found or access was denied. Please check your permissions and try again.</p>
          </div>
        )}
      </div>
       <EmailDetail 
        email={selectedEmail} 
        onClose={handleClosePanel} 
        isOpen={isPanelOpen} 
      />
    </div>
  );
}
