import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Post A Job | Webflow Jobs',
  description:
    'Post your Webflow job listing and reach thousands of talented Webflow designers, developers, and professionals.',
  alternates: {
    canonical: 'https://www.webflow.jobs/post-a-job',
  },
};

export default function PostAJobPage() {
  return (
    <>
      <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet" />
      {/* Hero */}
      <section className="section" style={{ paddingTop: '5rem' }}>
        <div className="padding-global z-index-1">
          <div className="padding-section-small padding-top">
            <div className="container-large">
              <div className="heading-content">
                <h1 className="hero-h1">Hire Webflow Developers Today</h1>
                <p className="max-width-medium">Help define our community and become a part of a network of people that are creating the career they love.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="section-background_component">
          <div className="bg-overlay"></div>
        </div>
      </section>

      {/* Form Section */}
      <section className="section">
        <div className="padding-global">
          <div className="padding-section-small">
            <div className="container-large">
              <div className="grid-2c_layout is-post_a_job">
                <div className="job_post-form-block w-form">
                  <form id="wf-form-Post-a-Job-Form" name="wf-form-Post-a-Job-Form" data-name="Post a Job Form" method="get" className="card is-lighter_orange">
                    <p className="heading-style-h4">Job Description</p>

                    <div className="form_field-wrapper">
                      <label htmlFor="Job-Title">Job Title *</label>
                      <input className="form_input is-apply w-input" maxLength={256} name="Job-Title" placeholder="" type="text" id="Job-Title" required />
                    </div>

                    <div className="form_field-wrapper">
                      <label htmlFor="name-2">Job Description *</label>
                      <div id="editor" className="form_input is-apply" style={{ minHeight: '8rem', padding: 0, border: 'none' }}></div>
                      <input className="hide" type="hidden" name="formattedContent" id="hiddenInput" />
                    </div>

                    <div className="h-wrap wrap_portrait">
                      <div className="form_field-wrapper">
                        <label htmlFor="name-2">Job Type *</label>
                        <div className="select-wrapper pl-0">
                          <select id="Job-Type" name="Job-Type" required className="form_input is-select-input is-apply w-select">
                            <option value="">Select one...</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                          </select>
                          <div className="icon w-icon-dropdown-toggle"></div>
                        </div>
                      </div>
                      <div className="form_field-wrapper">
                        <label htmlFor="name">Category *</label>
                        <div className="select-wrapper pl-0">
                          <select id="Category" name="Category" required className="form_input is-select-input is-apply w-select">
                            <option value="">Select one...</option>
                            <option value="Designer">Designer</option>
                            <option value="cro">CRO</option>
                            <option value="seo">SEO</option>
                            <option value="google ads">Google Ads</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="icon w-icon-dropdown-toggle"></div>
                        </div>
                      </div>
                    </div>

                    <div className="form_field-wrapper">
                      <label htmlFor="Email-To-Receive-Application">Job Location * (City, State or Remote)</label>
                      <input className="form_input is-apply w-input" maxLength={256} name="Email-To-Receive-Application" placeholder="" type="text" id="Email-To-Receive-Application" required />
                    </div>

                    <div className="form_field-wrapper">
                      <label htmlFor="job-posting-email">Job Posting Email (email to send applicants to)</label>
                      <input className="form_input is-apply w-input" maxLength={256} name="job-posting-email" placeholder="" type="text" id="job-posting-email" required />
                    </div>

                    <div className="form_field-wrapper">
                      <label htmlFor="job-posting-url">Job Posting URL (optional: indeed, linkedin, etc)</label>
                      <input className="form_input is-apply w-input" maxLength={256} name="job-posting-url" placeholder="" type="text" id="job-posting-url" />
                    </div>

                    <div className="spacer-component" style={{ paddingTop: '2rem' }}></div>

                    <p className="heading-style-h4">Salary Indication</p>

                    <div className="form_field-wrapper">
                      <label className="w-checkbox checkbox-wrapper">
                        <input type="checkbox" id="Salary-Indication" name="Salary-Indication" className="w-checkbox-input form_input is-apply checkbox" />
                        <span className="w-form-label">I want to add a salary indication for this job</span>
                      </label>
                    </div>

                    <div className="form_field-wrapper">
                      <label htmlFor="name-2">Is This Job Restricted To A Specific Location *</label>
                      <div className="select-wrapper pl-0">
                        <select id="Pay-Period" name="Pay-Period" className="form_input is-select-input is-apply w-select">
                          <option value="">Choose between annually, monthly, weekly, daily or hourly.</option>
                          <option value="Annually">Annually</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Daily">Daily</option>
                          <option value="Hourly">Hourly</option>
                        </select>
                        <div className="icon w-icon-dropdown-toggle"></div>
                      </div>
                    </div>

                    <div className="h-wrap wrap_portrait">
                      <div className="form_field-wrapper">
                        <label htmlFor="name-2">Currency *</label>
                        <div className="select-wrapper pl-0">
                          <select id="Currency" name="Currency" className="form_input is-select-input is-apply w-select">
                            <option value="">Select one...</option>
                            <option value="CAD">CAD</option>
                            <option value="USD">USD</option>
                          </select>
                          <div className="icon w-icon-dropdown-toggle"></div>
                        </div>
                      </div>
                      <div className="form_field-wrapper">
                        <label htmlFor="Minimum-Salary">Minimum Salary *</label>
                        <input className="form_input is-apply w-input" maxLength={256} name="Minimum-Salary" placeholder="" type="number" id="Minimum-Salary" />
                      </div>
                      <div className="form_field-wrapper">
                        <label htmlFor="Maximum-Salary">Maximum Salary *</label>
                        <input className="form_input is-apply w-input" maxLength={256} name="Maximum-Salary" placeholder="" type="number" id="Maximum-Salary" />
                      </div>
                    </div>

                    <div className="spacer-component" style={{ paddingTop: '2rem' }}></div>

                    <p className="heading-style-h4">Company Details</p>

                    <div className="h-wrap wrap_portrait">
                      <div className="form_field-wrapper">
                        <label htmlFor="Company-Name">Company Name *</label>
                        <input className="form_input is-apply w-input" maxLength={256} name="Company-Name" placeholder="" type="text" id="Company-Name" required />
                      </div>
                    </div>

                    <div className="form_field-wrapper">
                      <label htmlFor="Logo-URL">Company Logo (URL) *</label>
                      <input className="form_input is-apply w-input" maxLength={256} name="Logo-URL" placeholder="" type="url" id="Logo-URL" required />
                    </div>

                    <div className="form_field-wrapper">
                      <label htmlFor="Company-Website">Company Website (URL) *</label>
                      <input className="form_input is-apply w-input" maxLength={256} name="Company-Website" placeholder="" type="url" id="Company-Website" required />
                    </div>

                    <div className="form_field-wrapper">
                      <label htmlFor="About-The-Company">About The Company *</label>
                      <textarea id="About-The-Company" name="About-The-Company" maxLength={5000} placeholder="" required className="form_input is-apply textarea w-input"></textarea>
                    </div>

                    <div className="spacer-component"></div>

                    <p className="heading-style-h4">Promote Your Job Listing</p>

                    <label className="w-checkbox checkbox-wrapper">
                      <input type="checkbox" name="Email-Listing-To-Candidates" id="Email-Listing-To-Candidates" className="w-checkbox-input form_input is-apply checkbox" />
                      <span className="w-form-label">Email my job post to 5k+ qualified candidates (free)</span>
                    </label>

                    <label className="w-checkbox checkbox-wrapper">
                      <input type="checkbox" name="4-Week-Spotlight" id="4-Week-Spotlight" className="w-checkbox-input form_input is-apply checkbox" />
                      <span className="w-form-label">Spotlight my job post for 4 weeks ($125)</span>
                    </label>

                    <label className="w-checkbox checkbox-wrapper">
                      <input type="checkbox" name="1-Week-Spotlight" id="1-Week-Spotlight" className="w-checkbox-input form_input is-apply checkbox" />
                      <span className="w-form-label">Spotlight my job for 1 week ($75)</span>
                    </label>

                    <div className="form_field-wrapper">
                      <label htmlFor="Comments">Additional Comments Or Feedback</label>
                      <textarea id="Comments" name="Comments" maxLength={5000} placeholder="" className="form_input is-apply textarea w-input"></textarea>
                    </div>

                    <input type="submit" data-wait="Please wait..." className="button w-button" value="Post My Job Now" />
                  </form>

                  <div className="success-message-3 w-form-done">
                    <h3>Thank you for submitting your job post on Webflow.Jobs!</h3>
                    <div className="b-toppadding">Your job post has been submitted and is now under review. It will be live within up to 6 hours, and you&apos;ll receive a confirmation once it&apos;s published.</div>
                  </div>

                  <div className="w-form-fail">
                    <div>Oops! Something went wrong while submitting the form.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quill.js Rich Text Editor */}
      <Script
        src="https://cdn.quilljs.com/1.3.6/quill.min.js"
        strategy="beforeInteractive"
      />
      <Script id="quill-init" strategy="lazyOnload">
        {`
          var quill = new Quill('#editor', {
            theme: 'snow',
            placeholder: 'Write something...',
            modules: {
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                ['blockquote', 'code-block'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link']
              ]
            }
          });
          var form = document.getElementById('wf-form-Post-a-Job-Form');
          if (form) {
            form.onsubmit = function () {
              document.getElementById('hiddenInput').value = quill.root.innerHTML;
            };
          }
        `}
      </Script>
    </>
  );
}
