"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/admin", label: "Dashboard" },
    { href: "/verify", label: "Verify" },
    { href: "/student", label: "Student" },
  ];

  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <div className="navbar-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shield body */}
            <path
              d="M20 3L5 10v10c0 9.38 6.4 18.16 15 20.36C28.6 38.16 35 29.38 35 20V10L20 3z"
              fill="currentColor"
              opacity="0.12"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            {/* Checkmark */}
            <path
              d="M14 20l4 4 8-8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="navbar-title">Verity</span>
      </Link>

      <button
        className="nav-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {menuOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-link ${pathname === link.href ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
