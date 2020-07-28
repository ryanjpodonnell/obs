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

  // var videos = fs.readFileSync('wizards.txt').toString().split("\r\n");
  // var video = '';
  // var maxBangs = 0;
  // var bangerGrandChamp = null;
  // var Map = require('sorted-map');
  // var bangers = new Map();
  var firstRun = true;
  // var wizardInvoked = false;

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
    '!grandchampion',
    '!leaderboard'
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
    "Antagonist Title",
    "An Axe to Grind: Centaur's main weapon is an axe with a pick on the back.",
    "Call a Hit Point a \"Smeerp\": Pinballs are \"Power Orbs\" here.",
    "Cool Shades: The Rider has a pair— no, wait, she has compound eyes like an insect!",
    "Decapitation Presentation: The sides of the backbox show a skull impaled on a spear.",
    "Deliberately Monochrome: The cabinet, backglass, and playfield art are almost entirely in black and white, with slight hints of red and amber.",
    "Dominatrix: The Rider is implied to be one, with her leather outfit and bullwhip.",
    "Echoing Acoustics: Centaur featured an echo/reverb board attached to its sound card, which added echo effects to the sound.",
    "Excuse Plot: \"Destroy Centaur\" is basically the \"plot\" in its entirety.",
    "Femme Fatalons: Seen on the Rider.",
    "Fur and Loathing/Pretty in Mink: The Rider is wearing a large fur shawl on the backglass; the interpretation of this is left ambiguous.",
    "Machine Monotone: Played with, since the synthetic voice actually sounds slightly more human-like, and less robot like.",
    "Numbered Sequel: Subverted: Though there is a Centaur II, it's more of an Updated Re-release than a true sequel.",
    "Of Corsets Sexy: Part of the Rider's dominatrix ensemble.",
    "Organic Technology: Implied, as the Centaur appear to be grown from pods, including the motorcycle bits.",
    "Our Centaurs Are Different: Centaur is a predominant mix of human, horse, and motorcycle, but there are some other odds and ends as well (in particular, that hind leg/kickstand doesn't have a hoof but clawed toes).",
    "This example contains a TRIVIA entry. It should be moved to the TRIVIA tab.Recycled Set: It used spare backboxes from Rapid Fire.",
    "Red Eyes, Take Warning: Centaur has small red eyes.",
    "Savage Piercings: Centaur sports a nose ring, adding to his bestial appearance.",
    "Spelling Bonus: The right 1-2-3-4 sequence enables multiball, while O-R-B-S can reward points or add an additional ball, depending on whether it was spelled in sequence or not.",
    "Take That Player: Centaur will taunt, \"Slow, aren't you?\" or, \"Bad move, human,\" if you send the ball down a lane that's already lit.",
    "Tattoo as Character Type: The only spot of color on Centaur himself is a small red heart tattoo on his upper-left bicep.",
    "What the Hell, Player?: Tilting the machine causes Centaur to remark \"No class, human.\"",
    "Whip It Good: The Rider has a large bullwhip with a miniature copy of Centaur's head on the hilt."
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

    // else if (commandName === '!grandchampion' && bangerGrandChamp === null) {
    //   client.say(target, `No puppy has yet to bang`);
    // }

    // else if (commandName === '!grandchampion' && bangerGrandChamp !== null) {
    //   let bangs = bangers.get(bangerGrandChamp);
    //   client.say(target, `@${bangerGrandChamp} is the current Grand Champion with ${bangs} bang(s)`);
    // }

    // else if (commandName === `!${video}` && randomDoublerActive === true) {
    //   let bangs = bangers.get(context.username);
    //   bangers.set(context.username, (bangs || 0) + 1);
    //   bangs = bangers.get(context.username);
    //   if (bangs > maxBangs) {
    //     maxBangs = bangs;
    //     bangerGrandChamp = context.username;
    //   }

    //   client.say(target, `@${context.username} has ${bangs} bang(s) under their belt`);
    //   stopRandomDoubler(target);
    // }

    // else if (commandName === '!leaderboard') {
    //   let startLength = bangers.length - 3;
    //   if (startLength < 0) { startLength = 0 };
    //   const leaders = bangers.slice(startLength, bangers.length)
    //   for (index = leaders.length-1; index >= 0; index--) {
    //     client.say(target, `@${leaders[index].key} - ${leaders[index].value} bang(s)`)
    //   }
    // }

    // else if (commandName === '!wizards' && wizardInvoked === false) {
    //   wizardInvoked = true;
    //   setScene('wizards');
    // }

    if (randomCommandInvoked === false) {
      randomCommand = setTimeout(executeRandomCommand, 60000, target);
      randomCommandInvoked = true;
    }

    if (firstRun === true) {
      // setInterval(function() { startRandomDoubler(target) }, 60000);
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

  // function startRandomDoubler (target) {
  //   if (randomDoublerActive === false && getRandomInt(4) === 0) {
  //     client.say(target, `!yabbadabbadoo`)
  //     obs
  //       .send('GetCurrentScene')
  //       .then(response => {
  //         if (response.name === "Main Pinball Scene" || response.name === "Tiki Cam" || response.name === "Face Cam") {
  //           randomDoublerActive = true;
  //           video = randomElementFromArray(videos);
  //           fs.writeFile('st.txt', `!${video}`, function (err) {
  //             if (err) return console.log(err);
  //             hideItem('s2');
  //             hideItem('st');
  //             showItem('s1');
  //             setTimeout(showItem, 3000, 'st');
  //             setTimeout(stopRandomDoubler, 30000, target);
  //           });
  //         }
  //       });
  //   }
  // }

  // function stopRandomDoubler (target) {
  //   if (randomDoublerActive === true) {
  //     obs
  //       .send('GetCurrentScene')
  //       .then(response => {
  //         if (response.name === "Main Pinball Scene" || response.name === "Tiki Cam" || response.name === "Face Cam") {
  //           hideItem('s1');
  //           hideItem('st');
  //           showItem('s2');
  //           setTimeout(hideItem, 4000, 's2');
  //           randomDoublerActive = false;
  //         }
  //       });
  //   }
  // }
});

obs.connect({ address: '10.0.1.57:4444', password: ''});
