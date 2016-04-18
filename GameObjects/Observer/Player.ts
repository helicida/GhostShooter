/**
 * Created by 46465442z on 18/04/16.
 */
module MyGame{

    export class Player extends Phaser.Sprite {

        // Instanciamos el juego
        game:ShooterGame;

        // Codigo al que suscribiremos nuestro jugador
        ScoreBackend:ScoreBackend = new ScoreBackend();

        // Le vamos guardando a nuestro personaje los recolectables
        partesDelTesoro:Array<PartesDelTesoro> = [];
        contador:number=0; // Contador para saber en que posicion del arrayEscribir

        // Variables
        id:string;              // ID con la que identificaremos al jugador
        puntuacion:number = 0;  // Puntos que lleva

        // Constructores
        constructor(id:string, numeroVidas:number, game:ShooterGame, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture, frame:string|number)  {
            super(game, x, y, key, frame);

            // Ajustamos el sprite
            this.anchor.setTo(0.5, 0.5);
            this.game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.maxVelocity.setTo(this.game.PLAYER_MAX_SPEED, this.game.PLAYER_MAX_SPEED);
            this.body.collideWorldBounds = true;
            this.body.drag.setTo(this.game.PLAYER_DRAG, this.game.PLAYER_DRAG);

            // Datos del jugador
            this.game = game;
            this.id = id;
            this.health = numeroVidas;

            // Finalmente suscribimos el jugador a nuestro codigo que monitoriza las puntuaciones
            this.ScoreBackend.suscribirJugador(this);
        }

        // Update
        update():void  {
            super.update();
            this.ScoreBackend.update(this);
        }

        // Metodos
        notificarPuntuacion():void {
            this.game.scoreText.setText("Score: " + this.game.score);
        }

        anyadirTesoro(recolectable:PartesDelTesoro)  {
            this.partesDelTesoro[this.contador] = recolectable;
            this.contador++;
        }

        mostrarTextoRecolectables(){
            var textoRecolectables="";

            for (var iterador = 0; iterador < this.partesDelTesoro.length; iterador++) {
                textoRecolectables = textoRecolectables + "Tesoro " + this.partesDelTesoro[iterador].getNumeroParteDelTesoro() + " - ";
                this.game.recolectableText.setText("Recolectables: " + textoRecolectables);

            }
        }

        // Getters
        getId():String{
            return this.id;
        }

        getPuntuacion():number{
            return this.puntuacion;
        }

    }

}