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
    "It seems that Bill always repeats any question asked of him and repeats back any information given to him. What is the significance of this?",
    "How many versions of Eyes Wide Shut are there?",
    "What is Eyes Wide Shut actually about?",
    "What does the chanting at the mansion party mean?",
    "Is Eyes Wide Shut based on a book?",
    "What exactly was the point of the party? Everyone walking around in masks only to stand and watch others have sex? Do they take turns having sex with the girls?",
    "What's the deal with the costume shop owner's daughter? She was caught messing around with those two guys, and then the next day they were leaving like everything was okay? Also what was going on with the shop owner the next day, was he suggesting she was a hooker and he (Bill) could buy her company?",
    "Who put the mask on Bill's pillow in bed next to his wife? Did she find it and then leave it there to confront him?",
    "Was the hooker from the orgy party who saved Bill murdered by the cult members, or did she actually die from a drug overdose of her own doing?",
    "What's with the guys on the street jeering at Bill and calling him gay?",
    "How old was Milich's daughter?",
    "Who are the masked couple in the orgy party, and why does the masked man with the three-cornered hat nod his head at Bill?",
    "What were some of the references to Kubrick's other films?",
    "Who was the masked cult leader in the red cloak?"
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

    else if (commandName === '!quizmonster' && quizMonsterInvoked === false) {
      quizMonsterInvoked = true;
      client.say(target, `@${context.username} has awoken the quiz monster from their oily slumber`);
      setInterval(function() { startQuizMonster(target) }, 6000);
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
      'How many gallons of oil is a barrel?': '42',
      'Which country has the largest oil reserve?': 'venezuela',
      'Which country consumes the most oil?': 'us',
      'What % of crude oil does gasoline make up?': '45',
      'Petrochemicals is found in oil? (T/F)': 't',
      'Oil is referred to as "Texas Tea" and ___"': 'blackgold',
      'Oil can errupt like crazy (T/F)': 'true',
      'There have been no oil opps in US? (T/F)': 'f',
      'Ancient cultures used oil for sealant? (T/F)': 't',
      'In 2014, TX accounted for what % of US oil?': '29'
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
    if (quizMonsterActive === false && getRandomInt(4) === 0) {
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
