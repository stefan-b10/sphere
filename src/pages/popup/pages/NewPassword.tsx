import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Input } from "antd";
import logo from "@assets/img/logo.png";

function NewPassword() {
  const navigate = useNavigate();

  const { state } = useLocation();
  const action = state;

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  function handlePasswordChange(e) {
    setPassword(e.target.value);
    if (password.length >= 8 && password === confirmPassword) {
      history.pushState({ name: "password" }, password);
    }
  }

  function handleConfirmPasswordChange(e) {
    setConfirmPassword(e.target.value);
    if (password.length >= 8 && password === confirmPassword) {
      history.pushState({ name: "password" }, password);
    }
  }

  function handleOnClick() {
    if (password.length >= 8 && password === confirmPassword) {
      if (action === "create") navigate("/createwallet", { state: password });
      if (action === "import") navigate("/importwallet", { state: password });
    }
  }

  return (
    <>
      <div className="content">
        <img src={logo} alt="logo" className="frontPageLogo" />
        <h3 style={{ marginBottom: "1px" }}>Create a Password</h3>
        <p style={{ color: "grey", fontSize: "15px" }}>
          You will use this password to unlock your wallet
        </p>
        <Input.Password
          placeholder="Password"
          style={{ width: "90%", marginBottom: "10px" }}
          value={password}
          onChange={handlePasswordChange}
        />
        <Input.Password
          placeholder="Confirm Password"
          style={{ width: "90%" }}
          visibilityToggle={false}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
        />
        <Button
          className="frontPageButton"
          type="primary"
          disabled={!(password.length >= 8 && password === confirmPassword)}
          onClick={handleOnClick}
        >
          Continue
        </Button>
        <p className="frontPageButton" onClick={() => navigate("/")}>
          Back
        </p>
      </div>
    </>
  );
}

export default NewPassword;
