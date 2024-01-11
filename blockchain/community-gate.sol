// SPDX-License-Identifier: GNU AFFERO GENERAL PUBLIC LICENSE Version 3

// Incentive System for Truth, Respect & Direct Democracy. 
// The Community Gate incentivizes voters to vote and protects against stupidity, corruption and fraud. 
// Any project can become a community guarded project with the Community Gate.
// The earlier you vote like the majority of the community will vote, the better it shall be.
// The Community Gate uses Freedom Cash as its decentralized currency
// https://zkevm.polygonscan.com/token/0xa1e7bB978a28A30B34995c57d5ba0B778E90033B

pragma solidity 0.8.19;

import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.4/contracts/utils/math/Math.sol";
import "https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/v4.9.4/contracts/token/ERC20/IERC20.sol";
import "https://github.com/monique-baumann/freedom-cash/blob/v1.3.0/blockchain/freedom-cash-interface.sol";

contract CommunityGate {
 
  address public nativeFreedomEnterprise = 0xF366764BEFEAAb8D156A589BC5E4f54fd6Db8fD5; // testnet
  address public nativeFreedomCash = 0x1E7A208810366D0562c7Ba93F883daEedBf31410; // testnet

  uint256 public assetCounter;
  uint256 public voteCounter;
  uint256 public rewardCounter;

  mapping(uint256 => IAsset) public assets;
  struct IAsset{
    address contractAddress;
    uint256 assetID;
    uint256 upVoteScore;
    uint256 downVoteScore;
    uint256 reconciliationAt;
    bool reconciled;
  }
  mapping(uint256 => IVote) public votes;
  struct IVote {
    uint256 amount;
    bool up;
  }
  mapping(uint256 => uint256) public voteToAsset;
  mapping(uint256 => IReward) public rewards;
  struct IReward {
    uint256 voteID;
    uint256 amount;
    bool claimed;
  }

  error BuyPriceMightHaveRisen(); 
  error Patience();

  function registerAsset(address project, uint256 assetID) public{
    assetCounter++;
    IAsset memory asset = IAsset(project, assetID, 0, 0, block.timestamp + 3600, false);
    assets[assetCounter] = asset;
  }
  function appreciateAsset(uint256 assetID, uint256 appreciationAmountFC, uint256 fCBuyPrice) public payable  {
    voteCounter++;
    invest(appreciationAmountFC, fCBuyPrice);
    assets[assetID].upVoteScore += appreciationAmountFC;
    IVote memory vote = IVote(appreciationAmountFC, true);
    votes[voteCounter] = vote;
    voteToAsset[voteCounter] = assetID;
  }
  function depreciateAsset(uint256 assetID, uint256 depreciationAmountFC, uint256 fCBuyPrice) public payable  {
    voteCounter++;    
    invest(depreciationAmountFC, fCBuyPrice);
    assets[assetID].downVoteScore += depreciationAmountFC;
    IVote memory vote = IVote(depreciationAmountFC, false);    
    votes[voteCounter] = vote;
    voteToAsset[voteCounter] = assetID;
  }
  function reconcile(uint256 assetID) public {
    if (block.timestamp < assets[assetID].reconciliationAt) { revert Patience(); }
    if (assets[assetID].upVoteScore >= assets[assetID].downVoteScore) {
      uint256 sumOfLosingVotes = getSumOfLosingVotes(assetID, true);
      uint256 numberOfWinningVotes = getNumberOfWinningVotes(assetID, true);
      uint256 rewardPerWinner = sumOfLosingVotes / numberOfWinningVotes;
      assignRewards(true, rewardPerWinner);
    } else {
      uint256 sumOfLosingVotes = getSumOfLosingVotes(assetID, false);      
      uint256 numberOfWinningVotes = getNumberOfWinningVotes(assetID, false);      
      uint256 rewardPerWinner = sumOfLosingVotes / numberOfWinningVotes;      
      assignRewards(false, rewardPerWinner);
    }
  }
  function getNumberOfWinningVotes(uint256 assetID, bool up) public view returns (uint256) {
    uint256 counter;
    for (uint256 i = 1; i <= voteCounter; i++) {
      if (assetID == voteToAsset[i]) {
        if(up && votes[i].up) {
          counter++;
        } else if(!up && !votes[i].up) {
          counter++;
        }
      }
    } 
    return counter;   
  }
  function getSumOfLosingVotes(uint256 assetID, bool up) public view returns (uint256) {
    uint256 sum;
    for (uint256 i = 1; i <= voteCounter; i++) {
      if (assetID == voteToAsset[i]) {
        if((up && votes[i].up) || (!up && !votes[i].up)) {
          sum += votes[i].amount;
        }
      } 
    }
    return sum;   
  }
  function assignRewards(bool toUpvoters, uint256 rewardPerWinner) internal {
    for (uint256 i = 1; i <= voteCounter; i++) {
      rewardCounter++;
      if((votes[voteCounter].up && toUpvoters) || (!votes[voteCounter].up && !toUpvoters)){
        IReward memory reward = IReward(voteCounter, rewardPerWinner, false);
        rewards[rewardCounter] = reward;
      } 

    }
  }
  function getBTS() public view returns(uint256) {
    return block.timestamp;
  }
  function invest(uint256 amount, uint256 fCBuyPrice) internal {
    uint256 fCBuyPriceCheck = IFreedomCash(nativeFreedomCash).getBuyPrice(10**18);
    if (fCBuyPriceCheck != fCBuyPrice) { revert BuyPriceMightHaveRisen(); }
    IFreedomCash(nativeFreedomCash).buyFreedomCash{value: msg.value}(amount, fCBuyPrice);
  }
}