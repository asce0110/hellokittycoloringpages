// Creative taxonomy system for AI prompt generation
export interface CategoryCombination {
  name?: string
  theme: string
  style: string
  mood: string
  difficulty: 'easy' | 'medium' | 'complex'
  description: string
  keywords: string[]
  prompt?: string
}

// Theme categories for coloring pages
export const THEME_CATEGORIES = [
  {
    name: 'Animals',
    items: ['cat', 'dog', 'butterfly', 'elephant', 'lion', 'bird', 'fish', 'horse', 'rabbit', 'bear'],
    icon: '🐾',
    description: 'Cute and friendly animals'
  },
  {
    name: 'Nature',
    items: ['flower', 'tree', 'garden', 'landscape', 'mountain', 'ocean', 'forest', 'sunset', 'rainbow', 'cloud'],
    icon: '🌿',
    description: 'Beautiful natural scenes'
  },
  {
    name: 'Fantasy',
    items: ['unicorn', 'dragon', 'castle', 'fairy', 'mermaid', 'wizard', 'magic', 'princess', 'knight', 'phoenix'],
    icon: '🦄',
    description: 'Magical and fantastical themes'
  },
  {
    name: 'Holidays',
    items: ['christmas', 'halloween', 'easter', 'valentine', 'birthday', 'thanksgiving', 'new year', 'summer', 'spring', 'winter'],
    icon: '🎄',
    description: 'Seasonal and holiday themes'
  },
  {
    name: 'Food',
    items: ['cake', 'ice cream', 'fruit', 'cupcake', 'pizza', 'candy', 'cookie', 'donut', 'burger', 'apple'],
    icon: '🍰',
    description: 'Delicious food and treats'
  },
  {
    name: 'Vehicles',
    items: ['car', 'airplane', 'train', 'boat', 'bicycle', 'motorcycle', 'truck', 'bus', 'helicopter', 'rocket'],
    icon: '🚗',
    description: 'Cars, planes, and transportation'
  }
] as const

// Style categories for artistic approaches
export const STYLE_CATEGORIES = [
  {
    name: 'Simple',
    description: 'Clean lines, easy to color',
    keywords: ['simple', 'clean', 'basic', 'minimal'],
    difficulty: 'easy'
  },
  {
    name: 'Detailed',
    description: 'Intricate patterns and fine details',
    keywords: ['detailed', 'intricate', 'complex', 'ornate'],
    difficulty: 'complex'
  },
  {
    name: 'Mandala',
    description: 'Circular patterns and symmetrical designs',
    keywords: ['mandala', 'circular', 'symmetrical', 'meditative'],
    difficulty: 'medium'
  },
  {
    name: 'Cartoon',
    description: 'Fun, animated style',
    keywords: ['cartoon', 'animated', 'cute', 'friendly'],
    difficulty: 'easy'
  },
  {
    name: 'Realistic',
    description: 'Life-like and natural appearance',
    keywords: ['realistic', 'natural', 'lifelike', 'detailed'],
    difficulty: 'complex'
  },
  {
    name: 'Geometric',
    description: 'Shapes and patterns',
    keywords: ['geometric', 'patterns', 'shapes', 'abstract'],
    difficulty: 'medium'
  }
] as const

// Mood categories for emotional expression
export const MOOD_CATEGORIES = [
  {
    name: 'Happy',
    description: 'Cheerful and uplifting',
    keywords: ['happy', 'cheerful', 'joyful', 'smiling'],
    colors: ['bright', 'vibrant', 'colorful']
  },
  {
    name: 'Peaceful',
    description: 'Calm and relaxing',
    keywords: ['peaceful', 'calm', 'serene', 'tranquil'],
    colors: ['soft', 'pastel', 'gentle']
  },
  {
    name: 'Adventurous',
    description: 'Exciting and dynamic',
    keywords: ['adventurous', 'exciting', 'dynamic', 'action'],
    colors: ['bold', 'energetic', 'striking']
  },
  {
    name: 'Cozy',
    description: 'Warm and comfortable',
    keywords: ['cozy', 'warm', 'comfortable', 'homey'],
    colors: ['warm', 'earthy', 'inviting']
  },
  {
    name: 'Mysterious',
    description: 'Intriguing and enigmatic',
    keywords: ['mysterious', 'enigmatic', 'mystical', 'shadowy'],
    colors: ['deep', 'rich', 'dramatic']
  },
  {
    name: 'Playful',
    description: 'Fun and energetic',
    keywords: ['playful', 'fun', 'energetic', 'lively'],
    colors: ['bright', 'mixed', 'dynamic']
  }
] as const

// Popular pre-defined combinations
export const POPULAR_COMBINATIONS: CategoryCombination[] = [
  {
    name: 'Happy Animals',
    theme: 'Animals',
    style: 'Simple',
    mood: 'Happy',
    difficulty: 'easy',
    description: 'Simple, happy animal designs perfect for beginners',
    keywords: ['simple animal', 'happy pet', 'easy coloring', 'kids friendly'],
    prompt: 'Create a simple, happy {animal} coloring page with clean lines and friendly expression, perfect for children'
  },
  {
    name: 'Peaceful Nature',
    theme: 'Nature',
    style: 'Detailed',
    mood: 'Peaceful',
    difficulty: 'complex',
    description: 'Intricate nature scenes for relaxation',
    keywords: ['detailed nature', 'peaceful landscape', 'adult coloring', 'relaxing'],
    prompt: 'Design a detailed, peaceful {nature} scene with intricate patterns and calming elements for adult coloring'
  },
  {
    name: 'Mystical Mandalas',
    theme: 'Fantasy',
    style: 'Mandala',
    mood: 'Mysterious',
    difficulty: 'medium',
    description: 'Fantasy-themed mandala designs',
    keywords: ['fantasy mandala', 'mysterious pattern', 'magical design', 'symmetrical'],
    prompt: 'Create a mysterious {fantasy} mandala with magical symbols and symmetrical patterns'
  },
  {
    name: 'Holiday Fun',
    theme: 'Holidays',
    style: 'Cartoon',
    mood: 'Playful',
    difficulty: 'easy',
    description: 'Fun holiday characters and scenes',
    keywords: ['holiday cartoon', 'playful celebration', 'festive fun', 'seasonal joy'],
    prompt: 'Design a playful cartoon {holiday} scene with fun characters and festive elements'
  },
  {
    name: 'Cozy Kitchen',
    theme: 'Food',
    style: 'Realistic',
    mood: 'Cozy',
    difficulty: 'complex',
    description: 'Realistic food illustrations with cozy atmosphere',
    keywords: ['realistic food', 'cozy kitchen', 'detailed treats', 'homemade'],
    prompt: 'Create a realistic, cozy {food} illustration with detailed textures and warm atmosphere'
  },
  {
    name: 'Adventure Vehicles',
    theme: 'Vehicles',
    style: 'Geometric',
    mood: 'Adventurous',
    difficulty: 'medium',
    description: 'Geometric vehicle designs with dynamic elements',
    keywords: ['geometric vehicle', 'adventurous journey', 'modern design', 'transportation'],
    prompt: 'Design an adventurous {vehicle} with geometric patterns and dynamic elements'
  }
]

// Generate a creative prompt based on selections
export function generateCreativePrompt(
  theme: string, 
  style: string, 
  mood: string,
  customSubject?: string
): string {
  const themeData = THEME_CATEGORIES.find(t => t.name === theme)
  const styleData = STYLE_CATEGORIES.find(s => s.name === style)
  const moodData = MOOD_CATEGORIES.find(m => m.name === mood)
  
  if (!themeData || !styleData || !moodData) {
    return 'Create a coloring page design'
  }
  
  // Use custom subject or random theme item
  const subject = customSubject || themeData.items[Math.floor(Math.random() * themeData.items.length)]
  
  // Build prompt components
  const styleDescriptor = styleData.keywords[0]
  const moodDescriptor = moodData.keywords[0]
  const colorHint = moodData.colors ? ` with ${moodData.colors[0]} colors` : ''
  
  return `Create a ${styleDescriptor}, ${moodDescriptor} ${subject} coloring page${colorHint}. The design should be ${styleData.description.toLowerCase()} and evoke a ${moodData.description.toLowerCase()} feeling. Perfect for ${styleData.difficulty} level coloring.`
}

// Get difficulty level for a combination
export function getDifficultyLevel(style: string): 'easy' | 'medium' | 'complex' {
  const styleData = STYLE_CATEGORIES.find(s => s.name === style)
  return styleData?.difficulty || 'medium'
}

// Get random combination
export function getRandomCombination(): CategoryCombination {
  return POPULAR_COMBINATIONS[Math.floor(Math.random() * POPULAR_COMBINATIONS.length)]
}

// Filter combinations by difficulty
export function getCombinationsByDifficulty(difficulty: 'easy' | 'medium' | 'complex'): CategoryCombination[] {
  return POPULAR_COMBINATIONS.filter(combo => combo.difficulty === difficulty)
}

// Search combinations by keyword
export function searchCombinations(query: string): CategoryCombination[] {
  const lowercaseQuery = query.toLowerCase()
  return POPULAR_COMBINATIONS.filter(combo => 
    combo.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
    combo.description.toLowerCase().includes(lowercaseQuery) ||
    combo.theme.toLowerCase().includes(lowercaseQuery) ||
    combo.style.toLowerCase().includes(lowercaseQuery) ||
    combo.mood.toLowerCase().includes(lowercaseQuery)
  )
}

export default {
  THEME_CATEGORIES,
  STYLE_CATEGORIES,
  MOOD_CATEGORIES,
  POPULAR_COMBINATIONS,
  generateCreativePrompt,
  getDifficultyLevel,
  getRandomCombination,
  getCombinationsByDifficulty,
  searchCombinations
}