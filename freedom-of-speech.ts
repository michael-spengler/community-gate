import { freedomOfSpeech, baseURLScan, FC, FE, getContract, getLogger, getProvider } from "./constants-types-infrastructure.ts"
import { ethers, Logger } from "./deps.ts"

export class FreedomOfSpeech {

    private static instance
    public static async getInstance() {
        if (FreedomOfSpeech.instance === undefined) {
            const logger = await getLogger()
            const provider = getProvider(logger)
            const contract = await getContract(freedomOfSpeech, provider, './blockchain/freedom-of-speech-abi.json')
            const fCcontract = await getContract(FC, provider, './blockchain/freedom-cash-abi.json')
            return new FreedomOfSpeech(logger, contract, fCcontract, provider)
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
    public async speak(text: number, refersTo: number) {
        await this.awaitTransaction(await this.contract.speak(text, refersTo))
    }
    public async appreciateSpeech(speechID: number, donationAmountFC: number) {
        const parsedAmount = ethers.parseEther(donationAmountFC.toString())
        const buyPrice = await this.fCcontract.getBuyPrice(BigInt(10 ** 18))
        const cost = buyPrice * BigInt(donationAmountFC)
        this.logger.debug(`appreciate speech with ${speechID} ${parsedAmount} ${buyPrice} ${cost}`)
        await this.awaitTransaction(await this.contract.appreciateSpeech(speechID, parsedAmount, buyPrice, {value: cost}))
    }
    public async claimDonations() {
        await this.awaitTransaction(await this.contract.claimDonations())
    }

    public async getSpeechCounter() {
        return this.contract.speechCounter()
    }
    public async getSpeech(id: number) {
        this.logger.info(`reading speech ${id}`)
        const raw = await this.contract.speeches(id)

        return {
            from: raw[0],
            text: raw[1],
            refersTo: raw[2],
            donations: raw[3],
            claimed: raw[4],
            timestamp: raw[5]
        }
    }

    public async log() {
        this.logger.debug(`speech counter: ${await this.getSpeechCounter()}`)
        const speech1 = await this.getSpeech(1)
        const speech2 = await this.getSpeech(2)
        this.logger.debug(`speech 1 ${speech1.from} ${speech1.text} ${speech1.refersTo} ${speech1.donations} ${speech1.claimed} ${speech1.timestamp}`)
        this.logger.debug(`speech 2 ${speech2.from} ${speech2.text} ${speech2.refersTo} ${speech2.donations} ${speech2.claimed} ${speech1.timestamp}`)
        // this.logger.debug(`claimableRewards: ${await this.contract.getClaimableRewards(FC)}`) 
    }
    private async awaitTransaction(tx: any): Promise<void> {
        this.logger.info(`transaction ${baseURLScan}tx/${tx.hash}`)
        await tx.wait()
    }
}