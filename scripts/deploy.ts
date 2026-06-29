import { ethers, network } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log(`Deploying on ${network.name} with account: ${deployer.address}`)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`)

  // Deploy MockVerifier
  const Verifier = await ethers.getContractFactory('MockVerifier')
  const verifier = await Verifier.deploy()
  await verifier.waitForDeployment()
  const verifierAddr = await verifier.getAddress()
  console.log(`MockVerifier deployed: ${verifierAddr}`)

  // Deploy ETHMixer (0.01 ETH denomination for testnet, 1 ETH for mainnet)
  const denomination = network.name === 'hardhat' || network.name === 'localhost'
    ? ethers.parseEther('1')
    : ethers.parseEther('0.01')

  const Mixer = await ethers.getContractFactory('ETHMixer')
  const mixer = await Mixer.deploy(verifierAddr, denomination, 20)
  await mixer.waitForDeployment()
  const mixerAddr = await mixer.getAddress()
  console.log(`ETHMixer deployed: ${mixerAddr}`)
  console.log(`Denomination: ${ethers.formatEther(denomination)} ETH`)

  console.log('\n--- Frontend Config ---')
  console.log(`VITE_MIXER_ADDRESS=${mixerAddr}`)
  console.log(`VITE_DENOMINATION=${denomination.toString()}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
