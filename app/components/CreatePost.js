import React, { useState, useContext } from "react";
import Page from "./Page";
import Axios from "axios";
import { Redirect } from "react-router-dom";
import DispatchContext from "../DispatchContext";
import StateContext from "../StateContext";
import MainLayout from "../shared/MainLayout";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [created, setCreated] = useState(null);
  const dispatch = useContext(DispatchContext);
  const state = useContext(StateContext);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios.post("/create-post", {
        title,
        body,
        token: state.user.token,
      });
      setCreated(response.data);
    } catch (e) {
      console.log("Problem while creating post occurred");
    }
  };

  if (created) {
    try {
      dispatch({ type: "flashMessage", payload: "Post created! 🙌" });
    } catch {
      console.log("Error on create post dispatch");
    }
    return <Redirect to={`/post/${created}`} />;
  }

  return (
    <MainLayout>
      <Page title="Create new Post">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="post-title" className="text-muted mb-1">
              <small>Title</small>
            </label>
            <input
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              name="title"
              id="post-title"
              className="form-control form-control-lg form-control-title"
              type="text"
              placeholder=""
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="post-body" className="text-muted mb-1 d-block">
              <small>Body Content</small>
            </label>
            <textarea
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              id="post-body"
              className="body-content tall-textarea form-control"
              type="text"
            ></textarea>
          </div>

          <button className="marketing-btn">Save New Post</button>
        </form>
      </Page>
    </MainLayout>
  );
};

export default CreatePost;
