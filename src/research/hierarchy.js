/**
 * Source Hierarchy Definitions and Dynamic Classification Rules
 * 
 * TIER 1 - PRIMARY / HIGHEST TRUST
 * - Official corporate website / official domain of the subject's company
 * - Official founder biography / filings / press releases on official domain
 * - Regulatory records (DIFC, ADGM, DLD, SCA, SEC, Companies House)
 * - Official company filings and audited financial statements
 * 
 * TIER 2 - HIGH TRUST
 * - Major financial / business publications (Forbes Middle East, Bloomberg, Reuters, Financial Times)
 * - Established regional and industry news (Arabian Business, Gulf News, The National, Entrepreneur ME, TechCrunch)
 * - Official architectural / registry databases (CTBUH Skyscraper Center)
 * 
 * TIER 3 - MEDIUM TRUST
 * - Public LinkedIn content
 * - Conference / event speaker profiles
 * - Industry directories
 * 
 * TIER 4 - LOW TRUST / DISQUALIFIED
 * - Aggregators, content farms, unsourced blogs, speculative wealth posts
 * - A Tier 4 source must NEVER independently verify an important factual claim.
 */

export const SOURCE_TIERS = {
  TIER_1: {
    tier: 1,
    name: 'Primary / Highest Trust',
    description: 'Official corporate domain, regulatory filings, registered entities, verified company announcements'
  },
  TIER_2: {
    tier: 2,
    name: 'Major Business & Financial Press',
    description: 'Established publications (Forbes, Bloomberg, Reuters, Arabian Business, Gulf News, Entrepreneur)'
  },
  TIER_3: {
    tier: 3,
    name: 'Public Profiles & Industry Directory',
    description: 'Public LinkedIn profile, conference profiles, industry directories'
  },
  TIER_4: {
    tier: 4,
    name: 'Low Trust / Disqualified',
    description: 'Aggregators, unverified blogs, content farms, scraper portals (Disqualified from verification)'
  }
};

export function classifySourceTier(url, officialDomain = '') {
  if (!url) return SOURCE_TIERS.TIER_4;
  const lowerUrl = url.toLowerCase();
  const cleanDomain = officialDomain ? officialDomain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] : '';

  // Tier 1: Matches subject's official company domain or government/regulatory registries
  if (
    (cleanDomain && lowerUrl.includes(cleanDomain)) ||
    lowerUrl.includes('.gov.ae') ||
    lowerUrl.includes('dubailand.gov.ae') ||
    lowerUrl.includes('difc.ae') ||
    lowerUrl.includes('adgm.com') ||
    lowerUrl.includes('sec.gov')
  ) {
    return {
      tier: 1,
      name: 'Tier 1: Primary Source',
      type: 'official_primary',
      trusted: true
    };
  }

  // Tier 2: Reputable established news, major financial publications, established technology press
  if (
    lowerUrl.includes('forbesmiddleeast.com') ||
    lowerUrl.includes('forbes.com') ||
    lowerUrl.includes('bloomberg.com') ||
    lowerUrl.includes('reuters.com') ||
    lowerUrl.includes('ft.com') ||
    lowerUrl.includes('arabianbusiness.com') ||
    lowerUrl.includes('gulfnews.com') ||
    lowerUrl.includes('thenationalnews.com') ||
    lowerUrl.includes('entrepreneur.com') ||
    lowerUrl.includes('techcrunch.com') ||
    lowerUrl.includes('skyscrapercenter.com') ||
    lowerUrl.includes('wikipedia.org') // Reference and corroboration citation index
  ) {
    return {
      tier: 2,
      name: 'Tier 2: Major Business Publication',
      type: 'independent_publication',
      trusted: true
    };
  }

  // Tier 3: Professional profiles, conferences, trade directories
  if (
    lowerUrl.includes('linkedin.com') ||
    lowerUrl.includes('cityscape-intelligence.com') ||
    lowerUrl.includes('crunchbase.com') ||
    lowerUrl.includes('zawya.com')
  ) {
    return {
      tier: 3,
      name: 'Tier 3: Professional & Industry Profile',
      type: 'industry_profile',
      trusted: false
    };
  }

  // Tier 4: Unknown / aggregator / scraper
  return {
    tier: 4,
    name: 'Tier 4: Low Trust / Disqualified',
    type: 'unverified_aggregator',
    trusted: false
  };
}
