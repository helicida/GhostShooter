/**
 * Created by 46465442z on 18/04/16.
 */
module MyGame {

    import game = PIXI.game;
    import Point = Phaser.Point;

    export class PlayState extends Phaser.State {

        // Instanciamos nuestro shooter game para poder acceder a las variables
        game:ShooterGame;

        preload():void {

            super.preload();

            // Arrancamos el sistema de físicas
            this.physics.startSystem(Phaser.Physics.ARCADE);

            // Comprobamos la plataforma y ajustamos las teclas y las dimensiones de la pantalla
            if (this.game.device.desktop) {
                this.game.cursors = this.input.keyboard.createCursorKeys();
            }
            else {
                this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
                this.scale.pageAlignHorizontally = true;
                this.scale.pageAlignVertically = true;
                this.scale.forceOrientation(true);
                this.scale.startFullScreen(false);
            }
        }

        create():void {
            super.create();

            // Llamámos a todos los metodos de los creates
            this.createTilemap();
            this.createBackground();
            this.createWalls();
            this.createExplosions();
            this.createBullets();
            this.createPlayer();
            this.setupCamera();
            this.createRecolectables();
            this.createMonsters();

            // Importante crear en último lugar los textos para que el resto de elementos de la pantalla no los pisen
            this.createTexts();

            // Comprobamos en qué plataforma estámos jugando
            if (!this.game.device.desktop) {
                this.createVirtualJoystick();
            }
        }

        //-------------------------------------------------------------------------------
        // Create elementos fisicos: Jugadores, monstruos, balas, recolectables y explosiones
        //-------------------------------------------------------------------------------

        // Jugador principal
        private createPlayer() {

            var jugador = new Player('J1', 5, this.game, this.world.centerX, this.world.centerY, 'player', 0);
            this.game.player = this.add.existing(jugador);

            // Nota: importante asignar el jugador con add.existing. Si se referencia directamente la variable causará problemas
        };

        // Generamos los monstruos cdel tipo que nos interese
        private createMonsters() {

            this.game.monsters = this.add.group();

            // Instanciamos la clase factory que es con la que construiremos los zombies
            var factory = new MonsterFactory(this.game);

            // Generamos 10 zombies rápidos
            for (var iterador = 0; iterador < 10; iterador++) {

                var monster1 = factory.generarMonstruo('Zombie Runner');

                // Anyadimos los zombies al grupo
                this.game.add.existing(monster1);
                this.game.monsters.add(monster1)
            }

            // Generamos 15 normales
            for (var iterador = 0; iterador < 15; iterador++) {

                var monster2 = factory.generarMonstruo('Zombie Normal');

                // Anyadimos los zombies al grupo
                this.game.add.existing(monster2);
                this.game.monsters.add(monster2)
            }
        };

        // Le damos las propiedades a las balas
        private createBullets() {
            this.game.bullets = this.add.group();
            this.game.bullets.enableBody = true;
            this.game.bullets.physicsBodyType = Phaser.Physics.ARCADE;
            this.game.bullets.createMultiple(20, 'bullet');

            this.game.bullets.setAll('anchor.x', 0.5);
            this.game.bullets.setAll('anchor.y', 0.5);
            this.game.bullets.setAll('scale.x', 0.5);
            this.game.bullets.setAll('scale.y', 0.5);
            this.game.bullets.setAll('outOfBoundsKill', true);
            this.game.bullets.setAll('checkWorldBounds', true);
        };

        // Con este metodo se generan las explosiones, existen tres tipos y se escogen de manera al azar
        private createExplosions() {
            this.game.explosions = this.add.group();
            this.game.explosions.createMultiple(20, 'explosion');

            this.game.explosions.setAll('anchor.x', 0.5);
            this.game.explosions.setAll('anchor.y', 0.5);

            this.game.explosions.forEach((explosion:Phaser.Sprite) => {
                explosion.loadTexture(this.rnd.pick(['explosion', 'explosion2', 'explosion3']));
            }, this);
        };

        // Método con el que creamos los muros y marcamos los limites del mapa
        private createWalls() {
            this.game.walls = this.game.tilemap.createLayer('walls');
            this.game.walls.x = this.world.centerX;
            this.game.walls.y = this.world.centerY;
            this.game.walls.resizeWorld();
            this.game.tilemap.setCollisionBetween(1, 195, true, 'walls');
        };

        createRecolectables():void {

            // Anyadimos el recolectable a un grupo
            this.game.recolectables = this.add.group();
            this.game.recolectables.enableBody = true;

            // Posiciones en las que generaremos los recolectables
            var positions:Point[] = [
                new Point(500, 295),
                new Point(390, 335), new Point(610, 335),
                new Point(320, 400), new Point(680, 400),
                new Point(295, 500), new Point(705, 500),
                new Point(320, 605), new Point(680, 605),
                new Point(390, 665), new Point(610, 665),
                new Point(500, 705),
            ];

            // Colocamos los sprites en sus coordenadas a traves de un for
            for (var i = 0; i < positions.length; i++) {

                var position = positions[i];

                // instanciamos el Sprite
                var recolectable = new PartesDelTesoro(this.game, "Pieza del tesoro", i, position.x, position.y, 'recolectable', 0);

                // mostramos el Sprite por pantalla
                this.add.existing(recolectable);
                this.game.recolectables.add(recolectable);
            }
        }

        //---------------------------------------------------------
        // Textos, mapa... Parte gráfica del juego
        //---------------------------------------------------------

        // En este metodo generamos los textos que mostraremos por pantalla
        private createTexts() {

            var width = this.scale.bounds.width;
            var height = this.scale.bounds.height;

            this.game.recolectableText = this.add.text(30, 20, 'Recolectables: ',
                {font: "15px Arial", fill: "#ffffff"});
            this.game.recolectableText.fixedToCamera = true;


            this.game.scoreText = this.add.text(this.game.TEXT_MARGIN, this.game.TEXT_MARGIN, 'Score: ' + this.game.score,
                {font: "30px Arial", fill: "#ffffff"});
            this.game.scoreText.fixedToCamera = true;
            this.game.livesText = this.add.text(width - this.game.TEXT_MARGIN, this.game.TEXT_MARGIN, 'Lives: ' + this.game.player.health,
                {font: "30px Arial", fill: "#ffffff"});
            this.game.livesText.anchor.setTo(1, 0);
            this.game.livesText.fixedToCamera = true;

            this.game.stateText = this.add.text(width / 2, height / 2, '', {font: '84px Arial', fill: '#fff'});
            this.game.stateText.anchor.setTo(0.5, 0.5);
            this.game.stateText.visible = false;
            this.game.stateText.fixedToCamera = true;
        };

        // Método con el que creamos el fondo y ajustamos las coordenadas
        private createBackground() {
            this.game.background = this.game.tilemap.createLayer('background');
            this.game.background.x = this.world.centerX;
            this.game.background.y = this.world.centerY;
        };

        // Incorpora el mapa al juego a partir de un tileMap
        private createTilemap() {
            this.game.tilemap = this.game.add.tilemap('tilemap');
            this.game.tilemap.addTilesetImage('tilesheet_complete', 'tiles');

        };

        //---------------------------------------------------------
        //  Movimiento jugador, monstruos y lógica general del juego
        //---------------------------------------------------------

        // ----- Monstruos ------ //

        private setRandomAngle(monster:Phaser.Sprite) {
            monster.angle = this.rnd.angle();
        }

        private resetMonster(monster:Phaser.Sprite) {
            monster.rotation = this.physics.arcade.angleBetween(monster, this.game.player);
        }

        // Función para mover los monstruos
        private moveMonsters() {
            this.game.monsters.forEach(this.advanceStraightAhead, this)
        };

        // Metodo con el que hacemos avanzar los monstruos en dirección a su angulo
        private advanceStraightAhead(monster:Phaser.Sprite) {
            this.physics.arcade.velocityFromAngle(monster.angle, this.game.MONSTER_SPEED, monster.body.velocity);
        }

        // ------ Jugador ----- //

        // Función para mover jugador
        private movePlayer() {

            // Controles de teclado
            var moveWithKeyboard = function () {
                if (this.game.cursors.left.isDown ||
                    this.input.keyboard.isDown(Phaser.Keyboard.A)) {
                    this.game.player.body.acceleration.x = -this.game.PLAYER_ACCELERATION;
                } else if (this.game.cursors.right.isDown ||
                    this.input.keyboard.isDown(Phaser.Keyboard.D)) {
                    this.game.player.body.acceleration.x = this.game.PLAYER_ACCELERATION;
                } else if (this.game.cursors.up.isDown ||
                    this.game.input.keyboard.isDown(Phaser.Keyboard.W)) {
                    this.game.player.body.acceleration.y = -this.game.PLAYER_ACCELERATION;
                } else if (this.game.cursors.down.isDown ||
                    this.input.keyboard.isDown(Phaser.Keyboard.S)) {
                    this.game.player.body.acceleration.y = this.game.PLAYER_ACCELERATION;
                } else {
                    this.game.player.body.acceleration.x = 0;
                    this.game.player.body.acceleration.y = 0;
                }
            };

            // Controles con joystick
            var moveWithVirtualJoystick = function () {
                if (this.game.gamepad.stick1.cursors.left) {
                    this.game.player.body.acceleration.x = -this.game.PLAYER_ACCELERATION;}
                if (this.game.gamepad.stick1.cursors.right) {
                    this.game.player.body.acceleration.x = this.game.PLAYER_ACCELERATION;
                } else if (this.game.gamepad.stick1.cursors.up) {
                    this.game.player.body.acceleration.y = -this.game.PLAYER_ACCELERATION;
                } else if (this.game.gamepad.stick1.cursors.down) {
                    this.game.player.body.acceleration.y = this.game.PLAYER_ACCELERATION;
                } else {
                    this.game.player.body.acceleration.x = 0;
                    this.game.player.body.acceleration.y = 0;
                }
            };

            // Comprobamos si la plataforma en la que se ejecuta el juego es escritorio o movil
            if (this.game.device.desktop) {
                moveWithKeyboard.call(this);
            } else {
                moveWithVirtualJoystick.call(this);
            }
        };

        rotateWithRightStick() {
            var speed = this.game.gamepad.stick2.speed;

            if (Math.abs(speed.x) + Math.abs(speed.y) > 20) {
                var rotatePos = new Phaser.Point(this.game.player.x + speed.x, this.game.player.y + speed.y);
                this.game.player.rotation = this.physics.arcade.angleToXY(this.game.player, rotatePos.x, rotatePos.y);

                this.fire();
            }
        }

        // Función con la que rotamos al jugador en dirección al puntero del ratón
        private rotatePlayerToPointer() {
            this.game.player.rotation = this.physics.arcade.angleToPointer(
                this.game.player,
                this.input.activePointer
            );
        };

        // ---- Cámara y controles ----//

        private createVirtualJoystick() {
            this.game.gamepad = new Gamepads.GamePad(this.game, Gamepads.GamepadType.DOUBLE_STICK);
        };

        private setupCamera() {
            this.camera.follow(this.game.player);
        };


        //---------------------------------------------------------
        //  Tweens, efectos, animaciones del juego.
        //---------------------------------------------------------

        explosion(x:number, y:number):void {

            // Sacamos el primer sprite muerto del group
            var explosion:Phaser.Sprite = this.game.explosions.getFirstDead();

            if (explosion) {

                // Colocamos la explosión con su transpariencia y posición
                explosion.reset(
                    x - this.rnd.integerInRange(0, 5) + this.rnd.integerInRange(0, 5),
                    y - this.rnd.integerInRange(0, 5) + this.rnd.integerInRange(0, 5)
                );
                explosion.alpha = 0.6;
                explosion.angle = this.rnd.angle();
                explosion.scale.setTo(this.rnd.realInRange(0.5, 0.75));

                // Hacemos que varíe su tamaño para dar la sensación de que el humo se disipa
                this.add.tween(explosion.scale).to({x: 0, y: 0}, 500).start();
                var tween = this.add.tween(explosion).to({alpha: 0}, 500);

                // Una vez terminado matámos la explosión
                tween.onComplete.add(() => {
                    explosion.kill();
                });
                tween.start();
            }
        }

        blink(sprite:Phaser.Sprite) {
            var tween = this.add.tween(sprite)
                .to({alpha: 0.5}, 100, Phaser.Easing.Bounce.Out)
                .to({alpha: 1.0}, 100, Phaser.Easing.Bounce.Out);

            tween.repeat(3);
            tween.start();
        }

        //---------------------------------------------------------
        //  Colisiones y limites del mapa
        //---------------------------------------------------------

        private monsterTouchesPlayer(player:Phaser.Sprite, monster:Phaser.Sprite) {
            monster.kill();

            player.damage(1);

            this.game.livesText.setText("Lives: " + this.game.player.health);

            this.blink(player);

            if (player.health == 0) {
                this.game.stateText.text = " GAME OVER \n Click to restart";
                this.game.stateText.visible = true;

                //the "click to restart" handler
                this.input.onTap.addOnce(this.restart, this);
            }
        }

        private bulletHitWall(bullet:Phaser.Sprite, walls:Phaser.TilemapLayer) {
            this.explosion(bullet.x, bullet.y);
            bullet.kill();
        }

        private bulletHitMonster(bullet:Phaser.Sprite, monster:Phaser.Sprite) {
            bullet.kill();
            monster.damage(1);

            this.explosion(bullet.x, bullet.y);

            if (monster.health > 0) {
                this.blink(monster)
            } else {
                this.game.score += 10;
                // this.game.scoreText.setText("Score: " + this.game.score);
            }
        }

        private recogerTesoro(player:Player, recolectable:PartesDelTesoro) {

            // Anyadimos el recolectable al array
            player.anyadirTesoro(recolectable);
            player.mostrarTextoRecolectables();

            // Nos cargamos el sprite
            recolectable.kill();
        }

        //---------------------------------------------------------
        //  Update principal del juego
        //---------------------------------------------------------

        update():void {
            super.update();

            this.movePlayer();
            this.moveMonsters();

            // Determina el comportamiento de los zombis
            if(this.game.monsters.countLiving() < 15){
                this.game.monsters.callAll('setComportamiento', null, new Enfadado());
            }

            // Controles
            if (this.game.device.desktop) {
                this.rotatePlayerToPointer();
                this.fireWhenButtonClicked();
            }
            else {
                this.rotateWithRightStick();
                this.fireWithRightStick();
            }

            // Colisiones
            this.physics.arcade.collide(this.game.player, this.game.monsters, this.monsterTouchesPlayer, null, this);
            this.physics.arcade.collide(this.game.player, this.game.walls);
            this.physics.arcade.overlap(this.game.bullets, this.game.monsters, this.bulletHitMonster, null, this);
            this.physics.arcade.collide(this.game.bullets, this.game.walls, this.bulletHitWall, null, this);
            this.physics.arcade.collide(this.game.walls, this.game.monsters, this.resetMonster, null, this);
            this.physics.arcade.collide(this.game.monsters, this.game.monsters, this.resetMonster, null, this);
            this.physics.arcade.overlap(this.game.player, this.game.recolectables, this.recogerTesoro, null, this);
        }

        // Método para reiniciar el juego de cero (cuidado con las variables de puntuacion, vidas, etc...)
        restart() {
            this.game.state.restart();
            this.game.score = 0;
        }

        //---------------------------------------------------------
        // Balas y disparos
        //---------------------------------------------------------

        fireWithRightStick() {
            //this.gamepad.stick2.
        }

        // Función con la que disparamos al hacer clic
        private fireWhenButtonClicked() {
            if (this.input.activePointer.isDown && this.game.player.health > 0) {
                this.fire();
            }
        };

        // Función para disparar
        fire():void {

            // Usamos un if para respetar la cadencia de disparo
            if (this.time.now > this.game.nextFire) {

                // Sacamos el primer sprite muerto del group
                var bullet = this.game.bullets.getFirstDead();

                if (bullet) {

                    // Colocamos la bala en su posición y angulo
                    var length = this.game.player.width * 0.5 + 20;
                    var x = this.game.player.x + (Math.cos(this.game.player.rotation) * length);
                    var y = this.game.player.y + (Math.sin(this.game.player.rotation) * length);

                    // Damos los valores a las balas, a las explosiones y el angulo
                    bullet.reset(x, y);
                    this.explosion(x, y);
                    bullet.angle = this.game.player.angle;

                    // Le damos bien la velocidad en relación al angulo para que la bala apunte bien
                    var velocity = this.physics.arcade.velocityFromRotation(bullet.rotation, this.game.BULLET_SPEED);
                    bullet.body.velocity.setTo(velocity.x, velocity.y);

                    // Ajustamos la variable auxiliar nextFire usando la cadencia de fuego para saber cada cuando se puede disaprar
                    this.game.nextFire = this.time.now + this.game.FIRE_RATE;
                }
            }
        }
    }

    window.onload = () => {
        new ShooterGame();
    };
}