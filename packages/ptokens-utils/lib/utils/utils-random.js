const pickRandomElementFromArray = _array => {
  const index = Math.floor(Math.random(0, 1) * _array.length)

  return _array[index]
}

module.exports = {
  pickRandomElementFromArray
}