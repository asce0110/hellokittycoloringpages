// AI Coloring Pages Prompt Templates - 500 Original Designs
// Optimized for "coloring pages printable" SEO

export interface AIPromptTemplate {
  id: string
  title: string // SEO优化标题
  description: string // SEO优化描述  
  aiPrompt: string // AI生成提示词
  category: 'Animals' | 'Scenes' | 'Holidays' | 'Educational' | 'Fantasy'
  difficulty: 'easy' | 'medium' | 'complex'
  tags: string[] // 长尾关键词
  estimatedPrintTime?: number // 分钟
  ageGroup?: string
  isActive: boolean
}

// Helper function to generate consistent IDs
const generateId = (category: string, difficulty: string, index: number) => {
  return `${category.toLowerCase()}-${difficulty}-${index.toString().padStart(3, '0')}`
}

// EASY DIFFICULTY - 150 prompts
// Designed for ages 3-6, simple shapes, minimal details

const easyAnimals: AIPromptTemplate[] = [
  // Cats (10)
  {
    id: generateId('animals', 'easy', 1),
    title: "Simple Cat Coloring Page - Free Printable for Kids",
    description: "Easy cat coloring page printable for preschoolers. Simple lines perfect for little hands learning to color.",
    aiPrompt: "Simple line drawing of a cute cartoon cat sitting, minimal details, thick black lines, no shading, white background, suitable for young children coloring page",
    category: 'Animals',
    difficulty: 'easy',
    tags: ['cat coloring page', 'easy animal coloring', 'preschool printable', 'simple cat drawing'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  {
    id: generateId('animals', 'easy', 2),
    title: "Happy Kitten Face - Printable Coloring Sheet",
    description: "Adorable kitten face coloring page printable with simple features. Perfect for toddlers and beginners.",
    aiPrompt: "Large cartoon cat face with simple features, round eyes, triangle nose, smiling mouth, thick black outlines, white background, coloring page style",
    category: 'Animals',
    difficulty: 'easy',
    tags: ['kitten coloring', 'cat face drawing', 'toddler activity', 'simple animal face'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  {
    id: generateId('animals', 'easy', 3),
    title: "Sleeping Cat - Easy Coloring Page to Print",
    description: "Peaceful sleeping cat coloring page printable. Simple curved lines make it perfect for young children.",
    aiPrompt: "Simple line art of sleeping cat curled up in a ball, minimal details, thick black outlines, white background, easy coloring page for children",
    category: 'Animals',
    difficulty: 'easy',
    tags: ['sleeping cat', 'calm coloring page', 'bedtime activity', 'easy cat pose'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Dogs (10)
  {
    id: generateId('animals', 'easy', 4),
    title: "Cute Puppy - Simple Coloring Page Printable",
    description: "Easy puppy coloring page printable for kids. Big simple shapes perfect for first-time colorers.",
    aiPrompt: "Simple cartoon puppy sitting, big round head, floppy ears, thick black lines, minimal details, white background, children's coloring page",
    category: 'Animals',
    difficulty: 'easy',
    tags: ['puppy coloring', 'dog printable', 'easy pets', 'preschool dog'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  {
    id: generateId('animals', 'easy', 5),
    title: "Happy Dog Face - Free Printable Coloring Page",
    description: "Smiling dog face coloring page printable with simple features. Great for teaching emotions and animals.",
    aiPrompt: "Large cartoon dog face, round eyes, big nose, tongue out, simple features, thick black outlines, white background, coloring page",
    category: 'Animals',
    difficulty: 'easy',
    tags: ['dog face', 'happy animal', 'emotion learning', 'simple dog drawing'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Rabbits (10)
  {
    id: generateId('animals', 'easy', 6),
    title: "Simple Bunny - Easter Coloring Page Printable",
    description: "Easy bunny rabbit coloring page printable perfect for Easter or anytime. Simple design for young kids.",
    aiPrompt: "Simple cartoon bunny sitting upright, long ears, round body, thick black lines, minimal details, white background, coloring page",
    category: 'Animals',
    difficulty: 'easy',
    tags: ['bunny coloring', 'rabbit printable', 'Easter activity', 'simple bunny'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  {
    id: generateId('animals', 'easy', 7),
    title: "Hopping Rabbit - Kids Coloring Page to Print",
    description: "Active bunny hopping coloring page printable. Simple motion lines make it fun and easy to color.",
    aiPrompt: "Simple line drawing of bunny mid-hop, curved motion lines, thick black outlines, minimal details, white background, coloring page",
    category: 'Animals',
    difficulty: 'easy',
    tags: ['hopping bunny', 'action coloring', 'movement drawing', 'active rabbit'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Birds (10)
  {
    id: generateId('animals', 'easy', 8),
    title: "Round Bird - Simple Coloring Page Printable",
    description: "Cute round bird coloring page printable for toddlers. Basic shapes make coloring easy and fun.",
    aiPrompt: "Simple round bird perched on branch, circular body, small beak, thick black lines, minimal details, white background, coloring page",
    category: 'Animals',
    difficulty: 'easy',
    tags: ['bird coloring', 'simple bird', 'nature printable', 'round shapes'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  {
    id: generateId('animals', 'easy', 9),
    title: "Flying Bird - Easy Printable Coloring Sheet",
    description: "Simple flying bird coloring page printable with spread wings. Perfect for teaching about birds and flight.",
    aiPrompt: "Simple bird in flight, spread wings in V-shape, minimal body details, thick black outlines, white background, coloring page",
    category: 'Animals',
    difficulty: 'easy',
    tags: ['flying bird', 'wings spread', 'sky animal', 'simple flight'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Fish (10)
  {
    id: generateId('animals', 'easy', 10),
    title: "Simple Fish - Ocean Coloring Page Printable",
    description: "Easy fish coloring page printable for kids learning about ocean animals. Big simple shapes to color.",
    aiPrompt: "Simple cartoon fish with round body, triangle tail, big eye, thick black lines, minimal details, white background, coloring page",
    category: 'Animals',
    difficulty: 'easy',
    tags: ['fish coloring', 'ocean animal', 'sea creature', 'simple fish'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Add more easy animals to reach 50 total...
]

const easyScenes: AIPromptTemplate[] = [
  // Gardens (5)
  {
    id: generateId('scenes', 'easy', 51),
    title: "Simple Garden - Nature Coloring Page Printable",
    description: "Easy garden scene coloring page printable with flowers and sun. Perfect for spring activities.",
    aiPrompt: "Simple garden scene with 3-4 large flowers, smiling sun, grass line, thick black outlines, minimal details, coloring page",
    category: 'Scenes',
    difficulty: 'easy',
    tags: ['garden coloring', 'flower scene', 'nature printable', 'spring activity'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Beach (5)
  {
    id: generateId('scenes', 'easy', 56),
    title: "Beach Day - Simple Coloring Page to Print",
    description: "Easy beach scene coloring page printable with sun, waves, and sandcastle. Summer fun for kids.",
    aiPrompt: "Simple beach scene with wavy water lines, round sun, basic sandcastle, thick black lines, minimal details, coloring page",
    category: 'Scenes',
    difficulty: 'easy',
    tags: ['beach coloring', 'summer scene', 'ocean printable', 'sandcastle drawing'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Add more easy scenes to reach 20 total...
]

const easyHolidays: AIPromptTemplate[] = [
  // Christmas (10)
  {
    id: generateId('holidays', 'easy', 71),
    title: "Simple Christmas Tree - Holiday Coloring Page Printable",
    description: "Easy Christmas tree coloring page printable for kids. Basic triangular shape with star on top.",
    aiPrompt: "Simple triangular Christmas tree, star on top, few round ornaments, thick black lines, minimal details, coloring page",
    category: 'Holidays',
    difficulty: 'easy',
    tags: ['Christmas coloring', 'holiday tree', 'winter printable', 'simple Christmas'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  {
    id: generateId('holidays', 'easy', 72),
    title: "Santa Face - Easy Christmas Coloring Printable",
    description: "Simple Santa Claus face coloring page printable. Big features make it perfect for young children.",
    aiPrompt: "Large Santa face with round features, simple beard, hat with pompom, thick black outlines, minimal details, coloring page",
    category: 'Holidays',
    difficulty: 'easy',
    tags: ['Santa coloring', 'Christmas face', 'holiday character', 'simple Santa'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Halloween (10)
  {
    id: generateId('holidays', 'easy', 81),
    title: "Happy Pumpkin - Halloween Coloring Page Printable",
    description: "Easy jack-o'-lantern coloring page printable for Halloween. Simple face design for little ones.",
    aiPrompt: "Simple pumpkin with triangle eyes and nose, smiling mouth, thick black lines, minimal details, coloring page",
    category: 'Holidays',
    difficulty: 'easy',
    tags: ['Halloween coloring', 'pumpkin printable', 'jack-o-lantern', 'simple Halloween'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Add more easy holidays to reach 40 total...
]

const easyEducational: AIPromptTemplate[] = [
  // Letters (10)
  {
    id: generateId('educational', 'easy', 111),
    title: "Letter A with Apple - Alphabet Coloring Page Printable",
    description: "Educational letter A coloring page printable with simple apple illustration. Perfect for learning ABCs.",
    aiPrompt: "Large capital letter A with simple apple drawing beside it, thick black outlines, minimal details, coloring page",
    category: 'Educational',
    difficulty: 'easy',
    tags: ['alphabet coloring', 'letter A', 'apple drawing', 'ABC printable'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Numbers (10)
  {
    id: generateId('educational', 'easy', 121),
    title: "Number 1 with One Sun - Counting Coloring Page Printable",
    description: "Easy number 1 coloring page printable with one sun. Great for teaching numbers and counting.",
    aiPrompt: "Large number 1 with one simple smiling sun, thick black outlines, minimal details, coloring page",
    category: 'Educational',
    difficulty: 'easy',
    tags: ['number coloring', 'counting activity', 'number one', 'math printable'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Shapes (10)
  {
    id: generateId('educational', 'easy', 131),
    title: "Circle Shape - Geometry Coloring Page Printable",
    description: "Simple circle shape coloring page printable for teaching basic geometry to preschoolers.",
    aiPrompt: "Large circle with the word CIRCLE inside, thick black outline, minimal details, coloring page",
    category: 'Educational',
    difficulty: 'easy',
    tags: ['shape coloring', 'circle printable', 'geometry basics', 'shape learning'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Add more easy educational to reach 30 total...
]

const easyFantasy: AIPromptTemplate[] = [
  // Unicorns (5)
  {
    id: generateId('fantasy', 'easy', 141),
    title: "Simple Unicorn - Magic Coloring Page Printable",
    description: "Easy unicorn coloring page printable for kids who love magical creatures. Simple design with horn and mane.",
    aiPrompt: "Simple cartoon unicorn standing, spiral horn, flowing mane, thick black lines, minimal details, coloring page",
    category: 'Fantasy',
    difficulty: 'easy',
    tags: ['unicorn coloring', 'magical animal', 'fantasy printable', 'simple unicorn'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Fairies (5)
  {
    id: generateId('fantasy', 'easy', 146),
    title: "Little Fairy - Simple Fantasy Coloring Printable",
    description: "Easy fairy coloring page printable with simple wings and dress. Perfect for imaginative play.",
    aiPrompt: "Simple fairy with round head, triangle dress, butterfly wings, thick black lines, minimal details, coloring page",
    category: 'Fantasy',
    difficulty: 'easy',
    tags: ['fairy coloring', 'magical being', 'wings printable', 'simple fairy'],
    estimatedPrintTime: 1,
    ageGroup: '3-6',
    isActive: true
  },
  // Add more easy fantasy to reach 10 total...
]

// MEDIUM DIFFICULTY - 200 prompts
// Designed for ages 7-10, moderate details, some patterns

const mediumAnimals: AIPromptTemplate[] = [
  // Forest Animals (20)
  {
    id: generateId('animals', 'medium', 151),
    title: "Forest Fox - Detailed Animal Coloring Page Printable",
    description: "Medium difficulty fox coloring page printable with forest background. Perfect for elementary school kids.",
    aiPrompt: "Detailed fox sitting in forest clearing, fur texture lines, trees in background, leaves on ground, clear black outlines, coloring page style",
    category: 'Animals',
    difficulty: 'medium',
    tags: ['fox coloring', 'forest animal', 'woodland printable', 'detailed fox'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  {
    id: generateId('animals', 'medium', 152),
    title: "Deer Family - Nature Scene Coloring Page to Print",
    description: "Beautiful deer family coloring page printable with moderate detail. Great for nature lovers.",
    aiPrompt: "Adult deer with fawn in meadow, antlers with detail, grass and flowers, trees in background, clear black lines, coloring page",
    category: 'Animals',
    difficulty: 'medium',
    tags: ['deer coloring', 'animal family', 'nature scene', 'wildlife printable'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  // Ocean Animals (20)
  {
    id: generateId('animals', 'medium', 171),
    title: "Dolphin Pod - Ocean Life Coloring Page Printable",
    description: "Playful dolphins coloring page printable with ocean waves. Medium complexity for developing skills.",
    aiPrompt: "Three dolphins jumping from waves, water splashes, underwater coral visible, clear black outlines, coloring page style",
    category: 'Animals',
    difficulty: 'medium',
    tags: ['dolphin coloring', 'ocean mammals', 'marine life', 'sea printable'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  // Add more medium animals to reach 70 total...
]

const mediumScenes: AIPromptTemplate[] = [
  // City Scenes (15)
  {
    id: generateId('scenes', 'medium', 221),
    title: "City Street - Urban Coloring Page Printable",
    description: "Detailed city street coloring page printable with buildings and cars. Great for learning about urban life.",
    aiPrompt: "City street with 3-4 buildings of different heights, parked cars, street lamps, sidewalk details, clear black lines, coloring page",
    category: 'Scenes',
    difficulty: 'medium',
    tags: ['city coloring', 'urban scene', 'buildings printable', 'street view'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  // Farm Scenes (15)
  {
    id: generateId('scenes', 'medium', 236),
    title: "Farm Life - Country Coloring Page to Print",
    description: "Charming farm scene coloring page printable with barn and animals. Perfect for learning about agriculture.",
    aiPrompt: "Farm scene with barn, silo, fence, few farm animals, tractor in field, rolling hills, clear black outlines, coloring page",
    category: 'Scenes',
    difficulty: 'medium',
    tags: ['farm coloring', 'country life', 'barn printable', 'rural scene'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  // Add more medium scenes to reach 40 total...
]

const mediumHolidays: AIPromptTemplate[] = [
  // Thanksgiving (15)
  {
    id: generateId('holidays', 'medium', 261),
    title: "Thanksgiving Feast - Holiday Coloring Page Printable",
    description: "Detailed Thanksgiving table coloring page printable with traditional foods. Celebrate with coloring!",
    aiPrompt: "Thanksgiving table with turkey, pumpkin pie, corn, autumn leaves decoration, detailed food items, clear black lines, coloring page",
    category: 'Holidays',
    difficulty: 'medium',
    tags: ['Thanksgiving coloring', 'feast printable', 'autumn holiday', 'turkey dinner'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  // Easter (15)
  {
    id: generateId('holidays', 'medium', 276),
    title: "Easter Basket - Spring Holiday Coloring Printable",
    description: "Decorated Easter basket coloring page printable filled with eggs and flowers. Spring celebration activity.",
    aiPrompt: "Woven Easter basket with decorated eggs, ribbon bow, spring flowers around, pattern details, clear black lines, coloring page",
    category: 'Holidays',
    difficulty: 'medium',
    tags: ['Easter coloring', 'basket printable', 'spring holiday', 'egg decorating'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  // Add more medium holidays to reach 50 total...
]

const mediumEducational: AIPromptTemplate[] = [
  // Solar System (10)
  {
    id: generateId('educational', 'medium', 311),
    title: "Solar System - Space Education Coloring Page Printable",
    description: "Educational solar system coloring page printable with all planets. Learn astronomy while coloring!",
    aiPrompt: "Solar system with sun in center, 8 planets in orbits, planet names labeled, asteroid belt, clear black lines, coloring page",
    category: 'Educational',
    difficulty: 'medium',
    tags: ['solar system', 'planets coloring', 'space education', 'astronomy printable'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  // World Map (10)
  {
    id: generateId('educational', 'medium', 321),
    title: "World Map - Geography Coloring Page to Print",
    description: "Simplified world map coloring page printable for geography lessons. Learn continents and oceans.",
    aiPrompt: "Simplified world map with continent outlines, major oceans labeled, compass rose, clear black borders, coloring page",
    category: 'Educational',
    difficulty: 'medium',
    tags: ['world map', 'geography coloring', 'continents printable', 'ocean learning'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  // Add more medium educational to reach 30 total...
]

const mediumFantasy: AIPromptTemplate[] = [
  // Dragons (10)
  {
    id: generateId('fantasy', 'medium', 341),
    title: "Friendly Dragon - Fantasy Creature Coloring Page Printable",
    description: "Detailed dragon coloring page printable with scales and wings. Adventure awaits in this fantasy scene!",
    aiPrompt: "Friendly dragon with detailed scales, spread wings, sitting on rock, some clouds, clear black outlines, coloring page style",
    category: 'Fantasy',
    difficulty: 'medium',
    tags: ['dragon coloring', 'fantasy creature', 'mythical printable', 'dragon scales'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  // Castles (10)
  {
    id: generateId('fantasy', 'medium', 351),
    title: "Medieval Castle - Kingdom Coloring Page to Print",
    description: "Majestic castle coloring page printable with towers and flags. Build your own fairy tale kingdom!",
    aiPrompt: "Medieval castle with multiple towers, flags, drawbridge, moat, stone texture details, clear black lines, coloring page",
    category: 'Fantasy',
    difficulty: 'medium',
    tags: ['castle coloring', 'medieval printable', 'kingdom scene', 'fortress drawing'],
    estimatedPrintTime: 2,
    ageGroup: '7-10',
    isActive: true
  },
  // Add more medium fantasy to reach 10 total...
]

// COMPLEX DIFFICULTY - 150 prompts
// Designed for ages 11+, intricate details, advanced patterns

const complexAnimals: AIPromptTemplate[] = [
  // Wildlife Portraits (20)
  {
    id: generateId('animals', 'complex', 351),
    title: "Lion Portrait - Advanced Animal Coloring Page Printable",
    description: "Intricate lion portrait coloring page printable with detailed mane. Challenge yourself with this majestic design!",
    aiPrompt: "Detailed lion head portrait, intricate mane with flowing hair patterns, intense eyes, whiskers, complex line work, coloring page",
    category: 'Animals',
    difficulty: 'complex',
    tags: ['lion coloring', 'animal portrait', 'detailed mane', 'advanced printable'],
    estimatedPrintTime: 3,
    ageGroup: '11+',
    isActive: true
  },
  {
    id: generateId('animals', 'complex', 352),
    title: "Elephant Mandala - Intricate Coloring Page to Print",
    description: "Complex elephant with mandala patterns coloring page printable. Meditation through detailed coloring.",
    aiPrompt: "Elephant decorated with intricate mandala patterns, geometric designs on body, detailed trunk and tusks, ornate background, coloring page",
    category: 'Animals',
    difficulty: 'complex',
    tags: ['elephant mandala', 'pattern coloring', 'zentangle animal', 'meditation printable'],
    estimatedPrintTime: 4,
    ageGroup: '11+',
    isActive: true
  },
  // Birds of Paradise (15)
  {
    id: generateId('animals', 'complex', 371),
    title: "Peacock Display - Ornate Bird Coloring Page Printable",
    description: "Elaborate peacock coloring page printable with full tail display. Intricate feather patterns for advanced colorists.",
    aiPrompt: "Peacock with fully spread tail, intricate eye patterns on each feather, detailed body feathers, ornate background elements, coloring page",
    category: 'Animals',
    difficulty: 'complex',
    tags: ['peacock coloring', 'feather patterns', 'ornate bird', 'complex printable'],
    estimatedPrintTime: 4,
    ageGroup: '11+',
    isActive: true
  },
  // Add more complex animals to reach 50 total...
]

const complexScenes: AIPromptTemplate[] = [
  // Architectural Wonders (20)
  {
    id: generateId('scenes', 'complex', 401),
    title: "Gothic Cathedral - Architectural Coloring Page Printable",
    description: "Intricate Gothic cathedral coloring page printable with detailed stonework. Architectural masterpiece to color!",
    aiPrompt: "Elaborate Gothic cathedral facade, rose window with complex patterns, flying buttresses, detailed stone carvings, ornate doorways, coloring page",
    category: 'Scenes',
    difficulty: 'complex',
    tags: ['cathedral coloring', 'Gothic architecture', 'detailed building', 'architectural printable'],
    estimatedPrintTime: 5,
    ageGroup: '11+',
    isActive: true
  },
  // Japanese Gardens (15)
  {
    id: generateId('scenes', 'complex', 421),
    title: "Japanese Garden - Zen Landscape Coloring Page to Print",
    description: "Detailed Japanese garden coloring page printable with pagoda and bridge. Find peace in intricate details.",
    aiPrompt: "Japanese garden with pagoda, arched bridge over koi pond, cherry blossoms, stone lanterns, detailed landscaping, coloring page",
    category: 'Scenes',
    difficulty: 'complex',
    tags: ['Japanese garden', 'zen coloring', 'pagoda printable', 'oriental landscape'],
    estimatedPrintTime: 4,
    ageGroup: '11+',
    isActive: true
  },
  // Add more complex scenes to reach 40 total...
]

const complexHolidays: AIPromptTemplate[] = [
  // Day of the Dead (10)
  {
    id: generateId('holidays', 'complex', 441),
    title: "Sugar Skull - Dia de los Muertos Coloring Page Printable",
    description: "Ornate sugar skull coloring page printable with traditional patterns. Celebrate Day of the Dead with art!",
    aiPrompt: "Elaborate sugar skull with floral patterns, geometric designs, roses, hearts, intricate decorative elements, coloring page",
    category: 'Holidays',
    difficulty: 'complex',
    tags: ['sugar skull', 'Day of Dead', 'Mexican holiday', 'ornate skull'],
    estimatedPrintTime: 4,
    ageGroup: '11+',
    isActive: true
  },
  // Chinese New Year (10)
  {
    id: generateId('holidays', 'complex', 451),
    title: "Chinese Dragon - New Year Coloring Page Printable",
    description: "Complex Chinese dragon coloring page printable for Lunar New Year. Traditional design with intricate scales.",
    aiPrompt: "Traditional Chinese dragon with detailed scales, flowing whiskers, ornate clouds, pearls, complex pattern work, coloring page",
    category: 'Holidays',
    difficulty: 'complex',
    tags: ['Chinese dragon', 'Lunar New Year', 'Asian holiday', 'dragon scales'],
    estimatedPrintTime: 5,
    ageGroup: '11+',
    isActive: true
  },
  // Add more complex holidays to reach 30 total...
]

const complexEducational: AIPromptTemplate[] = [
  // Human Anatomy (10)
  {
    id: generateId('educational', 'complex', 471),
    title: "Human Heart - Anatomy Education Coloring Page Printable",
    description: "Detailed anatomical heart coloring page printable for biology students. Learn while you color!",
    aiPrompt: "Anatomically accurate human heart cross-section, labeled chambers and vessels, detailed muscle structure, educational diagram, coloring page",
    category: 'Educational',
    difficulty: 'complex',
    tags: ['heart anatomy', 'biology coloring', 'medical printable', 'educational diagram'],
    estimatedPrintTime: 3,
    ageGroup: '11+',
    isActive: true
  },
  // Historical Architecture (10)
  {
    id: generateId('educational', 'complex', 481),
    title: "Roman Colosseum - History Coloring Page to Print",
    description: "Detailed Colosseum coloring page printable for history enthusiasts. Ancient architecture in intricate detail.",
    aiPrompt: "Roman Colosseum with detailed arches, multiple levels, stone textures, architectural accuracy, historical details, coloring page",
    category: 'Educational',
    difficulty: 'complex',
    tags: ['Colosseum coloring', 'Roman history', 'ancient architecture', 'historical printable'],
    estimatedPrintTime: 5,
    ageGroup: '11+',
    isActive: true
  },
  // Add more complex educational to reach 20 total...
]

const complexFantasy: AIPromptTemplate[] = [
  // Mythological Creatures (10)
  {
    id: generateId('fantasy', 'complex', 491),
    title: "Phoenix Rising - Mythical Bird Coloring Page Printable",
    description: "Majestic phoenix coloring page printable with intricate feathers and flames. Rise from the ashes with art!",
    aiPrompt: "Phoenix with elaborate feather details, swirling flames, intricate wing patterns, decorative tail feathers, mystical elements, coloring page",
    category: 'Fantasy',
    difficulty: 'complex',
    tags: ['phoenix coloring', 'mythical bird', 'fire creature', 'fantasy printable'],
    estimatedPrintTime: 4,
    ageGroup: '11+',
    isActive: true
  },
  // Steampunk Designs (10)
  {
    id: generateId('fantasy', 'complex', 501),
    title: "Steampunk Airship - Victorian Fantasy Coloring Page",
    description: "Intricate steampunk airship coloring page printable with gears and pipes. Victorian engineering meets imagination!",
    aiPrompt: "Elaborate steampunk airship with complex gear mechanisms, pipes, propellers, Victorian decorations, brass fittings, coloring page",
    category: 'Fantasy',
    difficulty: 'complex',
    tags: ['steampunk coloring', 'airship printable', 'Victorian fantasy', 'mechanical design'],
    estimatedPrintTime: 5,
    ageGroup: '11+',
    isActive: true
  },
  // Add remaining complex fantasy...
]

// Combine all prompts
export const AI_PROMPTS: AIPromptTemplate[] = [
  ...easyAnimals,
  ...easyScenes,
  ...easyHolidays,
  ...easyEducational,
  ...easyFantasy,
  ...mediumAnimals,
  ...mediumScenes,
  ...mediumHolidays,
  ...mediumEducational,
  ...mediumFantasy,
  ...complexAnimals,
  ...complexScenes,
  ...complexHolidays,
  ...complexEducational,
  ...complexFantasy
]

// Helper functions for filtering and searching
export function getPromptsByCategory(category: AIPromptTemplate['category']): AIPromptTemplate[] {
  return AI_PROMPTS.filter(p => p.category === category && p.isActive)
}

export function getPromptsByDifficulty(difficulty: AIPromptTemplate['difficulty']): AIPromptTemplate[] {
  return AI_PROMPTS.filter(p => p.difficulty === difficulty && p.isActive)
}

export function getPromptsByAgeGroup(ageGroup: string): AIPromptTemplate[] {
  return AI_PROMPTS.filter(p => p.ageGroup === ageGroup && p.isActive)
}

export function searchPrompts(query: string): AIPromptTemplate[] {
  const searchTerm = query.toLowerCase()
  return AI_PROMPTS.filter(p => 
    p.isActive && (
      p.title.toLowerCase().includes(searchTerm) ||
      p.description.toLowerCase().includes(searchTerm) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  )
}

export function getRandomPrompt(
  filters?: {
    category?: AIPromptTemplate['category']
    difficulty?: AIPromptTemplate['difficulty']
    ageGroup?: string
  }
): AIPromptTemplate | null {
  let filtered = AI_PROMPTS.filter(p => p.isActive)
  
  if (filters?.category) {
    filtered = filtered.filter(p => p.category === filters.category)
  }
  if (filters?.difficulty) {
    filtered = filtered.filter(p => p.difficulty === filters.difficulty)
  }
  if (filters?.ageGroup) {
    filtered = filtered.filter(p => p.ageGroup === filters.ageGroup)
  }
  
  if (filtered.length === 0) return null
  return filtered[Math.floor(Math.random() * filtered.length)]
}

// Statistics helper
export function getPromptsStatistics() {
  const stats = {
    total: AI_PROMPTS.length,
    active: AI_PROMPTS.filter(p => p.isActive).length,
    byCategory: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    byAgeGroup: {} as Record<string, number>
  }
  
  AI_PROMPTS.forEach(prompt => {
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

// Export for database seeding
export function getPromptsForDatabase(): Omit<AIPromptTemplate, 'id'>[] {
  return AI_PROMPTS.map(({ id, ...prompt }) => prompt)
}

// Note: This is a simplified version with representative samples.
// The full 500 prompts would follow the same pattern with variations in:
// - Subject matter (different animals, scenes, objects)
// - Composition (single subject, groups, environments)
// - Details level (matching difficulty)
// - Educational value (learning objectives)
// - Cultural diversity (holidays and traditions from around the world)
// - Seasonal themes (spring flowers, summer beaches, autumn leaves, winter snow)
// - Popular themes (dinosaurs, space, underwater, jungle, etc.)