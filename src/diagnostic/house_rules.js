/**
 * House Rule Checker for Growpido Editorial & Reputational Standards
 * 
 * House Rules:
 * 1. Zero em dashes (— or --)
 * 2. Zero hashtags (#)
 * 3. Zero AI filler vocabulary ('delve', 'tapestry', 'testament', 'beacon', 'pinnacle', 'seamlessly', 'game-changer', 'revolutionize')
 * 4. Zero unverified numbers or figures without direct source citation
 * 5. Zero unverified superlatives presented as facts
 * 
 * CRITICAL RULE: If a violation is found, BLOCK APPROVAL. Do not merely display a warning.
 */

const AI_FILLER_WORDS = [
  'delve', 'delving', 'tapestry', 'testament to', 'beacon of', 'pinnacle',
  'seamlessly', 'game-changer', 'revolutionize', 'supercharge', 'synergistic',
  'spearheading a new paradigm', 'plethora', 'groundbreaking voyage'
];

export function checkHouseRules(textOrObject) {
  const violations = [];
  const textContent = typeof textOrObject === 'string' 
    ? textOrObject 
    : JSON.stringify(textOrObject);

  // 1. Em-dash check
  if (textContent.includes('—') || textContent.includes(' – ') || textContent.includes(' -- ')) {
    violations.push({
      rule: 'NO_EM_DASHES',
      severity: 'BLOCKING',
      message: 'Found em dash or double hyphen. Growpido house style strictly prohibits em dashes.'
    });
  }

  // 2. Hashtag check
  if (/#\w+/.test(textContent)) {
    violations.push({
      rule: 'NO_HASHTAGS',
      severity: 'BLOCKING',
      message: 'Found hashtags. Executive advisory reports must never include social hashtags.'
    });
  }

  // 3. AI filler vocabulary check
  const lower = textContent.toLowerCase();
  for (const word of AI_FILLER_WORDS) {
    if (lower.includes(word)) {
      violations.push({
        rule: 'AI_FILLER_DETECTED',
        severity: 'BLOCKING',
        message: `Found prohibited AI filler phrasing: "${word}". Use direct, grounded executive language.`
      });
    }
  }

  return {
    passed: violations.length === 0,
    canApprove: violations.length === 0,
    violations
  };
}
