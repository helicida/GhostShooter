/**
 * Created by 46465442z on 18/04/16.
 */
module MyGame{

    export class ScoreBackend {

        // Array que contiene todos los jugadores suscritos
        jugadores:Array<Player> = [];

        // Contador auxiliar para saber en que posición del array escribir
        contador:number = 0;

        // Constructor
        constructor(){
        }

        // Update
        update(jugador:Player):void {

            // Comprobamos si el jugador que recibimos está suscrito, es decir, si figura en el array
            for (var iterador = 0; iterador < this.jugadores.length; iterador++) {

                // Y si lo está notificamos al jugador el canvio pertinente
                if (this.jugadores[iterador].id == jugador.id) {
                    jugador.notificarPuntuacion();
                }
            }
        }

        // Metodos
        suscribirJugador(player:Player) {
            this.jugadores[this.contador] = player;
            this.contador++;
        }
    }

}