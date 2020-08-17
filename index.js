require('log-timestamp')
const fs = require('fs');
const OBSWebSocket = require('obs-websocket-js');
const tmi = require('tmi.js');
const obs = new OBSWebSocket();
const client = new tmi.client({
  identity: {
    username: 'roddog_hogbot',
    password: ''
  },
  channels: [
    'gametimetelevision'
  ]
});

var question;
var answer;

obs.on('ConnectionOpened', () => {
  console.log('* Connection Opened');
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.connect();

  var maxBangs = 0;
  var bangerGrandChamp = null;
  var Map = require('sorted-map');
  var bangers = new Map();
  var totalBangs = 0;
  var frenzyGoal = 10;

  var randomCommand;
  var randomCommandInvoked = false;
  var camActive = false;
  var randomCam;
  var quizMonsterInvoked = false;
  var quizMonsterEnded = false;
  var quizMonsterActive = false;
  var frenzyValid = false;
  var frenzyActive = false;

  var babySinclairs = [
    'b1',
    'b2',
    'b3',
    'b4',
    'b5',
    'b6'
  ];

  var urkels = [
    'u1',
    'u2',
    'u3'
  ];

  var commands = [
    '!red',
    '!aqua',
    '!blue',
    '!pink',
    '!green',
    '!orange',
    '!purple',
    '!yellow',
    '!yabbadabbadoo',
    '!recipe',
    '!babysinclaircam',
    '!urkelcam',
    '!leaderboard',
    '!urkelfrenzy'
  ];

  var randomCommands = [
    '!red',
    '!aqua',
    '!blue',
    '!pink',
    '!green',
    '!orange',
    '!purple',
    '!yellow',
    '!recipe',
    '!babysinclaircam',
    '!urkelcam'
  ];

  function onMessageHandler (target, context, msg, self) {
    console.log(`${context.username} - ${msg}`);
    const commandName = msg.trim().toLowerCase();

    if (randomCommandInvoked === true) {
      clearTimeout(randomCommand);
      randomCommandInvoked = false;
    }

    if (commandName === '!commands') {
      client.say(target, `The INNOVATIVE commands are: ${commands.join(', ')}`);
    }

    else if (commandName === '!recipe' && camActive === false) {
      obs
        .send('GetCurrentScene')
        .then(response => {
          if (response.name === "Main Pinball Scene" || response.name === "Face Cam") {
            showRecipe();
            setTimeout(hideRecipe, 10000);
          }
        });
    }

    else if (commandName === '!babysinclaircam' && camActive === false) {
      obs
        .send('GetCurrentScene')
        .then(response => {
          if (response.name === "Main Pinball Scene" || response.name === "Face Cam") {
            showRandomCamFromGame(babySinclairs);
            setTimeout(hideRandomCamFromGame, 10000);
          }
          else if (response.name === "Tiki Cam") {
            showRandomCamFromRecipe(babySinclairs);
            setTimeout(hideRandomCamFromRecipe, 10000);
          }
        });
    }

    else if (commandName === '!urkelcam' && camActive === false) {
      obs
        .send('GetCurrentScene')
        .then(response => {
          if (response.name === "Main Pinball Scene" || response.name === "Face Cam") {
            showRandomCamFromGame(urkels);
            setTimeout(hideRandomCamFromGame, 10000);
          }
          else if (response.name === "Tiki Cam") {
            showRandomCamFromRecipe(urkels);
            setTimeout(hideRandomCamFromRecipe, 10000);
          }
        });
    }

    // else if (commandName === '!grandchampion' && bangerGrandChamp === null) {
    //   client.say(target, `No puppy has yet to bang`);
    // }

    // else if (commandName === '!grandchampion' && bangerGrandChamp !== null) {
    //   let bangs = bangers.get(bangerGrandChamp);
    //   client.say(target, `@${bangerGrandChamp} is the current Grand Champion with ${bangs} bang(s)`);
    // }

    else if (commandName === `!${answer}` && quizMonsterActive === true) {
      let bangs = bangers.get(context.username);
      bangers.set(context.username, (bangs || 0) + 1);
      bangs = bangers.get(context.username);
      if (bangs > maxBangs) {
        maxBangs = bangs;
        bangerGrandChamp = context.username;
      }

      totalBangs += 1;
      client.say(target, `@${context.username} has contributed ${bangs} points towards the Urkel Frenzy!`);
      if (totalBangs < frenzyGoal) {
        client.say(target, `Urkel Frenzy progress: ${totalBangs}/${frenzyGoal}`);
      }
      if (totalBangs >= frenzyGoal && frenzyValid === false) {
        client.say(target, `Urkel Frenzy achieved`);
        frenzyValid = true;
        quizMonsterEnded = true;
      }

      stopQuizMonster(target);
    }

    else if (commandName === '!leaderboard') {
      let startLength = bangers.length - 3;
      if (startLength < 0) { startLength = 0 };
      const leaders = bangers.slice(startLength, bangers.length)
      for (index = leaders.length-1; index >= 0; index--) {
        client.say(target, `@${leaders[index].key} - ${leaders[index].value} bang(s)`)
      }
    }

    else if (commandName === '!quizidothat' && quizMonsterInvoked === false) {
      quizMonsterInvoked = true;
      client.say(target, `@${context.username} has awoken the quiz monster from their cheesy slumber`);
      setInterval(function() { startQuizMonster(target) }, 60000);
    }

    else if (commandName === '!urkelfrenzy' && frenzyActive === false && frenzyValid === true) {
      frenzyActive = true;
      showItem('frenzy');
      setTimeout(hideItem, 30000, 'frenzy');
    }

    else if (commandName === '!urkelfrenzy' && frenzyActive === false && frenzyValid === false) {
      client.say(target, `Urkel Frenzy not yet achieved`);
    }

    else if (commandName === '!urkelfrenzy' && frenzyActive === true && frenzyValid === true) {
      client.say(target, `We already did that`);
    }

    else if (commandName === '!acruelangelsthesis') {
      setScene('END');
    }

    if (randomCommandInvoked === false) {
      randomCommand = setTimeout(executeRandomCommand, 60000, target);
      randomCommandInvoked = true;
    }
  }

  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }

  function showItem (item) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'visible': true
    });
  }

  function hideItem (item) {
    obs.send('SetSceneItemProperties', {
      'item': item,
      'visible': false
    });
  }

  function showRecipe () {
    camActive = true;
    showItem('recipe');
    hideItem('game');
  }

  function showRandomCamFromGame (arr) {
    camActive = true;
    randomCam = randomElementFromArray(arr);
    showItem(randomCam);
    hideItem('game');
  }

  function showRandomCamFromRecipe (arr) {
    camActive = true;
    randomCam = randomElementFromArray(arr);
    showItem(randomCam);
    hideItem('recipe');
  }

  function hideRecipe () {
    showItem('game');
    hideItem('recipe');
    camActive = false;
  }

  function hideRandomCamFromGame () {
    showItem('game');
    hideItem(randomCam);
    camActive = false;
  }

  function hideRandomCamFromRecipe () {
    showItem('recipe');
    hideItem(randomCam);
    camActive = false;
  }

  function setScene (sceneName) {
    obs.send('SetCurrentScene', {
      'scene-name': sceneName
    });
  }

  function randomElementFromArray (arr) {
    return arr[getRandomInt(arr.length)];
  }

  function setRandomQuestionAndAnswer () {
    var quiz = {
      'Family Matters was a spinoff of what show?': 'perfectstrangers',
      'Where city does Family Matters take place?': 'chicago',
      'What is Steve Urkel\'s favorite food?': 'cheese',
      'What musical instrument does Steve Urkel play?': 'accordian',
      'FILL IN THE BLANK: Did I do ___?': 'that',
      'Who is Steve Urkel\'s one true love?': 'laura'
    };
    var keys = Object.keys(quiz);

    question = randomElementFromArray(keys);
    answer = quiz[question];
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function executeRandomCommand (target) {
    const command = randomElementFromArray(randomCommands);
    client.say(target, command);
  }

  function startQuizMonster (target) {
    if (quizMonsterEnded === false && quizMonsterActive === false && getRandomInt(5) === 0) {
      client.say(target, `!yabbadabbadoo`)
      obs
        .send('GetCurrentScene')
        .then(response => {
          if (response.name === "Main Pinball Scene" || response.name === "Tiki Cam" || response.name === "Face Cam") {
            quizMonsterActive = true;
            setRandomQuestionAndAnswer();
            fs.writeFile('st.txt', `!${question}`, function (err) {
              if (err) return console.log(err);
              hideItem('s2');
              hideItem('st');
              showItem('s1');
              setTimeout(showItem, 3000, 'st');
              setTimeout(stopQuizMonster, 30000, target);
            });
          }
        });
    }
  }

  function stopQuizMonster (target) {
    if (quizMonsterActive === true) {
      obs
        .send('GetCurrentScene')
        .then(response => {
          if (response.name === "Main Pinball Scene" || response.name === "Tiki Cam" || response.name === "Face Cam") {
            hideItem('s1');
            hideItem('st');
            showItem('s2');
            setTimeout(hideItem, 4000, 's2');
            quizMonsterActive = false;
          }
        });
    }
  }
});

obs.connect({ address: '10.0.1.57:4444', password: ''});
