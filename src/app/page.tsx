import Link from 'next/link';
import Script from 'next/script';
import { getJobs } from '@/lib/data';
import { CountrySelect } from '@/components/home';
import AccordionToggle from '@/components/home/AccordionToggle';
import JobFilterClient from '@/components/home/JobFilterClient';
import HeroGrid from '@/components/home/HeroGrid';

/* ─────────── SVG Components ─────────── */

function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 13 13" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
      <path d="M2.59597 0.789307V1.98931H10.6131L0.0488281 11.9433L0.946696 12.7893L11.511 2.83531V10.3893H12.7845V0.789307H2.59597Z" fill="currentColor"></path>
    </svg>
  );
}

/* ─────────── FAQ Data ─────────── */

const POSTING_FAQS = [
  {
    question: 'How do I post a job on Webflow.jobs?',
    answer: 'Posting a job is simple! Click the <a href="/post-a-job"><strong>"Post a Job"</strong></a> button, fill out the job title, description, required skills, budget, and preferred experience level, and publish it. Your job will then be visible to qualified professionals who can apply directly.',
  },
  {
    question: 'What types of jobs can I post?',
    answer: 'You can post jobs related to Webflow development, CRO (Conversion Rate Optimization), SEO, UX/UI design, branding, digital marketing, and other website-related services.',
  },
  {
    question: 'How do I find the best talent for my job?',
    answer: 'When posting a job, be as detailed as possible about your requirements, budget, and expectations. Our platform allows professionals to showcase their portfolios, reviews, and experience levels, helping you make an informed decision.',
  },
  {
    question: 'Is there a fee for posting a job?',
    answer: 'Currently, posting a job on Webflow.jobs is free. Although we offer premium job listings for enhanced visibility and priority placement.',
  },
  {
    question: 'Can I post remote jobs or only local ones?',
    answer: 'You can post <strong>both remote and local jobs</strong>. Just specify your preference in the job listing so applicants understand if it\'s an on-site or remote opportunity.',
  },
  {
    question: 'Is Webflow.jobs affiliated with Webflow, the company?',
    answer: 'No, <strong>Webflow.jobs is an independent platform and is not affiliated with Webflow, Inc.</strong> We created this job board to help the Webflow community connect with opportunities, making it easier for businesses to find top talent.',
  },
];

const LOOKING_FAQS = [
  {
    question: 'Is there a fee to apply for jobs?',
    answer: 'No, applying for jobs on Webflow.jobs is completely <strong>free</strong>. You only need an account with a completed profile to start applying.',
  },
  {
    question: 'How do I increase my chances of getting hired?',
    answer: 'Apply only for jobs that match your skills, <strong>write a compelling application</strong>, and include examples of past work. Tailoring your application to each job increases your chances of standing out.',
  },
  {
    question: 'Can I negotiate my rates with clients?',
    answer: 'Yes! Many clients post budget ranges, but you can negotiate based on your expertise, project complexity, and expected deliverables.',
  },
  {
    question: 'Can I offer multiple services (e.g., Webflow, SEO, CRO)?',
    answer: 'Absolutely! You can list multiple skills on your profile to attract a broader range of clients looking for expertise in <strong>Webflow, SEO, CRO, digital marketing, and more</strong>.',
  },
];

const ALL_FAQS = [...POSTING_FAQS, ...LOOKING_FAQS];

/* ─────────── Strip HTML for schema ─────────── */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/* ─────────── Main Page (Server Component) ─────────── */

export default async function Home() {
  const jobs = await getJobs();
  const jobCount = jobs.length;

  const serializedJobs = jobs.map((job) => ({
    slug: job.slug,
    title: job.title,
    companyName: job.companyName,
    companyLogoUrl: job.companyLogoUrl,
    jobType: job.jobType,
    category: job.category,
    publishedAt: job.publishedAt,
    applyUrl: job.applyUrl,
    isVerified: job.isVerified,
    isSponsored: job.isSponsored,
  }));

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ALL_FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(faq.answer),
      },
    })),
  };

  return (
    <>
      {/* ═══════ FAQ SCHEMA ═══════ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="section_hero">
        <HeroGrid />
        <div className="padding-global z-index-1">
          <div className="padding-section-large">
            <div className="container-large">
              <div className="center-heading-content max-width-xmedium align-center">
                <h1 tb="" className="hero-h1">Webflow Jobs with Top Agencies and Startups</h1>
                <p>Webflow Jobs helps you find opportunities where you can succeed as a Webflow creator. Whether you are looking for a fresh start or needing an experienced Webflow designer to join your team, Webflow Jobs can find the right place for you.</p>
                <div className="button-group">
                  <Link href="/post-a-job" className="button is-nav w-button">Post A Job</Link>
                </div>
              </div>
              <div data-wf--spacer--size="xxhuge" className="spacer-component w-variant-fb369e3d-71fa-b25d-05ab-f74104ac50a2"></div>
              <div className="h-wrap space-between is-home_hero">
                <div className="hero-logo w-embed">
                  <svg width="100%" height="100%" viewBox="0 0 200 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24.5453 9.60692C24.5453 16.3584 19.3835 21.1014 12.2738 21.1014H7.84244L6.84416 33.2733C6.81981 33.4669 6.64938 33.6363 6.45459 33.6363H0.391885C0.148403 33.6363 -0.0220349 33.4427 0.00231327 33.2008L3.16758 0.362982C3.19193 0.145193 3.36237 0 3.5815 0H14.4895C20.6739 0 24.5697 3.62982 24.5453 9.60692ZM13.2234 6.24329H9.44942L8.49984 14.8581H12.2251C15.1713 14.8581 17.6061 13.7691 17.6061 10.2845C17.6548 7.28384 15.8773 6.24329 13.2234 6.24329Z" fill="#180E39"></path>
                    <path d="M44.6198 24.4376H28.9333C29.6606 26.8972 31.8669 28.1269 34.7278 28.1269C36.5704 28.1269 38.3161 27.6596 39.989 26.5528C40.1587 26.4298 40.4011 26.479 40.5224 26.6266L42.6317 29.3075C42.7529 29.4551 42.7529 29.701 42.6074 29.824C40.5224 32.013 37.419 33.6363 33.6126 33.6363C27.818 33.6363 22.7266 29.824 22.7266 22.7897C22.7266 15.534 28.3756 10 35.1885 10C40.9588 10 47.1897 14.0829 45.0077 24.1425C44.9592 24.3146 44.8137 24.4376 44.6198 24.4376ZM29.1515 19.5923H39.4556C39.1889 16.8868 37.0311 15.7062 34.6551 15.7062C31.8912 15.6816 30.0001 17.3049 29.1515 19.5923Z" fill="#180E39"></path>
                    <path d="M98.1468 10.9082H104.147C104.394 10.9082 104.566 11.1046 104.542 11.35L102.245 33.2673C102.221 33.4636 102.048 33.6355 101.85 33.6355H95.8505C95.6036 33.6355 95.4308 33.4391 95.4555 33.1937L97.7517 11.2764C97.7764 11.0555 97.9492 10.9082 98.1468 10.9082Z" fill="#180E39"></path>
                    <path d="M101.816 7.27272C103.824 7.27272 105.452 5.64467 105.452 3.63636C105.452 1.62805 103.824 0 101.816 0C99.8077 0 98.1797 1.62805 98.1797 3.63636C98.1797 5.64467 99.8077 7.27272 101.816 7.27272Z" fill="#180E39"></path>
                    <path d="M49.955 11.0472H55.4617C55.7729 11.0472 56.0363 11.3214 55.9884 11.6705L55.8208 13.3659C57.6165 11.2965 60.6571 10 63.2189 10C67.5525 10 69.7552 13.6901 68.7975 19.2501L67.7919 25.1841C67.6004 26.3061 67.9834 26.8047 69.1087 26.8047H69.4679C69.803 26.8047 70.0425 27.1039 69.9946 27.453L69.0369 33.1875C68.989 33.4618 68.7735 33.6363 68.5102 33.6363H67.6482C62.4767 33.6363 60.2501 30.8937 61.112 25.5581L61.9979 20.3721C62.4049 18.0034 61.6388 16.308 59.46 16.308C57.3531 16.308 55.6532 17.8788 55.0786 21.145L53.8575 33.6363H47.2734L49.4522 11.5458C49.4522 11.2466 49.6677 11.0472 49.955 11.0472Z" fill="#180E39"></path>
                    <path d="M73.5917 11.0472H79.0984C79.4096 11.0472 79.673 11.3214 79.6251 11.6705L79.4575 13.3659C81.2532 11.2965 84.2938 10 86.8557 10C91.1892 10 93.3919 13.6901 92.4342 19.2501L91.4286 25.1841C91.2371 26.3061 91.6202 26.8047 92.7454 26.8047H93.1046C93.4398 26.8047 93.6792 27.1039 93.6313 27.453L92.6736 33.1875C92.6257 33.4618 92.4103 33.6363 92.1469 33.6363H91.285C86.1135 33.6363 83.8868 30.8937 84.7487 25.5581L85.6346 20.3721C86.0416 18.0034 85.2755 16.308 83.0967 16.308C80.9898 16.308 79.2899 17.8788 78.7153 21.145L77.4943 33.6363H70.9102L73.0889 11.5458C73.0889 11.2466 73.3283 11.0472 73.5917 11.0472Z" fill="#180E39"></path>
                    <path d="M144.743 27.3241C143.773 28.2315 142.804 29.0256 141.834 29.7062C140.865 30.3868 139.852 30.954 138.797 31.4077C137.771 31.8614 136.673 32.1875 135.504 32.3861C134.334 32.6129 133.065 32.7264 131.697 32.7264C129.729 32.7264 127.918 32.4002 126.264 31.748C124.61 31.0957 123.184 30.1741 121.987 28.983C120.789 27.792 119.848 26.3599 119.164 24.6867C118.508 23.0136 118.18 21.1419 118.18 19.0718C118.18 16.718 118.636 14.4494 119.548 12.2658C120.49 10.0822 121.787 8.15378 123.441 6.48063C125.095 4.77913 127.048 3.4321 129.301 2.43956C131.583 1.41866 134.064 0.908203 136.744 0.908203C137.942 0.908203 139.068 1.05 140.123 1.33358C141.178 1.58881 142.148 1.94329 143.032 2.39702C143.945 2.85076 144.757 3.38956 145.47 4.01345C146.183 4.63734 146.768 5.30376 147.224 6.01272L144.059 8.60752C143.118 7.24631 142.034 6.25377 140.808 5.62988C139.582 4.97764 138.084 4.65151 136.316 4.65151C134.349 4.65151 132.495 5.04853 130.756 5.84257C129.045 6.63661 127.547 7.70005 126.264 9.03289C125.009 10.3374 124.011 11.8404 123.27 13.5419C122.557 15.2434 122.201 17.0158 122.201 18.8591C122.201 20.3904 122.443 21.78 122.928 23.0278C123.441 24.2755 124.14 25.339 125.024 26.2181C125.936 27.0972 126.991 27.7778 128.189 28.2599C129.415 28.742 130.741 28.983 132.167 28.983C134.306 28.983 136.159 28.586 137.728 27.792C139.296 26.9696 140.793 25.8636 142.219 24.4741L144.743 27.3241Z" fill="#180E39"></path>
                    <path d="M159.457 10.5217C162.166 10.5217 164.205 11.1456 165.574 12.3934C166.971 13.6411 167.67 15.3285 167.67 17.4553C167.67 17.7956 167.641 18.1643 167.584 18.5613C167.556 18.93 167.513 19.3128 167.456 19.7098L165.232 32.0457H161.467L161.981 29.1532H161.81C161.125 30.1457 160.184 30.9965 158.986 31.7055C157.789 32.3861 156.448 32.7264 154.966 32.7264C153.939 32.7264 152.984 32.5704 152.1 32.2584C151.216 31.9749 150.446 31.5495 149.79 30.9823C149.162 30.4151 148.663 29.7487 148.293 28.983C147.922 28.189 147.737 27.2957 147.737 26.3032C147.737 25.1121 147.993 24.0345 148.507 23.0703C149.048 22.1061 149.776 21.2979 150.688 20.6457C151.601 19.9651 152.67 19.4404 153.896 19.0718C155.151 18.7031 156.506 18.5188 157.96 18.5188C159.129 18.5188 160.156 18.6464 161.04 18.9016C161.952 19.1285 162.822 19.4263 163.649 19.7949L163.82 18.9016C163.877 18.6748 163.906 18.3912 163.906 18.0509C163.906 16.8315 163.464 15.8531 162.58 15.1158C161.696 14.3785 160.526 14.0098 159.072 14.0098C157.96 14.0098 156.962 14.2225 156.078 14.6479C155.222 15.0732 154.381 15.7822 153.554 16.7747L150.474 14.6053C151.472 13.2725 152.741 12.2658 154.281 11.5851C155.85 10.8762 157.575 10.5217 159.457 10.5217ZM155.778 29.2383C156.662 29.2383 157.504 29.0823 158.302 28.7704C159.129 28.4584 159.856 28.033 160.484 27.4942C161.139 26.9271 161.696 26.2748 162.152 25.5375C162.608 24.7718 162.908 23.9636 163.05 23.1128C162.708 22.8576 162.28 22.6166 161.767 22.3897C161.311 22.2196 160.74 22.0636 160.056 21.9218C159.4 21.7516 158.602 21.6666 157.66 21.6666C156.948 21.6666 156.235 21.7516 155.522 21.9218C154.837 22.0919 154.224 22.3613 153.682 22.73C153.141 23.0987 152.699 23.5524 152.356 24.0912C152.014 24.63 151.843 25.2539 151.843 25.9629C151.843 26.5017 151.957 26.9838 152.185 27.4091C152.413 27.8062 152.699 28.1465 153.041 28.43C153.411 28.6853 153.825 28.8838 154.281 29.0256C154.766 29.1674 155.265 29.2383 155.778 29.2383Z" fill="#180E39"></path>
                    <path d="M193.325 32.3861C192.612 32.3861 191.942 32.2726 191.314 32.0457C190.687 31.8189 190.145 31.5069 189.689 31.1099C189.233 30.6845 188.862 30.1741 188.577 29.5786C188.32 28.983 188.192 28.3166 188.192 27.5793C188.192 27.3524 188.206 27.0547 188.235 26.686C188.263 26.3174 188.32 25.9062 188.406 25.4524L190.288 14.7755H186.609L187.251 11.2023H190.929L192.084 4.82167H196.02L194.865 11.2023H199.998L199.356 14.7755H194.223L192.427 24.8994C192.37 25.2681 192.327 25.58 192.298 25.8353C192.241 26.1188 192.213 26.3741 192.213 26.6009C192.213 27.2248 192.384 27.7353 192.726 28.1323C193.068 28.5293 193.596 28.7278 194.309 28.7278C194.793 28.7278 195.15 28.6995 195.378 28.6427C195.635 28.586 195.92 28.4868 196.234 28.345L196.875 31.8331C196.305 32.0316 195.735 32.1734 195.164 32.2584C194.622 32.3435 194.009 32.3861 193.325 32.3861ZM175.53 14.6053H175.702C176.329 13.2725 177.313 12.2799 178.653 11.6277C180.022 10.9471 181.49 10.6068 183.059 10.6068C183.458 10.6068 183.743 10.621 183.914 10.6493C184.085 10.6493 184.271 10.6635 184.47 10.6919L183.743 14.7755C183.544 14.7188 183.301 14.6762 183.016 14.6479C182.731 14.6195 182.389 14.6053 181.989 14.6053C181.105 14.6053 180.25 14.7613 179.423 15.0732C178.624 15.3568 177.883 15.7822 177.199 16.3494C176.543 16.9165 175.987 17.5971 175.53 18.3912C175.074 19.1852 174.76 20.0643 174.589 21.0285L172.622 32.0457H168.686L172.365 11.2023H176.129L175.53 14.6053Z" fill="#180E39"></path>
                  </svg>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/image---2025-02-27T132736.665.webp" loading="lazy" alt="Partner company logo" className="hero-logo" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/image---2025-02-27T133118.792.webp" loading="lazy" alt="Partner company logo" className="hero-logo" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/627adad04716ea077b96ae7a_new-logo-1.svg" loading="lazy" alt="Partner company logo" className="hero-logo" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/image---2025-02-27T133050.767.webp" loading="lazy" alt="Partner company logo" className="hero-logo" />
              </div>
            </div>
          </div>
        </div>
        <div className="section-background_component">
          <div className="bg-overlay"></div>
        </div>
      </section>

      {/* ═══════ STATS BANNER ═══════ */}
      <div className="padding-global">
        <div className="container-large">
          <div className="h-wrap space-between" style={{ padding: '1.5rem 0', borderBottom: '1px solid #f3f3f3' }}>
            <div className="h-wrap gap-2">
              <p className="text-weight-semibold">{jobCount}+ Jobs Posted</p>
              <div className="bullet_dot"></div>
              <p className="text-weight-semibold">5,000+ Webflow Professionals</p>
              <div className="bullet_dot"></div>
              <p className="text-weight-semibold">Free To Post</p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ SPACER SECTION ═══════ */}
      <section className="section">
        <div className="padding-global"></div>
      </section>

      {/* ═══════ JOB POSTINGS SECTION ═══════ */}
      <section className="section">
        <div className="padding-global">
          <div className="padding-section-large padding-bottom">
            <div className="container-large">
              <JobFilterClient jobs={serializedJobs} />
            </div>
          </div>

          {/* ═══════ ACTION CARDS (BENTO GRID) ═══════ */}
          <div className="padding-section-medium padding-bottom">
            <div className="container-large">
              <div className="grid-3c_layout is-bento">
                {/* Card 1: Post A Job */}
                <div className="card">
                  <p>Post A Job</p>
                  <h3>Post A Job</h3>
                  <p>It&apos;s Fast. It&apos;s Free.</p>
                  <div className="text-color-white w-embed">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 345 127" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img">
                      <circle cx="52.0682" cy="29.6866" r="28.9334" fill="currentColor"></circle>
                      <path fillRule="evenodd" clipRule="evenodd" d="M0.913086 74.9725C0.913094 103.225 23.8167 126.129 52.0696 126.129C80.3226 126.129 103.226 103.225 103.226 74.9725L0.913086 74.9725Z" fill="currentColor"></path>
                      <g opacity="0.6">
                        <circle cx="172.568" cy="29.6866" r="28.9334" fill="currentColor"></circle>
                        <path fillRule="evenodd" clipRule="evenodd" d="M121.413 74.9725C121.413 103.225 144.317 126.129 172.57 126.129C200.823 126.129 223.726 103.225 223.726 74.9725L121.413 74.9725Z" fill="currentColor"></path>
                      </g>
                      <g opacity="0.3">
                        <circle cx="293.068" cy="29.6866" r="28.9334" fill="currentColor"></circle>
                        <path fillRule="evenodd" clipRule="evenodd" d="M241.913 74.9725C241.913 103.225 264.817 126.129 293.07 126.129C321.323 126.129 344.226 103.225 344.226 74.9725L241.913 74.9725Z" fill="currentColor"></path>
                      </g>
                    </svg>
                  </div>
                  <div className="button-group">
                    <Link href="/post-a-job" className="button is-nav w-button">Post A Job</Link>
                  </div>
                </div>

                {/* Card 2: Be Featured */}
                <div className="card is-light_orange">
                  <p className="text-color-orange">*New* Coming Soon<br /></p>
                  <div className="heading-content">
                    <div className="w-embed">
                      <svg width="183" height="102" viewBox="0 0 183 102" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="41.3285" cy="23.6825" r="23.2274" fill="#FF9500"></circle>
                        <path fillRule="evenodd" clipRule="evenodd" d="M0.261719 60.0374C0.261735 82.7185 18.6484 101.105 41.3295 101.105C64.0107 101.105 82.3974 82.7185 82.3974 60.0374L0.261719 60.0374Z" fill="#FF9500"></path>
                        <rect x="168.882" y="73.4627" width="19.7101" height="80.408" transform="rotate(135 168.882 73.4627)" fill="#FF9500"></rect>
                        <path d="M175.6 94.1117L171.123 75.6482L157.136 89.6351L175.6 94.1117Z" fill="#FF9500"></path>
                        <rect x="109.812" y="14.3922" width="19.7101" height="19.7101" transform="rotate(135 109.812 14.3922)" fill="#FF9500"></rect>
                      </svg>
                    </div>
                    <h3>Be Featured As A Webflow Designer</h3>
                    <div className="button-group">
                      <div className="h-wrap is-link">
                        <p>Join The Community</p>
                        <div className="icon-embed-xxsmall w-embed"><ArrowIcon /></div>
                      </div>
                    </div>
                  </div>
                  <Link href="/join-the-community" className="card_link w-inline-block"></Link>
                </div>

                {/* Card 3: Website Audit */}
                <div className="card">
                  <p>Website Audit</p>
                  <h3>Get a Website Audit from the Experts Behind Webflow Jobs</h3>
                  <div className="button-group">
                    <div className="h-wrap is-link">
                      <p>Schedule An Audit</p>
                      <div className="icon-embed-xxsmall w-embed"><ArrowIcon /></div>
                    </div>
                  </div>
                </div>

                {/* Card 4: Hidden blog card */}
                <div className="card is-light_orange hide">
                  <p className="text-color-orange">Blogs &amp; Resources</p>
                  <div className="heading-content">
                    <div className="w-embed">
                      <svg width="85" height="101" viewBox="0 0 85 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0.809082" y="0.0634766" width="24.0763" height="100.649" fill="#FF9500"></rect>
                        <circle cx="58.6147" cy="26.4219" r="26.3583" fill="#FF9500"></circle>
                        <path d="M84.9731 47.0244V99.7411H32.2563L84.9731 47.0244Z" fill="#FF9500"></path>
                      </svg>
                    </div>
                    <h3>12 Things To Look For When Hiring A Webflow Freelancer</h3>
                    <div className="button-group">
                      <div className="h-wrap is-link">
                        <p>Get The Resource</p>
                        <div className="icon-embed-xxsmall w-embed"><ArrowIcon /></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscribe Component */}
                <div id="w-node-_63426f41-e002-8a4e-e80a-8b81f8470e16-f8470e16" className="subscribe-component">
                  <div className="card is-signup">
                    <p className="text-color-orange">Subscribe To New Jobs</p>
                    <div className="heading-content">
                      <h3>Your Perfect Webflow Job, Sent to You Weekly</h3>
                      <p>No more endless searching. Share your details, and we&apos;ll send you Webflow job openings tailored to your expertise and location. The right job could be waiting—sign up today.</p>
                    </div>
                  </div>
                  <div className="subscribe_form-block w-form">
                    <form id="wf-form-Subscribe-Form" name="wf-form-Subscribe-Form" data-name="Subscribe Form" method="get" className="subscribe_form">
                      <input className="form_input is-subscribe w-input" maxLength={256} name="Email" data-name="Email" placeholder="Email Address" type="email" id="Email" required />
                      <div className="h-wrap gap-0 is-subscribe">
                        <div className="select-wrapper">
                          <select id="Occupation" name="Occupation" data-name="Occupation" required className="form_input is-select-input is-subscribe w-select">
                            <option value="">Occupation</option>
                            <option value="Webflow Developer">Webflow Developer</option>
                            <option value="Designer">Designer</option>
                            <option value="SEO">SEO</option>
                            <option value="CRO">CRO</option>
                            <option value="Google Ads">Google Ads</option>
                            <option value="Other">Other</option>
                          </select>
                          <div className="icon w-icon-dropdown-toggle"></div>
                        </div>
                        <div className="select-wrapper">
                          <div className="icon w-icon-dropdown-toggle"></div>
                          <div className="w-embed">
                            <CountrySelect />
                          </div>
                        </div>
                      </div>
                      <input type="submit" data-wait="Please wait..." className="button is-cta w-button" value="Sign Up" />
                    </form>
                    <div className="success-message-2 w-form-done">
                      <div>Thank you! Your submission has been received!</div>
                    </div>
                    <div className="w-form-fail">
                      <div>Oops! Something went wrong while submitting the form.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ SECTION ═══════ */}
      <section className="section">
        <div className="padding-global">
          <div className="padding-section-medium">
            <div className="container-large">
              {/* Posting A Job FAQ */}
              <div className="grid-2c_layout is-faq">
                <h2>Posting A Job</h2>
                <AccordionToggle items={POSTING_FAQS} />
              </div>

              <div data-wf--spacer--size="large" className="spacer-component"></div>

              {/* Looking For Work FAQ */}
              <div className="grid-2c_layout is-faq">
                <h2>Looking For Work</h2>
                <AccordionToggle items={LOOKING_FAQS} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ APPLICATION POPUP ═══════ */}
      <div w-el="popup" className="apply_popup-component">
        <div w-el="popup-overlay" className="apply_popup-overlay"></div>
        <div className="apply_popup-wrapper">
          <div className="apply_form-block w-form">
            <form id="wf-form-Application-Form" name="wf-form-Application-Form" data-name="Application Form" method="get" className="apply_form">
              <h2 className="heading-style-h3">Apply for the <span w-el-map="title">Title</span> at <span w-el-map="company">Company</span></h2>
              <p>Tell us a bit about yourself so we can match you with the best job opportunities! Once you&apos;ve filled in your details, the application link will be unlocked.</p>
              <div className="h-wrap gap-2">
                <div className="form_field-wrapper"><label htmlFor="First-Name-5">First Name*</label><input className="form_input is-apply w-input" maxLength={256} name="First-Name" data-name="First Name" placeholder="" type="text" id="First-Name-5" /></div>
                <div className="form_field-wrapper"><label htmlFor="Last-Name-5">Last Name*</label><input className="form_input is-apply w-input" maxLength={256} name="Last-Name" data-name="Last Name" placeholder="" type="text" id="Last-Name-5" required /></div>
              </div>
              <div className="h-wrap gap-2">
                <div className="form_field-wrapper"><label htmlFor="Email-7">Email Address*</label><input className="form_input is-apply w-input" maxLength={256} name="Email" data-name="Email" placeholder="" type="email" id="Email-7" required /></div>
              </div>
              <div className="button-group mt-0"><input type="submit" data-wait="Please wait..." className="button w-button" value="Unlock Application Link" /></div>
            </form>
            <div className="success-message w-form-done">
              <div className="center-heading-content">
                <p className="text-color-orange text-size-medium">Thanks For Visiting Webflow Jobs</p>
                <p className="heading-style-h2">Good Luck With Your Application!</p>
                <div className="button-group centered">
                  <a href="#" target="_blank" className="button w-button" rel="noreferrer">Open Application</a>
                </div>
              </div>
            </div>
            <div className="w-form-fail">
              <div>Oops! Something went wrong while submitting the form.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ P5.JS GRID ANIMATION ═══════ */}
    </>
  );
}
