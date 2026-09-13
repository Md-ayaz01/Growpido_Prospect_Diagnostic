/**
 * DEMO / FIXTURE DATASET
 * 
 * Explicitly labeled stored demonstration dataset for Abbas Sajwani.
 * This file is purely for reference fixtures / offline test comparisons.
 * It is NEVER used to bypass or short-circuit live research when a URL is submitted.
 */

export const DEMO_FIXTURE_METADATA = {
  isFixture: true,
  datasetName: 'Abbas Sajwani Reference Dataset (AHS Properties)',
  jurisdiction: 'Dubai, UAE',
  disclaimer: 'DEMO / FIXTURE DATA: Pre-curated audit dataset for baseline calibration. Live submissions execute dynamic pipeline research.'
};

export const ABBAS_SAJWANI_FIXTURE = {
  subject: {
    name: 'Abbas Sajwani',
    role: 'Founder & CEO',
    company: 'AHS Properties',
    location: 'Dubai, United Arab Emirates',
    linkedin_url: 'https://www.linkedin.com/in/abbas-sajwani/'
  },
  knownDomains: ['ahsproperties.com', 'ahstower.com']
};
