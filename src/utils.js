const getRoundedAmount = (amount) => {
    return Math.round(amount * 100) / 100
}

module.exports = {getRoundedAmount}