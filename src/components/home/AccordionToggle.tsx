'use client';

import { useState, useCallback } from 'react';

function AccordionIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line
        x1="12.375"
        y1="0.646973"
        x2="12.375"
        y2="24.7843"
        stroke="#080808"
        strokeWidth="2"
        style={{ opacity: isOpen ? 0 : 1, transition: 'opacity 0.2s ease' }}
      />
      <line x1="24.4434" y1="12.7157" x2="0.306028" y2="12.7157" stroke="#080808" strokeWidth="2" />
    </svg>
  );
}

interface AccordionToggleProps {
  items: { question: string; answer: string }[];
}

export default function AccordionToggle({ items }: AccordionToggleProps) {
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
    <div className="accordion-component">
      <div className="accordion-component">
        {items.map((item, index) => {
          const isOpen = openItems.has(index);
          return (
            <div key={index} faq-parent="" className="accordion-item">
              <div
                tabIndex={0}
                role="button"
                aria-expanded={isOpen}
                className="accordion_header"
                onClick={() => toggle(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle(index);
                  }
                }}
              >
                <p faq-question="" className="fs_accordion-1_label"><strong>{item.question}</strong></p>
                <div className="accordion_arrow-wrapper">
                  <div className="accordion_icon w-embed"><AccordionIcon isOpen={isOpen} /></div>
                </div>
              </div>
              <div
                className="accordion_content"
                style={{
                  height: isOpen ? 'auto' : '0px',
                  opacity: isOpen ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'opacity 0.3s ease',
                }}
              >
                <div className="accordion_body">
                  <div faq-answer="" className="text-rich-text w-richtext">
                    <p dangerouslySetInnerHTML={{ __html: item.answer }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
