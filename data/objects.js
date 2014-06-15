function Player(name, id){
    this.type = "player";
    //===========================
    this.id = id;
    this.cash = 0;
    this.name = name;
    this.hand = [null, null];
}

function GameData(players){
    this.type = "game_data";
    //============================
    this.completed = false;
    this.dealer = 0;
    this.num_players = Object.keys(players).length;
    this.players = [];
    this.table_cards = [];
    this.small_blind = 5;
    this.big_blind = 10;
    this.fresh_round = true;
    this.current_turn = 0;

    for(p in players){
        this.players.push(new Player(players[p].name, p));
    }
}

function Game(bus, players) {
    this.bus = bus;
    this.data = new GameData(players);

    this.playRound = function(deck){
        // Deal each players hands
        for(p in this.data.players){
            var player = this.data.players[p];
            player.hand = [deck.pop(), deck.pop()];
            this.bus.send(player.id, {type: 'hand', hand: player.hand});
            this.bus.send(player.id, {type: 'position', position: p});
        }

        this.bus.broadcast(this.data);
        this.data.fresh_round = false;

        while(true){
            break;
        }
        // - betting
        // - flop
    }

    this.completed = function(){
        return false;
    }
}
