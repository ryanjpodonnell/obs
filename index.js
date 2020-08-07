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

  var randomCommand;
  var randomCommandInvoked = false;
  var camActive = false;
  var randomBaby;

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
    '!babysinclaircam'
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
    '!babysinclaircam'
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
		return arr[Math.floor(Math.random() * arr.length)];
  }

  function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  function executeRandomCommand (target) {
    const command = randomElementFromArray(randomCommands);
    client.say(target, command);
  }
});

obs.connect({ address: '10.0.1.57:4444', password: ''});
