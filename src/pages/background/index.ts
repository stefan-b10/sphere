import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import { KeyPair, transactions, utils, providers } from "near-api-js";

import {
  createUser,
  recoverSecureState,
  deleteSecureState,
  unlockSecureState,
  isLocked,
  clearSessionState,
  sessionStateGet,
} from "./backgroundState";
import { createHash } from "crypto";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";

reloadOnUpdate("pages/background");

console.log("background loaded");

// TODO REFACTOR ALL VACKGROUND!!!!!!!!!!!!

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
  resolveUntrusted(sender, msg, sendResponse);

  return true;
}

async function resolveUntrusted(
  sender: chrome.runtime.MessageSender,
  msg: Record<string, any>,
  sendResponse: SendResponseFunction
) {
  // check if it comes from the web-page or from extension
  const senderIsExt =
    sender.url &&
    sender.url.startsWith("chrome-extension://" + chrome.runtime.id + "/");
  /*
  
  if (sender.url && !senderIsExt) msg.senderUrl = sender.url.split("/?")[0]; // remove querystring

  */

  switch (msg.code) {
    case "connect":
      isLocked().then((res) => {
        if (!res) {
          sessionStateGet().then((account) => {
            sendResponse({ data: [account.accountId], code: msg.code });
          });
        }
      });
      return;

    case "is-secure-state":
      if (senderIsExt) {
        recoverSecureState().then((res) => {
          sendResponse({
            data: res.hashedPassword != undefined,
            code: msg.code,
          });
        });
      }
      return;

    case "is-signed-in":
      sessionStateGet().then((res) => {
        sendResponse({ data: res.accountId != undefined, code: msg.code });
      });
      return;

    case "create-wallet":
      if (senderIsExt) {
        createUser(msg.network, msg.password, msg.mnemonic).then((res) => {
          sendResponse({ data: "success" });
        });
      }
      return;

    case "unlock":
      if (senderIsExt) {
        unlockSecureState(msg.network, msg.password).then((res) => {
          sendResponse({ data: res, code: msg.code });
        });
      }
      return;

    case "clear-state":
      if (senderIsExt) {
        clearSessionState().then(() => {
          sendResponse({ data: "success" });
        });
      }
      return;

    case "delete-wallet":
      if (senderIsExt) {
        deleteSecureState().then(() => {
          sendResponse({ data: "success", code: msg.code });
        });
      }
      return;

    case "sign-and-send-transaction":
      isLocked().then((locked) => {
        if (locked) return;
        else {
          if (!msg.params.transaction) {
            return;
          }
          if (senderIsExt) {
            commitActions(msg.params.transaction).then((tx) => {
              sendResponse({ data: tx, code: msg.code });
            });
          }
        }
      });
      return;

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

async function commitActions(params: {
  actions: any[];
  receiverId: string;
  signerId: string;
}): Promise<FinalExecutionOutcome> {
  const state = await sessionStateGet();

  // Based on https://docs.near.org/integrator/create-transactions#low-level----create-a-transaction
  const keyPair = KeyPair.fromString(state.privateKey);
  const publicKey = keyPair.getPublicKey();

  const accessKey: AccessKey = await provider.query(
    `access_key/${params.signerId}/${state.publicKey}`,
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
