/* eslint-disable no-console */
const deltas = []

/**
 * Usage:
 * utils.bench.tickSync()
 * codeToBench1()
 * utils.bench.tickSync()
 * codeToBench2()
 * utils.bench.diffSync()
 *
 * Output:
 * Starting time: 2023-10-21T21:01:12
 *   tick 1: 1ms
 *   tick 2: 4ms
 *
 **/
const tickSync = () => {
  if (!deltas) {
    console.log('Ticking started')
  }
  deltas.push(new Date())
}

const tick = () => Promise.resolve(tickSync())

const diffSync = () => {
  tickSync()
  deltas.map((delta, index) =>
    index === 0
      ? console.log('Starting time: ', delta)
      : console.log(`  tick ${index}: ${deltas[index] - deltas[index - 1]}ms`)
  )
}

const diff = () => Promise.resolve(diffSync())

module.exports = {
  tick,
  diff,
  diffSync,
  tickSync,
}
