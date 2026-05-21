const SERVICE_ICON_SVGS = {
  AD: `
    <path d="M10 20h22l5 7h27v29H10V20z"/>
    <path d="M32 20v7h27"/>
    <path d="M20 36h24M20 43h16"/>
  `,
  PMO: `
    <path d="M32 34c8 0 14-5 14-12V16H18v6c0 7 6 12 14 12z"/>
    <path d="M20 40h24v6H20z"/>
    <path d="M24 46v4M40 46v4"/>
    <path d="M26 22h12"/>
  `,
  ESD: `
    <path d="M32 34c8 0 14-5 14-12V16H18v6c0 7 6 12 14 12z"/>
    <path d="M20 40h24v6H20z"/>
    <path d="M24 46v4M40 46v4"/>
    <path d="M26 22h12"/>
  `,
  FSD: `
    <path d="M38 18l8 8-16 16-8-8 16-16z"/>
    <path d="M24 32l8 8"/>
    <path d="M18 46l6-6"/>
    <circle cx="44" cy="20" r="3"/>
  `,
  PR: `
    <circle cx="22" cy="16" r="5"/>
    <path d="M22 21v6"/>
    <path d="M16 27h12"/>
    <path d="M19 33h6l3 7"/>
    <circle cx="38" cy="41" r="10"/>
    <path d="M28 33h10"/>
    <path d="M48 41h6"/>
    <path d="M38 31v10"/>
  `,
  TR: `
    <path d="M12 42h40"/>
    <path d="M18 42V28l14-10 14 10v14"/>
    <path d="M26 42V32h12v10"/>
    <path d="M32 18v4"/>
  `,
  FD: `
    <rect x="10" y="24" width="28" height="18" rx="3"/>
    <circle cx="38" cy="33" r="8"/>
    <path d="M34 33h8"/>
    <path d="M18 30h12M18 36h8"/>
    <path d="M46 29v8"/>
  `,
  PSD: `
    <path d="M32 14l16 8v8c0 10-7 18-16 20-9-2-16-10-16-20v-8l16-8z"/>
    <path d="M24 30h16"/>
    <path d="M32 22v12"/>
  `,
  PPD: `
    <rect x="16" y="12" width="32" height="40" rx="3"/>
    <path d="M22 22h20M22 30h20M22 38h14"/>
    <path d="M40 38l8 8"/>
  `,
  AS: `
    <rect x="18" y="12" width="28" height="36" rx="3"/>
    <path d="M24 22h16M24 30h16M24 38h10"/>
    <path d="M36 38l10 10"/>
    <path d="M42 44h4v4"/>
  `,
  EN: `
    <rect x="10" y="28" width="44" height="22" rx="3"/>
    <path d="M16 34h6v6h-6zM26 34h6v6h-6zM36 34h6v6h-6zM46 34h4v6h-4z"/>
    <rect x="18" y="14" width="28" height="12" rx="2"/>
  `,
  CA: `
    <rect x="6" y="42" width="52" height="6" rx="2"/>
    <circle cx="24" cy="19" r="6"/>
    <path d="M24 25v11"/>
    <path d="M18 36h12"/>
    <rect x="34" y="27" width="22" height="15" rx="2"/>
    <path d="M38 31h14M38 35h10"/>
    <rect x="38" y="42" width="12" height="5" rx="1"/>
    <path d="M42 42v-3"/>
  `,
  MA: `
    <circle cx="32" cy="28" r="4"/>
    <path d="M32 32v18"/>
    <path d="M20 50h24"/>
    <path d="M24 38c-6 4-8 8-8 12"/>
    <path d="M40 38c6 4 8 8 8 12"/>
    <path d="M32 14v6"/>
  `
};

const DEFAULT_ICON = `
  <circle cx="32" cy="32" r="18"/>
  <path d="M32 22v20M22 32h20"/>
`;

function getServiceIcon(code, name = '') {
  let key = String(code || '').trim().toUpperCase();
  
  // If the key is not directly in SERVICE_ICON_SVGS, run a fallback resolution
  if (!SERVICE_ICON_SVGS[key]) {
    const nameUpper = String(name || '').toUpperCase();
    const matchKey = Object.keys(SERVICE_ICON_SVGS).find(k => 
      key.includes(k) || k.includes(key) || nameUpper.includes(k)
    );
    if (matchKey) {
      key = matchKey;
    }
  }

  const paths = SERVICE_ICON_SVGS[key] || DEFAULT_ICON;
  const label = name ? `${name} icon` : 'Service icon';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true" focusable="false"
      fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <title>${label}</title>
      ${paths}
    </svg>
  `.trim();
}
