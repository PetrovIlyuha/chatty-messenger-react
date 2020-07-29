import React, { useContext, useEffect, useRef } from "react";
import StateContext from "../StateContext";
import { useImmer } from "use-immer";
import { Link } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import io from "socket.io-client";

const Chat = () => {
  const socket = useRef(null);
  const appState = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const inputRef = useRef(null);
  const chatLog = useRef(null);
  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: [],
  });

  useEffect(() => {
    socket.current = io(
      process.env.BACKENDURL || "https://chattybackend.herokuapp.com"
    );
    socket.current.on("chatFromServer", (message) => {
      setState((state) => {
        state.chatMessages.push(message);
      });
    });
    return () => socket.current.disconnect();
  }, []);

  useEffect(() => {
    if (appState.isChatOpen) {
      inputRef.current.focus();
      dispatch({ type: "clearUnreadChatCount" });
    }
  }, [appState.isChatOpen]);

  useEffect(() => {
    chatLog.current.scrollIntoView(false);
    if (state.chatMessages.length && !appState.isChatOpen) {
      dispatch({ type: "incrementUnreadChatCount" });
    }
  }, [state.chatMessages]);

  const handleCloseChat = (e) => {
    dispatch({ type: "closeChat" });
  };

  const handleFieldChange = (e) => {
    const value = e.target.value;
    setState((state) => {
      state.fieldValue = value;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: send message to chat server
    socket.current.emit("chatFromBrowser", {
      message: state.fieldValue,
      token: appState.user.token,
    });
    setState((state) => {
      state.chatMessages.push({
        message: state.fieldValue,
        username: appState.user.username,
        avatar: appState.user.avatar,
      });
      state.fieldValue = "";
    });
  };

  return (
    <div
      id="chat-wrapper"
      style={{ marginBottom: 108 }}
      className={`chat-wrapper ${
        appState.isChatOpen ? "chat-wrapper--is-visible" : ""
      } shadow border-top border-left border-right`}
    >
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={handleCloseChat} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username === appState.user.username) {
            return (
              <div className="chat-self" key={index}>
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          } else {
            return (
              <div className="chat-other" key={index}>
                <Link to={`/profile/${message.username}`}>
                  <img className="avatar-tiny" src={message.avatar} />
                </Link>
                <div className="chat-message">
                  <div className="chat-message-inner">
                    <Link to={`/profile/${message.username}`}>
                      <strong>{message.username}: </strong>
                    </Link>{" "}
                    {message.message}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
      <form
        id="chatForm"
        className="chat-form border-top"
        onSubmit={handleSubmit}
      >
        <input
          onChange={handleFieldChange}
          ref={inputRef}
          type="text"
          value={state.fieldValue}
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default Chat;
