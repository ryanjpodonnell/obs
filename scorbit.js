module.exports = function() { 
  require("./obs-helpers.js")();

  const fetch = require('node-fetch');
  const Promise = require("bluebird");

  var obs;

  var frenzy = false;
  var frenzyGameId;

  var tonysSent = 0;
  var previousScore;
  var previousGameId;
  var bestGame = 0;
  var worstGame = 0;
  var weedCamActive = false;

  this.bestScore = function () {
    return bestGame;
  }

  this.worstScore = function () {
    return worstGame;
  }

  this.startFrenzy = function () {
    frenzy = true;
  }

  this.initializeScorbit = function (obsInstance) {
    obs = obsInstance;
    pingScorbit();
  }

  pingScorbit = function () {
    fetch('https://' + process.env.SCORBIT_AUTH + '@api.scorbit.io/api/scoreboard/49/scores/')
      .then(checkStatus)
      .then(res => res.json())
      .then(json => parseResponse(json))
      .then(() => Promise.delay(2000))
      .then(() => pingScorbit())
      .catch(function(error) { Promise.delay(2000).then(() => pingScorbit()) });
  };

  checkStatus = function (res) {
    if (res.ok) {
      return res;
    } else {
      console.log(res.statusText);
      throw(res.statusText);
    }
  };

  parseResponse = function (response) {
    var session = response["data"][0]["session"];

    console.log(session);
    checkScores(session);
    checkWeed(session);
    if (frenzy === true) {
      checkScoreDelta(session);
    }
  };

  checkScores = function (session) {
    if (previousGameId === undefined) {
      previousGameId = session["id"];
    }

    if (session["settled_on"] !== null && previousGameId !== session["id"]) {
      session["scores"].forEach(score => {
        if (bestGame === 0 && worstGame === 0) {
          bestGame = score["score"];
          worstGame = score["score"];
        }

        if (score["score"] > 0 && score["score"] > bestGame) {
          bestGame = score["score"];
        }
        if (score["score"] > 0 && score["score"] < worstGame) {
          worstGame = score["score"];
        }
      });
    }
  };

  checkWeed = function (session) {
    var currentScoresContainWeed = false;
    session["scores"].forEach(score => {
      if (score["score"].toString().includes("420")) {
        currentScoresContainWeed = true;
      }
    });

    if (currentScoresContainWeed === true && weedCamActive === false) {
      weedCamActive = true;
      showItemWithinScene(obs, 'weed', '- Score Cam');
    } else if (currentScoresContainWeed === false && weedCamActive === true) {
      weedCamActive = false;
      hideItemWithinScene(obs, 'weed', '- Score Cam');
    }
  };

  checkScoreDelta = function (session) {
    var gameOver = (session["settled_on"] !== null);
    if (gameOver === true && frenzyGameId === undefined) {
      return;
    }

    if (gameOver === true && frenzyGameId !== undefined) {
      frenzy = false;
      hideItem(obs, '- Frenzy');
    }

    if (gameOver === false && frenzyGameId === undefined) {
      frenzyGameId = session["id"];
      showItem(obs, '- Frenzy');
    }

    var currentScore = 0;
    session["scores"].forEach(score => {
      if (score["score"] > currentScore) {
        currentScore = score["score"];
      }
    });

    var delta = currentScore - (tonysSent * 100_000);
    delta = delta / 100_000;
    delta = Math.floor(delta);

    if (delta > 0) {
      fetch("http://localhost:4567/" + delta, {
        method: "POST"
      }).then(res => {
        console.log("Request complete!");
      });
    }

    tonysSent += delta;
  };
};
