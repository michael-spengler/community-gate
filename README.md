# Community Gate 
Incentive System for Truth, Respect & Direct Democracy. 
It incentivizes voters to vote and protects against stupidity, corruption and fraud. 


## First Use Cases
Community Gate features shall help the Freedom Enterprise to become a role model for respectful and free peer to peer cooperation.  
We want to have a good decentralized, democratic, transparent answer on how we ensure fairness. Some potential deals like selling drugs in schools are probably - for good reasons - not wanted by the majority of the community. 
In those contexts we want to explore if decentralized content moderation will be appreciated and helpful.

## Potential Weak Spots 
I'm aware of the [stupidity of masses](https://www.youtube.com/watch?v=09maaUaRT4M) problem.  
At the same time this stupidity is often caused by a few corrupt or stupid politicians and media people. 
This is why voting power is stored in [Freedom Cash](https://freedomcash.org/). 
So even in phases of temporary mainstream stupidity, people will still invest into Freedom.


## Usage Examples
```ts
import { GateKeeperCommunity } from "https://deno.land/x/community_gate/mod.ts" // under construction

const gateKeeperCommunity = await GateKeeperCommunity.getInstance()
const assetCounter = await gateKeeperCommunity.getAssetCounter()
console.log(assetCounter)
```