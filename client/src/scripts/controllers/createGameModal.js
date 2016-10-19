app.controller('CreateGameModalController', CreateGameModalController);

CreateGameModalController.$inject = ['$uibModalInstance', 'user', 'util', 'socket', 'decks'];

function CreateGameModalController($uibModalInstance, user, util, socket, decks) {

  var $ctrl = this;

  $ctrl.black_total = 0;
  $ctrl.cancel = cancel;
  $ctrl.customDecks = [];
  $ctrl.customDeckInput = '';
  $ctrl.decks = decks;
  $ctrl.isChecked = isChecked;
  $ctrl.isCustomChecked = isCustomChecked;
  $ctrl.loadCustomDeck = loadCustomDeck;
  $ctrl.ok = ok;
  $ctrl.options = {
    decks: [],
    customDecks: [],
    name: user.name() + "'s game",
    scoreLimit: $ctrl.scores[1],
    roundTime: $ctrl.times[3],
    czarTime: $ctrl.times[3]
  };
  $ctrl.scores = [
    {value: 5, name: 5},
    {value: 10, name: 10},
    {value: 15, name: 15},
    {value: 20, name: 20}
  ];
  $ctrl.times = [
    {value: 30, name: "30 sec"},
    {value: 60, name: "60 sec"},
    {value: 90, name: "90 sec"},
    {value: 120, name: "2 min"},
    {value: 180, name: "3 min"},
    {value: 300, name: "5 min"},
    {value: 600, name: "10 min"}
  ];
  $ctrl.toggleChecked = toggleChecked;
  $ctrl.toggleCustomChecked = toggleCustomChecked;
  $ctrl.white_total = 0;

  // Check all decks by default
  for (var i = 0; i < $ctrl.decks.length; i++) {
    $ctrl.options.decks.push($ctrl.decks[i].id);
  }
  updateTotals();

  socket.on('customDeckLoaded', function (data) {
    onCustomDeckLoaded(data);
  });

  //////

  function cancel () {
    $uibModalInstance.dismiss('cancel');
  }

  function isChecked (deckId) {
    if ($ctrl.options.decks.indexOf( deckId ) > -1 ) return true;
    return false;
  }

  function isCustomChecked (deckId) {
    if ($ctrl.options.customDecks.indexOf( deckId ) > -1 ) return true;
    return false;
  }

  function loadCustomDeck() {
    socket.emit( 'loadCustomDeck', {
      deckId: $ctrl.customDeckInput
    });
  }

  function ok () {
    $uibModalInstance.close($ctrl.options);
  }

  function onCustomDeckLoaded(data) {
    if (data.err) {
      alert(data.err);
    } else {
      if (typeof util.findByKeyValue( $ctrl.customDecks, 'code', data.deck.code) === "undefined") {
        $ctrl.customDecks.push(data.deck);
        $ctrl.options.customDecks.push(data.deck.code);
        updateTotals();
        $ctrl.customDeckInput = '';
      }
    }
  }
  
  function toggleChecked (deckId) {
    var index = $ctrl.options.decks.indexOf( deckId );
    if ( index > -1 ) {
      $ctrl.options.decks.splice(index, 1);
    } else {
      $ctrl.options.decks.push(deckId);
    }
    updateTotals();
  }

  function toggleCustomChecked (deckId) {
    var index = $ctrl.options.customDecks.indexOf( deckId );
    if ( index > -1 ) {
      $ctrl.options.customDecks.splice(index, 1);
    } else {
      $ctrl.options.customDecks.push(deckId);
    }
    updateTotals();
  }

  function updateTotals() {
    $ctrl.white_total = 0;
    $ctrl.black_total = 0;
    var i, deck;
    for (i = 0; i < $ctrl.options.decks.length; i++) {
      deck = util.findByKeyValue( $ctrl.decks, 'id', $ctrl.options.decks[i] );
      $ctrl.white_total += deck.white_card_count;
      $ctrl.black_total += deck.black_card_count;
    }
    for (i = 0; i < $ctrl.options.customDecks.length; i++) {
      deck = util.findByKeyValue( $ctrl.customDecks, 'code', $ctrl.options.customDecks[i] );
      $ctrl.white_total += deck.response_count;
      $ctrl.black_total += deck.call_count;
    }
  }

}