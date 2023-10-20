import { Button, Card } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

function TransactionResponse() {
  const navigate = useNavigate();

  const { state } = useLocation();

  return (
    <>
      {state.transaction.status ? (
        <>
          <CheckCircleOutlined
            style={{ fontSize: "50px", color: "green", marginTop: "100px" }}
            rev={undefined}
          />
          <h2 style={{ color: "green" }}>Transaction successful</h2>
          <Card
            size="small"
            style={{
              backgroundColor: "rgba(149, 213, 233, 0.678)",
              marginTop: "50px",
            }}
          >
            <h4 style={{ margin: "1px" }}>Transaction Id</h4>
            <a
              style={{ fontSize: "10px" }}
              href={
                "https://explorer.testnet.near.org/transactions/" +
                state.transaction.transaction.hash
              }
              target="_blank"
              rel="noreferrer"
            >
              {state.transaction.transaction.hash}
            </a>
          </Card>
          <Button
            type="primary"
            size="large"
            style={{ width: "50%", marginTop: "50px" }}
            onClick={() => navigate("/")}
          >
            Finish
          </Button>
        </>
      ) : (
        <>
          <CloseCircleOutlined
            style={{ fontSize: "50px", color: "red", marginTop: "100px" }}
            rev={undefined}
          />
          <h2 style={{ color: "red" }}>Transaction failed!</h2>
          <h4 style={{ color: "red" }}>{state.transaction.type}</h4>
          <Button
            type="primary"
            size="large"
            style={{ width: "50%", marginTop: "50px" }}
            onClick={() => navigate("/")}
          >
            Finish
          </Button>
        </>
      )}
    </>
  );
}

export default TransactionResponse;
