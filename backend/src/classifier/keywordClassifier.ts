export interface ClassifierResult {
  category: string;
  confidence: number;
  level: number; // 1=keyword, 2=fuzzy, 3=regex, 4=ml, 0=manual/uncategorized
}

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: [
    'swiggy', 'zomato', 'blinkit', 'dunzo', 'zepto', 'dominos', 'domino',
    'mcdonald', 'mcdonalds', 'kfc', 'pizza hut', 'burger king', 'subway',
    'starbucks', 'cafe coffee day', 'ccd', 'haldiram', 'bikaner',
    'restaurant', 'hotel', 'dhaba', 'biryani', 'canteen', 'mess',
    'food', 'meal', 'tiffin', 'bakery', 'sweets', 'mithai',
  ],
  Transport: [
    'uber', 'ola', 'rapido', 'namma yatri', 'bounce', 'yulu',
    'irctc', 'railway', 'indian rail', 'metro', 'dmrc', 'bmtc',
    'best bus', 'ksrtc', 'msrtc', 'redbus', 'abhibus',
    'petrol', 'diesel', 'fuel', 'hp petrol', 'indian oil', 'iocl',
    'bharat petro', 'bpcl', 'shell', 'fastag', 'toll',
    'makemytrip', 'goibibo', 'ixigo', 'cleartrip', 'indigo', 'air india',
    'spicejet', 'vistara', 'air asia',
  ],
  Entertainment: [
    'netflix', 'amazon prime', 'hotstar', 'disney', 'sony liv', 'zee5',
    'spotify', 'gaana', 'wynk', 'jio saavn', 'apple music',
    'bookmyshow', 'pvr', 'inox', 'cinepolis', 'movie', 'cinema',
    'youtube premium', 'twitch', 'gaming', 'steam',
  ],
  Utilities: [
    'electricity', 'msedcl', 'bescom', 'tpddl', 'cesc', 'tneb', 'adani elect',
    'water board', 'water tax', 'municipal',
    'airtel', 'jio', 'vi ', 'vodafone', 'idea', 'bsnl', 'mtnl',
    'broadband', 'internet', 'fiber', 'recharge', 'mobile bill',
    'piped gas', 'lpg', 'indane', 'bharat gas', 'hp gas',
    'dth', 'tatasky', 'dish tv', 'sun direct', 'videocon d2h',
  ],
  Shopping: [
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho',
    'snapdeal', 'tatacliq', 'reliance digital', 'croma', 'vijay sales',
    'dmart', 'bigbasket', 'grofers', 'jiomart', 'nature basket',
    'lifestyle', 'shoppers stop', 'pantaloons', 'westside', 'zara', 'h&m',
    'decathlon', 'puma', 'nike', 'adidas',
  ],
  Health: [
    'apollo', 'fortis', 'max hospital', 'aiims', 'manipal',
    'medplus', '1mg', 'netmeds', 'pharmeasy', 'practo',
    'pharmacy', 'medical', 'chemist', 'hospital', 'clinic', 'doctor',
    'dentist', 'pathology', 'diagnostic', 'thyrocare', 'lal path',
    'gym', 'cult fit', 'healthify', 'yoga',
  ],
  Finance: [
    'emi', 'loan', 'insurance', 'lic', 'hdfc life', 'icici pru',
    'mutual fund', 'sip', 'zerodha', 'groww', 'upstox', 'angel broking',
    'ppf', 'nps', 'rd ', 'fd ', 'fixed deposit', 'recurring deposit',
    'credit card', 'credit card bill', 'card payment',
    'tax', 'tds', 'gst', 'income tax',
  ],
  Education: [
    'byju', 'unacademy', 'vedantu', 'coursera', 'udemy', 'skillshare',
    'school fee', 'college fee', 'tuition', 'coaching', 'exam fee',
    'books', 'stationery',
  ],
  Transfers: [
    'neft', 'rtgs', 'imps', 'upi transfer', 'sent to', 'transfer to',
    'self transfer', 'own account',
  ],
};

export function keywordClassify(description: string): ClassifierResult | null {
  const desc = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword.toLowerCase())) {
        return { category, confidence: 1.0, level: 1 };
      }
    }
  }
  return null;
}
