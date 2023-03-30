/*global chrome*/
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./landingPage.css";

function LandingPage(props) {
  const [isGitHub, setIsGitHub] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
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
        await chrome.tabs.update({
          url: `https://github.com/${props.handle}`,
        });
        // Wait for the page to finish loading
        let pageLoaded = false;
        chrome.tabs.onUpdated.addListener(function listener(
          tabId,
          changeInfo,
          tab
        ) {
          if (tab.url.startsWith(`https://github.com/${props.handle}`)) {
            if (changeInfo.status === "complete") {
              chrome.tabs.onUpdated.removeListener(listener);
              pageLoaded = true;
            }
          }
        });

        while (!pageLoaded) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        props.setHandle(props.handle);
        props.setCurrentPage("GithubProfilePage");
        setError("");
      }
    } catch (error) {
      // handle error
      setError("User does not exist");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.get(
        `https://api.opensauced.pizza/v1/auth/session`,
        {
          headers: {
            Authorization: import.meta.env.VITE_HOT_OPENSAUCED_TOKEN,
          },
        }
      );
      if (response.status === 200) {
        setIsLogin(true);
        // Get the user's handle and repo name from the URL, using regex
        chrome.tabs.query(
          { active: true, currentWindow: true },
          async function (tabs) {
            const url = tabs[0].url;
            const regex = /github\.com\/(.+)\/(.+)/;
            const match = url.match(regex);

            if (match) {
              const handle = match[1]; // This will be "username"
              const repo = match[2]; // This will be "repo-name"

              // Check whether the repo is already in hot.opensauced
              try {
                const hotResponse = await axios.get(
                  `https://api.opensauced.pizza/v1/repos/${handle}/${repo}`,
                  {
                    headers: {
                      Authorization: import.meta.env.VITE_HOT_OPENSAUCED_TOKEN,
                    },
                  }
                );
                if (hotResponse.status === 200) {
                  // The repo is already in hot.opensauced
                  chrome.tabs.query(
                    { active: true, currentWindow: true },
                    async (tabs) => {
                      var tabId = tabs[0].id;
                      chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        func: injectVoteButton,
                        args: [
                          `${handle}`,
                          `${repo}`,
                          `${import.meta.env.VITE_HOT_OPENSAUCED_TOKEN}`,
                        ],
                      });
                    }
                  );
                }
              } catch (error) {
                console.log(error);
              }
            }
          }
        );
      }
    } catch (error) {
      // handle error
      console.log(error);
    }
  };

  const injectVoteButton = (handle, repo, token) => {
    const starButton = document.querySelector(
      ".pagehead-actions.flex-shrink-0.d-none.d-md-inline"
    );
    const upVoteButton = document.querySelector(".upvote-button");
    if (starButton && !upVoteButton) {
      const button = document.createElement("button");
      button.className = "py-2 px-4 mr-6 rounded upvote-button";
      button.style.float = "right";
      button.innerText = "Upvote";
      button.src;
      button.addEventListener("click", () => {
        fetch(`https://api.opensauced.pizza/v1/repos/${handle}/${repo}/vote`, {
          method: "PUT",
          headers: {
            Authorization: token,
          },
        })
          .then((response) => {
            if (response.status === 200) {
              button.innerText = "Upvoted :)";
              button.disabled = true;
            }
          })
          .catch((error) => {
            //find the 409 in error message
            if (error.includes("409")) {
              button.innerText = "Upvoted :)";
              button.disabled = true;
            } else console.log(error);
          });
      });
      starButton.parentNode.insertAdjacentElement("afterend", button);
    }
  };

  //check whether the user is already at a Github profile page
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTab = tabs[0];
      const isGitHub = /github\.com/.test(currentTab.url);
      setIsGitHub(isGitHub);

      if (isGitHub) {
        const match = currentTab.url.match(
          /^https?:\/\/github\.com\/([^/]+)(\?|$)/
        );
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
        isLogin ? (
          <div className="text-3xl font-mono px-1">
            You're authorized! You can vote repos that are available in
            hot.opensauced!
          </div>
        ) : (
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
            <div className="text-lg text-gray-400 mt-4">
              Check if you're
              <button
                className="text-green-500 ml-1 hover:underline border-none"
                onClick={handleLogin}
              >
                Authorized to vote!
              </button>{" "}
              If the screen doesnt change, check console log to see what's
              wrong. Visit hot.opensauced.pizza to get your token!
            </div>
          </div>
        )
      ) : (
        <h1 className="text-3xl font-mono px-1">
          Please visit GitHub.com to use this extension
        </h1>
      )}
    </div>
  );
}

export default LandingPage;
