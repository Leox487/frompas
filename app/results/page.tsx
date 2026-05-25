"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Person {
  name: string;
  what_they_did: string;
  first_customer: string;
  time_to_first_dollar: string;
  year_one_income: string;
  link: string | null;
}

interface FirstStep {
  action: string;
  expected_outcome: string;
}

interface Report {
  passion: string;
  people: Person[];
  first_steps: FirstStep[];
  honest_note?: string;
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
            Regular people who made money from this passion
          </h2>
          <div className="person-grid">
            {report.people.map((person, i) => (
              <article key={`${person.name}-${i}`} className="person-card">
                <h3 className="person-name">{person.name}</h3>
                <p className="person-built">{person.what_they_did}</p>
                <div className="person-details">
                  <p className="person-detail">
                    <strong>First customer:</strong> {person.first_customer}
                  </p>
                  <p className="person-detail">
                    <strong>Time to first $:</strong>{" "}
                    {person.time_to_first_dollar}
                  </p>
                  {person.year_one_income &&
                  person.year_one_income !== "Not disclosed" ? (
                    <p className="person-revenue">
                      Year 1: {person.year_one_income}
                    </p>
                  ) : null}
                </div>
                {person.link ? (
                  <a
                    href={person.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="person-link"
                  >
                    Read their story
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="results-section">
          <h2 className="results-heading">
            3 things you can do this week
          </h2>
          <ol className="model-list">
            {report.first_steps.map((step, i) => (
              <li key={`step-${i}`} className="model-item">
                <p className="model-name">{step.action}</p>
                <p className="model-description">{step.expected_outcome}</p>
              </li>
            ))}
          </ol>
        </section>

        {report.honest_note ? (
          <section className="results-section">
            <p className="results-muted">{report.honest_note}</p>
          </section>
        ) : null}

        <div className="results-actions">
          <Link href="/" className="btn btn-primary">
            Search another passion
          </Link>
        </div>
      </div>
    </main>
  );
}
