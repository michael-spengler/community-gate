// I buy and sell https://FreedomCash.org

import { GateKeeperCommunity, FreedomOfSpeech } from "./mod.ts"

const freedomOfSpeech = await FreedomOfSpeech.getInstance()
await freedomOfSpeech.speak("hello free world", 0)
await freedomOfSpeech.speak("explore freedomcash.org", 0)
await freedomOfSpeech.appreciateSpeech(1, 9)
await freedomOfSpeech.appreciateSpeech(2, 18)
await freedomOfSpeech.claimDonations()
await freedomOfSpeech.log()

const votingPeriodMinLength = 60
const gateKeeperCommunity = await GateKeeperCommunity.getInstance()
await gateKeeperCommunity.registerAsset(1, votingPeriodMinLength)
await gateKeeperCommunity.appreciateAsset(1, 9)
await gateKeeperCommunity.depreciateAsset(1, 3)
await gateKeeperCommunity.registerAsset(2, votingPeriodMinLength)
await gateKeeperCommunity.depreciateAsset(2, 6)
await gateKeeperCommunity.log()

// await gateKeeperCommunity.reconcile(assetID)
// await gateKeeperCommunity.claimRewards()
// await gateKeeperCommunity.log()