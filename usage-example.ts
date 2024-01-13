// I buy and sell https://FreedomCash.org

import { GateKeeperCommunity, FreedomOfSpeech } from "./mod.ts"
import {sleep} from "https://deno.land/x/sleep@v1.3.0/mod.ts"

const votingPeriodMinLength = 60
const freedomOfSpeech = await FreedomOfSpeech.getInstance(votingPeriodMinLength)
const hash1 = await freedomOfSpeech.speak("hello free world", 0)
const hash2 = await freedomOfSpeech.speak("explore freedomcash.org", 0)
await freedomOfSpeech.appreciateSpeech(1, 9)
await freedomOfSpeech.appreciateSpeech(2, 18)
await freedomOfSpeech.claimDonations()
await freedomOfSpeech.log()

const gateKeeperCommunity = await GateKeeperCommunity.getInstance()
await gateKeeperCommunity.appreciateAsset(1, 9)
await gateKeeperCommunity.depreciateAsset(1, 3)
await gateKeeperCommunity.depreciateAsset(2, 6)
await sleep(votingPeriodMinLength)

await gateKeeperCommunity.reconcile(1)
await gateKeeperCommunity.log()
await gateKeeperCommunity.claimRewards()
await gateKeeperCommunity.log()
console.log(await gateKeeperCommunity.getAssetIDFromUserGeneratedHash("0xc609cf2fa01e7711156c9f57575cbc3b955f05329428b9c5e26b50b2d92d5513"))
console.log(await gateKeeperCommunity.getAssetIDFromUserGeneratedHash("0xb95803b1d755567a38ca3d5daa2326a77fdf0385e7487a46bb3a14ce5b3c1870"))
console.log(await gateKeeperCommunity.getAssetFromUserGeneratedHash("0xc609cf2fa01e7711156c9f57575cbc3b955f05329428b9c5e26b50b2d92d5513"))
console.log(await gateKeeperCommunity.getAssetFromUserGeneratedHash("0xb95803b1d755567a38ca3d5daa2326a77fdf0385e7487a46bb3a14ce5b3c1870"))

