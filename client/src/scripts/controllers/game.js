(function() {
  'use strict';

  angular
    .module('cati')
    .controller('GameController', GameController);

  GameController.$inject = ['$interval', '$uibModal', 'players', 'socket', 'user', 'util'];

  function GameController($interval, $uibModal, players, socket, user, util) {

    var $ctrl = this;

    $ctrl.answered = false;
    $ctrl.afk = 0;
    $ctrl.clearCards = clearCards;
    $ctrl.czar = false;
    $ctrl.czarTimer = '--:--';
    $ctrl.czarTimerInterval = $interval(updateCzarTime, 100);
    $ctrl.dismissWinner = dismissWinner;
    $ctrl.getAnswersWidth = getAnswersWidth;
    $ctrl.getNumber = getNumber;
    $ctrl.hand = {};
    $ctrl.isActive = isActive;
    $ctrl.isClosed = isClosed;
    $ctrl.isOpen = isOpen;
    $ctrl.isSelf = isSelf;
    $ctrl.isWaiting = isWaiting;
    $ctrl.pickWinner = pickWinner;
    $ctrl.placeCard = placeCard;
    $ctrl.playerList = [];
    $ctrl.playSlots = [];
    $ctrl.round = false;
    $ctrl.roundTimer = '--:--';
    $ctrl.roundTimerInterval = $interval(updateRoundTime, 100);
    $ctrl.submitAnswer = submitAnswer;
    // $ctrl.winner = false;
    $ctrl.winner = {
      prompt: 'Something or other',
      name: 'Bob',
      cards: [
        {text: 'card 1 text'},
        {text: 'card 2 text'}
      ],
      show: true
    };

    // create a timesync instance
    var ts = timesync.create({
      server: '/timesync',
      interval: 10000
    });

    // Listen for updates to the player list
    players.registerObserver(updatePlayers);

    function autoCzar() {
      console.log('autoCzar');
      var rand = Math.floor(Math.random() * $ctrl.round.answers.length);
      pickWinner($ctrl.round.answers[rand]);
    }

    function autoSubmit() {
      console.log('autoSubmit');
      for (var i = 0; i < $ctrl.playSlots.length; i++) {
        if (!$ctrl.playSlots[i].card) {
          var rand = Math.floor(Math.random() * $ctrl.hand.length);
          while ($ctrl.hand[rand].disabled) {
            rand = Math.floor(Math.random() * $ctrl.hand.length);
          }
          $ctrl.playSlots[i].card = $ctrl.hand[rand];
          $ctrl.hand[rand].disabled = true;
        }
      }
      submitAnswer();
    }

    function cleanCard(card) {
      var cleaned = angular.copy(card);
      delete cleaned.disabled;
      return cleaned;
    }

    function clearCards() {
      for (var i = 0; i < $ctrl.playSlots.length; i++) {
        if ($ctrl.playSlots[i].card) {
          $ctrl.playSlots[i].card.disabled = false;
          $ctrl.playSlots[i].card = false;
        }
      }
    }

    function czarCheck() {
      var czar = util.findByKeyValue($ctrl.playerList, 'czar', true);
      if (czar && czar.id === user.id) {
        $ctrl.czar = true;
      } else {
        $ctrl.czar = false;
      }
    }

    function dismissWinner() {
      if ($ctrl.winner) {
        $ctrl.winner.show = false;
      }
    }

    function getAnswersWidth() {
      if ($ctrl.round.answers && $ctrl.round.answers[0]) {
        var answerCount = $ctrl.round.answers.length;
        var cardCount = $ctrl.round.answers[0].cards.length;
        var answerWidth = (cardCount * 208) + 24;
        var totalWidth = answerCount * answerWidth;
        return {width: totalWidth + 'px'};
      } else {
        return {};
      }
    }

    function getNumber(num) {
      return new Array(num);
    }

    function isActive() {
      return $ctrl.round.state !== 'waiting';
    }

    function isClosed() {
      return $ctrl.round.state === 'closed';
    }

    function isOpen() {
      return $ctrl.round.state === 'open';
    }

    function isSelf(id) {
      return user.id === id;
    }

    function isWaiting() {
      return $ctrl.round.state === 'waiting';
    }

    function pickWinner(answer) {
      if ($ctrl.czar) {
        socket.emit('pickWinner', angular.copy(answer));
      }
    }

    function placeCard(slot, card) {
      if (!card.disabled && !$ctrl.answered) {
        if (slot.card) {
          slot.card.disabled = false;
        }
        slot.card = card;
        card.disabled = true;
      }
    }

    function playSlotsFilled() {
      for (var i = 0; i < $ctrl.playSlots.length; i++) {
        if (!$ctrl.playSlots.card) {
          return false;
        }
      }
      return true;
    }

    function setupRound() {
      czarCheck();
      $ctrl.answered = false;
      $ctrl.playSlots = [];
      for (var i = 0; i < $ctrl.round.prompt.pick; i++) {
        $ctrl.playSlots.push({
          id: i,
          card: false
        });
      }
    }

    function submitAnswer() {
      var answer = $ctrl.playSlots.map(function(s) {
        return cleanCard(s.card);
      });
      console.log('submitAnswer', answer);
      socket.emit('submitAnswer', answer);
      $ctrl.answered = true;
    }

    function updatePlayers() {
      $ctrl.playerList = players.playerList;
      czarCheck();
    }

    function updateCzarTime() {
      if (!$ctrl.round || !$ctrl.round.czarTimerEnd || !isClosed()) {
        $ctrl.czarTimer = '--:--';
        return;
      }
      var timeRemaining = getTimeRemaining($ctrl.round.czarTimerEnd);
      if (timeRemaining) {
        $ctrl.czarTimer = timeRemaining;
      } else {
        $ctrl.czarTimer = '--:--';
      }
    }

    function updateRoundTime() {
      if (!$ctrl.round || !$ctrl.round.roundTimerEnd || !isOpen()) {
        $ctrl.roundTimer = '--:--';
        return;
      }
      var timeRemaining = getTimeRemaining($ctrl.round.roundTimerEnd);
      if (timeRemaining) {
        $ctrl.roundTimer = timeRemaining;
      } else {
        $ctrl.roundTimer = '--:--';
      }
    }

    function getTimeRemaining(endTime) {
      var now = ts.now();
      if (endTime > now) {
        var t = endTime - now;
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var seconds = Math.floor((t / 1000) % 60);
        return ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
      } else {
        return false;
      }
    }

    socket.on('czarTimeExpired', onCzarTimeExpired);
    socket.on('hand', onHand);
    socket.on('joinedGame', onJoinedGame);
    socket.on('newRound', onNewRound);
    socket.on('resetRound', onResetRound);
    socket.on('resetRound', onResetRound);
    socket.on('roundEnded', onRoundEnded);
    socket.on('roundTimeExpired', onRoundTimeExpired);
    socket.on('updateGame', onUpdateGame);

    function onCzarTimeExpired() {
      console.log('czarTimeExpired', $ctrl.czar);
      if ($ctrl.czar) {
        autoCzar();
        $ctrl.afk += 1;
      }
    }

    function onHand(data) {
      console.log('hand', data);
      $ctrl.hand = data;
    }

    function onJoinedGame(data) {
      console.log('joinedGame', data);
      $ctrl.round = data.round;
      setupRound();
    }

    function onNewRound(data) {
      console.log('newRound', data);
      $ctrl.round = data.round;
      setupRound();
    }

    function onResetRound() {
      console.log('resetRound');
      $ctrl.answered = false;
      clearCards();
    }

    function onRoundEnded(data) {
      console.log('onRoundEnded', data);
      $ctrl.winner = data;
      $ctrl.winner.show = true;
    }

    function onRoundTimeExpired() {
      console.log('roundTimeExpired', $ctrl.czar, $ctrl.answered);
      if (!$ctrl.czar && !$ctrl.answered) {
        autoSubmit();
        $ctrl.afk += 1;
      }
    }

    function onUpdateGame(data) {
      console.log('updateGame', data);
      $ctrl.round = data.round;
    }

  }

})();
