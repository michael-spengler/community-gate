// I buy and sell https://FreedomCash.org

import { FE } from "./constants-types-infrastructure.ts"
import { GateKeeperCommunity } from "./mod.ts"

const project = FE
const assetID = 1
const votingPeriodMinLength = 0
const gateKeeperCommunity = await GateKeeperCommunity.getInstance()
await gateKeeperCommunity.log()
await gateKeeperCommunity.registerAsset(assetID, votingPeriodMinLength)
await gateKeeperCommunity.appreciateAsset(assetID, 9)
await gateKeeperCommunity.depreciateAsset(assetID, 3)
await gateKeeperCommunity.reconcile(assetID)
await gateKeeperCommunity.claimRewards()
await gateKeeperCommunity.log()