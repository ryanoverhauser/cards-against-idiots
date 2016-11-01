'use strict';

function Cards() {

  function BlackCard(id, text, draw, pick) {
    this.id = id;
    this.text = text;
    this.draw = draw;
    this.pick = pick;
    this.toString = () => {
      return text;
    };
  }

  function WhiteCard(id, text) {
    this.id = id;
    this.text = text;
    this.toString = () => {
      return text;
    };
  }

  return {
    blackCard: BlackCard,
    whiteCard: WhiteCard,
  }

}

module.exports = Cards();