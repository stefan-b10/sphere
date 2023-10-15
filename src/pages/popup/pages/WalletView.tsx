import React, { useEffect, useState } from "react";
import {
  Tabs,
  Divider,
  Tooltip,
  Tag,
  List,
  Button,
  Input,
  Spin,
  Avatar,
  Modal,
} from "antd";
import {
  LogoutOutlined,
  CopyOutlined,
  UpCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  askBackgroundAccountId,
  askBackgroundCleatState,
  askBackgroundDeleteAccount,
} from "../utils/askBackground";
import { providers, Account, connect, utils } from "near-api-js";
import nearIcon from "@assets/img/near.svg";

// eslint-disable-next-line react/prop-types
function WalletView({ selectedChain }) {
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [wallet, setWallet] = useState<string>("");

  const [balance, setBalance] = useState("0");
  const [amountToSend, setAmountToSend] = useState(null);
  const [sendToAddress, setSendToAddress] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const tokens = [
    { symbol: "NEAR", name: "Near", balance: balance, logo: nearIcon },
  ];

  useEffect(() => {
    askBackgroundAccountId().then((res) => {
      setWallet(res);

      getBalance(res).then((res) => {
        setBalance(utils.format.formatNearAmount(res.amount, 3));
      });
    });
  }, []);

  function deleteState() {
    askBackgroundDeleteAccount(selectedChain).then(() => {
      navigate("/");
    });
  }

  function logout() {
    askBackgroundCleatState().then(() => {
      navigate("/");
    });
  }

  function copy() {
    navigator.clipboard.writeText(wallet);
  }

  async function getBalance(accountId): Promise<any> {
    const nearConfig = {
      networkId: selectedChain,
      nodeUrl: `https://rpc.${selectedChain}.near.org`,
    };

    const provider = new providers.JsonRpcProvider({ url: nearConfig.nodeUrl });

    return provider.query({
      request_type: "view_account",
      finality: "final",
      account_id: accountId,
    });
  }

  function sendTokens(sendToAddress, amountToSend) {
    navigate("/approval", {
      state: {
        signerId: wallet,
        receiverID: sendToAddress,
        amountToSend: amountToSend,
      },
    });
  }

  function showDelete() {
    setIsDeleteOpen(true);
  }

  function handleDeleteOk() {
    deleteState();
    setIsDeleteOpen(false);
  }

  function handleDeleteCancel() {
    setIsDeleteOpen(false);
  }

  const nfts = [
    "https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xd774557b647330c91bf44cfeab205095f7e6c367/0xfb76f9ef3adabc27d77c615959f9e22dea24ac7d6a10af3458b3481e5f5e0f10/high.png",
    ,
    "https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0x749f5ddf5ab4c1f26f74560a78300563c34b417d/0x90cae88ffc909feab8e4df76abd0652dee98b7bffab29597d898260d91c20aa1/high.jpeg",
  ];

  const items = [
    {
      key: "1",
      label: "Tokens",
      children: (
        <>
          {tokens ? (
            <>
              <List
                bordered
                itemLayout="horizontal"
                dataSource={tokens}
                renderItem={(item, index) => (
                  <List.Item style={{ textAlign: "left" }}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.logo} />}
                      title={item.symbol}
                      description={item.name}
                    />
                    <div>{balance} Tokens</div>
                  </List.Item>
                )}
              />
            </>
          ) : (
            <>
              <span>You do not have any tokens yet</span>
            </>
          )}
        </>
      ),
    },
    {
      key: "2",
      label: "NFTs",
      children: (
        <>
          {nfts ? (
            <>
              {nfts.map((e, i) => {
                return (
                  <>
                    {e && (
                      <img
                        className="nftImage"
                        key={i}
                        alt="nftImage"
                        src={e}
                      />
                    )}
                  </>
                );
              })}
            </>
          ) : (
            <>
              <span>You do not have any NTFs yet</span>
            </>
          )}
        </>
      ),
    },
    {
      key: "3",
      label: "Transfer",
      children: (
        <>
          <h3>Available Balance</h3>
          <h1>{balance}</h1>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}>To: </p>
            <Input
              value={sendToAddress}
              onChange={(e) => setSendToAddress(e.target.value)}
              placeholder="Account to send to"
            />
          </div>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}>Amount: </p>
            <Input
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              placeholder="Amount of tokens to send"
            />
          </div>
          {processing ? (
            <Spin />
          ) : (
            <Button
              style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
              type="primary"
              onClick={() => sendTokens(sendToAddress, amountToSend)}
            >
              Send Tokens
            </Button>
          )}
        </>
      ),
    },

    {
      key: "4",
      label: "Activity",
      children: (
        <>
          <span>No activity yet</span>
        </>
        // <>
        //   {txs.length > 0 ? (
        //     <>
        //       <List
        //         bordered
        //         size="small"
        //         itemLayout="horizontal"
        //         dataSource={txs}
        //         renderItem={(item, index) => (
        //           <List.Item style={{ textAlign: "left" }}>
        //             <List.Item.Meta
        //               avatar={<UpCircleOutlined rotate={45} rev={undefined} />}
        //               title="Send"
        //               description={
        //                 <>
        //                   {new Intl.DateTimeFormat("en-US", {
        //                     month: "short",
        //                     day: "numeric",
        //                     year: "numeric",
        //                     hour: "2-digit",
        //                     minute: "2-digit",
        //                   }).format(item.date)}
        //                 </>
        //               }
        //             />
        //             <a
        //               href={
        //                 nearConnection.config.explorerUrl +
        //                 "/transactions/" +
        //                 item.hash
        //               }
        //               target="_blank"
        //               rel="noreferrer"
        //             >
        //               {item.amount} NEAR
        //             </a>
        //           </List.Item>
        //         )}
        //       />
        //     </>
        //   ) : (
        //     <>
        //       <span>No activity yet</span>
        //     </>
        //   )}
        // </>
      ),
    },
  ];

  return (
    <>
      <div className="content">
        <div style={{ justifyContent: "space-between", width: "300px" }}>
          <div className="deleteButton" onClick={showDelete}>
            <Tooltip title="Delete account">
              <CloseCircleOutlined rev={undefined} />
            </Tooltip>
          </div>
          <div className="logoutButton" onClick={logout}>
            <Tooltip title="Lock">
              <LogoutOutlined rev={undefined} />
            </Tooltip>
          </div>
          <Modal
            title="Delete account?"
            open={isDeleteOpen}
            onOk={handleDeleteOk}
            onCancel={handleDeleteCancel}
          ></Modal>
        </div>
        <div className="walletName">Wallet</div>
        <Tooltip
          title={"Copied"}
          trigger={"click"}
          placement={"bottom"}
          mouseLeaveDelay={1}
        >
          <Tag onClick={() => copy()}>
            {wallet.slice(0, 5)}...{wallet.slice(-5)}
            <CopyOutlined rev={undefined} />
          </Tag>
        </Tooltip>
        <Divider />
        <Tabs
          className="walletView"
          defaultActiveKey="1"
          items={items}
          centered
        />
      </div>
    </>
  );
}

export default WalletView;
