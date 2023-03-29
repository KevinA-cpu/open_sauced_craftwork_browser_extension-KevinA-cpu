/*global chrome*/
import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import GithubProfilePage from "./pages/GithubProfilePage";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("LandingPage");
  const [handle, setHandle] = useState("");

  return (
    <div className="text-white w-[350px] h-[500px]">
      {currentPage === "LandingPage" && (
        <LandingPage
          setCurrentPage={setCurrentPage}
          handle={handle}
          setHandle={setHandle}
        />
      )}
      {currentPage === "GithubProfilePage" && (
        <GithubProfilePage setCurrentPage={setCurrentPage} handle={handle} />
      )}
    </div>
  );
}

export default App;
