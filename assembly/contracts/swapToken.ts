import {
    Address,
    Context,
    generateEvent,
    Storage,
    createEvent,
    callerHasWriteAccess,
  } from '@massalabs/massa-as-sdk';
  import {
    Args,
    bytesToU64,
    stringToBytes,
    u64ToBytes,
    boolToByte,
    bytesToString,
    byteToBool,
  } from '@massalabs/as-types';
import {ERC20Token1} from './token1';
import {ERC20Token2} from './token2';


export class SwapToken
{
  eRC20Token1: ERC20Token1;
  eRC20Token2: ERC20Token2;

  constructor(eRC20Token1: ERC20Token1, eRC20Token2: ERC20Token2)
  {
    assert(callerHasWriteAccess());
    this.eRC20Token1 = eRC20Token1;
    this.eRC20Token2 = eRC20Token2;
  }

  // swap of amount1 token1 from address1 to amount2 token2 to address2
  swap(address1: Address, amount1: u64, address2: Address, amount2: u64): void
  {
    this.eRC20Token1.transferFrom(address1, address2, amount1);
    this.eRC20Token2.transferFrom(address2, address1, amount2);
  }
}