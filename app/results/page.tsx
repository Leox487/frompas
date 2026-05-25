"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Person {
  name: string;
  business: string;
  how_they_started: string;
  revenue_or_scale: string;
  link: string | null;
}

interface BusinessModel {
  name: string;
  description: string;
}

interface Report {
  passion: string;
  people: Person[];
  business_models: BusinessModel[];
}

export default function ResultsPage() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("frompas_result");
    if (stored) {
      try {
        setReport(JSON.parse(stored) as Report);
      } catch {
        /* ignore malformed data */
      }
    }
  }, []);

  if (!report) {
    return (
      <main className="error-page">
        <h1 className="error-heading">No results found</h1>
        <p className="error-message">
          Try searching for a passion from the home page.
        </p>
        <Link href="/" className="btn btn-primary">
          Go back
        </Link>
      </main>
    );
  }

  return (
    <main className="results-page">
      <div className="results-inner">
        <header>
          <p className="results-passion-label">Your passion</p>
          <h1 className="results-passion">{report.passion}</h1>
        </header>

        <section className="results-section">
          <h2 className="results-heading">
            Real people who built businesses from this passion
          </h2>
          <div className="person-grid">
            {report.people.map((person, i) => (
              <article key={`${person.name}-${i}`} className="person-card">
                <h3 className="person-name">{person.name}</h3>
                <p className="person-built">{person.business}</p>
                <p className="person-detail">{person.how_they_started}</p>
                {person.revenue_or_scale &&
                person.revenue_or_scale !== "Not publicly available" ? (
                  <p className="person-revenue">{person.revenue_or_scale}</p>
                ) : null}
                {person.link ? (
                  <a
                    href={person.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="person-link"
                  >
                    Visit site
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="results-section">
          <h2 className="results-heading">
            Top business models for this passion
          </h2>
          <ol className="model-list">
            {report.business_models.map((model, i) => (
              <li key={`${model.name}-${i}`} className="model-item">
                <p className="model-name">{model.name}</p>
                <p className="model-description">{model.description}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="results-actions">
          <Link href="/" className="btn btn-primary">
            Search another passion
          </Link>
        </div>
      </div>
    </main>
  );
}
