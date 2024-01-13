// I buy and sell https://FreedomCash.org

import { GateKeeperCommunity, FreedomOfSpeech } from "./mod.ts"
import {sleep} from "https://deno.land/x/sleep@v1.3.0/mod.ts"
import hashJs from 'https://deno.land/x/hash/mod-hashjs.ts'

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
console.log(await gateKeeperCommunity.getAssetFromUserGeneratedHash(hash1))
console.log(await gateKeeperCommunity.getAssetFromUserGeneratedHash(hash2))

