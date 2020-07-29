import React, { useEffect, useContext } from "react";
import { useImmerReducer } from "use-immer";
import Page from "./Page";
import { useParams, Link, useHistory, Redirect } from "react-router-dom";
import Axios from "axios";
import { formatDate } from "../utils/formatDate";
import LoadingDotsIcon from "../shared/LoadingDotsIcon";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import ReactTooltip from "react-tooltip";
import PageNotFound from "./404";
import MainLayout from "../shared/MainLayout";

const EditPost = () => {
  const {
    user: { token },
  } = useContext(StateContext);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const history = useHistory();
  const originalState = {
    title: {
      value: "",
      hasErrors: false,
      message: "",
    },
    body: {
      value: "",
      hasErrors: false,
      message: "",
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
    permissionProblem: false,
  };

  function editPostReducer(state, action) {
    switch (action.type) {
      case "fetchComplete":
        state.title.value = action.payload.title;
        state.body.value = action.payload.body;
        state.isFetching = false;
        if (appState.user.username !== action.payload.author.username)
          state.permissionProblem = true;
        return;
      case "titleChange":
        state.title.value = action.payload;
        return;
      case "changeBody":
        state.body.value = action.payload;
        return;
      case "submitChanges":
        if (!state.title.hasErrors && !state.body.hasErrors) {
          state.sendCount++;
        }
        return;
      case "savePostUpdateStarted":
        state.isSaving = true;
        return;
      case "savePostUpdateFinished":
        state.isSaving = false;
        return;
      case "titleRules":
        if (!action.payload.trim()) {
          state.title.hasErrors = true;
          state.title.message = "Title should contain something!";
          return;
        } else {
          state.title.hasErrors = false;
          state.title.message = "";
          return;
        }
      case "bodyRules":
        if (!action.payload.trim()) {
          state.body.hasErrors = true;
          state.body.message = "You should put some content for the post!";
          return;
        } else {
          state.body.hasErrors = false;
          state.body.message = "";
          return;
        }
      case "notFound":
        state.notFound = true;
        return;
    }
  }
  const [state, dispatch] = useImmerReducer(editPostReducer, originalState);

  const editSubmitHandler = (e) => {
    e.preventDefault();
    dispatch({ type: "titleRules", payload: state.title.value });
    dispatch({ type: "bodyRules", payload: state.body.value });
    dispatch({ type: "submitChanges" });
    setTimeout(() => {
      history.push(`/post/${state.id}`);
    }, 1200);
  };

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          cancelToken: ourRequest.token,
        });
        if (response.data) {
          dispatch({ type: "fetchComplete", payload: response.data });
        } else {
          dispatch({ type: "notFound" });
        }
      } catch (e) {
        console.log("Problem with getting your posts 🤷‍♀️");
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "savePostUpdateStarted" });
      const ourRequest = Axios.CancelToken.source();
      async function fetchPost() {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            { title: state.title.value, body: state.body.value, token },
            {
              cancelToken: ourRequest.token,
            }
          );
          dispatch({ type: "savePostUpdateFinished" });
          appDispatch({ type: "flashMessage", payload: "Post was updated!" });
        } catch (e) {
          console.log("Problem with getting your posts 🤷‍♀️");
        }
      }
      fetchPost();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.sendCount]);

  if (state.notFound) {
    return (
      <Page title="Not Found">
        <PageNotFound />
      </Page>
    );
  }

  if (state.permissionProblem) {
    appDispatch({ type: "flashMessage", payload: "You can't edit that post!" });
    return <Redirect to="/" />;
  }
  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );
  return (
    <MainLayout>
      <Page title="Edit Post">
        <Link className="small font-weight-bold" to={`/post/${state.id}`}>
          &laquo; Back to post page
        </Link>
        <form className="mt-3" onSubmit={editSubmitHandler}>
          <div className="form-group">
            <label htmlFor="post-title" className="text-muted mb-1">
              <small>Title</small>
            </label>
            <input
              autoFocus
              onChange={(e) =>
                dispatch({ type: "titleChange", payload: e.target.value })
              }
              onBlur={(e) =>
                dispatch({ type: "titleRules", payload: e.target.value })
              }
              value={state.title.value}
              name="title"
              id="post-title"
              className="form-control form-control-lg form-control-title"
              type="text"
              placeholder=""
              autoComplete="off"
            />
            {state.title.hasErrors && (
              <div className="alert alert-danger small liveValidateMessage">
                {state.title.message}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="post-body" className="text-muted mb-1 d-block">
              <small>Body Content</small>
            </label>
            <textarea
              name="body"
              value={state.body.value}
              onChange={(e) =>
                dispatch({ type: "changeBody", payload: e.target.value })
              }
              onBlur={(e) =>
                dispatch({ type: "bodyRules", payload: e.target.value })
              }
              id="post-body"
              className="body-content tall-textarea form-control"
              type="text"
            />{" "}
            {state.body.hasErrors && (
              <div className="alert alert-danger small liveValidateMessage">
                {state.body.message}
              </div>
            )}
          </div>

          <button
            data-tip="Form fields can't be empty! Changes won't apply"
            data-for="button"
            className="marketing-btn"
          >
            Save Updates
          </button>
          {(state.body.hasErrors || state.title.hasErrors) && (
            <ReactTooltip id="button" className="custom-tooltip" />
          )}
        </form>
      </Page>
    </MainLayout>
  );
};

export default EditPost;
