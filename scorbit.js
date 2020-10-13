module.exports = function() { 
  require("./obs-helpers.js")();

  const fetch = require('node-fetch');
  const Promise = require("bluebird");

  var obs;

  var previousGameId;
  var ingestedGameOverData = false;
  var startScorbitIngestion = false;

  var bestGame = 0;
  var worstGame = 0;
  var gameCount = 0;

  var weedCamActive = false;
  var devilCamActive = false;
  var elrodCamActive = false;

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
    checkDevil(session);
    checkElrod(session);
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
      showItemWithinScene(obs, 'weed', '- Scorbit Cam');
    } else if (currentScoresContainWeed === false && weedCamActive === true) {
      weedCamActive = false;
      hideItemWithinScene(obs, 'weed', '- Scorbit Cam');
    }
  };

  checkDevil = function (session) {
    var currentScoresContainDevil = false;
    session["scores"].forEach(score => {
      if (score["score"].toString().includes("666")) {
        currentScoresContainDevil = true;
      }
    });

    if (currentScoresContainDevil === true && devilCamActive === false) {
      devilCamActive = true;
      showItemWithinScene(obs, 'devil', '- Scorbit Cam');
    } else if (currentScoresContainDevil === false && devilCamActive === true) {
      devilCamActive = false;
      hideItemWithinScene(obs, 'devil', '- Scorbit Cam');
    }
  };

  checkElrod = function (session) {
    var currentScoresContainElrod = false;
    session["scores"].forEach(score => {
      if (score["score"].toString().includes("311")) {
        currentScoresContainElrod = true;
      }
    });

    if (currentScoresContainElrod === true && elrodCamActive === false) {
      elrodCamActive = true;
      showItemWithinScene(obs, 'elrod', '- Scorbit Cam');
    } else if (currentScoresContainElrod === false && elrodCamActive === true) {
      elrodCamActive = false;
      hideItemWithinScene(obs, 'elrod', '- Scorbit Cam');
    }
  };
};
