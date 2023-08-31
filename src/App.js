import "./App.css";
import { useState } from "react";
import logo from "./logo.png";
import { Select } from "antd";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CreateAccount from "./components/CreateAccount";
import ImportAccount from "./components/ImportAccount";
import WalletView from "./components/WalletView";

function App() {
	const [selectedChain, setSelectedChain] = useState("testnet");

	// Refactor for safe storage!!!
	const [wallet, setWallet] = useState(null);
	const [seedPhrase, setSeedPhrase] = useState(null);
	const [publicKey, setPublicKey] = useState(null);
	const [secretKey, setSecretKey] = useState(null);

	return (
		<div className="App">
			<header>
				<img src={logo} className="headerLogo" alt="logo" />
				<Select
					onChange={(val) => setSelectedChain(val)}
					value={selectedChain}
					options={[
						{
							label: "Mainnet",
							value: "mainnet",
						},
						{
							label: "Testnet",
							value: "testnet",
						},
					]}
					className="dropdown"
				></Select>
			</header>
			{wallet && seedPhrase ? (
				<Routes>
					<Route
						path="/yourwallet"
						element={
							<WalletView
								wallet={wallet}
								setWallet={setWallet}
								seedPhrase={seedPhrase}
								setSeedPhrase={setSeedPhrase}
								publicKey={publicKey}
								secretKey={secretKey}
								selectedChain={selectedChain}
							/>
						}
					></Route>
				</Routes>
			) : (
				<Routes>
					<Route path="/" element={<Home />} />
					<Route
						path="/recover"
						element={
							<ImportAccount
								setSeedPhrase={setSeedPhrase}
								setWallet={setWallet}
								setPublicKey={setPublicKey}
								setSecretKey={setSecretKey}
							/>
						}
					/>
					<Route
						path="/yourwallet"
						element={
							<CreateAccount
								setSeedPhrase={setSeedPhrase}
								setPublicKey={setPublicKey}
								setSecretKey={setSecretKey}
								setWallet={setWallet}
							/>
						}
					/>
				</Routes>
			)}
		</div>
	);
}

export default App;
