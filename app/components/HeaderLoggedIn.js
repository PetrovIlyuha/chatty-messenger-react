import React, { useContext } from "react";
import { Link } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import ReactTooltip from "react-tooltip";

const HeaderLoggedIn = () => {
  const dispatch = useContext(DispatchContext);
  const state = useContext(StateContext);

  const chatIconColor = state.unreadChatCount > 0 ? "yellow" : "#F2BE8D";

  const handleLogOut = () => {
    dispatch({ type: "logout" });
    dispatch({
      type: "flashMessage",
      payload: "Stay safe and keep social distance!",
    });
  };

  const handleSearchIcon = (e) => {
    e.preventDefault();
    dispatch({ type: "openSearch" });
  };

  const handleToggleChat = (e) => {
    e.preventDefault();
    dispatch({ type: "toggleChat" });
  };

  return (
    <div className="flex-row my-3 my-md-0 flex-center">
      <a
        onClick={handleSearchIcon}
        data-tip="search"
        data-for="search"
        href="#"
        className="mr-2 header-search-icon"
      >
        <ReactTooltip id="search" place="bottom" className="custom-tooltip" />
        <i
          className="fas fa-search"
          style={{ color: "#F2BE8D", fontSize: "1.2rem" }}
        ></i>
      </a>
      <span
        onClick={handleToggleChat}
        data-for="chat"
        data-tip="chat"
        className="mr-2 header-chat-icon"
        style={{ marginTop: 4 }}
      >
        <i
          className="fas fa-comment"
          style={{
            color: chatIconColor,
            fontSize: "1.4rem",
          }}
        ></i>
        {state.unreadChatCount ? (
          <span className="chat-count-badge">
            {state.unreadChatCount < 10 ? state.unreadChatCount : "9+"}
          </span>
        ) : (
          ""
        )}
      </span>
      <ReactTooltip id="chat" place="bottom" className="custom-tooltip" />
      <Link
        to={`/profile/${state.user.username}`}
        data-for="profile"
        data-tip="profile"
        className="mr-2"
      >
        <img className="small-header-avatar" src={state.user.avatar} />
      </Link>
      <ReactTooltip id="profile" place="bottom" className="custom-tooltip" />
      <button className="cta-button">
        <Link to="/create-post">Create Post</Link>
      </button>
      <button onClick={handleLogOut} className="marketing-btn">
        Sign Out
      </button>
    </div>
  );
};

export default HeaderLoggedIn;
