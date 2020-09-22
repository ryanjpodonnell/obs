module.exports = function() { 
  require("./obs-helpers.js")();

  const fetch = require('node-fetch');
  const Promise = require("bluebird");

  var obs;

  var previousGameId;
  var newGame = false;
  var ingestedGameOverData = false;
  var startScorbitIngestion = false;

  var bestGame = 0;
  var worstGame = 0;
  var gameCount = 0;

  var weedCamActive = false;

  this.bestScore = function () {
    return bestGame;
  }

  this.worstScore = function () {
    return worstGame;
  }

  this.gamesPlayed = function () {
    return gameCount;
  }

  this.initializeScorbit = function (obsInstance) {
    obs = obsInstance;
    pingScorbit();
  }

  pingScorbit = function () {
    fetch('https://' + process.env.SCORBIT_AUTH + '@api.scorbit.io/api/scoreboard/43/scores/')
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

    if (previousGameId === undefined) {
      previousGameId = session["id"];
    }
    if (startScorbitIngestion === false) {
      startScorbitIngestion = (previousGameId !== session["id"])
    }

    if (startScorbitIngestion === true) {
      ingestScoritSession(session);
    }
  };

  ingestScoritSession = function (session) {
    var gameOver = (session["settled_on"] !== null);

    if (gameOver === false && ingestedGameOverData === true) {
      ingestedGameOverData = false;
    }

    if (gameOver === true && ingestedGameOverData === false) {
      ingestFinalScores(session);
      incrementGameCount();
      ingestedGameOverData = true;
    }

    checkWeed(session);
  }

  ingestFinalScores = function (session) {
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
  };

  incrementGameCount = function () {
    gameCount += 1;
  }

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
};
