const Wallet = require('../models/Wallet')

const sendMoney = async listOfPaymentReceivers => {
  for (let paymentReceiver of listOfPaymentReceivers) {
    const wallet = await Wallet.update({ owner: paymentReceiver.user }, {
      $set: {
        $inc: {
          balance: paymentReceiver.payment,
        },
      },
    })
  }
}

module.exports = sendMoney