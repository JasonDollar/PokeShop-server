// async function iterateOrderItemsToSaveToDb(orderItemsArray) {
//   for (let item of orderItemsArray) {
//     const savedOrder = await item.save()
//     savedOrders.push(savedOrder)
//   }
// }
const saveManyItemsToDb = async arrayOfItems => {
  let savedItems = []
  for (let item of arrayOfItems) {
    const savedItem = await item.save()
    savedItems.push(savedItem)
  }
  return savedItems
}

module.exports = saveManyItemsToDb