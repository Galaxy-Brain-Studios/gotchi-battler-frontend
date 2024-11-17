const buyItem = async function ({ itemId, quantity }) {
  console.log('TODO contract buyItem', { itemId, quantity })
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ txId: Math.random() + '' })
    }, 1000)
  })
}

export default {
  buyItem
}
