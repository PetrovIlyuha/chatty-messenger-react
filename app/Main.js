// utils
import React, { useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { useImmerReducer } from "use-immer";
import FlashMessages from "./components/FlashMessages";

// components

import About from "./components/About";
const Chat = React.lazy(() => import("./components/Chat.js"));
const CreatePost = React.lazy(() => import("./components/CreatePost"));
import EditPost from "./components/EditPost";
import HomeGuest from "./components/HomeGuest";
import Home from "./components/Home";
import LoadingDotsIcon from "./shared/LoadingDotsIcon";
import NotFound from "./components/404";
import Profile from "./components/Profile";
const Search = React.lazy(() => import("./components/Search"));
import Terms from "./components/Terms";
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));

// axios
import Axios from "axios";
Axios.defaults.baseURL =
  process.env.BACKENDURL || "https://chattybackend.herokuapp.com";
// Context
import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("userToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("userToken"),
      username: localStorage.getItem("userName"),
      avatar: localStorage.getItem("userAvatar"),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  };

  const mainReducer = (state, action) => {
    switch (action.type) {
      case "login":
        state.loggedIn = true;
        state.user = action.data;
        break;
      case "logout":
        state.loggedIn = false;
        break;
      case "flashMessage":
        state.flashMessages.push(action.payload);
        break;
      case "openSearch":
        state.isSearchOpen = true;
        return;
      case "closeSearch":
        state.isSearchOpen = false;
        return;
      case "toggleChat":
        state.isChatOpen = !state.isChatOpen;
        return;
      case "closeChat":
        state.isChatOpen = false;
      case "incrementUnreadChatCount":
        state.unreadChatCount++;
        return;
      case "clearUnreadChatCount":
        state.unreadChatCount = 0;
        return;
      default:
        return state;
    }
  };

  const [state, dispatch] = useImmerReducer(mainReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("userToken", state.user.token);
      localStorage.setItem("userName", state.user.username);
      localStorage.setItem("userAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("userAvatar");
    }
  }, [state.loggedIn]);

  // check if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            "/checkToken",
            { token: state.user.token },
            { cancelToken: ourRequest.token }
          );
          if (!response.data) {
            dispatch({ type: "logout" });
            dispatch({
              type: "flashMessage",
              payload: "Your session has expired! Please log in again...",
            });
          }
        } catch (e) {
          console.log(`Request had been canceled!`);
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <Router>
          <FlashMessages messages={state.flashMessages} />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route exact path="/">
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/about-us" component={About} />
              <Route path="/terms" component={Terms} />
              <Route path="/post/:id" exact>
                <ViewSinglePost />
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route exact path="/post/:id/edit" component={EditPost} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
          <CSSTransition
            timeout={400}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
        </Router>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<Main />, document.getElementById("app"));

if (module.hot) {
  module.hot.accept();
}
