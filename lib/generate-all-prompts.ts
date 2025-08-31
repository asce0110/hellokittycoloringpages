// Generate Complete 500 AI Prompts for Coloring Pages
// Optimized for "coloring pages printable" SEO

import { AIPromptTemplate } from './ai-prompts-data'

// Helper function to generate consistent IDs
const generateId = (category: string, difficulty: string, index: number) => {
  return `${category.toLowerCase()}-${difficulty}-${index.toString().padStart(3, '0')}`
}

// Template generators for different themes
const animalTemplates = {
  easy: [
    // Domestic Animals (20)
    { base: 'cat', variations: ['sitting', 'sleeping', 'playing', 'stretching', 'face'] },
    { base: 'dog', variations: ['standing', 'sitting', 'running', 'face', 'with ball'] },
    { base: 'rabbit', variations: ['hopping', 'eating', 'sitting', 'face', 'with carrot'] },
    { base: 'hamster', variations: ['in wheel', 'eating', 'cheeks full', 'sleeping'] },
    
    // Farm Animals (20)
    { base: 'cow', variations: ['standing', 'grazing', 'face', 'with bell'] },
    { base: 'pig', variations: ['in mud', 'eating', 'sleeping', 'face'] },
    { base: 'chicken', variations: ['pecking', 'with chicks', 'laying egg', 'rooster'] },
    { base: 'sheep', variations: ['grazing', 'jumping', 'with lamb', 'fluffy'] },
    { base: 'horse', variations: ['standing', 'running', 'face', 'with foal'] },
    
    // Wild Animals (10)
    { base: 'elephant', variations: ['walking', 'trunk up', 'baby elephant'] },
    { base: 'giraffe', variations: ['eating leaves', 'standing tall', 'face'] },
    { base: 'lion', variations: ['sitting', 'roaring', 'cub playing'] },
    { base: 'monkey', variations: ['swinging', 'eating banana', 'hanging'] },
    { base: 'zebra', variations: ['standing', 'running', 'with stripes'] }
  ],
  medium: [
    // Forest Animals (25)
    { base: 'fox', variations: ['hunting', 'in den', 'with cubs', 'jumping', 'winter coat'] },
    { base: 'deer', variations: ['in meadow', 'with fawn', 'buck with antlers', 'drinking water', 'leaping'] },
    { base: 'bear', variations: ['fishing', 'with honey', 'hibernating', 'cubs playing', 'standing'] },
    { base: 'wolf', variations: ['howling', 'pack hunting', 'with pups', 'in snow', 'alpha pose'] },
    { base: 'raccoon', variations: ['washing food', 'climbing tree', 'night scene', 'family group'] },
    
    // Ocean Animals (25)
    { base: 'dolphin', variations: ['jumping', 'pod swimming', 'with trainer', 'underwater', 'playing'] },
    { base: 'whale', variations: ['breaching', 'spouting', 'with calf', 'underwater scene', 'tail flip'] },
    { base: 'octopus', variations: ['eight tentacles', 'in coral', 'changing color', 'with treasure'] },
    { base: 'sea turtle', variations: ['swimming', 'on beach', 'laying eggs', 'with fish', 'coral reef'] },
    { base: 'shark', variations: ['swimming', 'great white', 'hammerhead', 'with fish school'] },
    
    // Birds (20)
    { base: 'eagle', variations: ['soaring', 'perched', 'catching fish', 'nest with eaglets'] },
    { base: 'owl', variations: ['on branch', 'hunting', 'with owlets', 'barn owl', 'wise owl'] },
    { base: 'peacock', variations: ['tail spread', 'walking', 'in garden', 'feather detail'] },
    { base: 'parrot', variations: ['on perch', 'flying', 'tropical scene', 'talking pose'] },
    { base: 'flamingo', variations: ['standing one leg', 'group wading', 'flying', 'feeding'] }
  ],
  complex: [
    // Exotic Animals (25)
    { base: 'tiger', variations: ['stalking', 'with cubs', 'swimming', 'roaring', 'jungle scene'] },
    { base: 'leopard', variations: ['on tree', 'hunting', 'spotted pattern', 'with prey', 'resting'] },
    { base: 'cheetah', variations: ['running', 'with cubs', 'savanna scene', 'hunting gazelle'] },
    { base: 'panther', variations: ['prowling', 'night scene', 'on rock', 'jungle setting'] },
    { base: 'rhino', variations: ['charging', 'with calf', 'mud bath', 'savanna landscape'] },
    
    // Mythical Animal Hybrids (25)
    { base: 'griffin', variations: ['flying', 'guarding treasure', 'mountain perch', 'battle stance'] },
    { base: 'phoenix', variations: ['rising from ashes', 'in flight', 'fire feathers', 'rebirth scene'] },
    { base: 'dragon', variations: ['breathing fire', 'sleeping on gold', 'flying over castle', 'Chinese style', 'baby dragon'] },
    { base: 'pegasus', variations: ['flying', 'on cloud', 'with rider', 'drinking from stream'] },
    { base: 'unicorn', variations: ['in forest', 'with rainbow', 'by waterfall', 'mother and foal'] }
  ]
}

const sceneTemplates = {
  easy: [
    // Nature Scenes (10)
    { base: 'garden', variations: ['flower bed', 'vegetable patch', 'butterfly garden', 'sunflower field'] },
    { base: 'park', variations: ['playground', 'pond with ducks', 'picnic area', 'walking path'] },
    { base: 'beach', variations: ['sandcastle', 'seashells', 'beach ball', 'umbrella scene'] },
    
    // Home Scenes (10)
    { base: 'house', variations: ['simple cottage', 'with garden', 'treehouse', 'dog house'] },
    { base: 'room', variations: ['bedroom', 'kitchen', 'playroom', 'bathroom'] }
  ],
  medium: [
    // City Scenes (20)
    { base: 'city', variations: ['skyline', 'street view', 'park in city', 'busy intersection', 'neighborhood'] },
    { base: 'buildings', variations: ['school', 'library', 'fire station', 'hospital', 'police station'] },
    
    // Nature Landscapes (20)
    { base: 'mountain', variations: ['with lake', 'sunrise', 'hiking trail', 'ski slope', 'camping scene'] },
    { base: 'forest', variations: ['path through trees', 'clearing', 'autumn leaves', 'winter snow', 'spring bloom'] },
    { base: 'ocean', variations: ['waves crashing', 'sunset beach', 'lighthouse', 'sailboat', 'island view'] }
  ],
  complex: [
    // Architectural Scenes (20)
    { base: 'castle', variations: ['medieval fortress', 'fairy tale palace', 'ruins', 'drawbridge', 'throne room'] },
    { base: 'cathedral', variations: ['Gothic facade', 'rose window', 'interior nave', 'bell tower', 'cloister garden'] },
    { base: 'bridge', variations: ['suspension', 'stone arch', 'covered bridge', 'over canyon', 'Japanese style'] },
    
    // World Landmarks (20)
    { base: 'monument', variations: ['Eiffel Tower', 'Statue of Liberty', 'Big Ben', 'Taj Mahal', 'Great Wall'] },
    { base: 'ancient', variations: ['pyramid', 'Colosseum', 'Stonehenge', 'Parthenon', 'Machu Picchu'] }
  ]
}

const holidayTemplates = {
  easy: [
    // Major Holidays (40)
    { base: 'Christmas', variations: ['tree', 'Santa', 'reindeer', 'snowman', 'presents', 'stocking', 'candy cane', 'wreath'] },
    { base: 'Halloween', variations: ['pumpkin', 'ghost', 'witch hat', 'black cat', 'candy bag', 'spider', 'bat'] },
    { base: 'Easter', variations: ['bunny', 'eggs', 'basket', 'chick', 'spring flowers', 'egg hunt'] },
    { base: 'Valentine', variations: ['heart', 'cupid', 'love letter', 'roses', 'teddy bear'] },
    { base: 'Thanksgiving', variations: ['turkey', 'cornucopia', 'pilgrim hat', 'pumpkin pie'] }
  ],
  medium: [
    // Cultural Celebrations (50)
    { base: 'Birthday', variations: ['cake', 'party hats', 'balloons', 'presents pile', 'party scene'] },
    { base: 'NewYear', variations: ['fireworks', 'clock midnight', 'party', 'calendar', 'celebration'] },
    { base: 'Independence', variations: ['flag', 'fireworks', 'parade', 'liberty bell', 'eagle'] },
    { base: 'StPatricks', variations: ['shamrock', 'leprechaun', 'pot of gold', 'rainbow', 'Irish harp'] },
    { base: 'Hanukkah', variations: ['menorah', 'dreidel', 'gifts', 'Star of David', 'latkes'] },
    { base: 'Diwali', variations: ['diya lamps', 'rangoli', 'fireworks', 'sweets', 'decorations'] },
    { base: 'Chinese New Year', variations: ['lantern', 'dragon dance', 'red envelope', 'firecrackers'] }
  ],
  complex: [
    // Detailed Holiday Scenes (30)
    { base: 'Christmas Scene', variations: ['Victorian Christmas', 'North Pole workshop', 'nativity scene', 'winter village'] },
    { base: 'Halloween Scene', variations: ['haunted house', 'trick or treat street', 'costume party', 'spooky graveyard'] },
    { base: 'Cultural Festival', variations: ['carnival parade', 'harvest festival', 'winter carnival', 'summer fair'] },
    { base: 'Religious', variations: ['church service', 'temple celebration', 'mosque decoration', 'synagogue scene'] }
  ]
}

const educationalTemplates = {
  easy: [
    // Alphabet & Numbers (30)
    { base: 'alphabet', variations: Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(l => `Letter ${l} with object`) },
    { base: 'numbers', variations: Array.from({length: 10}, (_, i) => `Number ${i} with ${i} objects`) }
  ],
  medium: [
    // Science & Nature (30)
    { base: 'solar system', variations: ['planets orbit', 'moon phases', 'sun and earth', 'asteroid belt', 'space station'] },
    { base: 'weather', variations: ['rain cycle', 'cloud types', 'seasons change', 'tornado formation', 'rainbow science'] },
    { base: 'plants', variations: ['flower parts', 'tree lifecycle', 'photosynthesis', 'seed germination', 'forest layers'] },
    { base: 'animals', variations: ['food chain', 'habitats', 'lifecycle butterfly', 'migration patterns', 'adaptation'] },
    { base: 'human body', variations: ['skeleton', 'muscles', 'organs', 'senses', 'healthy habits'] }
  ],
  complex: [
    // Advanced Educational (20)
    { base: 'history', variations: ['ancient Egypt', 'Medieval times', 'Renaissance', 'Industrial revolution', 'Space age'] },
    { base: 'geography', variations: ['world map', 'continents', 'mountain ranges', 'ocean currents', 'climate zones'] },
    { base: 'chemistry', variations: ['periodic table', 'molecules', 'lab equipment', 'states of matter', 'reactions'] },
    { base: 'physics', variations: ['simple machines', 'forces', 'electricity', 'magnetism', 'light spectrum'] }
  ]
}

const fantasyTemplates = {
  easy: [
    // Magical Creatures (10)
    { base: 'fairy', variations: ['with wand', 'flower fairy', 'tooth fairy', 'flying'] },
    { base: 'mermaid', variations: ['on rock', 'underwater', 'with fish friends', 'combing hair'] },
    { base: 'wizard', variations: ['with hat', 'casting spell', 'with owl', 'potion making'] }
  ],
  medium: [
    // Fantasy Worlds (10)
    { base: 'enchanted forest', variations: ['fairy village', 'magical tree', 'mushroom houses', 'crystal cave'] },
    { base: 'underwater kingdom', variations: ['coral palace', 'sea dragon', 'treasure chest', 'Neptune throne'] },
    { base: 'sky realm', variations: ['cloud castle', 'rainbow bridge', 'flying islands', 'star palace'] }
  ],
  complex: [
    // Epic Fantasy (10)
    { base: 'dragon lair', variations: ['treasure hoard', 'mountain fortress', 'crystal cave', 'volcanic nest'] },
    { base: 'wizard tower', variations: ['spell library', 'alchemy lab', 'observatory', 'magical portal'] },
    { base: 'fairy kingdom', variations: ['throne room', 'enchanted garden', 'crystal palace', 'moonlight ball'] }
  ]
}

// Function to generate a complete prompt from template
function generatePrompt(
  base: string, 
  variation: string, 
  difficulty: 'easy' | 'medium' | 'complex',
  category: string,
  index: number
): AIPromptTemplate {
  const ageGroups = {
    easy: '3-6',
    medium: '7-10',
    complex: '11+'
  }
  
  const printTimes = {
    easy: 1,
    medium: 2,
    complex: 3
  }
  
  // Generate SEO-optimized title
  const title = `${variation} - ${difficulty === 'easy' ? 'Easy' : difficulty === 'medium' ? 'Detailed' : 'Intricate'} Coloring Page Printable`
  
  // Generate SEO-optimized description
  const description = `Free printable ${variation.toLowerCase()} coloring page for ${ageGroups[difficulty]} year olds. ${difficulty === 'easy' ? 'Simple lines perfect for beginners' : difficulty === 'medium' ? 'Moderate detail for developing skills' : 'Complex patterns for advanced colorists'}. Download and print this ${category.toLowerCase()} coloring sheet today!`
  
  // Generate AI prompt based on difficulty
  const aiPromptStyles = {
    easy: 'Simple line drawing, minimal details, thick black lines, no shading, white background, suitable for young children coloring page',
    medium: 'Detailed line art with moderate complexity, clear black outlines, some pattern work, white background, coloring page style',
    complex: 'Intricate line art with complex patterns, fine details, elaborate design elements, clear black lines, white background, advanced coloring page'
  }
  
  const aiPrompt = `${variation}, ${aiPromptStyles[difficulty]}`
  
  // Generate tags
  const tags = [
    `${base} coloring page`,
    `${variation.toLowerCase()} printable`,
    `${difficulty} coloring`,
    `${category.toLowerCase()} coloring page`,
    'free printable',
    'coloring pages printable',
    `${ageGroups[difficulty]} coloring`,
    `${base} drawing`
  ]
  
  return {
    id: generateId(category, difficulty, index),
    title,
    description,
    aiPrompt,
    category: category as any,
    difficulty,
    tags,
    estimatedPrintTime: printTimes[difficulty],
    ageGroup: ageGroups[difficulty],
    isActive: true
  }
}

// Generate all 500 prompts
export function generateAllPrompts(): AIPromptTemplate[] {
  const prompts: AIPromptTemplate[] = []
  let index = 1
  
  // EASY PROMPTS (150 total)
  // Animals - 50
  animalTemplates.easy.forEach(template => {
    template.variations.slice(0, Math.ceil(50 / animalTemplates.easy.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'easy',
        'Animals',
        index++
      ))
    })
  })
  
  // Scenes - 20
  sceneTemplates.easy.forEach(template => {
    template.variations.slice(0, Math.ceil(20 / sceneTemplates.easy.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'easy',
        'Scenes',
        index++
      ))
    })
  })
  
  // Holidays - 40
  holidayTemplates.easy.forEach(template => {
    template.variations.slice(0, Math.ceil(40 / holidayTemplates.easy.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base} ${variation}`,
        'easy',
        'Holidays',
        index++
      ))
    })
  })
  
  // Educational - 30
  educationalTemplates.easy.forEach(template => {
    if (template.base === 'alphabet') {
      template.variations.slice(0, 26).forEach(variation => {
        prompts.push(generatePrompt(
          template.base,
          variation,
          'easy',
          'Educational',
          index++
        ))
      })
    } else if (template.base === 'numbers') {
      template.variations.slice(0, 10).forEach(variation => {
        prompts.push(generatePrompt(
          template.base,
          variation,
          'easy',
          'Educational',
          index++
        ))
      })
    }
  })
  
  // Fantasy - 10
  fantasyTemplates.easy.forEach(template => {
    template.variations.slice(0, Math.ceil(10 / fantasyTemplates.easy.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'easy',
        'Fantasy',
        index++
      ))
    })
  })
  
  // MEDIUM PROMPTS (200 total)
  // Animals - 70
  animalTemplates.medium.forEach(template => {
    template.variations.slice(0, Math.ceil(70 / animalTemplates.medium.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'medium',
        'Animals',
        index++
      ))
    })
  })
  
  // Scenes - 40
  sceneTemplates.medium.forEach(template => {
    template.variations.slice(0, Math.ceil(40 / sceneTemplates.medium.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'medium',
        'Scenes',
        index++
      ))
    })
  })
  
  // Holidays - 50
  holidayTemplates.medium.forEach(template => {
    template.variations.slice(0, Math.ceil(50 / holidayTemplates.medium.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base} ${variation}`,
        'medium',
        'Holidays',
        index++
      ))
    })
  })
  
  // Educational - 30
  educationalTemplates.medium.forEach(template => {
    template.variations.slice(0, Math.ceil(30 / educationalTemplates.medium.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'medium',
        'Educational',
        index++
      ))
    })
  })
  
  // Fantasy - 10
  fantasyTemplates.medium.forEach(template => {
    template.variations.slice(0, Math.ceil(10 / fantasyTemplates.medium.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'medium',
        'Fantasy',
        index++
      ))
    })
  })
  
  // COMPLEX PROMPTS (150 total)
  // Animals - 50
  animalTemplates.complex.forEach(template => {
    template.variations.slice(0, Math.ceil(50 / animalTemplates.complex.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'complex',
        'Animals',
        index++
      ))
    })
  })
  
  // Scenes - 40
  sceneTemplates.complex.forEach(template => {
    template.variations.slice(0, Math.ceil(40 / sceneTemplates.complex.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'complex',
        'Scenes',
        index++
      ))
    })
  })
  
  // Holidays - 30
  holidayTemplates.complex.forEach(template => {
    template.variations.slice(0, Math.ceil(30 / holidayTemplates.complex.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base} ${variation}`,
        'complex',
        'Holidays',
        index++
      ))
    })
  })
  
  // Educational - 20
  educationalTemplates.complex.forEach(template => {
    template.variations.slice(0, Math.ceil(20 / educationalTemplates.complex.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'complex',
        'Educational',
        index++
      ))
    })
  })
  
  // Fantasy - 10
  fantasyTemplates.complex.forEach(template => {
    template.variations.slice(0, Math.ceil(10 / fantasyTemplates.complex.length)).forEach(variation => {
      prompts.push(generatePrompt(
        template.base,
        `${template.base.charAt(0).toUpperCase() + template.base.slice(1)} ${variation}`,
        'complex',
        'Fantasy',
        index++
      ))
    })
  })
  
  // Ensure we have exactly 500 prompts
  // If we're short, add more variations
  while (prompts.length < 500) {
    const additionalPrompts = [
      // Add seasonal variations
      generatePrompt('butterfly', 'Spring Butterfly Garden', 'easy', 'Animals', index++),
      generatePrompt('snowflake', 'Winter Snowflake Pattern', 'medium', 'Scenes', index++),
      generatePrompt('autumn leaves', 'Fall Leaf Collection', 'easy', 'Scenes', index++),
      generatePrompt('summer beach', 'Summer Beach Fun', 'medium', 'Scenes', index++),
      
      // Add more educational content
      generatePrompt('shapes', 'Basic Shapes Collection', 'easy', 'Educational', index++),
      generatePrompt('clock', 'Learning Time Clock Face', 'medium', 'Educational', index++),
      generatePrompt('money', 'Counting Coins and Bills', 'medium', 'Educational', index++),
      
      // Add more fantasy variations
      generatePrompt('robot', 'Friendly Robot Helper', 'easy', 'Fantasy', index++),
      generatePrompt('spaceship', 'Space Explorer Ship', 'medium', 'Fantasy', index++),
      generatePrompt('alien', 'Cute Alien Friend', 'easy', 'Fantasy', index++),
    ]
    
    prompts.push(...additionalPrompts.slice(0, 500 - prompts.length))
  }
  
  // Trim to exactly 500 if we went over
  return prompts.slice(0, 500)
}

// Generate statistics for the prompts
export function generatePromptStatistics() {
  const prompts = generateAllPrompts()
  
  const stats = {
    total: prompts.length,
    byCategory: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    byAgeGroup: {} as Record<string, number>
  }
  
  prompts.forEach(prompt => {
    // Category stats
    stats.byCategory[prompt.category] = (stats.byCategory[prompt.category] || 0) + 1
    
    // Difficulty stats
    stats.byDifficulty[prompt.difficulty] = (stats.byDifficulty[prompt.difficulty] || 0) + 1
    
    // Age group stats
    if (prompt.ageGroup) {
      stats.byAgeGroup[prompt.ageGroup] = (stats.byAgeGroup[prompt.ageGroup] || 0) + 1
    }
  })
  
  return stats
}

// Export the complete list
export const COMPLETE_AI_PROMPTS = generateAllPrompts()

console.log('Generated prompts statistics:', generatePromptStatistics())