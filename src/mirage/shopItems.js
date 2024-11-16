const items = []

const types = [
  {
    name: 'Speed',
    stat: 'speed',
    imageFile: 'Speed',
    boosts: [4, 6, 8]
  },
  {
    name: 'Health',
    stat: 'health',
    imageFile: 'Health',
    boosts: [50, 100, 150]
  },
  {
    name: 'Critical',
    stat: 'crit',
    imageFile: 'Critical',
    boosts: [4, 6, 8]
  },
  {
    name: 'Armor',
    stat: 'armor',
    imageFile: 'Armour',
    boosts: [10, 20, 30]
  },
  {
    name: 'Evasion',
    stat: 'evade',
    imageFile: 'Evade',
    boosts: [2, 4, 6]
  },
  {
    name: 'Resist',
    stat: 'resist',
    imageFile: 'Resist',
    boosts: [4, 8, 12]
  },
  {
    name: 'Magic',
    stat: 'magic',
    imageFile: 'Magic',
    boosts: [10, 20, 30]
  },
  {
    name: 'Physical',
    stat: 'physical',
    imageFile: 'Physical',
    boosts: [10, 20, 30]
  },
  {
    name: 'Accuracy',
    stat: 'accuracy',
    imageFile: 'Accuracy',
    boosts: [2, 4, 8]
  }
]

const RARITIES = ['common', 'rare', 'mythical']
const COST_MULTIPLIER = [0.25, 0.5, 1]
let lastId = 0

const toTitleCase = function (str) {
  return str[0].toUpperCase() + str.substring(1)
}

for (const { name, stat, imageFile, boosts } of types) {
  for (let i = 0; i < boosts.length ; i++) {
    const boost = boosts[i]
    lastId++
    let itemName = `${name} `
    for (let b = 0; b <= i; b++) {
      itemName += '+'
    }
    const rarity = RARITIES[i]
    items.push({
      id: lastId,
      name: itemName,
      description: `Increase ${name.toLowerCase()} by +${boost}`,
      image: `/media/items/${imageFile}${toTitleCase(rarity)}256.png`,
      rarity,
      cost: boost * COST_MULTIPLIER[i],
      stat,
      statValue: boost
    })
  }
}

export default items

