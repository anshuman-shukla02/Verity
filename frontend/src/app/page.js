import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero animate-fade-in">
        <div style={{ marginBottom: "1.25rem" }}>
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "rgba(255,255,255,0.9)" }}>
            <path d="M20 3L5 10v10c0 9.38 6.4 18.16 15 20.36C28.6 38.16 35 29.38 35 20V10L20 3z" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M14 20l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="page-title" style={{ maxWidth: "700px", margin: "0 auto 1rem" }}>
          Trusted Certificate Verification, Powered by Blockchain
        </h1>
        <p className="page-subtitle" style={{ margin: "0 auto 2.5rem", textAlign: "center" }}>
          Issue tamper-proof digital credentials. Verify authenticity in seconds.
          Every document is cryptographically hashed and recorded on-chain — making fraud impossible.
        </p>

        <div className="hero-actions" style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/admin" className="btn btn-primary btn-lg">
            Issue Certificate
          </Link>
          <Link href="/verify" className="btn btn-secondary btn-lg">
            Verify Document
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="animate-fade-in-delay-1" style={{ marginTop: "3.5rem" }}>
        <h2 style={{
          textAlign: "center",
          fontFamily: "var(--font-heading)",
          fontSize: "1.5rem",
          fontWeight: "800",
          marginBottom: "2.5rem",
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
        }}>
          How It Works
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}>
          {[
            {
              step: "1",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <path d="M14 2v6h6" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              ),
              title: "Upload Document",
              desc: "Admin uploads the certificate file (PDF or image) through the secure dashboard.",
            },
            {
              step: "2",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              ),
              title: "Hash & Store",
              desc: "A unique SHA-256 fingerprint is computed and the file is pinned to IPFS for permanent storage.",
            },
            {
              step: "3",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              title: "Record On-Chain",
              desc: "The hash and IPFS CID are immutably recorded on the Ethereum blockchain via a smart contract.",
            },
            {
              step: "4",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ),
              title: "Instant Verification",
              desc: "Anyone can verify authenticity by uploading the same document or scanning a QR code.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="glass-card"
              style={{ textAlign: "center", padding: "2rem 1.5rem" }}
            >
              <div className="step-number">{item.step}</div>
              <div style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "center" }}>
                {item.icon}
              </div>
              <h3 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1rem",
                fontWeight: "700",
                marginBottom: "0.5rem",
                color: "var(--text-primary)",
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="animate-fade-in-delay-2" style={{ marginTop: "3.5rem" }}>
        <h2 style={{
          textAlign: "center",
          fontFamily: "var(--font-heading)",
          fontSize: "1.5rem",
          fontWeight: "800",
          marginBottom: "2.5rem",
          color: "var(--text-primary)",
          letterSpacing: "-0.03em",
        }}>
          Get Started
        </h2>

        <div className="grid-3">
          <Link href="/admin">
            <div className="glass-card" style={{ cursor: "pointer", height: "100%", textAlign: "center", padding: "2.5rem 1.5rem" }}>
              <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: "700", marginBottom: "0.75rem" }}>
                Institution Dashboard
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.6" }}>
                Issue new certificates to students. Documents are hashed, stored on IPFS, and secured on the blockchain.
              </p>
              <div style={{
                marginTop: "1.25rem",
                color: "var(--primary-600)",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}>
                Go to Dashboard →
              </div>
            </div>
          </Link>

          <Link href="/verify">
            <div className="glass-card" style={{ cursor: "pointer", height: "100%", textAlign: "center", padding: "2.5rem 1.5rem" }}>
              <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: "700", marginBottom: "0.75rem" }}>
                Verify Certificate
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.6" }}>
                Upload a certificate to instantly verify its authenticity against the blockchain record.
              </p>
              <div style={{
                marginTop: "1.25rem",
                color: "var(--primary-600)",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}>
                Verify Now →
              </div>
            </div>
          </Link>

          <Link href="/student">
            <div className="glass-card" style={{ cursor: "pointer", height: "100%", textAlign: "center", padding: "2.5rem 1.5rem" }}>
              <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.125rem", fontWeight: "700", marginBottom: "0.75rem" }}>
                Student Portal
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", lineHeight: "1.6" }}>
                View and share your issued certificates using your unique verification hash.
              </p>
              <div style={{
                marginTop: "1.25rem",
                color: "var(--primary-600)",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}>
                Find Certificate →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="animate-fade-in-delay-3" style={{
        marginTop: "3.5rem",
        marginBottom: "1rem",
      }}>
        <div className="trust-strip">
          {[
            {
              icon: (
                <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              ),
              label: "SHA-256 Hashing",
            },
            {
              icon: (
                <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              label: "Ethereum Blockchain",
            },
            {
              icon: (
                <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              ),
              label: "IPFS Storage",
            },
            {
              icon: (
                <svg className="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              ),
              label: "Tamper-Proof",
            },
          ].map((item, i) => (
            <div key={i} className="trust-item">
              {item.icon}
              <span className="trust-label">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
