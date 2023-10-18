import React, { useEffect, useState } from "react";
import { Button, Input } from "antd";
import logo from "@assets/img/logo.png";
import { useNavigate } from "react-router-dom";
import { askBackgroundUnlock } from "../utils/askBackground";

// eslint-disable-next-line react/prop-types
function Unlock({ selectedChain }) {
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>("");

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  function handleClick() {
    askBackgroundUnlock(selectedChain, password).then((res) => {
      if (res) navigate("/yourwallet");
    });
  }

  return (
    <>
      <div className="content">
        <img src={logo} alt="logo" className="frontPageLogo" />
        <h3 className="h4">Welcome back!</h3>
        <p>Enter your password to unlock your wallet</p>
        <Input.Password
          placeholder="Password"
          style={{ width: "90%" }}
          value={password}
          onChange={handlePasswordChange}
        />
        <Button
          className="frontPageButton"
          type="primary"
          onClick={handleClick}
        >
          Unlock
        </Button>
      </div>
    </>
  );
}

export default Unlock;
