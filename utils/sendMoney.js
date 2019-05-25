const Wallet = require('../models/Wallet')

const sendMoney = async listOfPaymentReceivers => {
  for (let paymentReceiver of listOfPaymentReceivers) {
    const wallet = await Wallet.findOne({ owner: paymentReceiver.user })
    wallet.balance += paymentReceiver.payment
    await wallet.save()
  }
}

module.exports = sendMoney