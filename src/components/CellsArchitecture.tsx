export default function CellsArchitecture() {
  return (
    <svg viewBox="0 0 1200 720" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ca-orange" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" /><stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <filter id="ca-shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" /></filter>
        <marker id="ca-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
          <polygon points="0 0, 10 3, 0 6" fill="#6b7280" />
        </marker>
      </defs>

      <text x="600" y="34" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#1f2937">
        Cell-Based Multi-Tenancy
      </text>

      {/* Edge + control plane */}
      <g filter="url(#ca-shadow)">
        <rect x="360" y="60" width="480" height="50" rx="8" fill="#374151" />
        <text x="600" y="82" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">CloudFront + Edge Router</text>
        <text x="600" y="100" textAnchor="middle" fontSize="10.5" fill="white" opacity="0.9">resolve tenant → cell (host / path / custom domain)</text>
      </g>
      <g filter="url(#ca-shadow)">
        <rect x="360" y="128" width="230" height="46" rx="8" fill="url(#ca-orange)" />
        <text x="475" y="149" textAnchor="middle" fontSize="12.5" fontWeight="bold" fill="white">Tenant Registry</text>
        <text x="475" y="165" textAnchor="middle" fontSize="9.5" fill="white" opacity="0.9">tenant → model · cell · realm · region</text>
      </g>
      <g filter="url(#ca-shadow)">
        <rect x="610" y="128" width="230" height="46" rx="8" fill="url(#ca-orange)" />
        <text x="725" y="149" textAnchor="middle" fontSize="12.5" fontWeight="bold" fill="white">Placement Engine</text>
        <text x="725" y="165" textAnchor="middle" fontSize="9.5" fill="white" opacity="0.9">capacity + capability aware</text>
      </g>
      <path d="M 500 174 L 320 228" stroke="#6b7280" strokeWidth="2" markerEnd="url(#ca-arrow)" />
      <path d="M 600 174 L 600 228" stroke="#6b7280" strokeWidth="2" markerEnd="url(#ca-arrow)" />
      <path d="M 700 174 L 880 228" stroke="#6b7280" strokeWidth="2" markerEnd="url(#ca-arrow)" />

      {/* Cells */}
      {[{x:60,t:"Pooled Cell A"},{x:450,t:"Pooled Cell B"}].map((c) => (
        <g key={c.t} filter="url(#ca-shadow)">
          <rect x={c.x} y="232" width="340" height="150" rx="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="2.5" />
          <text x={c.x + 170} y="256" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e40af">{c.t} — up to N realms</text>
          <rect x={c.x + 24} y="272" width="292" height="40" rx="6" fill="#4ade80" opacity="0.25" stroke="#10b981" strokeWidth="2" />
          <text x={c.x + 170} y="297" textAnchor="middle" fontSize="12" fill="#047857">Keycloak cluster (Fargate, multi-AZ)</text>
          <rect x={c.x + 24} y="320" width="140" height="46" rx="6" fill="#cffafe" stroke="#0b7285" strokeWidth="1.5" />
          <text x={c.x + 94} y="341" textAnchor="middle" fontSize="10.5" fill="#0b7285">Aurora (default)</text>
          <text x={c.x + 94} y="356" textAnchor="middle" fontSize="9" fill="#0b7285">cell database</text>
          <rect x={c.x + 176} y="320" width="140" height="46" rx="6" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
          <text x={c.x + 246} y="341" textAnchor="middle" fontSize="10.5" fill="#6d28d9">Infinispan</text>
          <text x={c.x + 246} y="356" textAnchor="middle" fontSize="9" fill="#6d28d9">in-region cache</text>
        </g>
      ))}
      {/* Dedicated silo */}
      <g filter="url(#ca-shadow)">
        <rect x="820" y="232" width="320" height="150" rx="10" fill="#fef2f2" stroke="#dc2626" strokeWidth="2.5" />
        <text x="980" y="256" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#991b1b">Dedicated Silo (Enterprise)</text>
        <rect x="844" y="272" width="272" height="40" rx="6" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5" />
        <text x="980" y="297" textAnchor="middle" fontSize="11.5" fill="#991b1b">Tenant's own Keycloak + own DB</text>
        <text x="980" y="336" textAnchor="middle" fontSize="10.5" fill="#7f1d1d">strongest isolation · own keys / upgrades</text>
        <text x="980" y="356" textAnchor="middle" fontSize="10.5" fill="#7f1d1d">optional multi-cloud (Yugabyte) cell</text>
      </g>

      {/* Isolation tiers panel */}
      <g filter="url(#ca-shadow)">
        <rect x="120" y="418" width="960" height="270" rx="10" fill="#f8fafc" stroke="#e2e8f0" />
      </g>
      <text x="600" y="446" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#334155">Three isolation tiers — used together, not either/or</text>
      {[
        {x:150,c:"#2563eb",t:"Organizations",d:["Org inside a shared realm","Highest density","Many small B2B tenants"]},
        {x:470,c:"#7c3aed",t:"Realm-per-tenant (pooled)",d:["A realm on a shared cluster","Strong isolation, own keys","The standard tier"]},
        {x:790,c:"#dc2626",t:"Instance-per-tenant (silo)",d:["Dedicated KC + DB","Strongest isolation","Enterprise / regulated"]},
      ].map((tier) => (
        <g key={tier.t}>
          <rect x={tier.x} y="466" width="290" height="200" rx="8" fill="#fff" stroke={tier.c} strokeWidth="2" />
          <rect x={tier.x} y="466" width="290" height="34" rx="8" fill={tier.c} />
          <text x={tier.x + 145} y="489" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">{tier.t}</text>
          {tier.d.map((line, j) => (
            <text key={line} x={tier.x + 20} y={528 + j * 30} fontSize="11.5" fill="#475569">• {line}</text>
          ))}
          <text x={tier.x + 20} y={528 + 3 * 30} fontSize="10.5" fill="#94a3b8">
            {tier.t.startsWith("Organizations") ? "density ▲  isolation ▽" : tier.t.startsWith("Instance") ? "density ▽  isolation ▲" : "balanced"}
          </text>
        </g>
      ))}
    </svg>
  );
}
