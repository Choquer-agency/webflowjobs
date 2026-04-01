'use client';

import { useState, useCallback } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const POSTING_FAQS: FaqItem[] = [
  {
    question: 'How do I post a job on Webflow.jobs?',
    answer:
      "Posting a job is simple! Click the 'Post a Job' button, fill out the job title, description, required skills, budget, and preferred experience level, and publish it.",
  },
  {
    question: 'What types of jobs can I post?',
    answer:
      'You can post jobs related to Webflow development, CRO, SEO, UX/UI design, branding, digital marketing, and other website-related services.',
  },
  {
    question: 'How do I find the best talent for my job?',
    answer:
      'When posting a job, be as detailed as possible about your requirements, budget, and expectations.',
  },
  {
    question: 'Is there a fee for posting a job?',
    answer:
      'Currently, posting a job on Webflow.jobs is free. Although we offer premium job listings for enhanced visibility.',
  },
  {
    question: 'Can I post remote jobs or only local ones?',
    answer: 'You can post both remote and local jobs.',
  },
  {
    question: 'Is Webflow.jobs affiliated with Webflow, the company?',
    answer:
      'No, Webflow.jobs is an independent platform and is not affiliated with Webflow, Inc.',
  },
];

const LOOKING_FAQS: FaqItem[] = [
  {
    question: 'Is there a fee to apply for jobs?',
    answer: 'No, applying for jobs on Webflow.jobs is completely free.',
  },
  {
    question: 'How do I increase my chances of getting hired?',
    answer:
      'Apply only for jobs that match your skills, write a compelling application.',
  },
  {
    question: 'Can I negotiate my rates with clients?',
    answer: 'Yes! Many clients post budget ranges.',
  },
  {
    question: 'Can I offer multiple services (e.g., Webflow, SEO, CRO)?',
    answer: 'Absolutely! You can list multiple skills on your profile.',
  },
];

function PlusMinusIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, transition: 'transform 0.2s ease' }}
    >
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ opacity: isOpen ? 0 : 1, transition: 'opacity 0.2s ease' }} />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AccordionSection({ title, items, sectionKey }: { title: string; items: FaqItem[]; sectionKey: string }) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggle = useCallback((index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  return (
    <div
      className="grid-2c_layout is-faq"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '3rem',
        alignItems: 'start',
      }}
    >
      <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, index) => {
          const isOpen = openItems.has(index);
          return (
            <div
              key={`${sectionKey}-${index}`}
              className="accordion-item"
              style={{
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              <button
                className="accordion_header"
                onClick={() => toggle(index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: '1rem',
                }}
                aria-expanded={isOpen}
              >
                <span
                  className="fs_accordion-1_label"
                  style={{ fontWeight: 600, fontSize: '1.0625rem' }}
                >
                  {item.question}
                </span>
                <PlusMinusIcon isOpen={isOpen} />
              </button>
              <div
                className="accordion_content"
                style={{
                  maxHeight: isOpen ? '20rem' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease',
                }}
              >
                <div
                  className="accordion_body text-rich-text"
                  style={{
                    paddingBottom: '1.25rem',
                    color: '#555',
                    lineHeight: 1.6,
                  }}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FaqAccordion() {
  return (
    <section>
      <div className="padding-global">
        <div className="padding-section-medium">
          <div
            className="container-large"
            style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '4rem' }}
          >
            <AccordionSection title="Posting A Job" items={POSTING_FAQS} sectionKey="posting" />
            <AccordionSection title="Looking For Work" items={LOOKING_FAQS} sectionKey="looking" />
          </div>
        </div>
      </div>
    </section>
  );
}
