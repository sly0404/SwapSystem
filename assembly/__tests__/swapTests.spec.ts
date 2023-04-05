import { Address, Context } from '@massalabs/massa-as-sdk';

import {ERC20Token1} from '../contracts/erc20Token1';
import {ERC20Token2} from '../contracts/erc20Token2';
import {SwapToken} from '../contracts/swapToken';

const TOKEN_NAME1 = 'XToken1';
const TOKEN_NAME2 = 'XToken2';
const TOKEN_SYMBOL1 = 'XTN1';
const TOKEN_SYMBOL2 = 'XTN2';
const DECIMALS: u8 = 8;
const TOTAL_SUPPLY1: u64 = 540;
const TOTAL_SUPPLY2: u64 = 890;


const emptyBalanceAddress = new Address(
  'A12BqZEQ6sByhRLyEuf0YbQmcF2PsDdkNNG1akBJu9XcjZA1eT',
);

const address1 = new Address(
  'AU1Aa1owQcdiTvvh84L5WDmLgxagq4Tt3t5AcKLzhUVfjG5mfUcH',
);
const address2 = new Address(
  'AU12iSuReUSxGDrmgFAXPgnKnt6BZDWkpUAdjyAZ1mQZVPK69iGox',
);

const erc20Token1 = new ERC20Token1(address1, TOKEN_NAME1, TOKEN_SYMBOL1, DECIMALS, TOTAL_SUPPLY1);
const erc20Token2 = new ERC20Token2(address2, TOKEN_NAME2, TOKEN_SYMBOL2, DECIMALS, TOTAL_SUPPLY2);
const swapToken = new SwapToken(erc20Token1, erc20Token2);



describe('Initialization', () => {
  test('total supply 1 is properly initialized', () =>
    expect(erc20Token1.totalSupply()).toStrictEqual(TOTAL_SUPPLY1));
  test('total supply 2 is properly initialized', () =>
    expect(erc20Token2.totalSupply()).toStrictEqual(TOTAL_SUPPLY2));
});

describe('BalanceOf', () => {
  test('Check an empty balance', () =>
    expect(
      erc20Token1.balanceOf(emptyBalanceAddress),
    ).toStrictEqual(0));

  test('Check a non empty balance', () =>
    expect(erc20Token1.balanceOf(address1)).toBe(540));
  test('Check a non empty balance', () =>
    expect(erc20Token2.balanceOf(address2)).toBe(890));
});


describe('Allowance', () => {
  test('check Allowance 1', () => {
    const allowance1: u64 = 30;
    const owner = Context.caller();
    expect(
      erc20Token1.allowance(owner, address1),
    ).toStrictEqual(0);
    erc20Token1.increaseAllowance(address1, allowance1);
    expect(
      erc20Token1.allowance(owner, address1),
    ).toStrictEqual(allowance1);
  });

  test('check Allowance 2', () => {
    const allowance2: u64 = 40;
    const owner = Context.caller();
    expect(
      erc20Token2.allowance(owner, address2),
    ).toStrictEqual(0);
    erc20Token2.increaseAllowance(address2, allowance2);
    expect(
      erc20Token2.allowance(owner, address2),
    ).toStrictEqual(allowance2);
  });
});




describe('TransferFrom', () => {
  test('TransferFrom address1 to address2', () => {
    const amount: u64 = 5;
    // balance of number of token1 of address1 before transfer
    const address1BalanceBeforeTransferToken1: u64 = erc20Token1.balanceOf(address1);
    // balance of number of token1 of address2 before transfer
    const address2BalanceBeforeTransferToken1: u64 = erc20Token1.balanceOf(address2);
    erc20Token1.transferFrom(address1, address2, amount);
    expect(
      erc20Token1.balanceOf(address1),
    ).toStrictEqual(address1BalanceBeforeTransferToken1-amount);

    // check if amount has been added to balance of token1 of address2
    expect(
      erc20Token1.balanceOf(address2),
    ).toStrictEqual(address2BalanceBeforeTransferToken1+amount);
  });

  test('TransferFrom address2 to address1', () => {
    const amount: u64 = 9;
    // balance of number of token2 of address2 before transfer
    const address2BalanceBeforeTransferToken2: u64 = erc20Token2.balanceOf(address2);
    
    // balance of number of token2 of address1 before transfer
    const address1BalanceBeforeTransferToken2: u64 = erc20Token2.balanceOf(address1);
    erc20Token2.transferFrom(address2, address1, amount);
    expect(
      erc20Token2.balanceOf(address2),
    ).toStrictEqual(address2BalanceBeforeTransferToken2-amount);

    // check if amount has been added to balance of token2 of address1
    expect(
      erc20Token2.balanceOf(address1),
    ).toStrictEqual(address1BalanceBeforeTransferToken2+amount);
  });
});





describe('Swap', () => {
  const amount1: u64 = 6;
  const amount2: u64 = 4;
  test('Swap between Token1 et Token2', () => {
    // balance of number of token1 of address1 before swap
    const address1BalanceBeforeTransferToken1: u64 = erc20Token1.balanceOf(address1);
    
    // balance of number of token1 of address2 before swap
    const address2BalanceBeforeTransferToken1: u64 = erc20Token1.balanceOf(address2);
    
    // balance of number of token2 of address2 before swap
    const address2BalanceBeforeTransferToken2: u64 = erc20Token2.balanceOf(address2);
    
    // balance of number of token2 of address1 before swap
    const address1BalanceBeforeTransferToken2: u64 = erc20Token2.balanceOf(address1);
    swapToken.swap(address1, amount1, address2, amount2);

    // check if amount1 has been substracted from balance of token1 of address1
    expect(
      erc20Token1.balanceOf(address1),
    ).toStrictEqual(address1BalanceBeforeTransferToken1-amount1);

    // check if amount1 has been added to balance of token1 of address2
    expect(
      erc20Token1.balanceOf(address2),
    ).toStrictEqual(address2BalanceBeforeTransferToken1+amount1);

    // check if amount2 has been substracted from balance of token2 of address2
    expect(
      erc20Token2.balanceOf(address2),
    ).toStrictEqual(address2BalanceBeforeTransferToken2-amount2);

    // check if amount2 has been added to balance of token2 of address1
    expect(
      erc20Token2.balanceOf(address1),
    ).toStrictEqual(address1BalanceBeforeTransferToken2+amount2);
  });
});