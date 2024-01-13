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
    uint256 upVoteScore;
    uint256 downVoteScore;
    uint256 reconciliationFrom;
    bool reconciled;
  }
  mapping(uint256 => IVote) public votes;
  struct IVote {
    address payable from;
    uint256 amount;
    bool up;
    uint256 rewardAmount;
    bool claimed;
  }
  mapping(uint256 => uint256) public voteToAsset;
  mapping(bytes32 => uint256) public hashToAssetID;

  error BuyPriceMightHaveRisen(); 
  error Patience();
  error ReferenceSeemsUnintended();
  error NothingToClaim();

  function registerAsset(bytes32 userGeneratedHash, uint256 votingPeriodMinLength) public {
    assetCounter++;
    IAsset memory asset = IAsset(0, 0, block.timestamp + votingPeriodMinLength, false);
    assets[assetCounter] = asset;
    hashToAssetID[userGeneratedHash] = assetCounter;
  }
  function appreciateAsset(uint256 assetID, uint256 appreciationAmountFC, uint256 fCBuyPrice) public payable  {
		if(assetID > assetCounter) { revert ReferenceSeemsUnintended(); }    
    voteCounter++;
    invest(appreciationAmountFC, fCBuyPrice);
    assets[assetID].upVoteScore += appreciationAmountFC;
    IVote memory vote = IVote(payable(msg.sender), appreciationAmountFC, true, 0, false);
    votes[voteCounter] = vote;
    voteToAsset[voteCounter] = assetID;
  }
  function depreciateAsset(uint256 assetID, uint256 depreciationAmountFC, uint256 fCBuyPrice) public payable  {
    if(assetID > assetCounter) { revert ReferenceSeemsUnintended(); }    
    voteCounter++;    
    invest(depreciationAmountFC, fCBuyPrice);
    assets[assetID].downVoteScore += depreciationAmountFC;
    IVote memory vote = IVote(payable(msg.sender), depreciationAmountFC, false, 0, false);
    votes[voteCounter] = vote;
    voteToAsset[voteCounter] = assetID;
  }
  function reconcile(uint256 assetID) public {
    if(assetID > assetCounter) { revert ReferenceSeemsUnintended(); }    
    if (block.timestamp < assets[assetID].reconciliationFrom) { revert Patience(); }
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
  function getClaimableRewards(address receiver) public view returns(uint256) {
    uint256 sum;
    for (uint256 i = 1; i <= voteCounter; i++) {
      if (receiver == votes[i].from && !votes[i].claimed) {
        sum += votes[i].rewardAmount;
      }
    }
    return sum;
  }
  function claimRewards() public {
    uint256 amount = getClaimableRewards(msg.sender);
    if(amount == 0){ revert NothingToClaim(); }
    for (uint256 i = 1; i <= voteCounter; i++) {
      if (msg.sender == votes[i].from) {
        votes[i].claimed = true;
      }
    }    
    IERC20(nativeFreedomCash).transfer(msg.sender, amount);
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
        if((up && !votes[i].up) || (!up && votes[i].up)) {
          sum += votes[i].amount;
        }
      } 
    }
    return sum;   
  }
  function getAsset(bytes32 hash) public view returns(IAsset memory) {
    return assets[hashToAssetID[hash]];
  }
  function assignRewards(bool toUpvoters, uint256 rewardPerWinner) internal {
    for (uint256 i = 1; i <= voteCounter; i++) {
      rewardCounter++;
      if((votes[i].up && toUpvoters) || (!votes[i].up && !toUpvoters)){
        votes[i].rewardAmount = rewardPerWinner;
      } 
    }
  }
  function invest(uint256 amount, uint256 fCBuyPrice) internal {
    uint256 fCBuyPriceCheck = IFreedomCash(nativeFreedomCash).getBuyPrice(10**18);
    if (fCBuyPriceCheck != fCBuyPrice) { revert BuyPriceMightHaveRisen(); }
    IFreedomCash(nativeFreedomCash).buyFreedomCash{value: msg.value}(amount, fCBuyPrice);
  }
}