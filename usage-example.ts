// I buy and sell https://FreedomCash.org

import { GateKeeperCommunity } from "./mod.ts"

const gateKeeperCommunity = await GateKeeperCommunity.getInstance()
const assetCounter = await gateKeeperCommunity.getAssetCounter()
console.log(assetCounter)