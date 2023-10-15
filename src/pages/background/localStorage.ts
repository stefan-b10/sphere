export async function localStorageGet(
  code: string,
  defaultValue: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(code, (obj) => {
        if (chrome.runtime.lastError) {
          console.error(JSON.stringify(chrome.runtime.lastError));
        }
        let result = obj[code] || {};
        if (Object.keys(result).length == 0)
          Object.assign(result, defaultValue);
        return resolve(result);
      });
    } catch (error) {
      reject();
    }
  });
}

export function localStorageSet(payload: any) {
  chrome.storage.local.set(payload, () => {
    if (chrome.runtime.lastError) {
      console.error(JSON.stringify(chrome.runtime.lastError));
    }
  });
}

export function localStorageRemove(code: string) {
  chrome.storage.local.remove(code);
}
