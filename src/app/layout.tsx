import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import { Navbar, Footer } from "@/components/layout";

export const metadata: Metadata = {
  title: "Leading Webflow Jobs Board for Webflow Designers & Developers",
  description: "Looking to hire a Webflow developer or designer? Webflow Jobs is the leading job board that connects top talent with companies seeking experts. Find the right opportunity or hire today!",
  openGraph: {
    title: "Leading Webflow Jobs Board for Webflow Designers & Developers",
    description: "Looking to hire a Webflow developer or designer? Webflow Jobs is the leading job board that connects top talent with companies seeking experts. Find the right opportunity or hire today!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leading Webflow Jobs Board for Webflow Designers & Developers",
    description: "Looking to hire a Webflow developer or designer? Webflow Jobs is the leading job board that connects top talent with companies seeking experts. Find the right opportunity or hire today!",
  },
  verification: {
    other: { "msvalidate.01": "5A1BA4839CD8FA02CCDD952F843BEE1D" },
  },
  icons: {
    icon: "/images/favicon.png",
    apple: "/images/webclip.png",
  },
  alternates: {
    canonical: "https://www.webflow.jobs",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link href="https://fonts.gstatic.com" rel="preconnect" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=ABeeZee:wght@400&family=Roboto+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Webflow Jobs",
              "url": "https://www.webflow.jobs",
              "logo": "https://www.webflow.jobs/images/favicon.png",
              "description": "The leading job board for Webflow designers and developers"
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Webflow Jobs",
              "url": "https://www.webflow.jobs",
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.webflow.jobs/jobs?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <div className="page-wrapper">
          <Navbar />
          <main className="main-wrapper">
            {children}
          </main>
          <Footer />
        </div>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V4REHJ7432"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-V4REHJ7432');`}
        </Script>
      </body>
    </html>
  );
}
