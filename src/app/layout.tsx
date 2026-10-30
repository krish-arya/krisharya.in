import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Source_Serif_4 } from "next/font/google";
import { person } from "@/content/data";
import "./globals.css";

// SF Pro on Apple devices; Inter stands in everywhere else.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

/** Set NEXT_PUBLIC_SITE_URL to the production domain at deploy time. */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://krisharya.in";

const description =
  "Krish Arya builds AI systems: a sub-200ms voice agent, a self-updating production RAG, an evaluation platform scoring 50K+ conversations, Bylin.app, Mutagen, and published research on self-healing NLP-to-SQL.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Krish Arya — AI Engineer · Builder · Researcher",
    template: "%s — Krish Arya",
  },
  description,
  applicationName: "Krish Arya",
  authors: [{ name: person.name, url: person.links[0].href }],
  keywords: [
    "Krish Arya",
    "AI engineer",
    "LLM systems",
    "RAG",
    "AI agents",
    "voice agent",
    "text-to-SQL",
    "mutation testing",
    "Mutagen",
    "Bylin",
    "New Delhi",
  ],
  openGraph: {
    type: "profile",
    title: "Krish Arya",
    description,
    siteName: "Krish Arya",
    locale: "en_IN",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krish Arya",
    description,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eceef5" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1018" },
  ],
  colorScheme: "light dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  jobTitle: "AI Engineer",
  address: { "@type": "PostalAddress", addressLocality: "New Delhi", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: person.education.school },
  worksFor: { "@type": "Organization", name: "EaseMyTrip" },
  email: `mailto:${person.email}`,
  sameAs: person.links.filter((l) => l.href.startsWith("http")).map((l) => l.href),
  knowsAbout: ["Large language models", "Retrieval-augmented generation", "AI agents", "Voice AI", "Text-to-SQL", "AI evaluation"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plexMono.variable} ${sourceSerif.variable}`}
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
