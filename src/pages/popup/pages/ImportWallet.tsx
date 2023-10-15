import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button, Spin } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { parseSeedPhrase } from "near-seed-phrase";
import { askBackgroundCreateWallet } from "../utils/askBackground";

// eslint-disable-next-line react/prop-types
function ImportWallet({ selectedChain }) {
  const navigate = useNavigate();

  const { state } = useLocation();
  const password = state;

  const [typedSeed, setTypedSeed] = useState("");
  const [nonValid, setNonValid] = useState(false);
  const [processing, setProcessing] = useState(false);

  function seedAdjust(e) {
    setNonValid(false);
    setTypedSeed(e.target.value);
  }

  function importWallet() {
    setProcessing(true);
    try {
      const { seedPhrase } = parseSeedPhrase(typedSeed);
      askBackgroundCreateWallet(selectedChain, password, seedPhrase).then(
        () => {
          navigate("/yourwallet");
        }
      );
    } catch (error) {
      setNonValid(true);
      console.log(error);
      return;
    }
  }

  return (
    <>
      <div className="content">
        <div className="mnemonic">
          <BulbOutlined style={{ fontSize: "20px" }} rev={undefined} />
          <div>
            Type your 12 words seed phrase to recover your wallet (words should
            be seperated with spaces)
          </div>
        </div>
        <TextArea
          value={typedSeed}
          onChange={seedAdjust}
          rows={4}
          className="seedPhraseContainer"
          placeholder="Type your seed phrase here..."
        />
        {processing ? (
          <Spin />
        ) : (
          <Button
            disabled={
              typedSeed.split(" ").length !== 12 || typedSeed.slice(-1) === ""
            }
            className="frontPageButton"
            type="primary"
            onClick={() => importWallet()}
          >
            Import Wallet
          </Button>
        )}

        {nonValid && <p style={{ color: "red" }}> Invalid Seed Phrase</p>}
        <p className="frontPageButton" onClick={() => navigate("/")}>
          Back
        </p>
      </div>
    </>
  );
}

export default ImportWallet;
