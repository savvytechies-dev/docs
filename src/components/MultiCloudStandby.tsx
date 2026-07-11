export default function MultiCloudStandby() {
  return (
    <svg viewBox="0 0 1200 720" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="mc-shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" /></filter>
        <marker id="mc-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
        </marker>
        <marker id="mc-arrow-teal" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#0b7285" />
        </marker>
      </defs>

      <text x="600" y="34" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">
        Multi-Cloud — Premium Options
      </text>

      {/* Option A header */}
      <text x="600" y="66" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2563eb">
        Option A — Cross-Cloud Warm Standby (active-passive)
      </text>

      {/* Route53 */}
      <g filter="url(#mc-shadow)">
        <rect x="440" y="82" width="320" height="50" rx="8" fill="#374151" />
        <text x="600" y="103" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">Route 53 — health-check failover</text>
        <text x="600" y="121" textAnchor="middle" fontSize="10" fill="white" opacity="0.9">latency routing · 60s TTL · promote standby on region loss</text>
      </g>
      <path d="M 520 132 L 300 190" stroke="#6b7280" strokeWidth="2" markerEnd="url(#mc-arrow)" />
      <path d="M 680 132 L 900 190" stroke="#6b7280" strokeWidth="2" strokeDasharray="5,4" markerEnd="url(#mc-arrow)" />

      {/* AWS region (active) */}
      <g filter="url(#mc-shadow)">
        <rect x="60" y="194" width="440" height="240" rx="10" fill="#fff" stroke="#ff9900" strokeWidth="3" />
      </g>
      <text x="280" y="220" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#b45309">AWS — us-east-1 (ACTIVE)</text>
      <rect x="90" y="236" width="380" height="44" rx="6" fill="#4ade80" opacity="0.25" stroke="#10b981" strokeWidth="2" />
      <text x="280" y="263" textAnchor="middle" fontSize="12.5" fill="#047857">Keycloak (Fargate) — serving traffic</text>
      <g filter="url(#mc-shadow)">
        <ellipse cx="280" cy="360" rx="180" ry="34" fill="#0b7285" />
        <text x="280" y="352" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">Aurora PostgreSQL — PRIMARY</text>
        <text x="280" y="371" textAnchor="middle" fontSize="10" fill="white" opacity="0.9">logical-replication PUBLICATION</text>
      </g>

      {/* Azure region (passive) */}
      <g filter="url(#mc-shadow)">
        <rect x="700" y="194" width="440" height="240" rx="10" fill="#fff" stroke="#0078d4" strokeWidth="3" />
      </g>
      <text x="920" y="220" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0078d4">Azure — East US (WARM STANDBY)</text>
      <rect x="730" y="236" width="380" height="44" rx="6" fill="#dbeafe" opacity="0.6" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4,3" />
      <text x="920" y="263" textAnchor="middle" fontSize="12.5" fill="#1e40af">Keycloak (standby, promoted on failover)</text>
      <g filter="url(#mc-shadow)">
        <ellipse cx="920" cy="360" rx="180" ry="34" fill="#155e75" />
        <text x="920" y="352" textAnchor="middle" fontSize="12.5" fontWeight="bold" fill="white">Azure DB for PostgreSQL — SUBSCRIBER</text>
        <text x="920" y="371" textAnchor="middle" fontSize="10" fill="white" opacity="0.9">warm standby</text>
      </g>

      {/* Logical replication arrow */}
      <path d="M 462 360 L 738 360" stroke="#0b7285" strokeWidth="3" markerEnd="url(#mc-arrow-teal)" />
      <text x="600" y="348" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill="#0b7285">logical replication</text>
      <text x="600" y="382" textAnchor="middle" fontSize="10" fill="#0b7285">over VPN / interconnect (or AWS DMS)</text>

      {/* Caption */}
      <g filter="url(#mc-shadow)">
        <rect x="120" y="452" width="960" height="66" rx="8" fill="#fffbeb" stroke="#f59e0b" strokeWidth="1.5" />
      </g>
      <text x="600" y="476" textAnchor="middle" fontSize="11.5" fill="#92400e">
        Native physical log shipping is impossible — Aurora's log-structured storage doesn't expose WAL.
      </text>
      <text x="600" y="498" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill="#92400e">
        Active-passive: RTO = standby promotion + replication catch-up · RPO = replication lag
      </text>

      {/* Option B inset */}
      <text x="600" y="552" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#7c3aed">
        Option B — YugabyteDB geo-distributed (active-active)
      </text>
      <g filter="url(#mc-shadow)">
        <rect x="180" y="566" width="840" height="120" rx="10" fill="#faf5ff" stroke="#7c3aed" strokeWidth="2" />
      </g>
      {["AWS","Azure","GCP"].map((cloud, i) => (
        <g key={cloud}>
          <rect x={220 + i * 250} y="590" width="200" height="40" rx="6" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
          <text x={320 + i * 250} y="615" textAnchor="middle" fontSize="12" fill="#6d28d9">Keycloak — {cloud}</text>
        </g>
      ))}
      <text x="600" y="655" textAnchor="middle" fontSize="11" fill="#6d28d9">
        one YugabyteDB cluster (Raft) spans clouds · no failover gap → the tier that backs 99.99%
      </text>
      <text x="600" y="674" textAnchor="middle" fontSize="10" fill="#94a3b8">
        tradeoffs: gated DB migrations · cross-cloud egress cost · heavier ops · cell tagged capabilities:["multi-cloud"]
      </text>
    </svg>
  );
}
