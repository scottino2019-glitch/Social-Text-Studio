export interface FontInfo {
  name: string;
  family: string;
  category: 'Viral & Impact' | 'Artistic & Display' | 'Retro & Vintage' | 'Cursive & Script' | 'Cyber & Tech' | 'Luxury & Serif';
  popularOn: 'TikTok' | 'Instagram' | 'Universal';
  previewText: string;
}

export const FONTS_LIST: FontInfo[] = [
  // Viral & Impact (High engagement TikTok & Reels)
  {
    name: 'Anton',
    family: "'Anton', sans-serif",
    category: 'Viral & Impact',
    popularOn: 'TikTok',
    previewText: 'VIRAL HOOK',
  },
  {
    name: 'Bebas Neue',
    family: "'Bebas Neue', sans-serif",
    category: 'Viral & Impact',
    popularOn: 'Universal',
    previewText: 'TRENDING NOW',
  },
  {
    name: 'Montserrat 900',
    family: "'Montserrat', sans-serif",
    category: 'Viral & Impact',
    popularOn: 'Universal',
    previewText: 'BOLD STATEMENT',
  },
  {
    name: 'Syne 800',
    family: "'Syne', sans-serif",
    category: 'Viral & Impact',
    popularOn: 'Instagram',
    previewText: 'AESTHETIC VIBE',
  },
  {
    name: 'Russo One',
    family: "'Russo One', sans-serif",
    category: 'Viral & Impact',
    popularOn: 'TikTok',
    previewText: 'EXTREME POWER',
  },
  {
    name: 'Notable',
    family: "'Notable', sans-serif",
    category: 'Viral & Impact',
    popularOn: 'Instagram',
    previewText: 'HEADLINE',
  },

  // Retro & Vintage
  {
    name: 'Bungee Shade',
    family: "'Bungee Shade', cursive",
    category: 'Retro & Vintage',
    popularOn: 'TikTok',
    previewText: 'RETRO 80S',
  },
  {
    name: 'Monoton',
    family: "'Monoton', cursive",
    category: 'Retro & Vintage',
    popularOn: 'Instagram',
    previewText: 'DISCO GLOW',
  },
  {
    name: 'Righteous',
    family: "'Righteous', cursive",
    category: 'Retro & Vintage',
    popularOn: 'Universal',
    previewText: 'SYNTHWAVE',
  },
  {
    name: 'Shrikhand',
    family: "'Shrikhand', cursive",
    category: 'Retro & Vintage',
    popularOn: 'TikTok',
    previewText: 'GROOVY POP',
  },
  {
    name: 'Special Elite',
    family: "'Special Elite', cursive",
    category: 'Retro & Vintage',
    popularOn: 'Instagram',
    previewText: 'TYPEWRITER',
  },

  // Cursive & Script
  {
    name: 'Dancing Script',
    family: "'Dancing Script', cursive",
    category: 'Cursive & Script',
    popularOn: 'Instagram',
    previewText: 'Sweet Moments',
  },
  {
    name: 'Pacifico',
    family: "'Pacifico', cursive",
    category: 'Cursive & Script',
    popularOn: 'Universal',
    previewText: 'Summer Vibes',
  },
  {
    name: 'Great Vibes',
    family: "'Great Vibes', cursive",
    category: 'Cursive & Script',
    popularOn: 'Instagram',
    previewText: 'Elegance Love',
  },
  {
    name: 'Sacramento',
    family: "'Sacramento', cursive",
    category: 'Cursive & Script',
    popularOn: 'Instagram',
    previewText: 'Golden Hour',
  },
  {
    name: 'Caveat',
    family: "'Caveat', cursive",
    category: 'Cursive & Script',
    popularOn: 'TikTok',
    previewText: 'Handwritten notes',
  },
  {
    name: 'Satisfy',
    family: "'Satisfy', cursive",
    category: 'Cursive & Script',
    popularOn: 'Instagram',
    previewText: 'Daily Bliss',
  },

  // Cyber & Tech
  {
    name: 'Orbitron',
    family: "'Orbitron', sans-serif",
    category: 'Cyber & Tech',
    popularOn: 'TikTok',
    previewText: 'CYBERPUNK 2099',
  },
  {
    name: 'Rubik Glitch',
    family: "'Rubik Glitch', cursive",
    category: 'Cyber & Tech',
    popularOn: 'TikTok',
    previewText: 'SYSTEM GLITCH',
  },
  {
    name: 'Press Start 2P',
    family: "'Press Start 2P', cursive",
    category: 'Cyber & Tech',
    popularOn: 'Universal',
    previewText: 'PIXEL GAME',
  },
  {
    name: 'Silkscreen',
    family: "'Silkscreen', cursive",
    category: 'Cyber & Tech',
    popularOn: 'Universal',
    previewText: 'ARCADE 8-BIT',
  },
  {
    name: 'VT323',
    family: "'VT323', monospace",
    category: 'Cyber & Tech',
    popularOn: 'TikTok',
    previewText: 'TERMINAL CODE',
  },

  // Luxury & Serif
  {
    name: 'Playfair Display',
    family: "'Playfair Display', serif",
    category: 'Luxury & Serif',
    popularOn: 'Instagram',
    previewText: 'LUXURY EDIT',
  },
  {
    name: 'Cinzel Decorative',
    family: "'Cinzel Decorative', serif",
    category: 'Luxury & Serif',
    popularOn: 'Instagram',
    previewText: 'ROYAL NOIR',
  },
  {
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    category: 'Luxury & Serif',
    popularOn: 'Universal',
    previewText: 'MINIMAL MODERN',
  },

  // Artistic & Display
  {
    name: 'Permanent Marker',
    family: "'Permanent Marker', cursive",
    category: 'Artistic & Display',
    popularOn: 'TikTok',
    previewText: 'GRAFFITI TAG',
  },
  {
    name: 'Fredoka',
    family: "'Fredoka', sans-serif",
    category: 'Artistic & Display',
    popularOn: 'TikTok',
    previewText: 'BUBBLE POP',
  },
  {
    name: 'Lobster',
    family: "'Lobster', cursive",
    category: 'Artistic & Display',
    popularOn: 'Universal',
    previewText: 'Creative Art',
  },
  {
    name: 'Creepster',
    family: "'Creepster', cursive",
    category: 'Artistic & Display',
    popularOn: 'TikTok',
    previewText: 'SPOOKY HORROR',
  },
  {
    name: 'UnifrakturMaguntia',
    family: "'UnifrakturMaguntia', cursive",
    category: 'Artistic & Display',
    popularOn: 'Instagram',
    previewText: 'Gothic Dark',
  },
  {
    name: 'Faster One',
    family: "'Faster One', cursive",
    category: 'Artistic & Display',
    popularOn: 'Universal',
    previewText: 'SPEED RACER',
  },
];
