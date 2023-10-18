import { parseSeedPhrase } from "near-seed-phrase";
import {
  pbkdf2Sync,
  randomBytes,
  createCipheriv,
  createDecipheriv,
  Decipher,
} from "crypto";
import { utils } from "near-api-js";
import {
  localStorageSet,
  localStorageGet,
  localStorageRemove,
  sessionSet,
  sessionGet,
  sessionRemove,
} from "./localStorage";

type NetworkNameType = string;
type AccountId = string;

type AccountState = {
  network: string;
  accountId: AccountId;
  publicKey: string;
  privateKey: string;
};

type AccountData = {
  network: string;
  accountId: string;
  encryptedSeed: string;
  salt: string;
  iv: string;
};

type MwalletSecureData = {
  hashedPassword: string;
  accounts: Record<NetworkNameType, AccountData>;
};

const emptySecureState: MwalletSecureData = {
  hashedPassword: undefined,
  accounts: {},
};

const emptyState: AccountState = {
  network: undefined,
  accountId: undefined,
  publicKey: undefined,
  privateKey: undefined,
};

function sessionStateSet(network, accountId, publicKey, secretKey) {
  const sessionState = {
    network: network,
    accountId: accountId,
    publicKey: publicKey,
    privateKey: secretKey,
  };
  sessionSet({ sessionState });
}

export function sessionStateGet(): Promise<AccountState> {
  return sessionGet("sessionState", emptyState);
}

export async function clearSessionState(): Promise<void> {
  return sessionRemove();
}

// export let secureState: MwalletSecureData = Object.assign({}, emptySecureState);
// export let state: AccountState = Object.assign({}, emptyState);

export function saveSecureState(secureState) {
  if (!secureState.hashedPassword) {
    throw new Error("Invalid SecureState");
  }

  localStorageSet({ secureState });
}

export async function recoverSecureState(): Promise<MwalletSecureData> {
  return localStorageGet("secureState", emptySecureState);
}

export async function deleteSecureState(): Promise<void> {
  clearSessionState();
  localStorageRemove("secureState");
}

export async function isLocked(): Promise<boolean> {
  return sessionGet("sessionState", emptyState).then((res) => {
    return res === undefined;
  });
}

export async function unlockSecureState(
  network: string,
  password: string
): Promise<boolean> {
  return recoverSecureState().then((secureState) => {
    if (!secureState.hashedPassword) {
      console.log("No SecureState");
      return false;
    }

    const hashedPass = secureState.hashedPassword;
    const encryptedSeed = secureState.accounts[network].encryptedSeed;
    const salt = Buffer.from(secureState.accounts[network].salt, "hex");
    const iv = Buffer.from(secureState.accounts[network].iv, "hex");
    const hashAlgorithm = "sha512";

    // Check if hashed password match
    const passIterations = 10000;
    const passKeyLength = 64;

    const passwordDerivedKey = pbkdf2Sync(
      password,
      salt,
      passIterations,
      passKeyLength,
      hashAlgorithm
    );

    if (passwordDerivedKey.toString("hex") !== hashedPass) {
      // throw new Error("Invalid passowrd");
      return false;
    }

    // Decrypt seed phrase
    const seedIterations = 1000;
    const seedKeyLength = 32;
    const seedDerivedKey = pbkdf2Sync(
      password,
      salt,
      seedIterations,
      seedKeyLength,
      hashAlgorithm
    );

    const decipher: Decipher = createDecipheriv(
      "aes-256-cbc",
      seedDerivedKey,
      iv
    );

    let decryptedSeed: string = decipher.update(encryptedSeed, "hex", "utf8");
    decryptedSeed += decipher.final("utf8");

    const { publicKey, secretKey } = parseSeedPhrase(decryptedSeed);
    sessionStateSet(
      network,
      secureState.accounts[network].accountId,
      publicKey,
      secretKey
    );
    return true;
  });
}

export async function createUser(
  network: string,
  password: string,
  seedPhrase: string
): Promise<void> {
  const { publicKey, secretKey } = parseSeedPhrase(seedPhrase);

  const salt = randomBytes(16);
  const hashAlgorithm = "sha512";

  // Encrypt the password using PBKDF2
  const passIterations = 10000;
  const passKeyLength = 64;

  const passwordDerivedKey = pbkdf2Sync(
    password,
    salt,
    passIterations,
    passKeyLength,
    hashAlgorithm
  );

  // Encrypt seed phrase using PBKDF2

  const seedIterations = 1000;
  const seedKeyLength = 32;

  const seedDerivedKey = pbkdf2Sync(
    password,
    salt,
    seedIterations,
    seedKeyLength,
    hashAlgorithm
  );

  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", seedDerivedKey, iv);

  let encryptedSeedPhrase = cipher.update(seedPhrase, "utf8", "hex");
  encryptedSeedPhrase += cipher.final("hex");

  // Create AccountData
  const accountId = Buffer.from(
    utils.PublicKey.fromString(publicKey).data
  ).toString("hex");

  const accountData: AccountData = {
    network: network,
    accountId: accountId,
    encryptedSeed: encryptedSeedPhrase,
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
  };

  const secureState: MwalletSecureData = Object.assign({}, emptySecureState);

  secureState.hashedPassword = passwordDerivedKey.toString("hex");
  secureState.accounts[network] = accountData;

  sessionStateSet(network, accountId, publicKey, secretKey);
  saveSecureState(secureState);
  return;
}
