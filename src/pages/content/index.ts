console.log("content loaded from content script");

/**
 * @description
 * Chrome extensions don't support modules in content scripts.
 */
// import("./components/Demo");

window.addEventListener("message", (event) => {
  // Accepting messages only from ourselves
  if (event.source != window) {
    return;
  }

  const msg = event.data;
  if (msg && msg.type && msg.type == "mw" && msg.dest == "ext") {
    
    // Sending message to mwallet extension background service worker
    chrome.runtime.sendMessage(msg, function (response) {
      handleResponse(response, msg);
    });
  }
});

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MAX_COMMUNICATIONS = 2;

async function handleResponse(response: any, msg: any): Promise<void> {
  // post response to wallet-selector
  let postBackMsg = Object.assign({}, msg);

  try {
    if (!response) {
      throw new Error("Response is empty");
    }

    // communicationsLeft avoids infinite calls
    let communicationsLeft = MAX_COMMUNICATIONS;
    let waitingForInnerResponse = false;

    // console.log("response in content before while");
    // console.log(response);

    while (response && response.code != msg.code && communicationsLeft > 0) {
      if (waitingForInnerResponse) {
        await sleep(200);
      } else {
        if (response.err) break;
        waitingForInnerResponse = true;
        communicationsLeft--;

        setTimeout(() => {
          chrome.runtime.sendMessage(msg, function (innerResponse) {
            response = innerResponse;

            waitingForInnerResponse = false;
          });
        }, 500);
      }
    }

    // console.log("response in timeout");
    // console.log(response);
    if (!response) {
      throw new Error(response.err);
    }
    if (response.err) {
      throw new Error(response.err);
    }

    postBackMsg.result = response;
  } catch (err) {
    const lastErrMessage = chrome.runtime.lastError?.message || err.message;
    postBackMsg.result = { err: lastErrMessage };
  } finally {
    postBackMsg.dest = "page";
    window.postMessage(postBackMsg);
  }
}

(function () {
  function inject() {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("src/pages/injected/index.js");
    script.type = "module";
    const g = document.head || document.documentElement;
    g.appendChild(script);
  }

  inject();
})();
