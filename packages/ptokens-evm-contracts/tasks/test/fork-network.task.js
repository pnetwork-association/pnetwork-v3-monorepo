const getEnvironmentVariable = _envVar => process.env[_envVar] || ''

const forkNetwork = (_, hre) => {
  const nodeUrl = getEnvironmentVariable(hre.network.config.chainName.toUpperCase() + '_NODE')

  console.info(
    `Starting hardhat fork of ${hre.network.config.chainName} network on port ${hre.network.config.port} with chainId ${hre.network.config.chainId}`
  )
  console.info(`Forked from: ${nodeUrl}`)

  return hre.run('node', {
    fork: nodeUrl,
    port: hre.network.config.port,
    hostname: hre.network.config.hostname,
  })
}

task('fork-network', 'Launch a forked network depending on the configuration passed', forkNetwork)

module.exports = {
  forkNetwork,
}
