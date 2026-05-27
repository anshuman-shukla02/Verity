"use client";

import { useEffect, useState } from "react";

export default function StatsCards({ contract }) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    loading: true,
  });

  useEffect(() => {
    if (!contract) return;

    const fetchStats = async () => {
      try {
        const issuedFilter = contract.filters.CertificateIssued();
        const revokedFilter = contract.filters.CertificateRevoked();

        const [issuedEvents, revokedEvents] = await Promise.all([
          contract.queryFilter(issuedFilter),
          contract.queryFilter(revokedFilter),
        ]);

        const total = issuedEvents.length;
        const revoked = revokedEvents.length;
        const active = total - revoked;

        setStats({ total, active, revoked, loading: false });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, [contract]);

  const cards = [
    {
      label: "Total Issued",
      value: stats.total,
      icon: "📜",
    },
    {
      label: "Active",
      value: stats.active,
      icon: "✅",
    },
    {
      label: "Revoked",
      value: stats.revoked,
      icon: "🚫",
    },
  ];

  if (stats.loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="stat-card">
            <div className="skeleton skeleton-title mx-auto" style={{ width: 60 }} />
            <div className="skeleton skeleton-text mx-auto" style={{ width: 100 }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <div key={i} className={`stat-card animate-fade-in-delay-${i + 1}`}>
          <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            {card.icon}
          </div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-label">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
