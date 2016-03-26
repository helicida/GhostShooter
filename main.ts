/// <reference path="phaser/phaser.d.ts"/>
/// <reference path="joypad/GamePad.ts"/>

class mainState extends Phaser.State {
    private player:Phaser.Sprite;
    private cursors:Phaser.CursorKeys;
    private bullets:Phaser.Group;
    private tilemap:Phaser.Tilemap;
    private background:Phaser.TilemapLayer;
    private walls:Phaser.TilemapLayer;
    private monsters:Phaser.Group;
    private explosions:Phaser.Group;
    private scoreText:Phaser.Text;
    private livesText:Phaser.Text;
    private stateText:Phaser.Text;


    private PLAYER_ACCELERATION = 500;
    private PLAYER_MAX_SPEED = 400; // pixels/second
    private PLAYER_DRAG = 600;
    private MONSTER_SPEED = 100;
    private BULLET_SPEED = 800;
    private MONSTER_HEALTH = 3;
    private FIRE_RATE = 200;
    private LIVES = 3;
    private TEXT_MARGIN = 100;

    private nextFire = 0;
    private score = 0;


    preload():void {
        super.preload();

        this.load.image('bg', 'assets/bg.png');
        this.load.image('player', 'assets/survivor1_machine.png');
        this.load.image('bullet', 'assets/bulletBeigeSilver_outline.png');
        this.load.image('monster', 'assets/zombie2_hold.png');
        this.load.image('explosion', 'assets/smokeWhite0.png');
        this.load.image('explosion2', 'assets/smokeWhite1.png');
        this.load.image('explosion3', 'assets/smokeWhite2.png');
        this.game.load.tilemap('tilemap', 'assets/tiles.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('tiles', 'assets/tilesheet_complete.png');

        this.physics.startSystem(Phaser.Physics.ARCADE);

        this.cursors = this.input.keyboard.createCursorKeys();

        if (!this.game.device.desktop) {
            this.load.image('joystick_base', 'assets/transparentDark05.png');
            this.load.image('joystick_segment', 'assets/transparentDark09.png');
            this.load.image('joystick_knob', 'assets/transparentDark49.png');
        }
    }

    create():void {
        super.create();
        this.createTilemap();
        this.createBackground();
        this.createWalls();
        this.createExplosions();
        this.createBullets();
        this.createPlayer();
        this.setupCamera();
        this.createVirtualJoystick();
        this.createMonsters();
        this.createTexts();
    }

    private createTexts() {
        var width = this.scale.bounds.width;
        var height = this.scale.bounds.height;

        this.scoreText = this.add.text(this.TEXT_MARGIN, this.TEXT_MARGIN, 'Score: ' + this.score,
            {font: "35px Arial", fill: "#ffffff"});
        this.scoreText.fixedToCamera = true;
        this.livesText = this.add.text(width - this.TEXT_MARGIN, this.TEXT_MARGIN, 'Lives: ' + this.player.health,
            {font: "35px Arial", fill: "#ffffff"});
        this.livesText.anchor.setTo(1, 0);
        this.livesText.fixedToCamera = true;

        this.stateText = this.add.text(width / 2, height / 2, '', {font: '84px Arial', fill: '#fff'});
        this.stateText.anchor.setTo(0.5, 0.5);
        this.stateText.visible = false;
        this.stateText.fixedToCamera = true;
    };

    private createExplosions() {
        this.explosions = this.add.group();
        this.explosions.createMultiple(20, 'explosion');

        this.explosions.setAll('anchor.x', 0.5);
        this.explosions.setAll('anchor.y', 0.5);

        this.explosions.forEach((explosion:Phaser.Sprite) => {
            explosion.loadTexture(this.rnd.pick(['explosion', 'explosion2', 'explosion3']));
        }, this);
    };

    private createWalls() {
        this.walls = this.tilemap.createLayer('walls');
        this.walls.x = this.world.centerX;
        this.walls.y = this.world.centerY;

        this.walls.resizeWorld();

        this.tilemap.setCollisionBetween(1, 195, true, 'walls');
    };

    private createBackground() {
        this.background = this.tilemap.createLayer('background');
        this.background.x = this.world.centerX;
        this.background.y = this.world.centerY;
    };

    private createTilemap() {
        this.tilemap = this.game.add.tilemap('tilemap');
        this.tilemap.addTilesetImage('tilesheet_complete', 'tiles');

    };

    private createMonsters() {
        this.monsters = this.add.group();
        this.monsters.enableBody = true;
        this.monsters.physicsBodyType = Phaser.Physics.ARCADE;

        this.tilemap.createFromObjects('monsters', 541, 'monster', 0, true, false, this.monsters);

        this.monsters.setAll('anchor.x', 0.5);
        this.monsters.setAll('anchor.y', 0.5);
        this.monsters.setAll('scale.x', 2);
        this.monsters.setAll('scale.y', 2);
        this.monsters.setAll('health', this.MONSTER_HEALTH);
        this.monsters.forEach(this.setRandomAngle, this);
        this.monsters.setAll('checkWorldBounds', true);
        this.monsters.callAll('events.onOutOfBounds.add', 'events.onOutOfBounds', this.resetMonster, this);
    };

    private setRandomAngle(monster:Phaser.Sprite) {
        monster.angle = this.rnd.angle();
    }

    private resetMonster(monster:Phaser.Sprite) {
        monster.rotation = this.physics.arcade.angleBetween(
            monster,
            this.player
        );
    }

    private createBullets() {
        this.bullets = this.add.group();
        this.bullets.enableBody = true;
        this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
        this.bullets.createMultiple(20, 'bullet');

        this.bullets.setAll('anchor.x', 0.5);
        this.bullets.setAll('anchor.y', 0.5);

        this.bullets.setAll('outOfBoundsKill', true);
        this.bullets.setAll('checkWorldBounds', true);
    };

    private createVirtualJoystick() {
        if (!this.game.device.desktop) {
            var g = new Gamepads.GamePad(this.game, Gamepads.GamepadType.DOUBLE_STICK);
        }
    };

    private setupCamera() {
        this.camera.follow(this.player);
    };

    private createPlayer() {
        this.player = this.add.sprite(this.world.centerX, this.world.centerY, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.player.scale.setTo(2, 2);
        this.player.health = this.LIVES;
        this.physics.enable(this.player, Phaser.Physics.ARCADE);

        this.player.body.maxVelocity.setTo(this.PLAYER_MAX_SPEED, this.PLAYER_MAX_SPEED); // x, y
        this.player.body.collideWorldBounds = true;
        this.player.body.drag.setTo(this.PLAYER_DRAG, this.PLAYER_DRAG); // x, y
    };

    update():void {
        super.update();
        this.movePlayer();
        this.rotatePlayerToPointer();
        this.fireWhenButtonClicked();
        this.moveMonsters();

        this.physics.arcade.collide(this.player, this.monsters, this.monsterTouchesPlayer, null, this);
        this.physics.arcade.collide(this.player, this.walls);
        this.physics.arcade.overlap(this.bullets, this.monsters, this.bulletHitMonster, null, this);
        this.physics.arcade.collide(this.bullets, this.walls, this.bulletHitWall, null, this);
        this.physics.arcade.collide(this.walls, this.monsters, this.resetMonster, null, this);
        this.physics.arcade.collide(this.monsters, this.monsters, this.resetMonster, null, this);
    }

    private monsterTouchesPlayer(player:Phaser.Sprite, monster:Phaser.Sprite) {
        this.explosion(player.x, player.y);
        monster.kill();

        player.damage(1);

        this.livesText.setText("Lives: " + this.player.health);

        if (!player.alive) {
            this.stateText.text = " GAME OVER \n Click to restart";
            this.stateText.visible = true;

            //the "click to restart" handler
            this.input.onTap.addOnce(this.restart, this);

        }
    }

    restart() {
        this.game.state.restart();
    }

    private bulletHitWall(bullet:Phaser.Sprite, walls:Phaser.TilemapLayer) {
        this.explosion(bullet.x, bullet.y);
        bullet.kill();
    }

    private bulletHitMonster(bullet:Phaser.Sprite, monster:Phaser.Sprite) {
        bullet.kill();
        monster.damage(1);
        if (monster.health == 0) {
            monster.kill();
            this.score += 10;
            this.scoreText.setText("Score: " + this.score);
        }
        this.explosion(bullet.x, bullet.y);
    }

    private moveMonsters() {
        this.monsters.forEach(this.advanceStraightAhead, this)
    };

    private advanceStraightAhead(monster:Phaser.Sprite) {
        this.physics.arcade.velocityFromAngle(monster.angle, this.MONSTER_SPEED, monster.body.velocity);
    }

    private fireWhenButtonClicked() {
        if (this.input.activePointer.isDown) {
            this.fire();
        }
    };

    private rotatePlayerToPointer() {
        this.player.rotation = this.physics.arcade.angleToPointer(
            this.player,
            this.input.activePointer
        );
    };

    private movePlayer() {
        if (this.cursors.left.isDown || this.input.keyboard.isDown(Phaser.Keyboard.A)) {
            this.player.body.acceleration.x = -this.PLAYER_ACCELERATION;
        } else if (this.cursors.right.isDown || this.input.keyboard.isDown(Phaser.Keyboard.D)) {
            this.player.body.acceleration.x = this.PLAYER_ACCELERATION;
        } else if (this.cursors.up.isDown || this.input.keyboard.isDown(Phaser.Keyboard.W)) {
            this.player.body.acceleration.y = -this.PLAYER_ACCELERATION;
        } else if (this.cursors.down.isDown || this.input.keyboard.isDown(Phaser.Keyboard.S)) {
            this.player.body.acceleration.y = this.PLAYER_ACCELERATION;
        } else {
            this.player.body.acceleration.x = 0;
            this.player.body.acceleration.y = 0;
        }
    };

    fire():void {
        if (this.time.now > this.nextFire) {
            var bullet = this.bullets.getFirstDead();
            if (bullet) {
                var length = this.player.width * 0.5 + 20;
                var x = this.player.x + (Math.cos(this.player.rotation) * length);
                var y = this.player.y + (Math.sin(this.player.rotation) * length);

                bullet.reset(x, y);

                this.explosion(x, y);

                bullet.angle = this.player.angle;
                this.physics.arcade.moveToPointer(bullet, this.BULLET_SPEED);

                this.nextFire = this.time.now + this.FIRE_RATE;
            }
        }
    }

    explosion(x:number, y:number):void {
        var explosion:Phaser.Sprite = this.explosions.getFirstDead();
        if (explosion) {
            explosion.reset(
                x - this.rnd.integerInRange(0, 5) + this.rnd.integerInRange(0, 5),
                y - this.rnd.integerInRange(0, 5) + this.rnd.integerInRange(0, 5)
            );
            explosion.alpha = 0.6;
            explosion.angle = this.rnd.angle();
            explosion.scale.setTo(this.rnd.realInRange(0.5, 0.75));

            this.add.tween(explosion.scale).to({x: 0, y: 0}, 500).start();
            var tween = this.add.tween(explosion).to({alpha: 0}, 500);
            tween.onComplete.add(() => {
                explosion.kill();
            });
            tween.start();
        }

    }
}

class ShooterGame extends Phaser.Game {
    constructor() {
        super(1024, 768, Phaser.AUTO, 'gameDiv');
        this.state.add('main', mainState);
        this.state.start('main');
    }
}

window.onload = () => {
    var game = new ShooterGame();
};
