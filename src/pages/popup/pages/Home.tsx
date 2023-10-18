import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Button } from "antd";
import logo from "@assets/img/logo.png";
import NewPassword from "./NewPassword";
import {
  askBackgroundIsState,
  askBakcgroundIsSignedIn,
} from "../utils/askBackground";

// eslint-disable-next-line react/prop-types
function Home({ selectedChain }) {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      askBakcgroundIsSignedIn().then((res) => {
        if (res) {
          navigate("/yourwallet");
        } else {
          askBackgroundIsState().then((isState) => {
            if (isState) {
              navigate("/unlock");
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  function handleCreate() {
    navigate("/createpassword", { state: "create" });
  }

  function handleImport() {
    navigate("/createpassword", { state: "import" });
  }

  return (
    <>
      <div className="content">
        <img src={logo} alt="logo" className="frontPageLogo" />
        <h3>Welcome to Metaintro Wallet</h3>
        <Button
          onClick={handleCreate}
          className="frontPageButton"
          type="primary"
        >
          Create a Wallet
        </Button>
        <Button
          onClick={handleImport}
          className="frontPageButton"
          type="default"
        >
          Import a Wallet
        </Button>
      </div>
      <Routes>
        <Route path="/createpassword" element={<NewPassword />} />
      </Routes>
    </>
  );
}

export default Home;
