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
};
