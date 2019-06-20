const Wallet = require('../models/Wallet')

const sendMoney = async listOfPaymentReceivers => {
  for (let paymentReceiver of listOfPaymentReceivers) {
    const lol = await Wallet.update({ owner: paymentReceiver.user }, {
      $inc: {
        balance: paymentReceiver.payment,
      },
    })
    console.log(lol)
  }
}

module.exports = sendMoney