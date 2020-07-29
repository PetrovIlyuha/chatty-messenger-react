import React from "react";
import { Link } from "react-router-dom";
import Broken from "../assets/broken-page.jpg";
import MainLayout from "../shared/MainLayout";

const PageNotFound = () => {
  return (
    <MainLayout>
      <div className="text-center mt-5">
        <h2>Page is broken 💔</h2>
        <img
          src={Broken}
          alt="broken page"
          className="my-5"
          style={{
            width: 400,
            borderRadius: "50%",
            border: "2px solid silver",
            boxShadow: "2px 2px 12px -2px rgba(0,0,0,0.4)",
          }}
        />
        <div className="lead text-muted mt-2">
          You can always visit the <Link to="/">Home Page</Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default PageNotFound;
