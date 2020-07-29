import React, { useContext } from "react";
import { Link } from "react-router-dom";
import HeaderLoggedOut from "./HeaderLoggedOut";
import HeaderLoggedIn from "./HeaderLoggedIn";
import StateContext from "../StateContext";

const Header = ({ staticEmpty }) => {
  const { loggedIn } = useContext(StateContext);
  const headerContent = loggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOut />;
  return (
    <header className="header-bar mb-3">
      <div className="container d-flex flex-column flex-md-row align-items-center p-3">
        <h4 className="my-0 mr-md-auto font-weight-normal">
          <Link to="/" className="text-white">
            Chatty
          </Link>
        </h4>
        {!staticEmpty ? headerContent : ""}
      </div>
    </header>
  );
};

export default Header;
