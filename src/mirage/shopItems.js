const items = []

const types = [
  {
    name: 'Speed',
    boosts: [4, 6, 8]
  },
  {
    name: 'Health',
    boosts: [50, 100, 150]
  },
  {
    name: 'Critical',
    boosts: [4, 6, 8]
  },
  {
    name: 'Armor',
    boosts: [10, 20, 30]
  },
  {
    name: 'Evasion',
    boosts: [2, 4, 6]
  },
  {
    name: 'Resist',
    boosts: [4, 8, 12]
  },
  {
    name: 'Magic',
    boosts: [10, 20, 30]
  },
  {
    name: 'Physical',
    boosts: [10, 20, 30]
  },
  {
    name: 'Accuracy',
    boosts: [2, 4, 8]
  }
]

const RARITIES = ['common', 'uncommon', 'rare']
const IMAGE_URLS = ['/media/10k.png', '/media/30k.png', '/media/60k.png']
const COST_MULTIPLIER = [0.25, 0.5, 1]
let lastId = 0

for (const { name, boosts } of types) {
  for (let i = 0; i < boosts.length ; i++) {
    const boost = boosts[i]
    lastId++
    items.push({
      id: lastId,
      name: `${name} +${boost}`,
      description: `Increase ${name.toLowerCase()} by +${boost}`,
      image: IMAGE_URLS[i],
      rarity: RARITIES[i],
      cost: boost * COST_MULTIPLIER[i],
      stat: name.toLowerCase(),
      statValue: boost
    })
  }
}

export default items

