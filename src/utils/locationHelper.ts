export interface LocationDetails {
  city: string;
  state: string;
  greeting: string;
  tagline: string;
  vibeTitle: string;
}

export const SUPPORTED_LOCATIONS: Record<string, LocationDetails> = {
  'Bathinda': {
    city: 'Bathinda',
    state: 'Punjab',
    greeting: 'Sat Sri Akal! 🙏',
    vibeTitle: 'Vibe in Bathinda',
    tagline: 'Connecting local talent with verified workplaces in Bathinda... zero broker fees.'
  },
  'Chandigarh': {
    city: 'Chandigarh',
    state: 'UT',
    greeting: 'Hello Chandigarh! 🌟',
    vibeTitle: 'Vibe in Chandigarh',
    tagline: 'Vibe check the coolest workspaces in the City Beautiful... direct chat.'
  },
  'Mohali': {
    city: 'Mohali',
    state: 'Punjab',
    greeting: 'Sat Sri Akal! 🙏',
    vibeTitle: 'Vibe in Mohali',
    tagline: 'Connecting Mohali\'s tech professionals directly with fast-growing startups.'
  },
  'Patiala': {
    city: 'Patiala',
    state: 'Punjab',
    greeting: 'Sat Sri Akal! 🙏',
    vibeTitle: 'Vibe in Patiala',
    tagline: 'Connecting Royal City\'s talent directly to local brands & enterprises.'
  },
  'Ludhiana': {
    city: 'Ludhiana',
    state: 'Punjab',
    greeting: 'Sat Sri Akal! 🙏',
    vibeTitle: 'Vibe in Ludhiana',
    tagline: 'Industrial giant meets next-gen careers. Vibe check Ludhiana\'s best.'
  },
  'Amritsar': {
    city: 'Amritsar',
    state: 'Punjab',
    greeting: 'Sat Sri Akal! 🙏',
    vibeTitle: 'Vibe in Amritsar',
    tagline: 'Holy City vibes meet career growth. Direct applications, zero hiring noise.'
  },
  'Jalandhar': {
    city: 'Jalandhar',
    state: 'Punjab',
    greeting: 'Sat Sri Akal! 🙏',
    vibeTitle: 'Vibe in Jalandhar',
    tagline: 'Connecting local creators and professionals with verified Jalandhar brands.'
  },
  'Delhi': {
    city: 'Delhi',
    state: 'NCR',
    greeting: 'Namaste Dilli! 🕉️',
    vibeTitle: 'Vibe in Delhi',
    tagline: 'Dilwalon ki Dilli. Connect directly with verified NCR startups... direct applications.'
  },
  'Mumbai': {
    city: 'Mumbai',
    state: 'Maharashtra',
    greeting: 'Namaskar Mumbai! 🌊',
    vibeTitle: 'Vibe in Mumbai',
    tagline: 'The city of dreams has the best vibes. Apply directly to verified workplaces.'
  },
  'Bengaluru': {
    city: 'Bengaluru',
    state: 'Karnataka',
    greeting: 'Namaskara Bengaluru! 💻',
    vibeTitle: 'Vibe in Bengaluru',
    tagline: 'Vibe check the Silicon Valley of India. Direct chat with hiring managers.'
  },
  'Hyderabad': {
    city: 'Hyderabad',
    state: 'Telangana',
    greeting: 'Adaab Hyderabad! 🏰',
    vibeTitle: 'Vibe in Hyderabad',
    tagline: 'Biryani, tech, and awesome career vibes. Connect directly, zero broker fees.'
  },
  'Kolkata': {
    city: 'Kolkata',
    state: 'West Bengal',
    greeting: 'Nomoshkar Kolkata! 🎨',
    vibeTitle: 'Vibe in Kolkata',
    tagline: 'City of Joy career vibes. Direct applications with verified local brands.'
  },
  'Chennai': {
    city: 'Chennai',
    state: 'Tamil Nadu',
    greeting: 'Vanakkam Chennai! ☕',
    vibeTitle: 'Vibe in Chennai',
    tagline: 'Filter coffee and tech vibes. Direct chat with hiring teams, zero noise.'
  }
};

export const getLocationDetails = (city: string): LocationDetails => {
  // Normalize matches (case-insensitive keys)
  const normalizedKey = Object.keys(SUPPORTED_LOCATIONS).find(
    k => k.toLowerCase() === city.toLowerCase()
  );
  if (normalizedKey) {
    return SUPPORTED_LOCATIONS[normalizedKey];
  }
  
  // Generic Fallback
  return {
    city: city || 'India',
    state: 'National',
    greeting: 'Welcome! 👋',
    vibeTitle: `Vibe in ${city || 'India'}`,
    tagline: `Connecting verified talent with local workplaces in ${city || 'India'}... direct connections.`
  };
};
