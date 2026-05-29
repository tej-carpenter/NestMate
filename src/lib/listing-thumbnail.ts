type ListingThumbnailSource = {
  title: string;
  city: string;
  locality: string;
  spaceType: "pg" | "room" | "bed" | "lodge" | "apartment";
  verified: boolean;
  nestscore: number;
  status: "draft" | "published" | "suspended";
  reviewCount?: number;
};

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function getAccentPalette(source: ListingThumbnailSource) {
  const palettes = [
    ["#0f766e", "#14b8a6"],
    ["#155e75", "#06b6d4"],
    ["#0f766e", "#22c55e"],
    ["#92400e", "#f59e0b"],
  ];

  return palettes[hashString(`${source.title}-${source.city}-${source.locality}`) % palettes.length];
}

export function buildListingThumbnail(source: ListingThumbnailSource) {
  const [from, to] = getAccentPalette(source);
  const hasFeedback = (source.reviewCount ?? 0) > 0 && source.nestscore > 0;
  const score = hasFeedback ? source.nestscore.toFixed(1) : "New";
  const scoreLabel = hasFeedback ? "NestScore" : "Awaiting feedback";
  const label = source.spaceType.toUpperCase();
  const statusLabel = source.verified ? "Verified" : source.status.toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" fill="none">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(255,255,255,0.45)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" rx="36" fill="url(#bg)" />
      <circle cx="680" cy="104" r="118" fill="rgba(255,255,255,0.12)" />
      <circle cx="136" cy="502" r="160" fill="rgba(255,255,255,0.09)" />
      <path d="M-40 500C96 432 164 380 260 378C378 376 446 452 548 462C648 472 714 432 840 358V640H-40V500Z" fill="rgba(15,23,42,0.16)" />
      <path d="M84 402C156 360 220 338 312 338C434 338 506 388 596 396C676 404 724 376 836 324V600H84V402Z" fill="rgba(255,255,255,0.14)" />
      <rect x="60" y="56" width="196" height="52" rx="26" fill="rgba(255,255,255,0.22)" />
      <text x="158" y="89" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#ffffff">Nestmate</text>
      <rect x="60" y="462" width="318" height="86" rx="28" fill="rgba(255,255,255,0.18)" />
      <text x="94" y="503" font-family="Inter, Arial, sans-serif" font-size="21" font-weight="700" fill="#ffffff">${escapeXml(source.city)}</text>
      <text x="94" y="532" font-family="Inter, Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.82)">${escapeXml(source.locality)}</text>
      <rect x="488" y="62" width="248" height="58" rx="29" fill="rgba(15,23,42,0.25)" />
      <text x="612" y="98" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff">${escapeXml(statusLabel)}</text>
      <rect x="488" y="136" width="248" height="178" rx="34" fill="rgba(15,23,42,0.24)" />
      <text x="612" y="190" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="56" font-weight="800" fill="#ffffff">${escapeXml(score)}</text>
      <text x="612" y="224" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="17" font-weight="600" fill="rgba(255,255,255,0.82)">${escapeXml(scoreLabel)}</text>
      <text x="612" y="264" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="600" letter-spacing="2" fill="rgba(255,255,255,0.75)">${escapeXml(label)}</text>
      <rect x="488" y="340" width="248" height="94" rx="28" fill="rgba(255,255,255,0.18)" />
      <text x="612" y="376" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="700" fill="#ffffff">${escapeXml(source.title)}</text>
      <text x="612" y="402" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="15" fill="rgba(255,255,255,0.82)">${escapeXml(source.locality)}, ${escapeXml(source.city)}</text>
      <rect x="60" y="154" width="136" height="40" rx="20" fill="url(#shine)" opacity="0.85" />
      <rect x="60" y="214" width="164" height="12" rx="6" fill="rgba(255,255,255,0.36)" />
      <rect x="60" y="240" width="132" height="12" rx="6" fill="rgba(255,255,255,0.28)" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}