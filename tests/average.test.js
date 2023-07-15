const average = require('../utils/for_testing').average

// Describe blocks can be used for grouping tests into logical collections. The test output of Jest also uses the name of the describe block:
describe('average', () => {
  test('of one value is the value itself', () => {
    expect(average([1])).toBe(1)
  })

  test('of many is calculated right', () => {
    expect(average([1, 2, 3, 4, 5, 6])).toBe(3.5)
  })

  test('of empty array is zero', () => {
    expect(average([])).toBe(0)
  })
})