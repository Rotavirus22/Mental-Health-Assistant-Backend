const paymentFailure = async (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/payment-failure`);
  };

module.exports = paymentFailure;