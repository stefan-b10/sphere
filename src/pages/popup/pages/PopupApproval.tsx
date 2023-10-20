import { createRoot } from "react-dom/client";
import "@pages/popup/index.css";
import refreshOnUpdate from "virtual:reload-on-update-in-view";
import logo from "@assets/img/logo.png";
import { Button, Divider, Spin, Tag, Tooltip } from "antd";
import { utils } from "near-api-js";

refreshOnUpdate("pages/popup");

function init() {
  const appContainer = document.querySelector("#app-container");
  if (!appContainer) {
    throw new Error("Can not find #app-container");
  }
  const root = createRoot(appContainer);

  let processing = false;

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  const serializedParams = urlParams.get("data");
  const params = JSON.parse(decodeURIComponent(serializedParams));

  function onConfirm() {
    processing = true;
    render();
    chrome.runtime.sendMessage({ response: true });
  }

  function onReject() {
    chrome.runtime.sendMessage({ response: false });
  }

  function render() {
    root.render(
      <>
        <div className="App">
          <img
            src={logo}
            alt="logo"
            style={{ height: "50px", marginTop: "50px" }}
          />
          <div style={{ width: "80%" }}>
            <h3 style={{ marginBottom: "2px" }}>Confirm Transaction</h3>
            <Divider style={{ marginTop: "2px" }}></Divider>

            <div
              className="transactionContainer"
              style={{ width: "99%", height: "350px", overflow: "auto" }}
            >
              <h4
                style={{ textAlign: "left", margin: "5px", marginTop: "10px" }}
              >
                Receiver:
              </h4>

              <div style={{ textAlign: "right" }}>
                <Tooltip title={params.receiverId}>
                  <Tag
                    style={{
                      width: "200px",
                      marginLeft: "auto",
                      textAlign: "right",
                      overflow: "clip",
                    }}
                  >
                    {params.receiverId}
                  </Tag>
                </Tooltip>
              </div>

              <div
                style={{
                  margin: "5px",
                }}
              >
                <h4
                  style={{
                    textAlign: "left",
                    margin: "10px 0 0 0 ",
                  }}
                >
                  Actions:
                </h4>
                <ul style={{ listStyle: "none", marginTop: "0px" }}>
                  {params.actions.map((item, index) => (
                    <div key={index} className="actionContainder">
                      <div style={{ display: "flex" }}>
                        <p
                          style={{
                            flex: "1",
                            textAlign: "left",
                            marginTop: "5px",
                            marginLeft: "5px",
                          }}
                        >
                          Type:
                        </p>
                        <p
                          style={{
                            flex: "1",
                            textAlign: "right",
                            color: "darkgreen",
                            marginTop: "5px",
                            marginLeft: "5px",
                            marginRight: "5px",
                          }}
                        >
                          {item.type}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            flex: "1",
                            textAlign: "left",
                            marginLeft: "5px",
                            marginBottom: "0px",
                          }}
                        >
                          Params:
                        </p>

                        <ul style={{ listStyle: "none", marginTop: "0px" }}>
                          {Object.keys(item.params).map((el, index) => (
                            <div
                              style={{ display: "flex", marginTop: "0px" }}
                              key={index}
                            >
                              <p
                                style={{
                                  color: "blue",
                                  textAlign: "left",
                                  flex: "1",
                                }}
                              >
                                {el}
                              </p>
                              <p
                                style={{
                                  textAlign: "right",
                                  flex: "1",
                                  marginRight: "5px",
                                }}
                              >
                                {utils.format.formatNearAmount(item.params[el])}{" "}
                                {el === "deposit" ? "N" : ""}
                              </p>
                            </div>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ width: "100%" }}>
              {processing ? (
                <Spin />
              ) : (
                <>
                  <Button
                    size="large"
                    style={{ marginInline: "10px", width: "40%" }}
                    type="primary"
                    onClick={onConfirm}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="large"
                    style={{ marginInline: "10px", width: "40%" }}
                    onClick={onReject}
                  >
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  render();
}

init();
