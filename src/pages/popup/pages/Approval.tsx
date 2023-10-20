import { Button, Divider, notification, Tag, Tooltip, Spin } from "antd";
import { providers, utils } from "near-api-js";
import { useLocation, useNavigate } from "react-router-dom";
import { askBackgroundSignAndSendTransaction } from "../utils/askBackground";
import { useState } from "react";

// eslint-disable-next-line react/prop-types
function Approval({ selectedChain }) {
  const navigate = useNavigate();

  const { state } = useLocation();

  const [processing, setProcessing] = useState(false);

  const signerId = state.signerId;
  const receiverId = state.receiverID;
  const amount = state.amountToSend;

  const transaction = {
    signerId: signerId,
    receiverId: receiverId,
    actions: [
      {
        type: "Transfer",
        params: { deposit: utils.format.parseNearAmount(amount) },
      },
    ],
  };

  function onReject() {
    navigate("/");
  }

  function onConfirm() {
    setProcessing(true);

    askBackgroundSignAndSendTransaction(transaction).then((res) => {
      setProcessing(false);
      navigate("/transactionresponse", {
        state: { transaction: res },
      });
    });
  }

  return (
    <>
      <div style={{ width: "80%" }}>
        <h3 style={{ marginBottom: "2px" }}>Confirm Transaction</h3>
        <Divider style={{ marginTop: "2px" }}></Divider>

        <div
          className="transactionContainer"
          style={{ width: "99%", height: "350px", overflow: "auto" }}
        >
          <h4 style={{ textAlign: "left", margin: "5px", marginTop: "10px" }}>
            Receiver:
          </h4>

          <div style={{ textAlign: "right" }}>
            <Tooltip title={receiverId}>
              <Tag
                style={{
                  width: "200px",
                  marginLeft: "auto",
                  textAlign: "right",
                  overflow: "clip",
                }}
              >
                {receiverId}
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
              {transaction.actions.map((item, index) => (
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
    </>
  );
}

export default Approval;
