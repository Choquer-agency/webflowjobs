"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type Status = "idle" | "submitting" | "success" | "error";

export function PostAJobForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const quillRef = useRef<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const w = window as any;
      if (w.Quill && !quillRef.current) {
        quillRef.current = new w.Quill("#editor", {
          theme: "snow",
          placeholder: "Write something...",
          modules: {
            toolbar: [
              [{ header: [1, 2, false] }],
              ["bold", "italic", "underline"],
              ["blockquote", "code-block"],
              [{ list: "ordered" }, { list: "bullet" }],
              ["link"],
            ],
          },
        });
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);

    const jobDescription =
      quillRef.current?.root?.innerHTML?.trim() ||
      String(fd.get("formattedContent") || "");

    if (!jobDescription || jobDescription === "<p><br></p>") {
      setErrorMsg("Please provide a job description.");
      setStatus("error");
      return;
    }

    const payload = {
      title: fd.get("Job-Title"),
      jobDescription,
      jobType: fd.get("Job-Type"),
      category: fd.get("Category"),
      location: fd.get("Email-To-Receive-Application"),
      postingEmail: fd.get("job-posting-email"),
      postingUrl: fd.get("job-posting-url"),
      companyName: fd.get("Company-Name"),
      companyLogoUrl: fd.get("Logo-URL"),
      companyWebsite: fd.get("Company-Website"),
      aboutCompany: fd.get("About-The-Company"),
      salaryMin: fd.get("Minimum-Salary"),
      salaryMax: fd.get("Maximum-Salary"),
      salaryCurrency: fd.get("Currency"),
      salaryPeriod: fd.get("Pay-Period"),
      comments: fd.get("Comments"),
      wantsEmailBlast: fd.get("Email-Listing-To-Candidates") === "on",
      wants4WeekSpotlight: fd.get("4-Week-Spotlight") === "on",
      wants1WeekSpotlight: fd.get("1-Week-Spotlight") === "on",
    };

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/post-a-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      // Paid spotlight selected → redirect to Stripe Checkout.
      // Job stays pending until payment completes (webhook auto-approves).
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setStatus("success");
      formRef.current.reset();
      if (quillRef.current) quillRef.current.setContents([]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="success-message-3 w-form-done" style={{ display: "block" }}>
        <h3>Thank you for submitting your job post on Webflow.Jobs!</h3>
        <div className="b-toppadding">
          Your job post has been submitted and is now under review. It will be
          live within up to 6 hours, and you&apos;ll receive a confirmation once
          it&apos;s published.
        </div>
      </div>
    );
  }

  return (
    <>
      <link
        href="https://cdn.quilljs.com/1.3.6/quill.snow.css"
        rel="stylesheet"
      />
      <Script
        src="https://cdn.quilljs.com/1.3.6/quill.min.js"
        strategy="afterInteractive"
      />
      <form
        ref={formRef}
        onSubmit={onSubmit}
        id="wf-form-Post-a-Job-Form"
        name="wf-form-Post-a-Job-Form"
        data-name="Post a Job Form"
        className="card is-lighter_orange"
      >
        <p className="heading-style-h4">Job Description</p>

        <div className="form_field-wrapper">
          <label htmlFor="Job-Title">Job Title *</label>
          <input
            className="form_input is-apply w-input"
            maxLength={256}
            name="Job-Title"
            type="text"
            id="Job-Title"
            required
          />
        </div>

        <div className="form_field-wrapper">
          <label htmlFor="editor">Job Description *</label>
          <div
            id="editor"
            className="form_input is-apply"
            style={{ minHeight: "8rem", padding: 0, border: "none" }}
          ></div>
          <input className="hide" type="hidden" name="formattedContent" id="hiddenInput" />
        </div>

        <div className="h-wrap wrap_portrait">
          <div className="form_field-wrapper">
            <label htmlFor="Job-Type">Job Type *</label>
            <div className="select-wrapper pl-0">
              <select
                id="Job-Type"
                name="Job-Type"
                required
                className="form_input is-select-input is-apply w-select"
              >
                <option value="">Select one...</option>
                <option value="Freelance">Freelance</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
              </select>
              <div className="icon w-icon-dropdown-toggle"></div>
            </div>
          </div>
          <div className="form_field-wrapper">
            <label htmlFor="Category">Category *</label>
            <div className="select-wrapper pl-0">
              <select
                id="Category"
                name="Category"
                required
                className="form_input is-select-input is-apply w-select"
              >
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
          <label htmlFor="Email-To-Receive-Application">
            Job Location * (City, State or Remote)
          </label>
          <input
            className="form_input is-apply w-input"
            maxLength={256}
            name="Email-To-Receive-Application"
            type="text"
            id="Email-To-Receive-Application"
            required
          />
        </div>

        <div className="form_field-wrapper">
          <label htmlFor="job-posting-email">
            Job Posting Email (email to send applicants to) *
          </label>
          <input
            className="form_input is-apply w-input"
            maxLength={256}
            name="job-posting-email"
            type="email"
            id="job-posting-email"
            required
          />
        </div>

        <div className="form_field-wrapper">
          <label htmlFor="job-posting-url">
            Job Posting URL (optional: indeed, linkedin, etc)
          </label>
          <input
            className="form_input is-apply w-input"
            maxLength={256}
            name="job-posting-url"
            type="text"
            id="job-posting-url"
          />
        </div>

        <div className="spacer-component" style={{ paddingTop: "2rem" }}></div>

        <p className="heading-style-h4">Salary Indication</p>

        <div className="form_field-wrapper">
          <label className="w-checkbox checkbox-wrapper">
            <input
              type="checkbox"
              id="Salary-Indication"
              name="Salary-Indication"
              className="w-checkbox-input form_input is-apply checkbox"
            />
            <span className="w-form-label">
              I want to add a salary indication for this job
            </span>
          </label>
        </div>

        <div className="form_field-wrapper">
          <label htmlFor="Pay-Period">Pay Period</label>
          <div className="select-wrapper pl-0">
            <select
              id="Pay-Period"
              name="Pay-Period"
              className="form_input is-select-input is-apply w-select"
            >
              <option value="">
                Choose between annually, monthly, weekly, daily or hourly.
              </option>
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
            <label htmlFor="Currency">Currency</label>
            <div className="select-wrapper pl-0">
              <select
                id="Currency"
                name="Currency"
                className="form_input is-select-input is-apply w-select"
              >
                <option value="">Select one...</option>
                <option value="CAD">CAD</option>
                <option value="USD">USD</option>
              </select>
              <div className="icon w-icon-dropdown-toggle"></div>
            </div>
          </div>
          <div className="form_field-wrapper">
            <label htmlFor="Minimum-Salary">Minimum Salary</label>
            <input
              className="form_input is-apply w-input"
              maxLength={256}
              name="Minimum-Salary"
              type="number"
              id="Minimum-Salary"
            />
          </div>
          <div className="form_field-wrapper">
            <label htmlFor="Maximum-Salary">Maximum Salary</label>
            <input
              className="form_input is-apply w-input"
              maxLength={256}
              name="Maximum-Salary"
              type="number"
              id="Maximum-Salary"
            />
          </div>
        </div>

        <div className="spacer-component" style={{ paddingTop: "2rem" }}></div>

        <p className="heading-style-h4">Company Details</p>

        <div className="h-wrap wrap_portrait">
          <div className="form_field-wrapper">
            <label htmlFor="Company-Name">Company Name *</label>
            <input
              className="form_input is-apply w-input"
              maxLength={256}
              name="Company-Name"
              type="text"
              id="Company-Name"
              required
            />
          </div>
        </div>

        <div className="form_field-wrapper">
          <label htmlFor="Logo-URL">Company Logo (URL)</label>
          <input
            className="form_input is-apply w-input"
            maxLength={256}
            name="Logo-URL"
            type="url"
            id="Logo-URL"
          />
        </div>

        <div className="form_field-wrapper">
          <label htmlFor="Company-Website">Company Website (URL) *</label>
          <input
            className="form_input is-apply w-input"
            maxLength={256}
            name="Company-Website"
            type="url"
            id="Company-Website"
            required
          />
        </div>

        <div className="form_field-wrapper">
          <label htmlFor="About-The-Company">About The Company *</label>
          <textarea
            id="About-The-Company"
            name="About-The-Company"
            maxLength={5000}
            required
            className="form_input is-apply textarea w-input"
          ></textarea>
        </div>

        <div className="spacer-component"></div>

        <p className="heading-style-h4">Promote Your Job Listing</p>

        <label className="w-checkbox checkbox-wrapper">
          <input
            type="checkbox"
            name="Email-Listing-To-Candidates"
            id="Email-Listing-To-Candidates"
            className="w-checkbox-input form_input is-apply checkbox"
          />
          <span className="w-form-label">
            Email my job post to 5k+ qualified candidates (free)
          </span>
        </label>

        <label className="w-checkbox checkbox-wrapper">
          <input
            type="checkbox"
            name="4-Week-Spotlight"
            id="4-Week-Spotlight"
            className="w-checkbox-input form_input is-apply checkbox"
          />
          <span className="w-form-label">
            Spotlight my job post for 4 weeks ($175)
          </span>
        </label>

        <label className="w-checkbox checkbox-wrapper">
          <input
            type="checkbox"
            name="1-Week-Spotlight"
            id="1-Week-Spotlight"
            className="w-checkbox-input form_input is-apply checkbox"
          />
          <span className="w-form-label">
            Spotlight my job for 1 week ($75)
          </span>
        </label>

        <div className="form_field-wrapper">
          <label htmlFor="Comments">Additional Comments Or Feedback</label>
          <textarea
            id="Comments"
            name="Comments"
            maxLength={5000}
            className="form_input is-apply textarea w-input"
          ></textarea>
        </div>

        <input
          type="submit"
          disabled={status === "submitting"}
          className="button w-button"
          value={status === "submitting" ? "Please wait..." : "Post My Job Now"}
        />

        {status === "error" && (
          <div
            className="w-form-fail"
            style={{ display: "block", marginTop: 16 }}
          >
            <div>{errorMsg || "Oops! Something went wrong."}</div>
          </div>
        )}
      </form>
    </>
  );
}
