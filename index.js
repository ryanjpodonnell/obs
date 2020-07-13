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

obs.on('ConnectionOpened', () => {
  console.log('* Connection Opened');
  client.on('message', onMessageHandler);
  client.on('connected', onConnectedHandler);
  client.connect();

  var videos = fs.readFileSync('scratch.txt').toString().split("\r\n");
  var video = '';
  var maxBangs = 0;
  var bangerGrandChamp = null;
  var Map = require('sorted-map');
  var bangers = new Map();
  var firstRun = true;

  var randomCommand;
  var randomCommandInvoked = false;
  var recipeActive = false;
  var randomDoublerActive = false;

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
    '!grandchampion'
  ]

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
    "Big fat hairy deal.",
    "Nice touch.",
    "I hate Mondays.",
    "Who ever [phrase] should be dragged out into the street and shot.",
    "We're bachelors, baby.",
    "Feed me.",
    "Eat your heart out, [person].",
    "I'm not overweight. I'm undertall.",
    "I'm not known for my compassion.",
    "I love lasagna.",
    "Christmas: It's not the giving. It's not the getting. It's the loving.",
    "It's not that I dislike you, I just don't like you near me.",
    "Show me a good mouser and I'll show you a cat with bad breath.",
    "Yeah Brick, don't hurt them!",
    "I've got to do something.",
    "Trust me, you don't want to know.",
    "Momma ? Umm... I don't know, Penelope...",
    "Be still my beating heart."
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

    else if (commandName === '!recipe' && recipeActive === false) {
      obs
        .send('GetCurrentScene')
        .then(response => {
          if (response.name === "Main Pinball Scene" || response.name === "Face Cam") {
            showRecipe(target, context);
            setTimeout(hideRecipe, 10000);
          }
        });
    }
    
    else if (commandName === '!') {
      endStream();
    }

    else if (commandName === '!grandchampion' && bangerGrandChamp === null) {
      client.say(target, `No puppy has yet to bang`);
    }

    else if (commandName === '!grandchampion' && bangerGrandChamp !== null) {
      let bangs = bangers.get(bangerGrandChamp);
      client.say(target, `@${bangerGrandChamp} is the current Grand Champion with ${bangs} bang(s)`);
    }

    else if (commandName === `!${video}` && randomDoublerActive === true) {
      let bangs = bangers.get(context.username);
      bangers.set(context.username, (bangs || 0) + 1);
      bangs = bangers.get(context.username);
      if (bangs > maxBangs) {
        maxBangs = bangs;
        bangerGrandChamp = context.username;
      }

      client.say(target, `@${context.username} has ${bangs} bang(s) under their belt`);
      stopRandomDoubler(target);
    }

    else if (commandName === '!leaderboard') {
      let startLength = bangers.length - 3;
      if (startLength < 0) { startLength = 0 };
      const leaders = bangers.slice(startLength, bangers.length)
      for (index = leaders.length-1; index >= 0; index--) {
        client.say(target, `@${leaders[index].key} - ${leaders[index].value} bang(s)`)
      }
    }

    if (randomCommandInvoked === false) {
      randomCommand = setTimeout(executeRandomCommand, 60000, target);
      randomCommandInvoked = true;
    }

    if (firstRun === true) {
      setInterval(function() { startRandomDoubler(target) }, 60000);
      firstRun = false;
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
    showItem('recipe');
    hideItem('game');
    recipeActive = true;
  }

  function hideRecipe () {
    showItem('game');
    hideItem('recipe');
    recipeActive = false;
  }

  function endStream () {
    obs.send('SetCurrentScene', {
      'scene-name': 'END'
    });
  }

  function randomElementFromArray (arr) {
		return arr[Math.floor(Math.random() * arr.length)];
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function executeRandomCommand (target) {
    const command = randomElementFromArray(randomCommands);
    client.say(target, command);
  }

  function startRandomDoubler (target) {
    if (randomDoublerActive === false && getRandomInt(4) === 0) {
      obs
        .send('GetCurrentScene')
        .then(response => {
          if (response.name === "Main Pinball Scene" || response.name === "Tiki Cam" || response.name === "Face Cam") {
            randomDoublerActive = true;
            video = randomElementFromArray(videos);
            fs.writeFile('st.txt', `!${video}`, function (err) {
              if (err) return console.log(err);
              hideItem('s2');
              hideItem('st');
              showItem('s1');
              setTimeout(showItem, 3000, 'st');
              setTimeout(stopRandomDoubler, 30000, target);
            });
          }
        });
    }
  }

  function stopRandomDoubler (target) {
    if (randomDoublerActive === true) {
      obs
        .send('GetCurrentScene')
        .then(response => {
          if (response.name === "Main Pinball Scene" || response.name === "Tiki Cam" || response.name === "Face Cam") {
            hideItem('s1');
            hideItem('st');
            showItem('s2');
            setTimeout(hideItem, 4000, 's2');
            randomDoublerActive = false;
          }
        });
    }
  }
});

obs.connect({ address: '10.0.1.57:4444', password: ''});
