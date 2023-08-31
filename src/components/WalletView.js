import React, { useEffect, useState } from "react";
import {
	Tabs,
	Divider,
	Tooltip,
	Tag,
	List,
	Avatar,
	Button,
	Input,
	Spin,
} from "antd";
import {
	LogoutOutlined,
	CopyOutlined,
	UpCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { connect, utils, keyStores } from "near-api-js";
import { CHAINS_CONFIG } from "../chains";

function WalletView({
	wallet,
	setWallet,
	seedPhrase,
	publicKey,
	secretKey,
	setSeedPhrase,
	selectedChain,
}) {
	const navigate = useNavigate();
	const [nearConnection, setNearConnection] = useState(null);
	const tokens = [{ symbol: "NEAR", name: "Near", balance: 0 }];

	const [processing, setProcessing] = useState(false);
	const [txs, setTsx] = useState([]);

	const nfts = [
		"https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0xd774557b647330c91bf44cfeab205095f7e6c367/0xfb76f9ef3adabc27d77c615959f9e22dea24ac7d6a10af3458b3481e5f5e0f10/high.png",
		,
		"https://nft-preview-media.s3.us-east-1.amazonaws.com/evm/0x1/0x749f5ddf5ab4c1f26f74560a78300563c34b417d/0x90cae88ffc909feab8e4df76abd0652dee98b7bffab29597d898260d91c20aa1/high.jpeg",
	];
	const [balance, setBalance] = useState(0);
	const [amountToSend, setAmountToSend] = useState(null);
	const [sendToAddress, setSendToAddress] = useState(null);

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
							onClick={() => sendTransaction(sendToAddress, amountToSend)}
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
					{txs.length > 0 ? (
						<>
							<List
								bordered
								size="small"
								itemLayout="horizontal"
								dataSource={txs}
								renderItem={(item, index) => (
									<List.Item style={{ textAlign: "left" }}>
										<List.Item.Meta
											avatar={<UpCircleOutlined rotate={45} />}
											title="Send"
											description={
												<>
													{new Intl.DateTimeFormat("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
														hour: "2-digit",
														minute: "2-digit",
													}).format(item.date)}
												</>
											}
										/>
										<a
											href={
												nearConnection.config.explorerUrl +
												"/transactions/" +
												item.hash
											}
											target="_blank"
											rel="noreferrer"
										>
											{item.amount} NEAR
										</a>
									</List.Item>
								)}
							/>
						</>
					) : (
						<>
							<span>No activity yet</span>
						</>
					)}
				</>
			),
		},
	];

	function copy() {
		navigator.clipboard.writeText(wallet);
	}

	function logout() {
		setSeedPhrase(null);
		setWallet(null);
		navigate("/");
	}

	async function connection() {
		const keyPair = new utils.KeyPairEd25519(secretKey.split(":")[1]);
		const keyStore = new keyStores.BrowserLocalStorageKeyStore();

		await keyStore.setKey(selectedChain, wallet, keyPair);

		const connectionSettings = CHAINS_CONFIG[selectedChain];
		connectionSettings.keyStore = keyStore;

		const newConnection = await connect(connectionSettings);
		setNearConnection(newConnection);
		getBalance(newConnection);
	}

	async function getBalance(newConnection) {
		try {
			const account = await newConnection.account(wallet);
			const newBalance = await account.getAccountBalance();
			setBalance(utils.format.formatNearAmount(newBalance.available, 3));
			console.log(newConnection);
		} catch (error) {
			setBalance(0);
		}
	}

	async function sendTransaction(to, amount) {		

		setProcessing(true);

		try {
			const sender = await nearConnection.account(wallet);
			const tx = await sender.sendMoney(
				to,
				utils.format.parseNearAmount(amount)
			);
			setProcessing(false);

			const timestamp = await nearConnection.connection.provider.block({
				blockId: tx.transaction_outcome.block_hash,
			});

			const date = new Date(timestamp.header.timestamp / 1000000);

			const newTx = txs;
			newTx.push({
				amount: amount,
				hash: tx.transaction.hash,
				date: date,
			});

			setTsx(newTx);
			setAmountToSend(null);
			setSendToAddress(null);
			await getBalance(nearConnection);
		} catch (error) {
			setProcessing(false);
			setAmountToSend(null);
			setSendToAddress(null);
			console.log(error);
		}
	}

	useEffect(() => {
		connection();
	}, []);

	useEffect(() => {
		connection();
	}, [selectedChain]);

	return (
		<>
			<div className="content">
				<div className="logoutButton" onClick={logout}>
					<LogoutOutlined />
				</div>
				<div className="walletName">Wallet</div>
				<Tooltip
					title={"Copied"}
					trigger={"click"}
					placement={"bottom"}
					mouseLeaveDelay={"1"}
				>
					<Tag onClick={() => copy()}>
						{wallet.slice(0, 5)}...{wallet.slice(-5)}
						<CopyOutlined />
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
