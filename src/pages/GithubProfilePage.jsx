import React, { useState, useEffect } from "react";
import { FaUserFriends } from "react-icons/fa";
import axios from "axios";
import "./githubProfilePage.css";

function GithubProfilePage(props) {
  const [profile, setProfile] = useState(null);
  const [accountLink, setAccountLink] = useState("");
  const [showButton, setShowButton] = useState(false);

  //fetching profile datas
  useEffect(() => {
    const fetchOpenSauceAccount = async () => {
      try {
        const response = await axios.get(
          `https://api.opensauced.pizza/v1/users/${props.handle}`
        );
        if (response.status === 200)
          setAccountLink(
            `https://insights.opensauced.pizza/user/${props.handle}`
          );
      } catch (error) {
        // handle error
        console.log(error);
        setAccountLink("false");
      } finally {
        setShowButton(true);
      }
    };
    const fetchGithubProfile = async () => {
      try {
        const response = await axios.get(
          `https://api.github.com/users/${props.handle}`,
          {
            headers: {
              Authorization: import.meta.env.VITE_GITHUB_API_TOKEN,
            },
          }
        );
        setProfile(response.data);
        fetchOpenSauceAccount();
      } catch (error) {
        // handle error
        console.log(error);
      }
    };
    fetchGithubProfile();
  }, [props.handle]);

  // Inject the button above the follow button
  useEffect(() => {
    const injectOpenSaucedButton = async (accountLink) => {
      const followButton = document.querySelector(
        ".js-user-profile-follow-button"
      );
      const openSaucedButton = document.querySelector(".opensauced-button");
      if (followButton && !openSaucedButton) {
        const button = document.createElement("button");
        button.className = "py-2 px-4 rounded opensauced-button";
        button.innerText = "View on OpenSauced";
        button.addEventListener("click", () => {
          window.open(accountLink, "_blank");
        });
        followButton.parentNode.insertBefore(button, followButton.nextSibling);
      }
    };

    const injectJoinInsteadButton = async () => {
      const followButton = document.querySelector(
        ".js-user-profile-follow-button"
      );
      const openSaucedButton = document.querySelector(".joinopensauced-button");
      if (followButton && !openSaucedButton) {
        const button = document.createElement("button");
        button.className = "py-2 px-4 rounded joinopensauced-button";
        button.innerText = "Join OpenSauced";
        button.addEventListener("click", () => {
          window.open("https://insights.opensauced.pizza/start", "_blank");
        });
        followButton.parentNode.insertBefore(button, followButton.nextSibling);
      }
    };
    if (accountLink !== "" && accountLink !== "false")
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        var tabId = tabs[0].id;
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: injectOpenSaucedButton,
          args: [`${accountLink}`],
        });
      });
    else if (accountLink === "false")
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        var tabId = tabs[0].id;
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: injectJoinInsteadButton,
        });
      });
  }, [accountLink]);

  if (!profile) {
    return (
      <div className="loading-container">
        <div className="loading w-14 h-14"></div>
      </div>
    );
  }

  const { avatar_url, name, bio, login, followers, following } = profile;

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-full overflow-hidden mt-5">
        <img
          src={avatar_url}
          alt={`${name}'s avatar`}
          className="w-60 h-60 object-cover"
        />
      </div>
      <div className="text-left ml-[11px]">
        <h2 className="text-3xl font-bold mt-4">{name}</h2>
        <p className="text-xl text-gray-400 font-thin mt-1">{login}</p>
        <p className="text-xl font-thin mt-1">{bio}</p>
        <div className="text-center mt-1 mr-4">
          {showButton ? (
            accountLink === "" || accountLink === "false" ? (
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">
                  No OpenSauced account?
                  <a
                    href="https://insights.opensauced.pizza/start"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-500 ml-1 hover:underline"
                  >
                    Join instead!
                  </a>
                </div>
                <button
                  className="text-center w-[300px] text-lg bg-gray-400 text-white py-2 px-4 rounded cursor-not-allowed"
                  disabled
                >
                  No OpenSauced Account Found
                </button>
              </div>
            ) : (
              <button
                className="text-center w-[300px] text-xl bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                onClick={() => {
                  chrome.tabs.update({ url: accountLink });
                }}
              >
                View on OpenSauced
              </button>
            )
          ) : null}
        </div>
        <div className="flex items-center mt-1 mb-5">
          <FaUserFriends className="text-xl text-gray-500 mr-2" />
          <span className="text-xl font-thin mr-2">{followers}</span>
          <span className="text-xl text-gray-400 font-thin">followers</span>
          <span className="text-white ml-2">•</span>
          <span className="text-xl font-thin mr-1 ml-2">{following}</span>
          <span className="text-xl text-gray-400 font-thin">following</span>
        </div>
      </div>
    </div>
  );
}

export default GithubProfilePage;
