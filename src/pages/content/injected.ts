import { AccessKey } from "near-api-js/lib/transaction";

declare type BlockHash = string;
declare type BlockHeight = number;
declare type BlockId = BlockHash | BlockHeight;
declare type Finality = "optimistic" | "near-final" | "final";
declare type BlockReference =
  | {
      blockId: BlockId;
    }
  | {
      finality: Finality;
    }
  | {
      sync_checkpoint: "genesis" | "earliest_available";
    };
declare enum ExecutionStatusBasic {
  Unknown = "Unknown",
  Pending = "Pending",
  Failure = "Failure",
}
interface ExecutionStatus {
  SuccessValue?: string;
  SuccessReceiptId?: string;
  Failure?: ExecutionError;
}
declare enum FinalExecutionStatusBasic {
  NotStarted = "NotStarted",
  Started = "Started",
  Failure = "Failure",
}
interface ExecutionError {
  error_message: string;
  error_type: string;
}
interface FinalExecutionStatus {
  SuccessValue?: string;
  Failure?: ExecutionError;
}
interface ExecutionOutcomeWithId {
  id: string;
  outcome: ExecutionOutcome;
}
interface ExecutionOutcome {
  logs: string[];
  receipt_ids: string[];
  gas_burnt: number;
  status: ExecutionStatus | ExecutionStatusBasic;
}
interface FinalExecutionOutcome {
  status: FinalExecutionStatus | FinalExecutionStatusBasic;
  transaction: any;
  transaction_outcome: ExecutionOutcomeWithId;
  receipts_outcome: ExecutionOutcomeWithId[];
}

/********** Start extracted/converted from near-api-js **********/

declare class FunctionCallPermission {
  allowance?: bigint;
  receiverId: string;
  methodNames: string[];
}

declare abstract class Enum {
  enum: string;
  constructor(properties: any);
}

declare class CreateAccount {}

declare class DeployContract {
  code: Uint8Array;
}

declare class FunctionCall {
  methodName: string;
  args: Uint8Array;
  gas: bigint;
  deposit: bigint;
}

declare class Transfer {
  deposit: bigint;
}

declare class Stake {
  stake: bigint;
  publicKry: PublicKey;
}

declare class AddKey {
  publicKey: PublicKey;
  access_Key: AccessKey;
}

declare class DeleteKey {
  publicKey: PublicKey;
}

declare class DeleteAccount {
  beneficiaryId: string;
}

declare class Action extends Enum {
  createAccount: CreateAccount;
  deployContract: DeployContract;
  functionCall: FunctionCall;
  transfer: Transfer;
  stake: Stake;
  addKey: AddKey;
  deleteKey: DeleteKey;
  deleteAccount: DeleteAccount;
}

declare class PublicKey {
  keyType: KeyType;
  data: Uint8Array;
  static from(value: string | PublicKey): PublicKey;
  static fromString(encodedKey: string): PublicKey;
  toString(): string;
  verify(message: Uint8Array, signature: Uint8Array): boolean;
}
declare class Signature {
  keyType: KeyType;
  data: Uint8Array;
}

declare class Transaction {
  signerId: string;
  publicKey: PublicKey;
  nonce: bigint;
  receiverId: string;
  actions: Action[];
  blockHash: Uint8Array;
  encode(): Uint8Array;
  static decode(bytes: Buffer): Transaction;
}

declare class SignedTransaction {
  transaction: Transaction;
  signature: Signature;
  encode(): Uint8Array;
  static decode(bytes: Buffer);
}

/********** Finish extracted/converted from near-api-js **********/

// Standard interface for injected wallets according to
// https://github.com/near/NEPs/blob/master/specs/Standards/Wallets/InjectedWallets.md

/********** Start standard wallet interface **********/

interface Account {
  accountId: string;
  publicKey: PublicKey;
}

interface Network {
  networkId: string;
  nodeUrl: string;
}

interface SignInParams {
  permission: FunctionCallPermission;
  accounts: Array<Account>;
}

interface SignOutParams {
  accounts: Array<Account>;
}

interface TransactionOptions {
  receiverId: string;
  actions: Array<Action>;
  signerId: string;
}

interface SignTransactionParams {
  transaction: TransactionOptions;
}

interface SignTransactionsParams {
  transactions: Array<TransactionOptions>;
}

interface Events {
  accountsChanged: { accounts: Array<Account> };
}

interface ConnectParams {
  networkId: string;
}

type Unsubscribe = () => void;

interface Wallet {
  id: string;
  connected: boolean;
  network: Network;
  accounts: Array<string>;

  supportsNetwork(networkId: string): Promise<boolean>;
  connect(params: ConnectParams): Promise<Array<string>>;
  signIn(params: SignInParams): Promise<void>;
  signOut(params: SignOutParams): Promise<void>;
  signTransaction(params: SignTransactionParams): Promise<SignedTransaction>;
  signTransactions(
    params: SignTransactionsParams
  ): Promise<Array<SignedTransaction>>;
  disconnect(): Promise<void>;
  on<EventName extends keyof Events>(
    event: EventName,
    callback: (params: Events[EventName]) => void
  ): Unsubscribe;
  off<EventName extends keyof Events>(
    event: EventName,
    callback?: () => void
  ): void;
}

/********** Finish standard wallet interface **********/
const DEFAULT_NETWORK = {
  networkId: "testnet",
  nodeUrl: "https://rpc/testnet.near.org",
};

window.sphere = {
  id: "Spherewallet",
  connected: false,
  network: DEFAULT_NETWORK,
  accounts: [],
  supportsNetwork,
  connect,
  signIn,
  signOut,
  signTransaction,
  signTransactions,
  disconnect,
  on,
  off,
};

type Resolve =
  | string
  | boolean
  | FinalExecutionOutcome
  | Array<FinalExecutionOutcome>
  | Network
  | Account
  | SignedTransaction
  | SignedTransaction[];

type SwalletFunctionParams =
  | undefined
  | boolean
  | SignTransactionParams
  | SignTransactionsParams
  | SignAndSendTransactionParams
  | Array<SignTransactionParams>
  | ConnectParams;

interface SignAndSendTransactionParams {
  signerId?: string;
  receiverId?: string;
  actions: Array<Action>;
}

interface PendingPromises {
  id_wallet_selector: number;
  code: string;
  resolve: (value: Resolve) => void;
  reject: (reson?: string) => void;
  timeout?: number;
}

let id = 0;
const pendingPromises: Array<PendingPromises> = [];

const sendToSwallet = (
  code: string,
  params?: SwalletFunctionParams
): Promise<Resolve> => {
  const promise = new Promise<Resolve>((resolve, reject) => {
    id++;
    pendingPromises.push({ id_wallet_selector: id, code, resolve, reject });
    window.postMessage({
      id,
      src: "page",
      type: "mw",
      code,
      dest: "ext",
      params,
    });
  });
  return promise;
};

async function supportsNetwork(networkId: string): Promise<boolean> {
  return ["mainnet", "testnet"].includes(networkId);
}

/**
 * Request visibility for one or more accounts from the wallet. This should explicitly prompt the user to select from their list of imported accounts. dApps can use the accounts property once connected to retrieve the list of visible accounts.
 * Note: Calling this method when already connected will allow users to modify their selection, triggering the 'accountsChanged' event.
 * @param params
 * @returns An array with the selected account id (on wallet-selector they want an array in case someone wants to have more accounts to decide)
 */
async function connect(params: ConnectParams): Promise<Array<string>> {
  const accountResponse = (await sendToSwallet("connect", params)) as string;
  console.log(typeof accountResponse);
  window.sphere.accounts.push(accountResponse);
  window.sphere.connected = true;
  return [accountResponse];
}

/**
 * Remove visibility of all accounts from the wallet.
 */
async function disconnect(): Promise<void> {
  if (!(await isSignedIn())) {
    return;
  }

  window.sphere.accounts = [];
  window.sphere.connected = false;
  return;
}

/**
 * Add FunctionCall access key(s) for one or more accounts. This request should require explicit approval from the user.
 * https://docs.near.org/concepts/basics/accounts/access-keys
 * @param params
 * @returns
 */
async function signIn(params: SignInParams): Promise<void> {
  // Not implemented!!!
  await sendToSwallet("sing-in");
}

/**
 * Delete FunctionCall access key(s) for one or more accounts. This request should require explicit approval from the user.
 * No need for SignOutParams as there will be one user in accounts at the moment!
 * @param param
 * @returns
 */
async function signOut(param?: SignOutParams): Promise<void> {
  // Not implemented!!!
 
}

/**
 * Sign a transaction. This request should require explicit approval from the user.
 * @param params
 * @returns Type SignedTransaction is not properly defined yet, so FinalExecutionOutcome will be returned
 */
async function signTransaction(
  params: SignTransactionParams
): Promise<SignedTransaction> {
  return sendToSwallet("sign-and-send-transaction", params).then(
    (response: Resolve) => response as SignedTransaction
  );
}

async function signTransactions(params: SignTransactionsParams) {
  return sendToSwallet("sign-and-send-transactions", params).then(
    (response: Resolve) => response as SignedTransaction[]
  );
}

/**
 * Triggered whenever accounts are updated (e.g. calling connect or disconnect).
 * @param event
 * @param callbak
 * @returns
 */
function on<EventName extends keyof Events>(
  event: EventName,
  callbak: (params: Events[EventName]) => void
): Unsubscribe {
  switch (event) {
    case "accountsChanged":
      return () => {
        console.log("Not yet implemented");
      };
    default:
      return () => {
        console.log("Not yet implemented");
      };
  }
}

/**
 * No documentation
 * @param event
 * @param callback
 */
function off<EventName extends keyof Events>(
  event: EventName,
  callback?: () => void
): void {}

const isSignedIn = () => {
  return sendToSwallet("is-signed-in");
};

const findPendingPromiseById = (
  promiseId: number
): PendingPromises | undefined => {
  return pendingPromises.filter((c) => c.id_wallet_selector === promiseId)[0];
};

const removePendingPromise = (callback: PendingPromises) => {
  const index = pendingPromises.indexOf(callback);
  if (index > -1) {
    pendingPromises.splice(index, 1);
  }
};

window.addEventListener("message", (event) => {
  if (event.source !== window) {
    return;
  }
  const { data } = event;

  if (!data || data.dest !== "page") {
    return;
  }

  // if (data.id && data.type === "mw")
  if (data.type === "mw") {
    const pendingPromise = findPendingPromiseById(data.id);
    if (!data.result) {
      pendingPromise.reject("result is empty");
    } else if (data.result.err) {
      pendingPromise.reject(data.result.err);
    } else {
      pendingPromise.resolve(data.result.data);
    }
  }
});
