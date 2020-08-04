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
  var recipeActive = false;
  var frenzyActive = false;

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
    '!recipe'
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
    "Why was Newt afraid of Ripley & the Marines? They were human.",
    "How long could Ripley have survived in her stasis pod while drifting through space if she hadn't been found after 57 years?",
    "What is \"Aliens\" about?",
    "Is \"Aliens\" based on a book?",
    "Was Ripley really in hypersleep for 57 years or was this a dream?",
    "During the inquest, Van Leuwen says a team went over the lifeboat \"centimeter by centimeter\" and found no trace of the Alien. However, in \"Alien\", it clearly drools quite a bit before Ripley \"blows it out of the airlock.\" Is the Company hiding this?",
    "Why didn't the colonists on LV-426 pick up the warning beacon from the derelict ship?",
    "Wouldn't the colonists have found the Derelict Ship by themselves in 20 years?",
    "Why does Ripley agree to return to LV-426?",
    "What was the Marines \"bug hunt\"? Is there a connection to Starship Troopers?",
    "Why is Hudson so freaked out after the first encounter with the Aliens?",
    "Why do the Alien heads look so different from the first film?",
    "Why didn't the Facehuggers burn through their stasis tubes like through Kane's helmet in Alien?",
    "Why didn't Ripley, Newt and the marines try to avoid the Aliens by crawling out the complex through the same tube as Bishop did?",
    "Why did Burke unleash the two Facehuggers to kill Ripley?",
    "How did Burke release the Facehuggers into the med lab without himself getting attacked by them?",
    "Are the Aliens intelligent enough to intentionally \"cut the power\"?",
    "How intelligent is the Queen?",
    "How did Hicks' face get burned?",
    "Who is Pvt. Wierzbowski? Is he even seen?",
    "Does the alien species have an official name?",
    "How does the movie end?"
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
    
    else if (commandName === '!wedonthavetotakeourclothezoff') {
      setScene('END');
    }

    else if (commandName === '!babysinclairfrenzy' && frenzyActive === false) {
      obs
        .send('GetCurrentScene')
        .then(response => {
          frenzyActive = true;
          if (response.name === "Face Cam") {
            showItem('b1');
            showItem('b2');
            showItem('b3');
            setTimeout(hideItem, 10000, 'b1');
            setTimeout(hideItem, 10000, 'b2');
            setTimeout(hideItem, 10000, 'b3');
            setTimeout(setFalse, 10000, frenzyActive);
          }
        });
    }

    if (randomCommandInvoked === false) {
      randomCommand = setTimeout(executeRandomCommand, 60000, target);
      randomCommandInvoked = true;
    }
  }

  function onConnectedHandler (addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
  }

  function setFalse (innovation) {
    innovation = false;
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
