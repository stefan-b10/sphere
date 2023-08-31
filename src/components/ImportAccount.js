import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button, Input } from "antd";
import { BulbOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import { parseSeedPhrase } from "near-seed-phrase";
import { utils } from "near-api-js";

function ImportAccount({
	setSeedPhrase,
	setWallet,
	setPublicKey,
	setSecretKey,
}) {
	const navigate = useNavigate();
	const [typedSeed, setTypedSeed] = useState("");
	const [nonValid, setNonValid] = useState(false);

	function seedAdjust(e) {
		setNonValid(false);
		setTypedSeed(e.target.value);
	}

	function importWallet() {
		try {
			const { seedPhrase, publicKey, secretKey } = parseSeedPhrase(typedSeed);
			const recoveredWallet =
				utils.PublicKey.fromString(publicKey).data.toString("hex");

			setSeedPhrase(seedPhrase);
			setSeedPhrase(typedSeed);
			setPublicKey(publicKey);
			setSecretKey(secretKey);
			setWallet(recoveredWallet);
		} catch (err) {
			setNonValid(true);
			return;
		}

		navigate("/yourwallet");
		return;
	}

	return (
		<>
			<div className="content">
				<div className="mnemonic">
					<BulbOutlined style={{ fontSize: "20px" }} />
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
				{nonValid && <p style={{ color: "red" }}> Invalid Seed Phrase</p>}
				<p className="frontPageButton" onClick={() => navigate("/")}>
					Back
				</p>
			</div>
		</>
	);
}

export default ImportAccount;
