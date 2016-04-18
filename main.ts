/// <reference path="joypad/GamePad.ts"/>

module MyGame{

    import Gamepads = Phaser.Gamepad;

    export class ShooterGame extends Phaser.Game {

        game:Phaser.Game;

        // Jugador, cursor y controles
        player:Player;
        cursors:Phaser.CursorKeys;
        gamepad:Gamepads.GamePad;

        // Tilemaps y TileLayers
        tilemap:Phaser.Tilemap;
        background:Phaser.TilemapLayer;
        walls:Phaser.TilemapLayer;

        // Grupos para hacer monstruos
        monsters:Phaser.Group;
        explosions:Phaser.Group;
        bullets:Phaser.Group;
        recolectables:Phaser.Group; // Recolectables

        // Textos que mostramos en pantalla
        scoreText:Phaser.Text;
        livesText:Phaser.Text;
        stateText:Phaser.Text;
        recolectableText:Phaser.Text;

        // Constantes
        PLAYER_ACCELERATION = 500;  // aceleración del jugador
        PLAYER_MAX_SPEED = 400;     // pixels/second
        PLAYER_DRAG = 600;          // rozamiento del jugador
        MONSTER_SPEED = 100;        // velocidad de los monstruos
        BULLET_SPEED = 800;         // velocidad de las balas
        FIRE_RATE = 200;            // cadencia de disparo
        TEXT_MARGIN = 50;           // margen de los textos

        // Variables
        nextFire = 0;   // Variable auxiliar para calcular el tiempo de disparo
        score = 0;      // Puntuación

        constructor() {
            super(1000, 850, Phaser.CANVAS, 'gameDiv');
            this.state.add("boot", BootState);
            this.state.add("load", LoadState);
            this.state.add("play", PlayState);
            this.state.start("boot");
        }
    }


//---------------------------------------------------------------------- //
// --------- Patrón Factory para el comportamiento de los zombies ------ //
//---------------------------------------------------------------------- //








    window.onload = () => {
        var game = new MyGame.ShooterGame();
    };
}