import { FC, FE, getContract, getLogger, getProvider } from "../constants-types-infrastructure"
import { communityGate } from "../constants-types-infrastructure.ts"
import { ethers, Logger } from "../deps.ts"

export class GateKeeperCommunity {

    private static instance
    public static async getInstance() {
        if (GateKeeperCommunity.instance === undefined) {
            const logger = await getLogger()
            const provider = getProvider(logger)
            const contractFreedomEnterprise = await getContract(FE, provider, './blockchain/freedom-enterprise-abi.json')
            const contractFreedomCash = await getContract(FC, provider, './blockchain/freedom-cash-abi.json')
            const currency = await contractFreedomEnterprise.freedomCashSmartContract()
            if (currency !== FC) {
                throw new Error(`check Freedom Cash ${FC} resp. ${currency}`)
            }
            return new GateKeeperCommunity(logger, contractFreedomEnterprise, contractFreedomCash, provider)
        }
    }

    protected logger: Logger
    protected provider: any
    protected contractFreedomEnterprise: any
    protected contractFreedomCash: any
    
    protected constructor(logger: Logger, contractFreedomEnterprise: any, contractFreedomCash: any, provider: any) {
        this.logger = logger
        this.provider = provider
        this.contractFreedomEnterprise = contractFreedomEnterprise
        this.contractFreedomCash = contractFreedomCash
    }
    public async appreciateContent(contentID: number, amount: number){

    }

    public async getAsset(id: number) {
        
    }
    public async getVote(id: number) {

    }
    public async getReward(id: number) {

    }
    public async getAssetCounter() {

    }
    public async getVoteCounter() {

    }
    public async getRewardCounter() {

    }
    
}