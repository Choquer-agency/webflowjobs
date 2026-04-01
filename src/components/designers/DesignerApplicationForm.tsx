'use client';

import { useState } from 'react';

const SPECIALTIES = [
  'Animations/Interactions',
  'E-commerce',
  'CMS Development',
  'SEO',
  'Responsive Design',
  'Custom Code',
  'Figma to Webflow',
  'Webflow Enterprise',
  'Localization',
  'Memberships',
  'AI Development',
  'AI Automation',
  'AI Chatbots & Agents',
];

const COUNTRIES = [
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KR', name: 'South Korea' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MA', name: 'Morocco' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NO', name: 'Norway' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PA', name: 'Panama' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

interface ProjectData {
  projectName: string;
  projectUrl: string;
  imageUrl: string;
  description: string;
  role: string;
}

const emptyProject = (): ProjectData => ({
  projectName: '',
  projectUrl: '',
  imageUrl: '',
  description: '',
  role: '',
});

export default function DesignerApplicationForm() {
  const [projects, setProjects] = useState<ProjectData[]>([emptyProject()]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addProject = () => {
    if (projects.length < 3) {
      setProjects([...projects, emptyProject()]);
    }
  };

  const removeProject = (index: number) => {
    if (projects.length > 1) {
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

  const updateProject = (index: number, field: keyof ProjectData, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((s) => s !== specialty)
        : [...prev, specialty]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    if (selectedSpecialties.length === 0) {
      setError('Please select at least one specialty.');
      setSubmitting(false);
      return;
    }

    // Validate first project
    if (!projects[0].projectName || !projects[0].projectUrl || !projects[0].description) {
      setError('Please fill in all required fields for at least one showcase project.');
      setSubmitting(false);
      return;
    }

    const payload = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      bio: formData.get('bio') as string,
      profilePhotoUrl: (formData.get('profilePhotoUrl') as string) || undefined,
      portfolioUrl: formData.get('portfolioUrl') as string,
      country: formData.get('country') as string,
      yearsExperience: formData.get('yearsExperience') as string,
      specialties: selectedSpecialties,
      hourlyRateMin: formData.get('hourlyRateMin') ? Number(formData.get('hourlyRateMin')) : undefined,
      hourlyRateMax: formData.get('hourlyRateMax') ? Number(formData.get('hourlyRateMax')) : undefined,
      projectRateMin: formData.get('projectRateMin') ? Number(formData.get('projectRateMin')) : undefined,
      projectRateMax: formData.get('projectRateMax') ? Number(formData.get('projectRateMax')) : undefined,
      currency: formData.get('currency') as string,
      linkedinUrl: (formData.get('linkedinUrl') as string) || undefined,
      twitterUrl: (formData.get('twitterUrl') as string) || undefined,
      dribbbleUrl: (formData.get('dribbbleUrl') as string) || undefined,
      githubUrl: (formData.get('githubUrl') as string) || undefined,
      projects: projects.filter((p) => p.projectName && p.projectUrl && p.description),
    };

    try {
      const res = await fetch('/api/designers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-message-3 w-form-done" style={{ display: 'block' }}>
        <h3>Application Submitted!</h3>
        <div className="b-toppadding">
          Thank you for applying to be a featured Webflow designer. We&apos;ll review your
          profile and notify you via email once it&apos;s live on the directory.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card is-lighter_orange" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Section: Personal Info */}
      <p className="heading-style-h4">Personal Information</p>

      <div className="h-wrap wrap_portrait">
        <div className="form_field-wrapper">
          <label htmlFor="firstName">First Name *</label>
          <input className="form_input is-apply w-input" type="text" id="firstName" name="firstName" required maxLength={100} placeholder="John" />
        </div>
        <div className="form_field-wrapper">
          <label htmlFor="lastName">Last Name *</label>
          <input className="form_input is-apply w-input" type="text" id="lastName" name="lastName" required maxLength={100} placeholder="Doe" />
        </div>
      </div>

      <div className="form_field-wrapper">
        <label htmlFor="email">Email *</label>
        <input className="form_input is-apply w-input" type="email" id="email" name="email" required maxLength={256} placeholder="john@example.com" />
      </div>

      <div className="form_field-wrapper">
        <label htmlFor="profilePhotoUrl">Profile Photo (URL)</label>
        <input className="form_input is-apply w-input" type="url" id="profilePhotoUrl" name="profilePhotoUrl" maxLength={500} placeholder="https://example.com/photo.jpg" />
      </div>

      <div className="form_field-wrapper">
        <label htmlFor="country">Country *</label>
        <div className="select-wrapper pl-0">
          <select id="country" name="country" required className="form_input is-select-input is-apply w-select">
            <option value="">Select your country...</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <div className="icon w-icon-dropdown-toggle"></div>
        </div>
      </div>

      <div className="form_field-wrapper">
        <label htmlFor="bio">Bio / About You *</label>
        <textarea id="bio" name="bio" required maxLength={2000} placeholder="Tell companies about yourself, your experience, and what you bring to the table..." className="form_input is-apply textarea w-input" style={{ minHeight: '6rem' }} />
      </div>

      {/* Section: Experience */}
      <div className="spacer-component" style={{ paddingTop: '1rem' }}></div>
      <p className="heading-style-h4">Webflow Experience</p>

      <div className="h-wrap wrap_portrait">
        <div className="form_field-wrapper">
          <label htmlFor="yearsExperience">Years of Webflow Experience *</label>
          <input className="form_input is-apply w-input" type="number" id="yearsExperience" name="yearsExperience" required min={0} max={30} placeholder="e.g., 5" />
        </div>
        <div className="form_field-wrapper">
          <label htmlFor="portfolioUrl">Portfolio URL *</label>
          <input className="form_input is-apply w-input" type="url" id="portfolioUrl" name="portfolioUrl" required maxLength={500} placeholder="https://yourportfolio.com" />
        </div>
      </div>

      <div className="form_field-wrapper">
        <label>Specialties * (select at least one)</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSpecialty(s)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: selectedSpecialties.includes(s) ? 'rgb(255, 149, 0)' : '#ccc',
                backgroundColor: selectedSpecialties.includes(s) ? 'rgba(255, 149, 0, 0.12)' : '#fff',
                color: selectedSpecialties.includes(s) ? 'rgb(200, 117, 0)' : '#666',
                fontSize: '0.8125rem',
                fontWeight: selectedSpecialties.includes(s) ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Section: Showcase Projects */}
      <div className="spacer-component" style={{ paddingTop: '1rem' }}></div>
      <p className="heading-style-h4">Showcase Projects</p>
      <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '-0.5rem' }}>
        Add 1-3 projects you&apos;ve built in Webflow. The first project is required.
      </p>

      {projects.map((project, i) => (
        <div key={i} style={{ border: '1px solid #ddd', borderRadius: '0.5rem', padding: '1.25rem', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9375rem', margin: 0 }}>Project {i + 1} {i === 0 && '*'}</p>
            {i > 0 && (
              <button type="button" onClick={() => removeProject(i)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.8125rem' }}>
                Remove
              </button>
            )}
          </div>

          <div className="form_field-wrapper">
            <label>Project Name {i === 0 && '*'}</label>
            <input className="form_input is-apply w-input" type="text" value={project.projectName} onChange={(e) => updateProject(i, 'projectName', e.target.value)} required={i === 0} maxLength={200} placeholder="e.g., Acme Corp Website Redesign" />
          </div>

          <div className="form_field-wrapper">
            <label>Project URL {i === 0 && '*'}</label>
            <input className="form_input is-apply w-input" type="url" value={project.projectUrl} onChange={(e) => updateProject(i, 'projectUrl', e.target.value)} required={i === 0} maxLength={500} placeholder="https://acme.com" />
          </div>

          <div className="form_field-wrapper">
            <label>Project Screenshot / Image URL</label>
            <input className="form_input is-apply w-input" type="url" value={project.imageUrl} onChange={(e) => updateProject(i, 'imageUrl', e.target.value)} maxLength={500} placeholder="https://example.com/screenshot.png" />
          </div>

          <div className="form_field-wrapper">
            <label>Description {i === 0 && '*'}</label>
            <textarea value={project.description} onChange={(e) => updateProject(i, 'description', e.target.value)} required={i === 0} maxLength={1000} placeholder="What did you build? What was the challenge? What was the outcome?" className="form_input is-apply textarea w-input" style={{ minHeight: '4rem' }} />
          </div>

          <div className="form_field-wrapper">
            <label>Your Role</label>
            <input className="form_input is-apply w-input" type="text" value={project.role} onChange={(e) => updateProject(i, 'role', e.target.value)} maxLength={200} placeholder="e.g., Lead Designer, Webflow Developer" />
          </div>
        </div>
      ))}

      {projects.length < 3 && (
        <button
          type="button"
          onClick={addProject}
          style={{
            alignSelf: 'flex-start',
            padding: '0.5rem 1rem',
            border: '1px dashed #ccc',
            borderRadius: '0.375rem',
            background: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '0.875rem',
          }}
        >
          + Add Another Project
        </button>
      )}

      {/* Section: Pricing */}
      <div className="spacer-component" style={{ paddingTop: '1rem' }}></div>
      <p className="heading-style-h4">Pricing</p>

      <div className="form_field-wrapper">
        <label htmlFor="currency">Currency *</label>
        <div className="select-wrapper pl-0">
          <select id="currency" name="currency" required className="form_input is-select-input is-apply w-select">
            <option value="">Select currency...</option>
            <option value="USD">USD ($)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="EUR">EUR (&euro;)</option>
            <option value="GBP">GBP (&pound;)</option>
            <option value="AUD">AUD (A$)</option>
          </select>
          <div className="icon w-icon-dropdown-toggle"></div>
        </div>
      </div>

      <div className="h-wrap wrap_portrait">
        <div className="form_field-wrapper">
          <label htmlFor="hourlyRateMin">Hourly Rate (Min)</label>
          <input className="form_input is-apply w-input" type="number" id="hourlyRateMin" name="hourlyRateMin" min={0} placeholder="e.g., 50" />
        </div>
        <div className="form_field-wrapper">
          <label htmlFor="hourlyRateMax">Hourly Rate (Max)</label>
          <input className="form_input is-apply w-input" type="number" id="hourlyRateMax" name="hourlyRateMax" min={0} placeholder="e.g., 150" />
        </div>
      </div>

      <div className="h-wrap wrap_portrait">
        <div className="form_field-wrapper">
          <label htmlFor="projectRateMin">Project Rate (Min)</label>
          <input className="form_input is-apply w-input" type="number" id="projectRateMin" name="projectRateMin" min={0} placeholder="e.g., 2000" />
        </div>
        <div className="form_field-wrapper">
          <label htmlFor="projectRateMax">Project Rate (Max)</label>
          <input className="form_input is-apply w-input" type="number" id="projectRateMax" name="projectRateMax" min={0} placeholder="e.g., 10000" />
        </div>
      </div>

      {/* Section: Social Links */}
      <div className="spacer-component" style={{ paddingTop: '1rem' }}></div>
      <p className="heading-style-h4">Social Links</p>

      <div className="h-wrap wrap_portrait">
        <div className="form_field-wrapper">
          <label htmlFor="linkedinUrl">LinkedIn</label>
          <input className="form_input is-apply w-input" type="url" id="linkedinUrl" name="linkedinUrl" maxLength={500} placeholder="https://linkedin.com/in/yourname" />
        </div>
        <div className="form_field-wrapper">
          <label htmlFor="twitterUrl">Twitter / X</label>
          <input className="form_input is-apply w-input" type="url" id="twitterUrl" name="twitterUrl" maxLength={500} placeholder="https://x.com/yourhandle" />
        </div>
      </div>

      <div className="h-wrap wrap_portrait">
        <div className="form_field-wrapper">
          <label htmlFor="dribbbleUrl">Dribbble</label>
          <input className="form_input is-apply w-input" type="url" id="dribbbleUrl" name="dribbbleUrl" maxLength={500} placeholder="https://dribbble.com/yourname" />
        </div>
        <div className="form_field-wrapper">
          <label htmlFor="githubUrl">GitHub</label>
          <input className="form_input is-apply w-input" type="url" id="githubUrl" name="githubUrl" maxLength={500} placeholder="https://github.com/yourname" />
        </div>
      </div>

      {/* Sponsored Info */}
      <div className="spacer-component" style={{ paddingTop: '1rem' }}></div>
      <div style={{ border: '2px solid rgb(255, 149, 0)', borderRadius: '0.75rem', padding: '1.5rem', backgroundColor: 'rgba(255, 149, 0, 0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ backgroundColor: 'rgb(255, 149, 0)', color: '#fff', borderRadius: '999px', padding: '0.25rem 0.625rem', fontSize: '0.75rem', fontWeight: 600 }}>
            SPONSORED
          </span>
          <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>Get Priority Placement - $5/month</p>
        </div>
        <ul style={{ paddingLeft: '1.25rem', color: '#555', fontSize: '0.875rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>Appear at the top of the designer directory</li>
          <li>Verified badge on your profile card</li>
          <li>Stand out to companies looking to hire</li>
        </ul>
        <p style={{ color: '#888', fontSize: '0.8125rem', marginTop: '0.75rem', marginBottom: 0 }}>
          After your profile is approved, you&apos;ll receive instructions to upgrade to Sponsored via email.
        </p>
      </div>

      {error && (
        <div style={{ color: '#d32f2f', fontSize: '0.875rem', padding: '0.75rem', backgroundColor: '#fdecea', borderRadius: '0.375rem' }}>
          {error}
        </div>
      )}

      <input
        type="submit"
        className="button w-button"
        value={submitting ? 'Submitting...' : 'Submit Application'}
        disabled={submitting}
        style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
      />
    </form>
  );
}
