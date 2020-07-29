import React, { useContext, useEffect } from "react";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import axios from "axios";
import Post from "./Post";

const Search = () => {
  const dispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0,
  });

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler);
    return () => {
      document.removeEventListener("keyup", searchKeyPressHandler);
    };
  }, []);

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((state) => {
        state.show = "loading";
      });
      const delay = setTimeout(() => {
        setState((state) => {
          state.requestCount++;
        });
      }, 500);
      return () => clearTimeout(delay);
    } else {
      setState((state) => {
        state.show = "neither";
      });
    }
  }, [state.searchTerm]);

  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await axios.post(
            "/search",
            { searchTerm: state.searchTerm },
            { cancelToken: ourRequest.token }
          );
          setState((prevState) => {
            prevState.results = response.data;
            prevState.show = "results";
          });
        } catch (e) {
          console.log(`Request had been canceled!`);
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.requestCount]);

  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      dispatch({ type: "closeSearch" });
    }
  }

  const handleInput = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setState((state) => {
      state.searchTerm = value;
    });
  };

  const handleCloseSearch = (e) => {
    e.preventDefault();
    dispatch({ type: "closeSearch" });
  };

  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            onChange={handleInput}
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
          />
          <span className="close-live-search" onClick={handleCloseSearch}>
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={
              "circle-loader" +
              (state.show == "loading" ? "circle-loader--visible" : "")
            }
          ></div>
          <div
            className={`live-search-results
              ${state.show == "results" ? "live-search-results--visible" : ""}`}
          >
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length}{" "}
                  {state.results.length > 1 ? "items" : "item"} found)
                </div>
                {state.results.map((result) => (
                  <Post
                    key={result._id}
                    onClick={() => dispatch({ type: "closeSearch" })}
                    post={result}
                  />
                ))}
              </div>
            )}
            {!Boolean(state.results.length) && (
              <p className="alert alert-danger text-center shadow-sm">
                No results were found{" "}
                <span role="img" aria-label="NO results">
                  🤷‍♀️
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Search;
