// https://wiki.aavegotchi.com/en/xp
const getLevelFromXp = function(xp) {
  xp = xp - 0
  return Math.floor(Math.sqrt(xp * 0.02)) + 1
}

const getSpecialIdFromSpecial = function(special) {
  // special from server might be a number or it might be an object with an id
  if (Number.isInteger(special)) { return special }
  return special?.id
}

export const processGotchiModel = function (jsonData) {
  return {
    ...jsonData,
    // id should be a number
    id: (jsonData.id || jsonData.onchainId) - 0,
    // ensure properties that will be sortable are numbers
    level: jsonData.level ? jsonData.level - 0 : getLevelFromXp(jsonData.xp),
    brs: jsonData.brs - 0,
    xp: jsonData.xp - 0,
    speed: jsonData.speed - 0,
    health: jsonData.health - 0,
    accuracy: jsonData.accuracy - 0,
    evade: jsonData.evade - 0,
    physical: jsonData.physical - 0,
    magic: jsonData.magic - 0,
    armor: jsonData.armor - 0,
    resist: jsonData.resist - 0,
    crit: jsonData.crit - 0,
    // only want special IDs but API returns objects
    availableSpecials: jsonData.availableSpecials ? jsonData.availableSpecials.map(getSpecialIdFromSpecial) : (jsonData.specialId ? [jsonData.specialId] : [])
  }
}
