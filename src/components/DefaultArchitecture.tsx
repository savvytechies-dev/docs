export default function DefaultArchitecture() {
  return (
    <svg viewBox="0 0 1200 780" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="da-blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id="da-purple" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" /><stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <filter id="da-shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" /></filter>
        <marker id="da-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
        </marker>
      </defs>

      {/* Title */}
      <text x="600" y="34" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">
        Default Architecture — Single Region, Multi-AZ
      </text>

      {/* Legend */}
      <g fontSize="11" fill="#6b7280">
        <rect x="470" y="50" width="12" height="12" rx="2" fill="url(#da-blue)" /><text x="488" y="60">Data plane (Fargate)</text>
        <rect x="640" y="50" width="12" height="12" rx="2" fill="url(#da-purple)" /><text x="658" y="60">Control plane (Lambda)</text>
        <rect x="820" y="50" width="12" height="12" rx="2" fill="#0b7285" /><text x="838" y="60">Database</text>
      </g>

      {/* Users → CloudFront → ALB */}
      <g filter="url(#da-shadow)">
        <rect x="500" y="80" width="200" height="44" rx="8" fill="#374151" />
        <text x="600" y="107" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">Users / SPAs / APIs</text>
      </g>
      <path d="M 600 124 L 600 148" stroke="#6b7280" strokeWidth="2" markerEnd="url(#da-arrow)" />
      <g filter="url(#da-shadow)">
        <rect x="430" y="150" width="340" height="56" rx="8" fill="url(#da-blue)" />
        <text x="600" y="174" textAnchor="middle" fontSize="15" fontWeight="bold" fill="white">CloudFront (edge)</text>
        <text x="600" y="194" textAnchor="middle" fontSize="11" fill="white" opacity="0.9">TLS · WAF / Shield · cache /resources/*</text>
      </g>
      <path d="M 600 206 L 600 230" stroke="#6b7280" strokeWidth="2" markerEnd="url(#da-arrow)" />

      {/* DATA PLANE region */}
      <g filter="url(#da-shadow)">
        <rect x="40" y="232" width="760" height="300" rx="10" fill="#fff" stroke="#ff9900" strokeWidth="3" />
      </g>
      <text x="420" y="258" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#b45309">
        DATA PLANE — AWS us-east-1 · Fargate (JVM Keycloak / Quarkus, autoscaled on CPU)
      </text>
      {/* Regional ALB */}
      <rect x="300" y="272" width="240" height="42" rx="6" fill="#dbeafe" stroke="#2563eb" strokeWidth="2" />
      <text x="420" y="298" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e40af">Regional ALB (L7)</text>

      {/* AZ boxes with Keycloak tasks */}
      <rect x="70" y="336" width="340" height="96" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeDasharray="4,3" />
      <text x="240" y="354" textAnchor="middle" fontSize="11" fill="#64748b">Availability Zone 1</text>
      <rect x="440" y="336" width="290" height="96" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeDasharray="4,3" />
      <text x="585" y="354" textAnchor="middle" fontSize="11" fill="#64748b">Availability Zone 2</text>

      {[{x:95,l:"KC task 1"},{x:255,l:"KC task 2"},{x:465,l:"KC task 3"},{x:600,l:"KC task n"}].map((t) => (
        <g key={t.l}>
          <rect x={t.x} y="366" width="130" height="48" rx="6" fill="#4ade80" opacity="0.25" stroke="#10b981" strokeWidth="2" />
          <text x={t.x + 65} y="395" textAnchor="middle" fontSize="12" fill="#047857">{t.l}</text>
        </g>
      ))}
      {/* JDBC_PING cluster band */}
      <text x="400" y="428" textAnchor="middle" fontSize="10" fill="#059669">◄── clustered via JDBC_PING · embedded Infinispan (in-region) ──►</text>

      {/* Aurora */}
      <path d="M 420 314 L 420 452" stroke="#6b7280" strokeWidth="2" markerEnd="url(#da-arrow)" />
      <g filter="url(#da-shadow)">
        <ellipse cx="420" cy="490" rx="220" ry="30" fill="#0b7285" />
        <text x="420" y="486" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">Aurora PostgreSQL — Multi-AZ</text>
        <text x="420" y="503" textAnchor="middle" fontSize="10" fill="white" opacity="0.9">primary + synchronous replica · source of truth</text>
      </g>

      {/* CONTROL PLANE */}
      <g filter="url(#da-shadow)">
        <rect x="830" y="232" width="330" height="300" rx="10" fill="#fff" stroke="#9333ea" strokeWidth="3" />
      </g>
      <text x="995" y="258" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#6d28d9">CONTROL PLANE — serverless (Lambda)</text>
      {[
        "Provisioning API","Billing / metering (Stripe)","AI-config service",
        "Analytics pipeline → ClickHouse","Notifications (SES / SNS)","STS token-broker",
        "Tenant Registry + Placement Engine",
      ].map((label, i) => (
        <g key={label}>
          <rect x="850" y={274 + i * 34} width="290" height="26" rx="5" fill="#f3e8ff" stroke="#a855f7" strokeWidth="1.5" />
          <text x="995" y={291 + i * 34} textAnchor="middle" fontSize="11.5" fill="#6d28d9">{label}</text>
        </g>
      ))}
      {/* Admin REST arrow from control plane to data plane */}
      <path d="M 850 300 C 700 300, 620 290, 542 293" stroke="#9333ea" strokeWidth="2" strokeDasharray="5,4" fill="none" markerEnd="url(#da-arrow)" />
      <text x="690" y="285" textAnchor="middle" fontSize="10" fill="#7e22ce">Admin REST API</text>

      {/* Footnote */}
      <text x="600" y="560" textAnchor="middle" fontSize="12" fill="#6b7280">
        Not Lambda for Keycloak (stateful/clustered) · not GraalVM native (SPIs power analytics, adaptive auth, STS)
      </text>

      {/* SLA strip */}
      <g filter="url(#da-shadow)">
        <rect x="120" y="592" width="960" height="150" rx="10" fill="#f8fafc" stroke="#e2e8f0" />
      </g>
      <text x="600" y="618" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#334155">Scales two ways · Availability by tier</text>
      <text x="330" y="648" textAnchor="middle" fontSize="11.5" fill="#475569">Many tenants → add cells</text>
      <text x="330" y="668" textAnchor="middle" fontSize="10.5" fill="#64748b">(cell = Fargate + DB + cache, N realms)</text>
      <text x="870" y="648" textAnchor="middle" fontSize="11.5" fill="#475569">One huge realm → dedicated Fargate</text>
      <text x="870" y="668" textAnchor="middle" fontSize="10.5" fill="#64748b">sized by login rate (~1 vCPU / 15 logins/s)</text>
      <text x="600" y="702" textAnchor="middle" fontSize="11.5" fill="#334155">99.9% single-region · 99.95% multi-region active-passive · 99.99% active-active multi-cloud</text>
      <text x="600" y="722" textAnchor="middle" fontSize="10" fill="#94a3b8">SLA tiers backed after production maturity</text>
    </svg>
  );
}
