import { communityGate, baseURLScan, FC, FE, getContract, getLogger, getProvider } from "./constants-types-infrastructure.ts"

import { ethers, Logger } from "./deps.ts"

export class GateKeeperCommunity {

    private static instance
    public static async getInstance() {
        if (GateKeeperCommunity.instance === undefined) {
            const logger = await getLogger()
            const provider = getProvider(logger)
            const contract = await getContract(communityGate, provider, './blockchain/community-gate-abi.json')
            const fCcontract = await getContract(FC, provider, './blockchain/freedom-cash-abi.json')
            return new GateKeeperCommunity(logger, contract, fCcontract, provider)
        }
    }

    protected logger: Logger
    protected provider: any
    protected contract
    protected fCcontract

    protected constructor(logger: Logger, contract: any, fCcontract: any, provider: any) {
        this.logger = logger
        this.provider = provider
        this.contract = contract
        this.fCcontract = fCcontract
    }
    public async registerAsset(assetID: number, votingPeriodMinLength: number) {
        await this.awaitTransaction(await this.contract.registerAsset(assetID, votingPeriodMinLength))
    }
    public async appreciateAsset(assetID: number, amount: number) {
        const parsedAmount = ethers.parseEther(amount.toString())
        const buyPrice = await this.fCcontract.getBuyPrice(BigInt(10 ** 18))
        const cost = buyPrice * BigInt(amount)
        await this.awaitTransaction(await this.contract.appreciateAsset(assetID, parsedAmount, buyPrice, {value: cost}))
    }
    public async depreciateAsset(assetID: number, amount: number) {
        const parsedAmount = ethers.parseEther(amount.toString())
        const buyPrice = await this.fCcontract.getBuyPrice(BigInt(10 ** 18))
        const cost = buyPrice * BigInt(amount)
        await this.awaitTransaction(await this.contract.depreciateAsset(assetID, parsedAmount, buyPrice, {value: cost}))
    }
    public async reconcile(assetID: number) {
        await this.awaitTransaction(await this.contract.reconcile(assetID))
    }
    public async claimRewards() {
        await this.awaitTransaction(await this.contract.claimRewards())
    }
    public async getNumberOfWinningVotes(assetID: number, up: boolean) {
        return this.contract.getNumberOfWinningVotes(assetID, up)
    }
    public async getSumOfLosingVotes(assetID: number, amount: number) {
        return this.contract.getSumOfLosingVotes(assetID, amount)
    }
    public async getClaimableRewards(receiver: string) {
        return this.contract.getClaimableRewards(receiver)
    }
    public async getAsset(id: number) {
        this.logger.info(`reading asset ${id}`)
        const raw = await this.contract.assets(id)

        return {
            assetID: raw[0],
            upVoteScore: raw[1],
            downVoteScore: raw[2],
            reconciliationFrom: raw[3],
            reconciled: raw[4]
        }
    }
    public async getVote(id: number) {
        this.logger.info(`reading vote ${id}`)
        const raw = await this.contract.votes(id)

        return {
            from: raw[0],
            amount: raw[1],
            up: raw[2],
            rewardAmount: raw[3],
            claimed: raw[4]
        }
    }
    public async getAssetCounter() {
        return this.contract.assetCounter()
    }
    public async getVoteCounter() {
        return this.contract.voteCounter()
    }
    public async log() {
        this.logger.debug(`asset counter: ${await this.getAssetCounter()}`)
        this.logger.debug(`vote counter: ${await this.getVoteCounter()}`)
        const asset1 = await this.getAsset(1)
        this.logger.debug(`asset 1 ${asset1.assetID} ${asset1.upVoteScore} ${asset1.downVoteScore} ${asset1.reconciliationFrom} ${asset1.reconciled}`)
        const vote1 = await this.getVote(1)
        const vote2 = await this.getVote(2)
        this.logger.debug(`vote 1 ${vote1.from} ${vote1.amount} ${vote1.up} ${vote1.rewardAmount} ${vote1.claimed} `)
        this.logger.debug(`vote 2 ${vote2.from} ${vote2.amount} ${vote2.up} ${vote2.rewardAmount} ${vote2.claimed} `)
        this.logger.debug(`numberOFWinningVotes: ${await this.contract.getNumberOfWinningVotes(1, true)}`)
        this.logger.debug(`sumOfLosingVotes: ${await this.contract.getSumOfLosingVotes(1, true)}`) 
        // this.logger.debug(`claimableRewards: ${await this.contract.getClaimableRewards(FC)}`) 
    }
    private async awaitTransaction(tx: any): Promise<void> {
        this.logger.info(`transaction ${baseURLScan}tx/${tx.hash}`)
        await tx.wait()
    }

}