module.exports = function() { 
  this.randomElementFromArray = function (arr) {
    return arr[getRandomInt(arr.length)];
  }

  this.getRandomInt = function (max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  this.numberWithCommas = function (number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  this.writeMapToTxtFile = function (fs, map) {
    const arr = map.toArray()
    for (let index = 0; index < arr.length; index++) {
      if (index === 0) {
        fs.writeFileSync('leaderboard.txt', `${arr[index].key} ${arr[index].value}\n`);
        console.log('The file has been saved!');
      } else {
        fs.appendFileSync('leaderboard.txt', `${arr[index].key} ${arr[index].value}\n`);
        console.log('The "data to append" was appended to file!');
      }
    }
  }

  this.readMapFromTxtFile = function (fs, filename) {
    const Map = require('sorted-map');
    const bangers = new Map();
    let lines = [];

    try {
      lines = fs.readFileSync(filename, 'utf-8').split('\n').filter(Boolean);
    } catch (err) {
      return bangers;
    }

    for (let index = 0; index < lines.length; index++) {
      [username, bangs] = lines[index].split(' ');
      bangers.set(username, bangs);
    }

    return bangers;
  }
};
