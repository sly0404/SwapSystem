import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { deploySC, WalletClient, ISCData } from '@massalabs/massa-sc-deployer';
import { Args, fromMAS, IBalance, IEvent } from '@massalabs/massa-web3';

dotenv.config();

const publicApi = process.env.JSON_RPC_URL_PUBLIC;
if (!publicApi) {
  throw new Error('Missing JSON_RPC_URL_PUBLIC in .env file');
}
const privKey = process.env.WALLET_PRIVATE_KEY;
if (!privKey) {
  throw new Error('Missing WALLET_PRIVATE_KEY in .env file');
}

const deployerAccount = await WalletClient.getAccountFromSecretKey(privKey);

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(path.dirname(__filename));

const buildFileName1 = 'token1.wasm';
const buildFileName2 = 'token2.wasm';
const buildFileName3 = 'swapToken.wasm';
const token1constructorParameter1 = 'XToken1';
const token1constructorParameter2 = 'XTN1';
const token1constructorParameter3 = 8;
const token1constructorParameter4 = 540n;

const token2constructorParameter1 = 'XToken2';
const token2constructorParameter2 = 'XTN2';
const token2constructorParameter3 = 8;
const token2constructorParameter4 = 890n;

const adressString1 = 'AU1Aa1owQcdiTvvh84L5WDmLgxagq4Tt3t5AcKLzhUVfjG5mfUcH';
const adressString2 = 'AU12iSuReUSxGDrmgFAXPgnKnt6BZDWkpUAdjyAZ1mQZVPK69iGox';


(async () => {
  let deployedInfo1 = await deploySC(
    publicApi,
    deployerAccount,
    [
      {
        data: readFileSync(path.join(__dirname, 'build', buildFileName1)),
        coins: fromMAS(0.1),
        args: new Args().addString(adressString1).addString(token1constructorParameter1).addString(token1constructorParameter2).addU8(token1constructorParameter3).addU64(token1constructorParameter4),
      } as ISCData,
    ],
    0n,
    4_200_000_000n,
    true,
  );
  let deployedInfo2 = await deploySC(
    publicApi,
    deployerAccount,
    [
      {
        data: readFileSync(path.join(__dirname, 'build', buildFileName2)),
        coins: fromMAS(0.1),
        args: new Args().addString(adressString2).addString(token2constructorParameter1).addString(token2constructorParameter2).addU8(token2constructorParameter3).addU64(token2constructorParameter4),
      } as ISCData,
    ],
    0n,
    4_200_000_000n,
    true,
  );
  let deployedInfo3 = await deploySC(
    publicApi,
    deployerAccount,
    [
      {
        data: readFileSync(path.join(__dirname, 'build', buildFileName3)),
        coins: fromMAS(0.1),
        args: new Args().addString(adressString1).addString(adressString2),
      } as ISCData,
    ],
    0n,
    4_200_000_000n,
    true,
  );
  const data1 = (deployedInfo1.events?.find((e) => e.data) as IEvent).data;
  const address1 = data1.split('Contract deployed at address:')[1].trim();
  console.log('Contract address 1 = ' + address1);
  const data2 = (deployedInfo2.events?.find((e) => e.data) as IEvent).data;
  const address2 = data2.split('Contract deployed at address:')[1].trim();
  console.log('Contract address 2 = ' + address2);
  const data3 = (deployedInfo3.events?.find((e) => e.data) as IEvent).data;
  const address3 = data3.split('Contract deployed at address:')[1].trim();
  console.log('Contract address 3 = ' + address3);
  console.log('End');
  process.exit(0);
})();
