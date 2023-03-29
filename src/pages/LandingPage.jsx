/*global chrome*/
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./landingPage.css";

function LandingPage(props) {
  const [isGitHub, setIsGitHub] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${props.handle}`,
        {
          headers: {
            Authorization: import.meta.env.VITE_GITHUB_API_TOKEN,
          },
        }
      );
      if (response.status === 200) {
        const url = `https://github.com/${props.handle}`;
        chrome.tabs.update({ url: url });
        setError("");
        props.setCurrentPage("GithubProfilePage");
      }
    } catch (error) {
      // handle error
      setError("User does not exist");
    }
  };

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      const isGitHub = /github\.com/.test(currentTab.url);
      setIsGitHub(isGitHub);

      if (isGitHub) {
        const match = currentTab.url.match(/github\.com\/([^/]+)/);
        if (match) {
          props.setHandle(match[1]);
          props.setCurrentPage("GithubProfilePage");
        }
      }
    });
  }, []);

  return (
    <div className="text-white w-[350px] h-[500px] flex flex-col justify-center text-center">
      {isGitHub ? (
        <div className="items-center">
          <h1 className="text-3xl font-mono px-1">Enter a GitHub handle</h1>
          <input
            className="border border-gray-400 rounded-md py-2 px-4 w-72 text-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-black"
            type="text"
            placeholder="GitHub handle"
            onChange={(event) => props.setHandle(event.target.value)}
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </button>
          <div className="text-lg text-gray-400 mt-4">
            Don't like to type? Just navigate straight to the user profile!
          </div>
        </div>
      ) : (
        <h1 className="text-3xl font-mono px-1">
          Please visit GitHub.com to use this extension
        </h1>
      )}
    </div>
  );
}

export default LandingPage;
