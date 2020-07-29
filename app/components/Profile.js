import React, { useEffect, useContext, useState } from "react";
import Page from "./Page";
import { useParams, NavLink, Switch, Route } from "react-router-dom";
import Axios from "axios";
import StateContext from "../StateContext";
import ProfilePosts from "./ProfilePosts";
import { useImmer } from "use-immer";
import NotFound from "./404";
import MainLayout from "../shared/MainLayout";
import ProfileFollow from "./ProfileFollow";

const Profile = () => {
  const { username } = useParams();
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" },
    },
  });
  const {
    profileAvatar,
    profileUsername,
    isFollowing,
    counts: { postCount, followerCount, followingCount },
  } = state.profileData;

  useEffect(() => {
    const request = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          {
            token: appState.user.token,
          },
          { cancelToken: request.token }
        );
        setState((state) => {
          state.profileData = response.data;
        });
      } catch (e) {
        console.log("Problem with getting user's data");
      }
    }
    fetchData();
    return () => {
      request.cancel();
    };
  }, [username]);

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((state) => {
        state.followActionLoading = true;
      });
      const request = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            { cancelToken: request.token }
          );
          setState((state) => {
            state.profileData.isFollowing = true;
            state.profileData.counts.followerCount++;
            state.followActionLoading = false;
          });
          console.log(state.profileData);
        } catch (e) {
          console.log("Problem with getting user's data");
        }
      }
      fetchData();
      return () => {
        request.cancel();
      };
    }
  }, [state.startFollowingRequestCount]);

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((state) => {
        state.followActionLoading = true;
      });
      const request = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            {
              token: appState.user.token,
            },
            { cancelToken: request.token }
          );
          setState((state) => {
            state.profileData.isFollowing = false;
            state.profileData.counts.followerCount--;
            state.followActionLoading = false;
          });
        } catch (e) {
          console.log("Problem with getting user's data");
        }
      }
      fetchData();
      return () => {
        request.cancel();
      };
    }
  }, [state.stopFollowingRequestCount, state.profileData.isFollowing]);

  const allowedToFollow = () => {
    if (
      appState.loggedIn &&
      !state.profileData.isFollowing &&
      appState.user.username !== state.profileData.profileUsername &&
      state.profileData.profileUsername !== "..."
    ) {
      return true;
    } else {
      return false;
    }
  };

  const allowedToUnfollow = () => {
    if (
      appState.loggedIn &&
      state.profileData.isFollowing &&
      appState.user.username !== state.profileData.profileUsername &&
      state.profileData.profileUsername !== "..."
    ) {
      return true;
    } else {
      return false;
    }
  };

  const startFollowing = () => {
    setState((state) => {
      state.startFollowingRequestCount++;
    });
  };

  const stopFollowing = () => {
    setState((state) => {
      state.stopFollowingRequestCount++;
    });
  };

  return (
    <MainLayout>
      <Page title="Profile screen">
        <h2>
          <img className="avatar-small" src={profileAvatar} /> {profileUsername}
          {allowedToFollow() && !state.profileData.isFollowing && (
            <button
              onClick={startFollowing}
              className="btn btn-primary btn-sm ml-2"
              disabled={state.followActionLoading}
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
          {allowedToUnfollow() && state.profileData.isFollowing && (
            <button
              onClick={stopFollowing}
              className="btn btn-primary btn-danger btn-sm ml-2"
              disabled={state.followActionLoading}
            >
              Unfollow <i className="fas fa-user-minus"></i>
            </button>
          )}
        </h2>

        <div className="profile-nav nav nav-tabs pt-2 mb-4">
          <NavLink
            exact
            to={`/profile/${state.profileData.profileUsername}`}
            className="nav-item nav-link"
          >
            Posts: {postCount}
          </NavLink>
          <NavLink
            to={`/profile/${state.profileData.profileUsername}/followers`}
            className="nav-item nav-link"
          >
            Followers: {followerCount}
          </NavLink>
          <NavLink
            to={`/profile/${state.profileData.profileUsername}/following`}
            className="nav-item nav-link"
          >
            Following: {followingCount}
          </NavLink>
        </div>
        <Switch>
          <Route path="/profile/:username" exact>
            <ProfilePosts />
          </Route>
          <Route path="/profile/:username/followers">
            <ProfileFollow action="followers" />
          </Route>
          <Route path="/profile/:username/following">
            <ProfileFollow action="following" />
          </Route>
        </Switch>
      </Page>
    </MainLayout>
  );
};

export default Profile;
