import {Erc20Token, Transfer as TransferEvent} from "../generated/templates/Erc20Token/Erc20Token"
import {Token, TokenBalance} from "../generated/schema"
import {Address, BigInt, Bytes} from "@graphprotocol/graph-ts";
import {ADDRESS_ZERO, convertTokenToDecimal} from "./helpers";

const SYNC_FROM_BLOCK_NUMBER = 89886076

export function handleTransfer(event: TransferEvent): void {
  updateTokenBalance(event.params.to, event);
  updateTokenBalance(event.params.from, event);
}

function updateTokenBalance(address: Address,  event: TransferEvent): void {

  let tokenAddress = event.address

  if (address.toHexString() == ADDRESS_ZERO) {
    return
  }

  let tokenBalanceKey = Bytes.fromHexString(address.toHexString().concat(tokenAddress.toHexString()));
  let tokenBalance = TokenBalance.load(tokenBalanceKey);
  let token = Token.load(tokenAddress.toHexString())
  let isFirstCreation = false;

  if (token === null) {
    return;
  }

  if (tokenBalance == null) {
    tokenBalance = new TokenBalance(tokenBalanceKey);
    tokenBalance.tokenAddress = tokenAddress.toHexString();
    tokenBalance.user = address.toHexString();
    tokenBalance.balance = convertTokenToDecimal(Erc20Token.bind(tokenAddress).balanceOf(address), token.decimals);
    isFirstCreation = true;
  }

  // This is only used so our graph will sync faster.
  if (event.block.number.gt(BigInt.fromI32(SYNC_FROM_BLOCK_NUMBER)) && !isFirstCreation) {
    tokenBalance.balance = convertTokenToDecimal(Erc20Token.bind(tokenAddress).balanceOf(address), token.decimals);
  }

  tokenBalance.lastUpdatedAtTimestamp = event.block.timestamp;
  tokenBalance.lastUpdatedAtBlockNumber = event.block.number;

  tokenBalance.save();
}