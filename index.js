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

  var randomCommand;
  var randomCommandInvoked = false;
  var camActive = false;
  var randomBaby;
  var quizMonsterInvoked = false;
  var quizMonsterActive = false;

  var babySinclairs = [
    'b1',
    'b2',
    'b3',
    'b4',
    'b5',
    'b6'
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
    '!grandchampion',
    '!leaderboard'
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
    '!yabbadabbadoo',
    '!recipe',
    '!babysinclaircam',
    'Is The Good, the Bad and the Ugly a prequel to the two other Eastwood spaghetti westerns?',
    'What was the large battle depicted later in the movie when the bridge was blown? Was it based on an actual battle?',
    'What is a "spaghetti western"?',
    'Should I watch the other two films first before "The Good, the Bad and the Ugly"?',
    'Is the cemetery of Sad Hill a real location?',
    'Wasn\'t dynamite invented in 1867?',
    'Why does a dog appear in several of the scenes?',
    'Does the Man With No Name actually have a name?',
    'How does "The Good, the Bad and the Ugly" fit into the timeline of the Civil War?',
    'How much would the $200,000 be today?'
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
            showRandomBabySinclairFromGame();
            setTimeout(hideRandomBabySinclairFromGame, 10000);
          }
          else if (response.name === "Tiki Cam") {
            showRandomBabySinclairFromRecipe();
            setTimeout(hideRandomBabySinclairFromRecipe, 10000);
          }
        });
    }

    else if (commandName === '!grandchampion' && bangerGrandChamp === null) {
      client.say(target, `No puppy has yet to bang`);
    }

    else if (commandName === '!grandchampion' && bangerGrandChamp !== null) {
      let bangs = bangers.get(bangerGrandChamp);
      client.say(target, `@${bangerGrandChamp} is the current Grand Champion with ${bangs} bang(s)`);
    }

    else if (commandName === `!${answer}` && quizMonsterActive === true) {
      let bangs = bangers.get(context.username);
      bangers.set(context.username, (bangs || 0) + 1);
      bangs = bangers.get(context.username);
      if (bangs > maxBangs) {
        maxBangs = bangs;
        bangerGrandChamp = context.username;
      }

      client.say(target, `@${context.username} has ${bangs} bang(s) under their belt`);
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

    else if (commandName === '!hottriv' && quizMonsterInvoked === false) {
      quizMonsterInvoked = true;
      client.say(target, `@${context.username} has awoken the quiz monster from their hot slumber`);
      setInterval(function() { startQuizMonster(target) }, 60000);
    }

    else if (commandName === '!wedonthavetotakeourclothezoff') {
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

  function showRandomBabySinclairFromGame () {
    camActive = true;
    randomBaby = randomElementFromArray(babySinclairs);
    showItem(randomBaby);
    hideItem('game');
  }

  function showRandomBabySinclairFromRecipe () {
    camActive = true;
    randomBaby = randomElementFromArray(babySinclairs);
    showItem(randomBaby);
    hideItem('recipe');
  }

  function hideRecipe () {
    showItem('game');
    hideItem('recipe');
    camActive = false;
  }

  function hideRandomBabySinclairFromGame () {
    showItem('game');
    hideItem(randomBaby);
    camActive = false;
  }

  function hideRandomBabySinclairFromRecipe () {
    showItem('recipe');
    hideItem(randomBaby);
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
      'What tiki bar created the Q.O.?': 'paganidol',
      'Who is known for the cinnamon/grapefruit flavor combo?': 'donthebeachcomber',
      'Angostura bitters features notes of what spice?': 'cinnamon',
      'The rum blend featured in the Q.O. is dubbed ___?': 'jamtropics',
      'The Q.O. garnish includes: mint sprig, lime, and ___?': 'cherry',
      'Who created the Q.O.': 'williamprestwood'
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
    if (quizMonsterActive === false && getRandomInt(5) === 0) {
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
