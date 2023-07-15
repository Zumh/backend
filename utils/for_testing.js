// reverse a string
const reverse = (string) => {
  return string
    .split('')
    .reverse()
    .join('')
}

// find the average of array
// check if the array length is zero, if it is then return zero.
// otherwise return the average
const average = array => {
  const reducer = (sum, item) => {
    return sum + item
  }

  return array.length === 0
    ? 0
    : array.reduce(reducer, 0) / array.length
}

module.exports = {
  reverse,
  average
}