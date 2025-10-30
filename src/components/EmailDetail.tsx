
'use client';

interface EmailDetailProps {
  email: {
    id: string;
    sender: string;
    subject: string;
    date: string;
    body: string;
  } | null;
  onClose: () => void;
  isOpen: boolean;
}

export default function EmailDetail({ email, onClose, isOpen }: EmailDetailProps) {
  if (!email) return null;

  return (
    <div className={`email-detail-panel ${isOpen ? 'is-open' : ''}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h2 text-primary">{email.subject}</h2>
        <button onClick={onClose} className="btn-close btn-close-white"></button>
      </div>
      <div className="mb-4">
        <p><strong>From:</strong> {email.sender}</p>
        <p><strong>Date:</strong> {new Date(email.date).toLocaleString()}</p>
      </div>
      <div 
        className="email-body-content" 
        dangerouslySetInnerHTML={{ __html: email.body }}
      />
    </div>
  );
}
