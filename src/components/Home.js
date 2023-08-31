import React from "react";
import { Button } from "antd";
import logo from "../logo.png";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="content">
        <img src={logo} alt="logo" className="frontPageLogo" />
        <h4 className="h4">Welcome to your Sphere Wallet</h4>
        <Button onClick={() => navigate("/yourwallet")} className="frontPageButton" type="primary">
          Create a Wallet
        </Button>
        <Button onClick={() => navigate("/recover")} className="frontPageButton" type="default">
          Import a Wallet
        </Button>
      </div>
    </>
  );
}

export default Home;
