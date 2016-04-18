/**
 * Created by 46465442z on 18/04/16.
 */
module MyGame{

    export class MonsterFactory {

        // Instanciamos el juego
        game:ShooterGame;

        // Constructores
        constructor(game:ShooterGame) {
            this.game = game;
        }

        // Con este metodo
        generarMonstruo(key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture):Monster {

            if (key =='Zombie Normal'){
                return new ZombieNormal(this.game, key);
            }
            else if (key =='Zombie Runner'){
                return new ZombieRunner(this.game, key);
            }
            else{
                return null;
            }
        }
    }

}