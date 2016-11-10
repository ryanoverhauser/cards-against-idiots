(function() {
  'use strict';

  angular
    .module('cati')
    .factory('audio', audio);

  audio.$inject = ['ngAudio'];

  function audio(ngAudio) {

    var sounds = {
      alert: ngAudio.load('audio/alert.mp3'),
      drip: ngAudio.load('audio/drip.mp3'),
      plink: ngAudio.load('audio/plink.mp3'),
      warp: ngAudio.load('audio/warp.mp3')
    };

    var service = {
      play: play,
      setVolume: setVolume
    };

    return service;

    //////

    function play(sound) {
      sounds[sound].play();
    }

    function setVolume(value) {
      for (var sound in sounds) {
        if (sounds.hasOwnProperty(sound)) {
          sounds[sound].volume = value;
        }
      }
    }

  }

})();

