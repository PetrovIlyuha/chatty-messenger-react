import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import LoadingDotsIcon from "../shared/LoadingDotsIcon";

const ProfileFollow = ({ action }) => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const userPosts = posts.data;

  useEffect(() => {
    const request = Axios.CancelToken.source();
    async function fetchPosts() {
      try {
        const posts = await Axios.get(`/profile/${username}/${action}`, {
          cancelToken: request.token,
        });
        setPosts(posts);
        setIsLoading(false);
      } catch (e) {
        console.log("Problem with getting your posts 🤷‍♀️");
      }
    }
    fetchPosts();
    return () => {
      request.cancel();
    };
  }, [username, action]);
  console.log(userPosts);
  if (isLoading) return <LoadingDotsIcon />;
  return (
    <div className="list-group">
      {userPosts.length > 0 ? (
        userPosts.map((follower, index) => {
          return (
            <Link
              to={`/profile/${follower.username}`}
              className="list-group-item list-group-item-action"
              key={index}
            >
              <img className="avatar-tiny" src={follower.avatar} />{" "}
              {follower.username}
            </Link>
          );
        })
      ) : (
        <div className="alert alert-danger text-center">
          {action == "followers"
            ? "This User Has no Followers Yet"
            : "This User In Not Following Anyone Yet"}
        </div>
      )}
    </div>
  );
};

export default ProfileFollow;
