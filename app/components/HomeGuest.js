import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import axios from "axios";
import { useImmerReducer } from "use-immer";
import MainLayout from "../shared/MainLayout";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";

export default function HomeGuest() {
  const appDispatch = useContext(DispatchContext);
  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    email: {
      value: "",
      hasErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0,
    },
    password: {
      value: "",
      hasErrors: false,
      message: "",
    },
    submitCount: 0,
  };

  function loginReducer(state, action) {
    switch (action.type) {
      case "usernameImmediately":
        state.username.hasErrors = false;
        state.username.value = action.value;
        if (state.username.value.length > 20) {
          state.username.hasErrors = true;
          state.username.message =
            "What an imagination! They'll not appreciate! Punch'em with short username";
        }
        if (
          state.username.value &&
          !/^([a-zA-Z0-9]+)$/.test(state.username.value)
        ) {
          state.username.hasErrors = true;
          state.username.message =
            "Only LETTERS and NUMBERS are suitable to present you to the world!";
        }
        if (!state.username.hasErrors) {
          state.username.checkCount++;
        }
        return;
      case "usernameAfterDelay":
        if (state.username.value.length < 3) {
          state.username.hasErrors = true;
          state.username.message =
            "Too short for a respected member of society!";
        }
        if (!state.hasErrors && !action.noRequest) {
          state.username.checkCount++;
        }
        return;
      case "usernameUniqueResults":
        if (action.value) {
          state.username.hasErrors = true;
          state.username.isUnique = false;
          state.username.message = "Username is already taken";
        } else {
          state.username.isUnique = true;
        }
        return;
      case "emailImmediately":
        state.email.hasErrors = false;
        state.email.value = action.value;
        return;
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(state.email.value)) {
          state.email.hasErrors = true;
          state.email.message = "Provide a valid Email address";
        }
        if (!state.email.hasErrors && !action.noRequest) {
          state.email.checkCount++;
        }
        return;
      case "emailUniqueResults":
        if (action.value) {
          state.email.hasErrors = true;
          state.email.isUnique = false;
          state.email.message = "email is already taken";
        } else {
          state.email.isUnique = true;
        }
        return;
      case "passwordImmediately":
        state.password.hasErrors = false;
        state.password.value = action.value;
        return;
      case "passwordAfterDelay":
        if (
          !/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(
            state.password.value
          )
        ) {
          state.password.hasErrors = true;
          state.password.message =
            "Password can be stronger! One of those guys !@#$%^&* and some of those folks 0-9 will cut the deal";
        }
        return;
      case "submitForm":
        if (
          !state.username.hasErrors &&
          state.username.isUnique &&
          !state.email.hasErrors &&
          state.email.isUnique &&
          !state.password.hasErrors
        ) {
          state.submitCount++;
        }
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(loginReducer, initialState);

  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "usernameAfterDelay" });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [state.username.value]);

  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => {
        dispatch({ type: "emailAfterDelay" });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => {
        console.log("password delayed check");
        dispatch({ type: "passwordAfterDelay" });
      }, 800);
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  useEffect(() => {
    if (state.username.checkCount) {
      const ourRequest = axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await axios.post(
            "/doesUsernameExist",
            { username: state.username.value },
            { cancelToken: ourRequest.token }
          );
          dispatch({ type: "usernameUniqueResults", value: response.data });
        } catch (e) {
          console.log(`Request had been canceled!`);
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.username.checkCount]);

  useEffect(() => {
    if (state.email.checkCount) {
      console.log("checking email in the database");
      const ourRequest = axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await axios.post(
            "/doesEmailExist",
            { email: state.email.value },
            { cancelToken: ourRequest.token }
          );
          dispatch({ type: "emailUniqueResults", value: response.data });
        } catch (e) {
          console.log(`Request had been canceled!`);
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.email.checkCount]);

  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await axios.post(
            "/register",
            {
              username: state.username.value,
              email: state.email.value,
              password: state.password.value,
            },
            { cancelToken: ourRequest.token }
          );
          appDispatch({ type: "login", data: response.data });
          appDispatch({
            type: "flashMessage",
            payload: "Welcome to the New Chatty World!",
          });
        } catch (e) {
          console.log(`Request for registration had been canceled!`);
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.submitCount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch({ type: "usernameImmediately", value: state.username.value });
    dispatch({
      type: "usernameAfterDelay",
      value: state.username.value,
      noRequest: true,
    });
    dispatch({ type: "emailImmediately", value: state.email.value });
    dispatch({
      type: "emailAfterDelay",
      value: state.email.value,
      noRequest: true,
    });
    dispatch({ type: "passwordImmediately", value: state.password.value });
    dispatch({ type: "passwordAfterDelay", value: state.password.value });
    dispatch({ type: "submitForm" });
  };

  return (
    <MainLayout>
      <Page wide={true} title="Welcome!">
        <div className="row align-items-center">
          <div className="col-lg-7 py-3 py-md-5">
            <h1 className="display-3">Remember Writing?</h1>
            <p className="lead text-muted">
              Are you sick of short tweets and impersonal &ldquo;shared&rdquo;
              posts that are reminiscent of the late 90&rsquo;s email forwards?
              We believe getting back to actually writing is the key to enjoying
              the internet again.
            </p>
          </div>
          <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username-register" className="text-muted mb-1">
                  <small>Username</small>
                </label>
                <input
                  onChange={(e) =>
                    dispatch({
                      type: "usernameImmediately",
                      value: e.target.value,
                    })
                  }
                  value={state.username.value}
                  id="username-register"
                  name="username"
                  className="form-control"
                  type="text"
                  placeholder="Pick a username"
                  autoComplete="off"
                />
                <CSSTransition
                  in={state.username.hasErrors}
                  timeout={330}
                  classNames="liveValidateMessage"
                  unmountOnExit
                >
                  <div className="alert alert-danger small liveValidateMessage">
                    {state.username.message}
                  </div>
                </CSSTransition>
              </div>
              <div className="form-group">
                <label htmlFor="email-register" className="text-muted mb-1">
                  <small>Email</small>
                </label>
                <input
                  onChange={(e) =>
                    dispatch({
                      type: "emailImmediately",
                      value: e.target.value,
                    })
                  }
                  value={state.email.value}
                  id="email-register"
                  name="email"
                  className="form-control"
                  type="text"
                  placeholder="you@example.com"
                  autoComplete="off"
                />
                <CSSTransition
                  in={state.email.hasErrors}
                  timeout={330}
                  classNames="liveValidateMessage"
                  unmountOnExit
                >
                  <div className="alert alert-danger small liveValidateMessage">
                    {state.email.message}
                  </div>
                </CSSTransition>
              </div>
              <div className="form-group">
                <label htmlFor="password-register" className="text-muted mb-1">
                  <small>Password</small>
                </label>
                <input
                  onChange={(e) =>
                    dispatch({
                      type: "passwordImmediately",
                      value: e.target.value,
                    })
                  }
                  value={state.password.value}
                  id="password-register"
                  name="password"
                  className="form-control"
                  type="password"
                  placeholder="Create a password"
                />
                <CSSTransition
                  in={state.password.hasErrors}
                  timeout={330}
                  classNames="liveValidateMessage"
                  unmountOnExit
                >
                  <div className="alert alert-danger small liveValidateMessage">
                    {state.password.message}
                  </div>
                </CSSTransition>
              </div>
              <button
                type="submit"
                className="py-3 mt-4 btn btn-lg marketing-btn btn-block"
              >
                Sign up for Chatty
              </button>
            </form>
          </div>
        </div>
      </Page>
    </MainLayout>
  );
}
