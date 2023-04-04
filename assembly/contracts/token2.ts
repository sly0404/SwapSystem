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

const TRANSFER_EVENT_NAME = 'TRANSFER';
const APPROVAL_EVENT_NAME = 'APPROVAL';

export const NAME_KEY2 = stringToBytes('NAME2');
export const SYMBOL_KEY2 = stringToBytes('SYMBOL2');
export const TOTAL_SUPPLY_KEY2 = stringToBytes('TOTAL_SUPPLY2');
export const DECIMALS_KEY = stringToBytes('DECIMALS');
export const OWNER_KEY2 = 'OWNER2';
export const NOT_SET = 'NOT_SET';
export const CHANGE_OWNER_EVENT_NAME = 'CHANGE_OWNER';
export const BALANCE_KEY2 = 'BALANCE2';
  
export class ERC20Token2
{
 
  /**
   * Initialize the ERC20 contract
   * Can be called only once
   *
   * @example
   * ```typescript
   *   constructor(
   *   new Args()
   *     .add('TOKEN_NAME')
   *     .add('TOKEN_SYMBOL')
   *     .add(3) // decimals
   *     .add(1000) // total supply
   *     .serialize(),
   *   );
   * ```
   *
   * @param stringifyArgs - Args object serialized as a string containing:
   * - the token name (string)
   * - the token symbol (string).
   * - the decimals (u8).
   * - the totalSupply (u64)
   * - first owner (address)e
   */
  constructor(creatorAddress: Address, name: string, symbol: string, decimals: u8, totalSupply: u64)
  {
    //assert(callerHasWriteAccess());
  
    // initialize token name
    Storage.set(NAME_KEY2, stringToBytes(name));
  
    // initialize token symbol
    Storage.set(SYMBOL_KEY2, stringToBytes(symbol));
  
    // initialize token decimals
    Storage.set(DECIMALS_KEY, [decimals]);
  
    // initialize totalSupply
    Storage.set(TOTAL_SUPPLY_KEY2, u64ToBytes(totalSupply));
  
    this.setOwner(creatorAddress.toString());
    this._setBalance(creatorAddress, totalSupply);
  }
  
  // ======================================================== //
  // ====                 TOKEN ATTRIBUTES               ==== //
  // ======================================================== //
  
  /**
   * Returns the name of the token.
   *
   * @param _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
   * @returns token name.
   */
  public name(): string
  {
    return bytesToString(Storage.get(NAME_KEY2));
  }
  
  /** Returns the symbol of the token.
   *
   * @param _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
   * @returns token symbol.
   */
  public symbol(): string
  {
    return bytesToString(Storage.get(SYMBOL_KEY2));
  }
  
  /**
   * Returns the total token supply.
   *
   * The number of tokens that were initially minted.
   *
   * @param _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
   * @returns u64
   */
  public totalSupply(): u64
  {
    return bytesToU64(Storage.get(TOTAL_SUPPLY_KEY2));
  }
  
  /**
   * Returns the maximum number of digits being part of the fractional part
   * of the token when using a decimal representation.
   *
   * @param _ - unused see https://github.com/massalabs/massa-sc-std/issues/18
   * @returns
   */
  public decimals(): u8
  {
    return bytesToU64(Storage.get(DECIMALS_KEY));
  }
  
  // ==================================================== //
  // ====                 BALANCE                    ==== //
  // ==================================================== //
  
  /**
  * @param address -
  * @returns the key of the balance in the storage for the given address
  */
  private getBalanceKey(address: Address): StaticArray<u8> 
  {
    return stringToBytes(BALANCE_KEY2 + address.toString());
  }
  
  /**
   * Returns the balance of an account.
   *
   * @param binaryArgs - Args object serialized as a string containing an owner's account (Address).
   */
  public balanceOf(addr: Address): u64
  {
    const key = this.getBalanceKey(addr);
    if (Storage.has(key)) 
    {
      return bytesToU64(Storage.get(key));
   }
    else
      return 0;
  }
  
  // ==================================================== //
  // ====                 TRANSFER                   ==== //
  // ==================================================== //
  
  /**
   * Transfers tokens from the caller's account to the recipient's account.
   *
   * @param from - sender address
   * @param to - recipient address
   * @param amount - number of token to transfer
   *
   * @returns true if the transfer is successful
   */
  private _transfer(from: Address, to: Address, amount: u64): bool 
  {
    const currentFromBalance = this.balanceOf(from);
    const currentToBalance = this.balanceOf(to);
    const newToBalance = currentToBalance + amount;
  
    if (
      currentFromBalance < amount || // underflow of balance from
      newToBalance < currentToBalance
    ) {
      // overflow of balance to
      return false;
    }
  
    this._setBalance(from, currentFromBalance - amount);
    this._setBalance(to, newToBalance);
  
    return true;
  }

  /**
 * Transfers tokens from the caller's account to the recipient's account.
 *
 * @param binaryArgs - Args object serialized as a string containing:
 * - the recipient's account (address)
 * - the number of tokens (u64).
 */
  public transfer(toAddress: Address, amount: u64): void 
  {
    const owner = Context.caller();
    assert(this._transfer(owner, toAddress, amount),'Transfer failed: Invalid amount',);
    generateEvent(
      createEvent(TRANSFER_EVENT_NAME, [
        owner.toString(),
        toAddress.toString(),
        amount.toString(),
      ]),
    );
  }
  
  /**
   * Transfers token ownership from the owner's account to the recipient's account
   * using the spender's allowance.
   *
   * This function can only be called by the spender.
   * This function is atomic:
   * - both allowance and transfer are executed if possible;
   * - or if allowance or transfer is not possible, both are discarded.
   *
   * @param binaryArgs - Args object serialized as a string containing:
   * - the owner's account (address);
   * - the recipient's account (address);
   * - the amount (u64).
   */
  public transferFrom(fromAddress: Address, toAddress: Address, amount: u64): void 
  {
    const owner = Context.caller();
    const spenderAddress: Address = fromAddress;
    const recipient: Address = toAddress;
    const spenderAllowance = this.allowance(owner, spenderAddress);
    assert(spenderAllowance >= amount,'transferFrom failed: insufficient allowance',);
    assert(this._transfer(spenderAddress, recipient, amount),'transferFrom failed: invalid amount',);
  
    this.approve(owner, spenderAddress, spenderAllowance - amount);

  }

  // ==================================================== //
  // ====                 ALLOWANCE                  ==== //
  // ==================================================== //
  

  /**
   * Returns the allowance set on the owner's account for the spender.
   *
   * @param owner - owner's id
   * @param spenderAddress - spender's id
   *
   * @returns the allowance
   */
  public allowance(owner: Address, spenderAddress: Address): u64
  {
    const key = stringToBytes(owner.toString().concat(spenderAddress.toString()));
    return Storage.has(key) ? bytesToU64(Storage.get(key)) : 0;
  }
  
  /**
   * Increases the allowance of the spender on the owner's account by the amount.
   *
   * This function can only be called by the owner.
   *
   * @param binaryArgs - Args object serialized as a string containing:
   * - the spender's account (address);
   * - the amount (u64).
   */
  public increaseAllowance(spenderAddress: Address, amount: u64): void 
  {
    const owner = Context.caller(); 
    const newAllowance = this.allowance(owner, spenderAddress) + amount;
    assert(newAllowance >= amount,'Increasing allowance with requested amount causes an overflow',);
  
    this.approve(owner, spenderAddress, newAllowance);
  }
  
  /**
   * Decreases the allowance of the spender the on owner's account by the amount.
   *
   * This function can only be called by the owner.
   *
   * @param binaryArgs - Args object serialized as a string containing:
   * - the spender's account (address);
   * - the amount (u64).
   */
  public decreaseAllowance(binaryArgs: StaticArray<u8>): void 
  {
    const owner = Context.caller();
  
    const args = new Args(binaryArgs);
    const spenderAddress = new Address(
      args.nextString().expect('spenderAddress argument is missing or invalid'),
    );
    const amount = args.nextU64().expect('amount argument is missing or invalid');
  
    const current = this.allowance(owner, spenderAddress);
  
    assert(
      current >= amount,
      'Decreasing allowance with requested amount causes an underflow',
    );
  
    const newAllowance = current - amount;
  
    this.approve(owner, spenderAddress, newAllowance);
  }
  
  /**
   * Sets the allowance of the spender on the owner's account.
   *
   * @param owner - owner address
   * @param spenderAddress - spender address
   * @param amount - amount to set an allowance for
   */
  public approve(owner: Address, spenderAddress: Address, amount: u64): void 
  {
    const key = stringToBytes(owner.toString().concat(spenderAddress.toString()));
    Storage.set(key, u64ToBytes(amount));

    generateEvent(
      createEvent(APPROVAL_EVENT_NAME, [
        owner.toString(),
        spenderAddress.toString(),
        amount.toString(),
      ]),
    );
  }
  

  /**
   *  Set the contract owner
   *
   * @param binaryArgs - byte string with the following format:
   * - the address of the new contract owner (address).
   */
  private setOwner(newOwner: string): void
  {
    const contractOwner = this.ownerAddress([]);
    const callerIsOwner = byteToBool(this.isOwner(Context.caller()));
    assert(
      callerIsOwner || bytesToString(contractOwner) === NOT_SET,
      'Caller is not the owner',
    );
    Storage.set(OWNER_KEY2, newOwner);
    //generateEvent(createEvent(CHANGE_OWNER_EVENT_NAME, [newOwner]));
  }

  /**
   *  Returns the contract owner
   *
   * @returns owner address in bytes
   */
  public ownerAddress(_: StaticArray<u8>): StaticArray<u8> 
  {
    return stringToBytes(
      Storage.has(OWNER_KEY2) ? Storage.get(OWNER_KEY2) : NOT_SET,
    );
  }
  
  /**
   * Returns true if address is the owner of the contract.
   *
   * @param address -
   */
  public isOwner(address: Address): StaticArray<u8> 
  {
    // values are bytes array so cannot use ===
    const owner = this.ownerAddress([]);
    const isOwner = address === new Address(bytesToString(owner));
    return boolToByte(isOwner);
  }
  
  /**
   *
   * @param address -
   */
  public ownerKey(address: Address): StaticArray<u8> 
  {
    return new Args().add('owned' + address.toString()).serialize();
  }

  /**
 * Theses function are intended to be used in different token types (mintable, burnable...).
 * We define them and export in this file to avoid exporting them in the contract entry file,
 * making them callable from the outside world
 *
 */

/**
 * Sets the balance of a given address.
 *
 * @param address - address to set the balance for
 * @param balance -
 */
private _setBalance(address: Address, balance: u64): void 
{
  Storage.set(this.getBalanceKey(address), u64ToBytes(balance));
}

}