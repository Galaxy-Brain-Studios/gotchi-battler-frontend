const buyItem = async function ({ itemId, amount }) {
  console.log('TODO contract buyItem', { itemId, amount })
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ blockNumber: 1000 })
    }, 1000)
  })
}

export default {
  buyItem
}
