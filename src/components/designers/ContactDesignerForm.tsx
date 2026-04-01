'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const FORMSPARK_ACTION_URL = process.env.NEXT_PUBLIC_FORMSPARK_DESIGNER_FORM_ID
  ? `https://submit-form.com/${process.env.NEXT_PUBLIC_FORMSPARK_DESIGNER_FORM_ID}`
  : '';

const BUDGET_OPTIONS = [
  'Under $1,000',
  '$1,000 - $3,000',
  '$3,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000+',
  'Not sure yet',
];

const TIMELINE_OPTIONS = [
  'ASAP',
  '1-2 weeks',
  '2-4 weeks',
  '1-2 months',
  '3+ months',
  'Flexible',
];

const PROJECT_TYPES = [
  'New website',
  'Website redesign',
  'Landing page',
  'E-commerce store',
  'CMS development',
  'Ongoing maintenance',
  'Consultation',
  'Other',
];

interface Props {
  designerName: string;
  designerEmail: string;
  designerSlug: string;
  children: React.ReactNode;
}

export default function ContactDesignerForm({ designerName, designerEmail, designerSlug, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSubmitted(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload: Record<string, string> = {
      _email: JSON.stringify({
        subject: `New project inquiry for ${designerName} via Webflow Jobs`,
      }),
      'Designer Name': designerName,
      'Designer Email': designerEmail,
      'Designer Profile': `https://www.webflow.jobs/designers/${designerSlug}`,
      'Contact Name': formData.get('contactName') as string,
      'Company Name': formData.get('companyName') as string,
      'Contact Email': formData.get('contactEmail') as string,
      'Phone Number': (formData.get('contactPhone') as string) || 'Not provided',
      'Current Website': (formData.get('websiteUrl') as string) || 'Not provided',
      'Project Type': formData.get('projectType') as string,
      'Budget': formData.get('budget') as string,
      'Timeline': formData.get('timeline') as string,
      'Project Description': formData.get('projectDescription') as string,
    };

    try {
      if (!FORMSPARK_ACTION_URL) {
        // Fallback: log to console if no FormSpark ID configured
        console.log('Contact designer submission:', payload);
        setSubmitted(true);
        return;
      }

      const res = await fetch(FORMSPARK_ACTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to send. Please try again.');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger */}
      <div onClick={handleOpen} style={{ cursor: 'pointer', position: 'relative', zIndex: 1 }}>
        {children}
      </div>

      {/* Popup modal */}
      {isOpen && createPortal(
        <div className="apply_popup-component" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* Overlay */}
          <div
            className="apply_popup-overlay"
            style={{ opacity: 1, visibility: 'visible' }}
            onClick={handleClose}
          />

          <style>{`.contact-designer-form input::placeholder, .contact-designer-form textarea::placeholder { color: #aaa !important; }`}</style>

          {/* Modal */}
          <div className="apply_popup-wrapper" style={{ maxWidth: '40rem', maxHeight: '70vh', overflowY: 'auto', width: '100%' }}>
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="contact-designer-form">
                <h2 className="heading-style-h3" style={{ margin: 0 }}>
                  Contact {designerName}
                </h2>
                <p style={{ color: '#666', margin: 0 }}>
                  Share your project details and {designerName.split(' ')[0]} will get back to you directly.
                </p>

                {/* Your Info */}
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', margin: '0.5rem 0 0' }}>Your Information</p>

                <div className="h-wrap gap-2">
                  <div className="form_field-wrapper">
                    <label htmlFor="popup-contactName">Your Name *</label>
                    <input className="form_input is-apply w-input" type="text" id="popup-contactName" name="contactName" required maxLength={100} placeholder="Jane Smith" />
                  </div>
                  <div className="form_field-wrapper">
                    <label htmlFor="popup-companyName">Company Name *</label>
                    <input className="form_input is-apply w-input" type="text" id="popup-companyName" name="companyName" required maxLength={200} placeholder="Acme Inc." />
                  </div>
                </div>

                <div className="h-wrap gap-2">
                  <div className="form_field-wrapper">
                    <label htmlFor="popup-contactEmail">Email *</label>
                    <input className="form_input is-apply w-input" type="email" id="popup-contactEmail" name="contactEmail" required maxLength={256} placeholder="jane@acme.com" />
                  </div>
                  <div className="form_field-wrapper">
                    <label htmlFor="popup-contactPhone">Phone Number *</label>
                    <input className="form_input is-apply w-input" type="tel" id="popup-contactPhone" name="contactPhone" required maxLength={30} placeholder="+1 (555) 123-4567" />
                  </div>
                </div>

                <div className="form_field-wrapper">
                  <label htmlFor="popup-websiteUrl">Current Website URL *</label>
                  <input className="form_input is-apply w-input" type="url" id="popup-websiteUrl" name="websiteUrl" required maxLength={500} placeholder="https://acme.com" />
                </div>

                {/* Project Details */}
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', margin: '0.5rem 0 0' }}>Project Details</p>

                <div className="h-wrap gap-2">
                  <div className="form_field-wrapper">
                    <label htmlFor="popup-projectType">Project Type *</label>
                    <div className="select-wrapper pl-0">
                      <select id="popup-projectType" name="projectType" required className="form_input is-select-input is-apply w-select">
                        <option value="">Select one...</option>
                        {PROJECT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <div className="icon w-icon-dropdown-toggle"></div>
                    </div>
                  </div>
                  <div className="form_field-wrapper">
                    <label htmlFor="popup-budget">Budget *</label>
                    <div className="select-wrapper pl-0">
                      <select id="popup-budget" name="budget" required className="form_input is-select-input is-apply w-select">
                        <option value="">Select budget...</option>
                        {BUDGET_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <div className="icon w-icon-dropdown-toggle"></div>
                    </div>
                  </div>
                </div>

                <div className="form_field-wrapper">
                  <label htmlFor="popup-timeline">Timeline *</label>
                  <div className="select-wrapper pl-0">
                    <select id="popup-timeline" name="timeline" required className="form_input is-select-input is-apply w-select">
                      <option value="">When do you need this?</option>
                      {TIMELINE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <div className="icon w-icon-dropdown-toggle"></div>
                  </div>
                </div>

                <div className="form_field-wrapper">
                  <label htmlFor="popup-projectDescription">Project Description *</label>
                  <textarea
                    id="popup-projectDescription"
                    name="projectDescription"
                    required
                    minLength={50}
                    maxLength={5000}
                    placeholder="Describe your project, goals, and any specific requirements..."
                    className="form_input is-apply textarea w-input"
                    style={{ minHeight: '6rem' }}
                  />
                </div>

                {error && (
                  <div style={{ color: '#d32f2f', fontSize: '0.875rem', padding: '0.75rem', backgroundColor: '#fdecea', borderRadius: '0.375rem' }}>
                    {error}
                  </div>
                )}

                <div className="button-group mt-0">
                  <button
                    type="submit"
                    className="button w-button"
                    disabled={submitting}
                    style={{ opacity: submitting ? 0.7 : 1 }}
                  >
                    {submitting ? 'Sending...' : `Send to ${designerName.split(' ')[0]}`}
                  </button>
                </div>

                <p style={{ color: '#999', fontSize: '0.75rem', textAlign: 'center', margin: 0 }}>
                  Your details will be shared with {designerName} and Webflow Jobs.
                </p>
              </form>
            ) : (
              <div className="center-heading-content">
                <p className="text-color-orange text-size-medium">Message Sent!</p>
                <p className="heading-style-h2">
                  {designerName.split(' ')[0]} Will Be In Touch Soon
                </p>
                <p style={{ color: '#666' }}>
                  Your project details have been sent. The designer will reach out to you directly.
                </p>
                <div className="button-group centered">
                  <button onClick={handleClose} className="button w-button">
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
