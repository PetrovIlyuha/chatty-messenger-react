import React, { useEffect, useContext } from "react";
import Page from "./Page";
import StateContext from "../StateContext";
import MainLayout from "../shared/MainLayout";
import { useImmer } from "use-immer";
import { nameUppercase } from "../utils/nameUppercase";
import { formatDate } from "../utils/formatDate";
import Axios from "axios";
import { Link } from "react-router-dom";
import LoadingDotsIcon from "../shared/LoadingDotsIcon";
import Post from "./Post";

const Home = () => {
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    isLoading: true,
    feed: [],
  });
  const username =
    appState.user.username && nameUppercase(appState.user.username);

  useEffect(() => {
    const request = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post(
          "/getHomeFeed",
          {
            token: appState.user.token,
          },
          { cancelToken: request.token }
        );
        setState((state) => {
          state.isLoading = false;
          state.feed = response.data;
        });
      } catch (e) {
        console.log("Problem with getting user's data");
      }
    }
    fetchData();
    return () => {
      request.cancel();
    };
  }, []);

  if (state.isLoading) {
    return <LoadingDotsIcon />;
  }
  return (
    <MainLayout>
      <Page title="Your Feed">
        {state.feed.length > 0 && (
          <>
            <h2 className="text-center mb-4">
              The Latest from those you follow
            </h2>
            <div className="list-group">
              {state.feed.map((post) => (
                <Post post={post} key={post._id} />
              ))}
            </div>
          </>
        )}
        {state.feed.length == 0 && (
          <>
            <h2 className="text-center">
              Hello <strong>{username}</strong>, your feed is empty.
            </h2>
            <p className="lead text-muted text-center">
              Heirloom roof party everyday carry umami. Sustainable literally
              vaporware, pork belly celiac chillwave portland synth YOLO ennui
              venmo twee cronut neutra fashion axe. Vegan kinfolk hammock
              gastropub, ramps slow-carb hot chicken church-key pitchfork
              selvage viral lomo tousled marfa deep v. Glossier austin butcher
              artisan, mlkshk disrupt locavore af meh swag 3 wolf moon.
            </p>
          </>
        )}
      </Page>
    </MainLayout>
  );
};

export default Home;
