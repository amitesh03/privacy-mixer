import { expect } from 'chai'
import { ethers } from 'hardhat'
import { keccak256, toUtf8Bytes } from 'ethers'

describe('ETHMixer', () => {
  const DENOMINATION = ethers.parseEther('1')
  const LEVELS = 20

  async function deploy() {
    const [owner, depositor, recipient, relayer, other] = await ethers.getSigners()

    const Verifier = await ethers.getContractFactory('MockVerifier')
    const verifier = await Verifier.deploy()
    await verifier.waitForDeployment()

    const Mixer = await ethers.getContractFactory('ETHMixer')
    const mixer = await Mixer.deploy(await verifier.getAddress(), DENOMINATION, LEVELS)
    await mixer.waitForDeployment()

    // Generate a commitment: keccak256(nullifier || secret)
    const nullifier = ethers.randomBytes(32)
    const secret = ethers.randomBytes(32)
    const commitment = keccak256(ethers.concat([nullifier, secret]))
    const nullifierHash = keccak256(nullifier)

    return { owner, depositor, recipient, relayer, other, mixer, verifier, nullifier, secret, commitment, nullifierHash }
  }

  describe('Deposit', () => {
    it('deposits with correct denomination', async () => {
      const { mixer, depositor, commitment } = await deploy()
      await mixer.connect(depositor).deposit(commitment, { value: DENOMINATION })
      expect(await mixer.commitments(commitment)).to.be.true
      expect(await mixer.nextIndex()).to.equal(1n)
    })

    it('reverts wrong denomination', async () => {
      const { mixer, depositor, commitment } = await deploy()
      await expect(
        mixer.connect(depositor).deposit(commitment, { value: ethers.parseEther('0.5') })
      ).to.be.revertedWith('Mixer: wrong denomination')
    })

    it('reverts duplicate commitment', async () => {
      const { mixer, depositor, commitment } = await deploy()
      await mixer.connect(depositor).deposit(commitment, { value: DENOMINATION })
      await expect(
        mixer.connect(depositor).deposit(commitment, { value: DENOMINATION })
      ).to.be.revertedWith('Mixer: duplicate commitment')
    })

    it('updates merkle root after deposit', async () => {
      const { mixer, depositor, commitment } = await deploy()
      const rootBefore = await mixer.getLastRoot()
      await mixer.connect(depositor).deposit(commitment, { value: DENOMINATION })
      const rootAfter = await mixer.getLastRoot()
      expect(rootAfter).to.not.equal(rootBefore)
    })
  })

  describe('Withdrawal', () => {
    async function depositAndGetRoot() {
      const ctx = await deploy()
      const { mixer, depositor, commitment } = ctx
      await mixer.connect(depositor).deposit(commitment, { value: DENOMINATION })
      const root = await mixer.getLastRoot()
      return { ...ctx, root }
    }

    it('withdraws to recipient', async () => {
      const { mixer, recipient, nullifierHash, root } = await depositAndGetRoot()
      const before = await ethers.provider.getBalance(recipient.address)
      await mixer.withdraw(
        '0x', root, nullifierHash,
        recipient.address as `0x${string}`,
        ethers.ZeroAddress as `0x${string}`,
        0, 0
      )
      const after = await ethers.provider.getBalance(recipient.address)
      expect(after - before).to.equal(DENOMINATION)
    })

    it('pays relayer fee', async () => {
      const { mixer, recipient, relayer, nullifierHash, root } = await depositAndGetRoot()
      const fee = ethers.parseEther('0.01')
      const relayerBefore = await ethers.provider.getBalance(relayer.address)
      await mixer.withdraw(
        '0x', root, nullifierHash,
        recipient.address as `0x${string}`,
        relayer.address as `0x${string}`,
        fee, 0
      )
      const relayerAfter = await ethers.provider.getBalance(relayer.address)
      expect(relayerAfter - relayerBefore).to.equal(fee)
    })

    it('reverts double spend (same nullifier)', async () => {
      const { mixer, recipient, nullifierHash, root } = await depositAndGetRoot()
      await mixer.withdraw('0x', root, nullifierHash, recipient.address as `0x${string}`, ethers.ZeroAddress as `0x${string}`, 0, 0)
      await expect(
        mixer.withdraw('0x', root, nullifierHash, recipient.address as `0x${string}`, ethers.ZeroAddress as `0x${string}`, 0, 0)
      ).to.be.revertedWith('Mixer: already spent')
    })

    it('reverts unknown root', async () => {
      const { mixer, recipient, nullifierHash } = await depositAndGetRoot()
      const fakeRoot = ethers.randomBytes(32)
      await expect(
        mixer.withdraw('0x', fakeRoot, nullifierHash, recipient.address as `0x${string}`, ethers.ZeroAddress as `0x${string}`, 0, 0)
      ).to.be.revertedWith('Mixer: unknown root')
    })

    it('reverts fee > denomination', async () => {
      const { mixer, recipient, nullifierHash, root } = await depositAndGetRoot()
      await expect(
        mixer.withdraw('0x', root, nullifierHash, recipient.address as `0x${string}`, ethers.ZeroAddress as `0x${string}`, DENOMINATION + 1n, 0)
      ).to.be.revertedWith('Mixer: fee too large')
    })
  })

  describe('MerkleTree', () => {
    it('root history tracks last 30 roots', async () => {
      const { mixer, depositor } = await deploy()
      const roots = new Set<string>()
      for (let i = 0; i < 5; i++) {
        const c = keccak256(ethers.randomBytes(32))
        await mixer.connect(depositor).deposit(c, { value: DENOMINATION })
        roots.add(await mixer.getLastRoot())
      }
      // All recent roots should be known
      for (const root of roots) {
        expect(await mixer.isKnownRoot(root)).to.be.true
      }
    })

    it('unknown root returns false', async () => {
      const { mixer } = await deploy()
      expect(await mixer.isKnownRoot(ethers.randomBytes(32))).to.be.false
    })
  })
})
