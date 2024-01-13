import { ethers, Logger } from "./deps.ts"

export const communityGate = "0xE42f9Ebfd64cb86E2c69EC323f52eC2A754170D7"
export const freedomOfSpeech = "0x03246eC378e7Be20F42E1f0D32913829E43632FF"
export const FE = "0xc79E10bcE57e40e1474fbefF8044C906021A05b1"
export const FC = "0x1E7A208810366D0562c7Ba93F883daEedBf31410"
export const baseURLScan = "https://zkevm.polygonscan.com/"

export interface IVote {
    from: string
    amount: number
    up: boolean
    rewardAmount: bigint
    claimed: boolean
}

export interface IAsset {
    upVoteScore: number
    downVoteScore: number
    reconciliationFrom: number
    reconciled: boolean
}


export function getProvider(logger: Logger) {
    return new ethers.JsonRpcProvider(getProviderURL(logger))
}
export function getABI(url: string) {
    return JSON.parse(Deno.readTextFileSync(url))
}
export async function getContract(asset: string, provider: any, url: string): Promise<any> {
    const configuration = JSON.parse(Deno.readTextFileSync('./.env.json'))
    return new ethers.Contract(asset, getABI(url), await provider.getSigner())
}
export function getProviderURL(logger: Logger): string {
    let configuration: any = {}
    if (Deno.args[0] !== undefined) { // supplying your provider URL via parameter
        return Deno.args[0]
    } else { // ... or via .env.json
        try {
            configuration = JSON.parse(Deno.readTextFileSync('./.env.json'))
            return configuration.providerURL
        } catch (error) {
            logger.error(error.message)
            logger.error("without a providerURL I cannot connect to the blockchain")
        }
    }
    throw new Error("could not get a providerURL")
}
let loggerInstance
export async function getLogger() {
    if (loggerInstance === undefined) {
        const minLevelForConsole = 'DEBUG'
        const minLevelForFile = 'WARNING'
        const fileName = "./warnings-errors.txt"
        const pureInfo = true // leaving out e.g. the time info
        loggerInstance = await Logger.getInstance(minLevelForConsole, minLevelForFile, fileName, pureInfo)
    }
    return loggerInstance
}

