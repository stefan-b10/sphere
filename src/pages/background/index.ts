import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import {
  KeyPair,
  Near,
  keyStores,
  transactions,
  utils,
  connect,
  Account,
  providers,
} from "near-api-js";

import {
  createUser,
  recoverSecureState,
  saveSecureState,
  deleteSecureState,
  secureState,
  unlockSecureState,
  state,
  isLocked,
  clearState,
} from "./backgroundState";
import { send } from "vite";
import { Action, Transaction } from "near-api-js/lib/transaction";
import { KeyPairEd25519 } from "near-api-js/lib/utils";
import { KeyStore } from "near-api-js/lib/key_stores";
import { createHash } from "crypto";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";

reloadOnUpdate("pages/background");

console.log("background loaded");

chrome.runtime.onMessage.addListener(runtimeMessageHandler);

type SendResponseFunction = (response: any) => void;

function approvePopup(transaction) {
  chrome.runtime.sendMessage({ showApproval: true, data: transaction });

  // TODO handle transaction requests from outside extension
  /*
  chrome.windows.create({
    url: "src/pages/popup/index.html",
    type: "popup",
    width: 350,
    height: 600,
  });
  */
}

function runtimeMessageHandler(
  msg: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: SendResponseFunction
) {
  // check if it comes from the web-page or from extension
  const senderIsExt =
    sender.url &&
    sender.url.startsWith("chrome-extension://" + chrome.runtime.id + "/");

  /*
  if (!senderIsExt || msg.src === "page") {
    resolveUntrustedFromPage(sender, msg, sendResponse);
  }
  */

  resolveUntrustedFromPage(sender, msg, sendResponse);
}

/*
// create promise to resolve the action requested by popup
async function getPromiseFromPopup(msg: Record<string, any>): Promise<any>{
  
}
*/

// Listening for confirm/reject transaction from extensions
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // check if it comes from extension

  if (message.type === "transactionApproval") {
    console.log(`Received approve in background: ${message.approved}`);
  }
});

async function resolveUntrustedFromPage(
  sender: chrome.runtime.MessageSender,
  msg: Record<string, any>,
  sendResponse: SendResponseFunction
) {
  const senderIsExt =
    sender.url &&
    sender.url.startsWith("chrome-extension://" + chrome.runtime.id + "/");
  /*
  
  if (sender.url && !senderIsExt) msg.senderUrl = sender.url.split("/?")[0]; // remove querystring

  */

  switch (msg.code) {
    case "connect":
      if (!isLocked()) {
        sendResponse({ data: state.accountId, code: msg.code });
      }
      return;
    case "is-secure-state":
      if (senderIsExt) {
        sendResponse({ data: secureState.hashedPassword ? true : false });
      }

      return;
    case "is-signed-in":
      sendResponse({ data: !isLocked(), code: msg.code });
      return;
    case "recover-secure-state":
      if (senderIsExt) sendResponse({ data: recoverSecureState() });
      return;
    case "create-wallet":
      if (senderIsExt && !secureState.hashedPassword) {
        createUser(msg.network, msg.password, msg.mnemonic);
        unlockSecureState(msg.network, msg.password);
      }
      sendResponse({ data: "success" });
      return;
    case "unlock":
      if (senderIsExt && secureState.hashedPassword) {
        sendResponse({ data: unlockSecureState(msg.network, msg.password) });
      }
      return;
    case "clear-state":
      if (senderIsExt) {
        clearState();
        sendResponse({ data: "success" });
      }
      return;

    case "delete-wallet":
      if (senderIsExt && secureState.hashedPassword) {
        deleteSecureState();
        sendResponse({ data: "success" });
      }
      return;
    case "public-key":
      if (senderIsExt && state.publicKey) {
        sendResponse({ data: state.publicKey });
      }
      return;
    case "private-key":
      if (senderIsExt && state.privateKey) {
        sendResponse({ data: state.privateKey });
      }
      return;
    case "sign-transaction":
      if (isLocked()) return; // Consider adding unlock

      if (!msg.params.transaction) {
        return;
      }
      console.log("msg receiven in background");
      console.log(msg);
      console.log(state.privateKey);
      console.log(msg.params.privateKey);
      console.log(state.privateKey === msg.params.privateKey);

      if (senderIsExt) {
        const signedTx = signTransaction(
          msg.params.privateKey,
          msg.params.accessKey,
          msg.params.transaction
        );

        sendResponse({
          data: signedTx,
        });
      }
      return;
    case "sign-and-send-transaction":
      if (isLocked()) return; // Consider adding unlock

      if (!msg.params.transaction) {
        return;
      }

      if (senderIsExt) {
        // sendResponse({ data: commitActions(msg.params.transaction) });
      }

      // approvePopup(msg.params.transaction);

      return true;
    case "sign-and-send-transactions":
      // TODO
      if (isLocked()) return; // Consider adding unlock

      if (!msg.params.transaction) {
        return;
      }

      break;
  }
}

// TODO!!! provider change/create function
const provider = new providers.JsonRpcProvider({
  url: `https://rpc.testnet.near.org`,
});

function signTransaction(privateKey, accessKey, params) {
  // Based on https://docs.near.org/integrator/create-transactions#low-level----create-a-transaction
  const keyPair = KeyPair.fromString(privateKey);
  const publicKey = keyPair.getPublicKey();

  // each transaction requires a unique number or nonce
  // this is created by taking the current nonce and incrementing it
  const nonce = ++accessKey.nonce;

  // converts a recent block hash into an array of bytes
  // this hash was retreived earlier when creating the accessKey
  // this is required to prove the tx was recently constructed (within 24hrs)
  const recentBlockHash = utils.serialize.base_decode(accessKey.block_hash);

  const reconstructedActions = params.actions.map((action: any) =>
    createCorrespondingAction(action)
  );

  // create transaction
  const transaction = transactions.createTransaction(
    params.signerId,
    publicKey,
    params.receiverId,
    nonce,
    reconstructedActions,
    recentBlockHash
  );

  // before we can sign the transaction we must perform three steps...
  // 1) serialize the transaction in Borsh
  const serializedTx = utils.serialize.serialize(
    transactions.SCHEMA,
    transaction
  );
  // 2) hash the serialized transaction using sha256
  const serializedTxBuffer = Buffer.from(serializedTx);
  const sha256Hash = createHash("sha256").update(serializedTxBuffer).digest();
  const serializedTxHash = new Uint8Array(sha256Hash);
  // 3) create a signature using the hashed transaction
  const signature = keyPair.sign(serializedTxHash);
  // now we can sign the transaction
  const signedTransaction = new transactions.SignedTransaction({
    transaction,
    signature: new transactions.Signature({
      keyType: transaction.publicKey.keyType,
      data: signature.signature,
    }),
  });
  console.log("signedTransaction");
  console.log(signedTransaction);
  // encode signed transaction to serialized Borsh (required for all transactions)
  const signedSerializedTx = signedTransaction.encode();
  console.log("signed serializedtx");
  console.log(signedSerializedTx);

  return signedSerializedTx;
}

// Promise<FinalExecutionOutcome>
async function commitActions(params): Promise<any> {
  // Based on https://docs.near.org/integrator/create-transactions#low-level----create-a-transaction
  const keyPair = KeyPair.fromString(state.privateKey);
  const publicKey = keyPair.getPublicKey();

  const accessKey: AccessKey = await provider.query(
    `access_key/${state.accountId}/${state.publicKey}`,
    ""
  );

  // each transaction requires a unique number or nonce
  // this is created by taking the current nonce and incrementing it
  const nonce = ++accessKey.nonce;

  // converts a recent block hash into an array of bytes
  // this hash was retreived earlier when creating the accessKey
  // this is required to prove the tx was recently constructed (within 24hrs)
  const recentBlockHash = utils.serialize.base_decode(accessKey.block_hash);

  const reconstructedActions = params.actions.map((action: any) =>
    createCorrespondingAction(action)
  );

  // create transaction
  const transaction = transactions.createTransaction(
    state.accountId,
    publicKey,
    params.receiverId,
    nonce,
    reconstructedActions,
    recentBlockHash
  );

  // before we can sign the transaction we must perform three steps...
  // 1) serialize the transaction in Borsh
  const serializedTx = utils.serialize.serialize(
    transactions.SCHEMA,
    transaction
  );
  // 2) hash the serialized transaction using sha256
  const serializedTxBuffer = Buffer.from(serializedTx);
  const sha256Hash = createHash("sha256").update(serializedTxBuffer).digest();
  const serializedTxHash = new Uint8Array(sha256Hash);
  // 3) create a signature using the hashed transaction
  const signature = keyPair.sign(serializedTxHash);
  // now we can sign the transaction
  const signedTransaction = new transactions.SignedTransaction({
    transaction,
    signature: new transactions.Signature({
      keyType: transaction.publicKey.keyType,
      data: signature.signature,
    }),
  });

  // encode signed transaction to serialized Borsh (required for all transactions)
  const signedSerializedTx = signedTransaction.encode();

  // TODO HANDLE ERRORS!!!
  return provider.sendJsonRpc("broadcast_tx_commit", [
    Buffer.from(signedSerializedTx).toString("base64"),
  ]);
}

function createCorrespondingAction(action: any): transactions.Action {
  switch (action.type) {
    case "FunctionCall":
      return transactions.functionCall(
        action.params.methodName,
        action.params.args,
        action.params.gas,
        action.params.deposit
      );
    case "Transfer":
      return transactions.transfer(action.params.deposit);
    case "DeleteAccount":
      return transactions.deleteAccount(action.params.beneficiaryAccountId);
    default:
      throw new Error(`action.type not recognized: ${action.type}`);
  }
}

declare class AccessKey {
  nonce: number;
  permission: string;
  block_height: number;
  block_hash: string;
}

/* TODO
async function handleUnlock(
  msg: Record<string, any>,
  sendResponse: SendResponseFunction
) {
  const width = 350;
  const height = 600;
  chrome.windows.create({
    url: "index.html",
    type: "popup",
    left: 400,
    top: 100,
    width: width,
    height: height,
    focused: true,
  });
}
*/

function stateIsEmpty(): boolean {
  return !state.accountId;
}
