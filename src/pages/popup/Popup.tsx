import logo from "@assets/img/logo.png";
import "@pages/popup/Popup.css";
import withSuspense from "@src/shared/hoc/withSuspense";
import { Routes, Route } from "react-router-dom";
import { Select } from "antd";
import Home from "./pages/Home";
import CreateWallet from "./pages/CreateWallet";
import ImportWallet from "./pages/ImportWallet";
import WalletView from "./pages/WalletView";
import Approval from "./pages/Approval";
import Unlock from "./pages/Unlock";
import NewPassword from "./pages/NewPassword";
import TransactionResponse from "./pages/TransactionResponse";
import { useState } from "react";

declare global {
  interface Window {
    sphere: any;
  }
}

const Popup = () => {
  const [selectedChain, setSelectedChain] = useState("testnet");

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

      <Routes>
        <Route path="/" element={<Home selectedChain={selectedChain} />} />
        <Route
          path="/unlock"
          element={<Unlock selectedChain={selectedChain} />}
        />
        <Route path="/createpassword" element={<NewPassword />} />
        <Route
          path="/createwallet"
          element={<CreateWallet selectedChain={selectedChain} />}
        />
        <Route
          path="/importwallet"
          element={<ImportWallet selectedChain={selectedChain} />}
        />
        <Route
          path="/yourwallet"
          element={<WalletView selectedChain={selectedChain} />}
        />
        <Route
          path="/approval"
          element={<Approval selectedChain={selectedChain} />}
        />
        <Route path="/transactionresponse" element={<TransactionResponse />} />
      </Routes>
    </div>
  );
};

export default withSuspense(Popup);
