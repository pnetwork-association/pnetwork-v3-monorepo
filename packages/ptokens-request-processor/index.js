const { greet } = require('./lib/example')

const main = () => greet().then(console.log)

main()
