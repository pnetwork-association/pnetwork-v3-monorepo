module.exports.getOptionMaskWithOptionEnabledForBit = (
  _position,
  _optionMask = '0x'.padEnd(66, '0')
) => {
  const binaryString = BigInt(_optionMask).toString(2).padStart(256, '0')
  const binaryArray = binaryString.split('')
  binaryArray[255 - _position] = '1'
  return (
    '0x' +
    BigInt('0b' + binaryArray.join(''))
      .toString(16)
      .padStart(64, '0')
  )
}
