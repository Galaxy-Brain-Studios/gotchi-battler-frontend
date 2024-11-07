const items = []

const types = [
  {
    name: 'Speed',
    stat: 'speed',
    boosts: [4, 6, 8]
  },
  {
    name: 'Health',
    stat: 'health',
    boosts: [50, 100, 150]
  },
  {
    name: 'Critical',
    stat: 'crit',
    boosts: [4, 6, 8]
  },
  {
    name: 'Armor',
    stat: 'armor',
    boosts: [10, 20, 30]
  },
  {
    name: 'Evasion',
    stat: 'evade',
    boosts: [2, 4, 6]
  },
  {
    name: 'Resist',
    stat: 'resist',
    boosts: [4, 8, 12]
  },
  {
    name: 'Magic',
    stat: 'magic',
    boosts: [10, 20, 30]
  },
  {
    name: 'Physical',
    stat: 'physical',
    boosts: [10, 20, 30]
  },
  {
    name: 'Accuracy',
    stat: 'accuracy',
    boosts: [2, 4, 8]
  }
]

const RARITIES = ['common', 'uncommon', 'rare']
const IMAGE_URLS = ['/media/10k.png', '/media/30k.png', '/media/60k.png']
const COST_MULTIPLIER = [0.25, 0.5, 1]
let lastId = 0

for (const { name, stat, boosts } of types) {
  for (let i = 0; i < boosts.length ; i++) {
    const boost = boosts[i]
    lastId++
    let itemName = `${name} `
    for (let b = 0; b <= i; b++) {
      itemName += '+'
    }
    items.push({
      id: lastId,
      name: itemName,
      description: `Increase ${name.toLowerCase()} by +${boost}`,
      image: IMAGE_URLS[i],
      rarity: RARITIES[i],
      cost: boost * COST_MULTIPLIER[i],
      stat,
      statValue: boost
    })
  }
}

export default items

