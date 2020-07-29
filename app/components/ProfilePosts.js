import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
import StateContext from "../StateContext";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { formatDate } from "../utils/formatDate";
import LoadingDotsIcon from "../shared/LoadingDotsIcon";
import Post from "./Post";

const ProfilePosts = () => {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const state = useContext(StateContext);
  const [posts, setPosts] = useState([]);
  const userPosts = posts.data;

  useEffect(() => {
    const request = Axios.CancelToken.source();
    async function fetchPosts() {
      try {
        const posts = await Axios.get(`/profile/${username}/posts`, {
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
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;
  return (
    <div className="list-group">
      {userPosts &&
        userPosts.map((post) => {
          return <Post noAuthor={true} post={post} key={post._id} />;
        })}
    </div>
  );
};

export default ProfilePosts;
