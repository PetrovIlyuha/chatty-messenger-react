import React from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils/formatDate";

const Post = ({ post, onClick = () => {}, noAuthor }) => {
  return (
    <Link
      key={post._id}
      onClick={onClick}
      to={`/post/${post._id}`}
      className="list-group-item list-group-item-action"
    >
      <img className="avatar-tiny" src={post.author.avatar} />{" "}
      <strong>{post.title}</strong>{" "}
      <span className="text-muted small">
        {!noAuthor && <>by {post.author.username}</>} on {formatDate(post)}{" "}
      </span>
    </Link>
  );
};

export default Post;
