    
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var platforms, player, stars, enemy, diamonds, firstaids;
    
var score = 0;
var scoreText;
    
var life = 100;
var lifeText;
    
var timer, timerEvent, timerText;
var time = 0;
    
var timeEnemyTouches = -1;
var diamondOut = -1;
var firstaidOut = -1;
    
var enemyToLeft = 1;
    
var diedText, timeoutText;

var showMainMenu = 1;
var isPausedGame = 0;
var keyEscape;

function startGame() {
    showMainMenu = 0;
    isPausedGame = 0;
    this.create();
}

function resumeGame() {
    showMainMenu = 0;
    isPausedGame = 0;
    
    if (this.startButton != null && this.startButton != undefined)
        this.startButton.kill();
    
    if (this.restartButton != null && this.restartButton != undefined)
        this.restartButton.kill();
    
    if (this.resumeButton != null && this.resumeButton != undefined)
        this.resumeButton.kill();
}

function preload() {
    
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('diamond', 'assets/diamond.png');
    game.load.image('firstaid', 'assets/firstaid.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
    game.load.spritesheet('enemy', 'assets/baddie.png', 32, 32);
    game.load.spritesheet('button-start', 'assets/buttonstart_sprite.png', 201, 73);
    game.load.spritesheet('button-restart', 'assets/buttonrestart_sprite.png', 201, 73);
    game.load.spritesheet('button-resume', 'assets/buttonresume_sprite.png', 201, 73);
    
    game.load.audio('jump', ['sounds/smb_jump-small.wav', 'sounds/smb_jump-small.ogg']);
    game.load.audio('coin', ['sounds/smb_coin.wav', 'sounds/smb_coin.ogg']);
    game.load.audio('looseLife', ['sounds/smb_breakblock.wav', 'sounds/smb_breakblock.ogg']);
    game.load.audio('die', ['sounds/smb_mariodie.wav', 'sounds/smb_mariodie.ogg']);
}

function create() {
    //CSS styles
    this._mainMenu =  {
        font:'26px Arial',
        fill: '#f00'
    };
    
    if (this.startButton != null && this.startButton != undefined)
        this.startButton.kill();
    
    if (this.restartButton != null && this.restartButton != undefined)
        this.restartButton.kill();
    
    if (this.resumeButton != null && this.resumeButton != undefined)
        this.resumeButton.kill();
        
    keyEscape = null;
            
    if (showMainMenu == 1){
        
        if (isPausedGame == 1){
            
            this.game.add.text(300,120, 'PAUSED GAME\n', this._mainMenu);    

            this.restartButton = game.add.button((game.world.width / 2) - 100, (game.world.height / 2) - 35,'button-restart', 
                                                startGame, this, 1, 0, 2);      
            this.resumeButton = game.add.button((game.world.width / 2) - 100, (game.world.height / 2) + 35 + 10,'button-resume', 
                                                resumeGame, this, 1, 0, 2);              
        }
        else{
            
            this.game.add.text(80,120, 'Pick up all the stars and diamonds you can on time!!\n', this._mainMenu);
            this.game.add.text(80, 160, 'Also try to keep your life on the maximum level.\nIt will give you some extra points.\n', this._mainMenu);      

            this.startButton = game.add.button((game.world.width / 2) - 100, (game.world.height / 2) - 35,'button-start', 
                                                startGame, this, 1, 0, 2);
        }
    }
    else{

        //  We're going to be using physics, so enable the Arcade Physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //  A simple background for our game
        game.add.sprite(0, 0, 'sky');
        
        //  The platforms group contains the ground and the 2 ledges we can jump on
        platforms = game.add.group();

        //  We will enable physics for any object that is created in this group
        platforms.enableBody = true;

        // Here we create the ground.
        var ground = platforms.create(0, game.world.height - 64, 'ground');

        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        ground.scale.setTo(2, 2);

        //  This stops it from falling away when you jump on it
        ground.body.immovable = true;

        //  Now let's create two ledges
        var ledge = platforms.create(400, 400, 'ground');

        ledge.body.immovable = true;

        ledge = platforms.create(-150, 250, 'ground');

        ledge.body.immovable = true;

        // The player and its settings
        player = game.add.sprite(32, game.world.height - 150, 'dude');

        //  We need to enable physics on the player
        game.physics.arcade.enable(player);

        //  Player physics properties. Give the little guy a slight bounce.
        player.body.bounce.y = 0.2;
        player.body.gravity.y = 300;
        player.body.collideWorldBounds = true;

        //  Our two animations, walking left and right.
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true); 

        // The enemy and its settings
        enemy = game.add.sprite(600, game.world.height - 280, 'enemy');

        //  We need to enable physics on the enemy
        game.physics.arcade.enable(enemy);

        //  enemy physics properties. Give a slight bounce.
        enemy.body.bounce.y = 0.2;
        enemy.body.gravity.y = 400;
        enemy.body.collideWorldBounds = true;

        //  Our two animations, walking left and right.
        enemy.animations.add('left', [0, 1], 10, true);
        enemy.animations.add('right', [2, 3], 10, true);   
        enemy.animations.add('leftidle', [1], 10, false);
        enemy.animations.add('rightidle', [3], 10, false);       
        enemy.enableBody = true;

        //Stars
        stars = game.add.group();
        stars.enableBody = true;

        //  Here we'll create 12 of them evenly spaced apart
        for (var i = 0; i < 12; i++)
        {
            //  Create a star inside of the 'stars' group
            var star = stars.create(i * 70, 0, 'star');

            //  Let gravity do its thing
            star.body.gravity.y = 200;

            //  This just gives each star a slightly random bounce value
            star.body.bounce.y = 0.3 + Math.random() * 0.2;
        }

        //Diamonds
        diamonds = game.add.group();
        diamonds.enableBody = true;  

        //First aid
        firstaids = game.add.group();
        firstaids.enableBody = true;

        // Create a custom timer
        timer = game.time.create();

        // Create a delayed event 1m and 30s from now
        timerEvent = timer.add(Phaser.Timer.MINUTE * 1 + Phaser.Timer.SECOND * 30, this.endTimer, this);

        // Start the timer
        timer.start();

        scoreText = game.add.text(16, 16, 'Score: ' + score, { fontSize: '32px', fill: '#000' });
        lifeText = game.add.text(680, 16, 'Life: ' + life, { fontSize: '32px', fill: '#000' });
        timerText = game.add.text(340, 16, 'Time: ' + time, { fontSize: '32px', fill: '#000' });    

        jump = game.add.audio('jump');
        coin = game.add.audio('coin');
        looseLife = game.add.audio('looseLife');
        die = game.add.audio('die');
        die.onStop.add(dieSoundStopped, this);      
                
        keyEscape = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        keyEscape.onDown.add(keyEscapePressed, this);
    }
}

function update() {
    
    //  Collide the player and the stars with the platforms
    if (platforms != null && platforms != undefined){
        if (player != null && player != undefined)
            game.physics.arcade.collide(player, platforms);
        if (stars != null && stars != undefined)
            game.physics.arcade.collide(stars, platforms);
        if (enemy != null && enemy != undefined)
            game.physics.arcade.collide(enemy, platforms);
        if (diamonds != null && diamonds != undefined)
            game.physics.arcade.collide(diamonds, platforms);
        if (firstaids != null && firstaids != undefined)
            game.physics.arcade.collide(firstaids, platforms);
    }
    
    if (showMainMenu != 1){                        

        if (timer.running) {
                time = (Math.round((timerEvent.delay - timer.ms) / 1000));
                timerText.text = "Time: " + time;
            }

        //Time out
        if (time <= 0){

            timeoutText = game.add.text(300, 300, 'Time Out!! You got ' + score + 'points.', { fontSize: '64px', fill: '#F00' });
            return;
        }

        cursors = game.input.keyboard.createCursorKeys();
        //  Reset the players velocity (movement)
        player.body.velocity.x = 0;
        
        if (cursors.left.isDown)
        {
            //  Move to the left
            player.body.velocity.x = -150;
            player.animations.play('left');
        }
        else if (cursors.right.isDown)
        {
            //  Move to the right
            player.body.velocity.x = 150;
            player.animations.play('right');
        }
        else
        {
            //  Stand still
            player.animations.stop();
            player.frame = 4;
        }

        //  Allow the player to jump if they are touching the ground.
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.body.velocity.y = -350;
            jump.play();
        }    
        
        //Enemy position, top of the game world widht, change direction
        if (enemy.body.position.x == game.world.width - 32)
        {
            enemyToLeft = 1;
        }
        else if (enemy.body.position.x == 0) {
            enemyToLeft = 0;
        }

        //Enemy movement, depending direction set before
        if (enemyToLeft == 1)
        {
            //  Move to the left
            enemy.body.velocity.x = -250;
            enemy.animations.play('left');
        }
        else 
        {
            //  Move to the right
            enemy.body.velocity.x = 250;
            enemy.animations.play('right');
        }

        game.physics.arcade.overlap(player, stars, collectStar, null, this);
        game.physics.arcade.overlap(player, enemy, enemyTouches, null, this);
        game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this);
        game.physics.arcade.overlap(player, firstaids, collectFirstAid, null, this);

        //Every 4 seconds, enemy jumps
        if (time < 90 && time % 4 == 0 && enemy.body.touching.down)
        {
            enemy.body.velocity.y = -400;
        }

        //2 seconds between one enemy collides and the next to detect, allow the player to go away
        if (time == timeEnemyTouches - 2.0){
            timeEnemyTouches = -1;
        }

        //Time to show diamonds, every 20 seconds
        if (diamondOut == -1 && time < 90 && time % 20 == 0){

            diamondOut = time; //Just one diamond on screen each time

            //  Create a star inside of the 'stars' group
            var diamond = diamonds.create(Math.random() * game.world.width, 0, 'diamond');

            //  Let gravity do its thing
            diamond.body.gravity.y = 300;

            //  This just gives each star a slightly random bounce value
            diamond.body.bounce.y = 0.5;
        }

        //Time to show fist aid, every 20 seconds
        if (firstaidOut == -1 && time < 90 && time % 20 == 10 && life < 100){

            firstaidOut = time; //Just one diamond on screen each time

            //  Create a star inside of the 'stars' group
            var firstaid = firstaids.create(Math.random() * game.world.width, 0, 'firstaid');

            //  Let gravity do its thing
            firstaid.body.gravity.y = 100;

            //  This just gives each star a slightly random bounce value
            firstaid.body.bounce.y = 0.1;
        }                
    }
    else if (isPausedGame)    {
        
        enemy.body.velocity.x = 0;
        if (enemyToLeft)
            enemy.animations.play('leftidle');
        else enemy.animations.play('righidle');
        
        enemy.body.gravity.y = 0;
        
    }
}

function collectStar (player, star) {

    // Removes the star from the screen
    star.kill();
    
    //Play sound for collecting item
    coin.play();
    
    //  Add and update the score
    score += 10;
    scoreText.text = 'Score: ' + score;
}

function collectDiamond (player, diamond) {

    // Removes the star from the screen
    diamond.kill();
    diamondOut = -1;
    
    //Play sound for collecting item
    coin.play();
    
    //  Add and update the score
    score += 50;
    scoreText.text = 'Score: ' + score;
    time += 10;
    timerText.text = "Time: " + time;    
}
    
function collectFirstAid (player, firstaid) {

    // Removes the star from the screen
    firstaid.kill();
    firstaidOut = -1;
    
    life += 10;
    lifeText.text = 'Life: ' + life;
}    
    
function enemyTouches (player, enemy) {
        
    //  Add and update the life
    if (timeEnemyTouches == -1){
        
        //Play sound for loosing life
        looseLife.play();
        
        timeEnemyTouches = time;
        life -= 20;
        lifeText.text = 'Life: ' + life;
        
        if (life <= 0){
            player.kill();
            
            //Play sound for dead
            die.play();
            diedText = game.add.text(300, 300, 'YOU DIED!!', { fontSize: '64px', fill: '#F00' });              
        }
    }
}
     
function dieSoundStopped(sound) {

    //Restart game
    this.create();
}

function keyEscapePressed () {
    isPausedGame = 1;
    showMainMenu = 1;
    this.create();
}