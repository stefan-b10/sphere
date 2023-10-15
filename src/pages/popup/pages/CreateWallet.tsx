import { useState } from "react";
import { Button, Card, Spin } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { generateSeedPhrase } from "near-seed-phrase";
import { askBackgroundCreateWallet } from "../utils/askBackground";

// eslint-disable-next-line react/prop-types
function CreateWallet({ selectedChain }) {
  const navigate = useNavigate();

  const { state } = useLocation();
  const password = state;

  const [newSeedPhrase, setNewSeedPhrase] = useState(null);
  const [processing, setProcessing] = useState(false);

  function generateWallet() {
    const { seedPhrase } = generateSeedPhrase();
    setNewSeedPhrase(seedPhrase);
  }

  function openWallet() {
    setProcessing(true);
    askBackgroundCreateWallet(selectedChain, password, newSeedPhrase).then(
      () => {
        navigate("/yourwallet");
      }
    );
  }

  return (
    <>
      <div className="content">
        <div className="mnemonic">
          <ExclamationCircleOutlined
            style={{ fontSize: "20px" }}
            rev={undefined}
          />
          <div>
            Save your 12 words in a secure place to be able to recover your
            wallet. Do not share them with anyone!
          </div>
        </div>
        <Button
          className="frontPageButton"
          type="primary"
          onClick={() => generateWallet()}
        >
          Generate Seed Phrase
        </Button>
        <Card className="seedPhraseContainer">
          {newSeedPhrase && (
            <pre style={{ whiteSpace: "pre-wrap" }}>{newSeedPhrase}</pre>
          )}
        </Card>
        {processing ? (
          <Spin />
        ) : (
          <Button
            className="frontPageButton"
            type="default"
            disabled={
              !newSeedPhrase ||
              newSeedPhrase.split(" ").length !== 12 ||
              newSeedPhrase.slice(-1) === ""
            }
            onClick={openWallet}
          >
            Open your new wallet
          </Button>
        )}

        <p className="frontPageButton" onClick={() => navigate("/")}>
          Back
        </p>
      </div>
    </>
  );
}

export default CreateWallet;
