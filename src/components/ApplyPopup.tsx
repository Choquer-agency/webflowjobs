'use client';

import { useState, useEffect, useCallback } from 'react';

interface ApplyPopupProps {
  jobTitle: string;
  companyName: string;
  applyUrl: string;
  children: React.ReactNode;
}

const STORAGE_KEY = 'wfjobs_applicant';

function getStoredApplicant(): { firstName: string; lastName: string; email: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export default function ApplyPopup({ jobTitle, companyName, applyUrl, children }: ApplyPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  // Lock body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleApplyClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If already submitted before, go straight to the application
    const stored = getStoredApplicant();
    if (stored) {
      window.open(applyUrl, '_blank');
      return;
    }

    setIsOpen(true);
  }, [applyUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ firstName, lastName, email }));

    // Show success state
    setSubmitted(true);
  };

  const handleOpenApplication = () => {
    window.open(applyUrl, '_blank');
    setIsOpen(false);
    setSubmitted(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmitted(false);
    setFirstName('');
    setLastName('');
    setEmail('');
  };

  return (
    <>
      {/* The trigger button — wraps whatever children are passed */}
      <div onClick={handleApplyClick} style={{ cursor: 'pointer' }}>
        {children}
      </div>

      {/* Popup modal */}
      {isOpen && (
        <div className="apply_popup-component" style={{ display: 'flex' }}>
          {/* Overlay */}
          <div
            className="apply_popup-overlay"
            style={{ opacity: 1, visibility: 'visible' }}
            onClick={handleClose}
          />

          {/* Modal content */}
          <div className="apply_popup-wrapper">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="apply_form">
                <h2 className="heading-style-h3">
                  Apply for the {jobTitle} at {companyName}
                </h2>
                <p>
                  Tell us a bit about yourself so we can match you with the best job
                  opportunities! Once you&apos;ve filled in your details, the application
                  link will be unlocked.
                </p>
                <div className="h-wrap gap-2">
                  <div className="form_field-wrapper">
                    <label htmlFor="apply-first-name">First Name*</label>
                    <input
                      className="form_input is-apply w-input"
                      type="text"
                      id="apply-first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form_field-wrapper">
                    <label htmlFor="apply-last-name">Last Name*</label>
                    <input
                      className="form_input is-apply w-input"
                      type="text"
                      id="apply-last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form_field-wrapper">
                  <label htmlFor="apply-email">Email Address*</label>
                  <input
                    className="form_input is-apply w-input"
                    type="email"
                    id="apply-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="button-group mt-0">
                  <button type="submit" className="button w-button">
                    Unlock Application Link
                  </button>
                </div>
              </form>
            ) : (
              <div className="center-heading-content">
                <p className="text-color-orange text-size-medium">Thanks For Visiting Webflow Jobs</p>
                <p className="heading-style-h2">Good Luck With Your Application!</p>
                <div className="button-group centered">
                  <button onClick={handleOpenApplication} className="button w-button">
                    Open Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
