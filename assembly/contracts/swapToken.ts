import {
    Address,
    callerHasWriteAccess,
  } from '@massalabs/massa-as-sdk';

import {ERC20Token1} from './erc20Token1';
import {ERC20Token2} from './erc20Token2';

export class SwapToken
{
  //type ERC20Token1
  eRC20Token1: ERC20Token1;

  //type ERC20Token2
  eRC20Token2: ERC20Token2;

  /**
   * Initialize the SwapToken contract
   * Can be called only once
   
   * @param eRC20Token1 - the token of type ERC20Token1
   * @param eRC20Token2 - the token of type ERC20Token2
   */
  constructor(eRC20Token1: ERC20Token1, eRC20Token2: ERC20Token2)
  {
    assert(callerHasWriteAccess());
    this.eRC20Token1 = eRC20Token1;
    this.eRC20Token2 = eRC20Token2;
  }

  /**
   * Swap of amount1 ERC20Token1 from address1 to amount2 ERC20Token2 to address2
   * @param address1 - the from address
   * @param amount1 - the number of ERC20Token1.
   * @param address2 - the to address.
   * @param amount2 - the number of ERC20Token2
   */
  swap(address1: Address, amount1: u64, address2: Address, amount2: u64): void
  {
    this.eRC20Token1.transferFrom(address1, address2, amount1);
    this.eRC20Token2.transferFrom(address2, address1, amount2);
  }
}