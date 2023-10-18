// ask background, wait for response, return a Promise

export function askBackground(requestPayload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      return reject(Error("askBackground timeout"));
    }, 30000);

    chrome.runtime.sendMessage(requestPayload, function (response) {
      clearTimeout(timeout);
      if (!response) {
        return reject(Error("response is empty"));
      }
      if (response.err) {
        return reject(Error(response.err));
      }
      return resolve(response.data);
    });
  });
}

export function askBakcgroundIsSignedIn(): Promise<boolean> {
  return askBackground({ code: "is-signed-in" }) as Promise<boolean>;
}

export function askBackgroundIsState(): Promise<object> {
  return askBackground({ code: "is-secure-state" }) as Promise<object>;
}

export function askBackgroundAccountId(): Promise<string> {
  return askBackground({ code: "connect" }) as Promise<string>;
}

export function askBackgroundRecoverSecureState(): Promise<any> {
  return askBackground({ code: "recover-secure-state" });
}

export function askBackgroundCleatState(): Promise<any> {
  return askBackground({ code: "clear-state" });
}

export function askBackgroundPublicKey(): Promise<string> {
  return askBackground({ code: "public-key" });
}

export function askBackgroundPrivateKey(): Promise<string> {
  return askBackground({ code: "private-key" });
}

export function askBackgroundCreateWallet(
  network,
  password,
  mnemonic
): Promise<any> {
  return askBackground({
    code: "create-wallet",
    network: network,
    password: password,
    mnemonic: mnemonic,
  });
}

export function askBackgroundUnlock(network, password): Promise<boolean> {
  return askBackground({
    code: "unlock",
    network: network,
    password: password,
  }) as Promise<boolean>;
}

export function askBackgroundDeleteAccount(network): Promise<any> {
  return askBackground({ code: "delete-wallet", network: network });
}

export function askBackgroundSignAndSendTransaction(transaction): Promise<any> {
  return askBackground({
    code: "sign-and-send-transaction",
    params: { transaction: transaction },
  }) as Promise<any>;
}
