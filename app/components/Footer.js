import React from "react";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="border-top text-center small py-3 footer">
      <p>
        <Link to="/" className="mx-1">
          Home
        </Link>{" "}
        |{" "}
        <Link className="mx-1" to="/about-us">
          About Us
        </Link>{" "}
        |{" "}
        <Link className="mx-1" to="/terms">
          Terms
        </Link>
      </p>
      <p className="mx-1">
        Copyright &copy; 2020 <Link to="/">Chatty</Link>. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
