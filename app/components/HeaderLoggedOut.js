import React, { useState, useContext } from "react";
import axios from "axios";
import DispatchContext from "../DispatchContext";

const HeaderLoggedOut = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useContext(DispatchContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/login", {
        username,
        password,
      });
      if (response.data) {
        dispatch({ type: "login", data: response.data });
        dispatch({
          type: "flashMessage",
          payload: "You have successfully logged In~",
        });
      } else {
        console.log("Invalid username / password");
        dispatch({
          type: "flashMessage",
          payload: "Invalid username / password",
        });
      }
    } catch (e) {
      console.log("Problem with Sign In");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-0 pt-2 pt-md-0">
      <div className="row align-items-center">
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control form-control-sm input-dark"
            type="text"
            placeholder="Username"
            autoComplete="off"
          />
        </div>
        <div className="col-md mr-0 pr-md-0 mb-3 mb-md-0">
          <input
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control form-control-sm input-dark"
            type="password"
            placeholder="Password"
          />
        </div>
        <div className="col-md-auto">
          <button className="marketing-btn">Sign In</button>
        </div>
      </div>
    </form>
  );
};

export default HeaderLoggedOut;
