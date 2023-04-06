/* eslint-disable no-console */
const deltas = []

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
