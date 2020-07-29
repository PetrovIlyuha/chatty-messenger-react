import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import { useParams, Link, Redirect } from "react-router-dom";
import Axios from "axios";
import { formatDate } from "../utils/formatDate";
import LoadingDotsIcon from "../shared/LoadingDotsIcon";
import ReactMarkdown from "react-markdown";
import ReactTooltip from "react-tooltip";
import NotFound from "./404";
import MainLayout from "../shared/MainLayout";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";

const ViewSinglePost = () => {
  const [isLoading, setIsLoading] = useState(true);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const { id } = useParams();
  const [post, setPost] = useState();
  const [deleteAttemptCount, setDeleteAttemptCount] = useState(0);
  const [deleteWasSuccessful, setDeleteWasSuccessful] = useState(false);
  const postData = post && post.data;

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchPost() {
      try {
        const post = await Axios.get(`/post/${id}`, {
          cancelToken: ourRequest.token,
        });
        setPost(post);
        setIsLoading(false);
      } catch (e) {
        console.log("Problem with getting your posts 🤷‍♀️");
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, [id]);

  useEffect(() => {
    if (deleteAttemptCount) {
      const ourRequest = Axios.CancelToken.source();
      async function deletePost() {
        try {
          const response = await Axios.delete(
            `/post/${id}`,
            {
              data: { token: appState.user.token },
            },
            {
              cancelToken: ourRequest.token,
            }
          );
          if (response.data == "Success") {
            setDeleteWasSuccessful(true);
          }
        } catch (e) {
          console.log("Problem with deleting post1 🤷‍♀️");
        }
      }
      deletePost();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [deleteAttemptCount]);

  if (deleteWasSuccessful) {
    appDispatch({ type: "flashMessage", payload: "Post was deleted! 🎉" });
    return <Redirect to={`/profile/${appState.user.username}`} />;
  }

  if (!isLoading && !postData) {
    return <NotFound />;
  }

  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    );

  function isOwner() {
    return appState.user.username == postData.author.username;
  }

  function deleteHandler() {
    const areYouSure = window.confirm("Are You Sure?");
    if (areYouSure) {
      setDeleteAttemptCount((prev) => prev + 1);
    }
  }

  return (
    <MainLayout>
      <Page title={postData.title.substr(0, 14)}>
        <div className="d-flex justify-content-between">
          <h2>{postData.title.substr(0, 40).concat("...")}</h2>
          {isOwner() && (
            <span className="pt-2">
              <Link
                to={`/post/${postData._id}/edit`}
                data-tip="Edit"
                data-for="edit"
                className="text-primary mr-2"
              >
                <i className="fas fa-edit"></i>
              </Link>{" "}
              <ReactTooltip id="edit" className="custom-tooltip" />
              <a
                className="delete-post-button text-danger"
                data-tip="Delete"
                data-for="delete"
                onClick={deleteHandler}
              >
                <i className="fas fa-trash"></i>
              </a>
              <ReactTooltip id="delete" className="custom-tooltip" />
            </span>
          )}
        </div>

        <p className="text-muted small mb-4">
          <Link to={`/profile/${postData.author.username}`}>
            <img className="avatar-tiny" src={postData.author.avatar} />
          </Link>
          Posted by{" "}
          <Link to={`/profile/${postData.author.username}`}>
            {postData.author.username}
          </Link>{" "}
          on {formatDate(postData)}
        </p>

        <div className="body-content">
          <ReactMarkdown source={postData.body} />
        </div>
      </Page>
    </MainLayout>
  );
};

export default ViewSinglePost;
