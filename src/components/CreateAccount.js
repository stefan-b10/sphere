import React from "react";
import { useState } from "react";
import { Button, Card } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { generateSeedPhrase } from "near-seed-phrase";
import { utils } from "near-api-js";

function CreateAccount({
	setWallet,
	setSeedPhrase,
	setPublicKey,
	setSecretKey,
}) {
	const navigate = useNavigate();

	const [newSeedPhrase, setNewSeedPhrase] = useState(null);
	const [newPublicKey, setNewPublicKey] = useState(null);
	const [newSecretKey, setNewSecretKey] = useState(null);

	function generateWallet() {
		const { seedPhrase, publicKey, secretKey } = generateSeedPhrase();	

		setNewSeedPhrase(seedPhrase);
		setNewPublicKey(publicKey);
		setNewSecretKey(secretKey);
	}

	function setWalletAndMnemonic() {
		setSeedPhrase(newSeedPhrase);
		setPublicKey(newPublicKey);
		setSecretKey(newSecretKey);
		setWallet(utils.PublicKey.fromString(newPublicKey).data.toString("hex"));
	}

	return (
		<>
			<div className="content">
				<div className="mnemonic">
					<ExclamationCircleOutlined style={{ fontSize: "20px" }} />
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
				<Button
					className="frontPageButton"
					type="default"
					disabled={
						!newSeedPhrase ||
						newSeedPhrase.split(" ").length !== 12 ||
						newSeedPhrase.slice(-1) === ""
					}
					onClick={() => setWalletAndMnemonic()}
				>
					Open your new wallet
				</Button>
				<p className="frontPageButton" onClick={() => navigate("/")}>
					Back
				</p>
			</div>
		</>
	);
}

export default CreateAccount;
