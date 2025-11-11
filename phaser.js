// phaser.js - CORRECTION DES BUGS DE TRANSITION ET REDÉMARRAGE

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#21223a',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// Variables globales
let score = 0;
let bestScore = 0;
let scoreText;
let timerText;
let gameScene;
let timedEvent;
let gameActive = false;
let menuActive = true;

// Références pour les éléments du menu
let menuElements = {
    title: null,
    subtitle: null,
    playButton: null,
    bestScoreText: null,
    instructions: null,
    background: null
};

const game = new Phaser.Game(config);

function preload() {
    // Sons (on les ajoutera plus tard, mais on prépare le terrain)
}

function create() {
    gameScene = this;

    // === CHARGEMENT MEILLEUR SCORE ===
    const saved = localStorage.getItem('neonRushBestScore');
    bestScore = saved ? parseInt(saved) : 0;

    // === ÉTAT INITIAL : MENU ===
    menuActive = true;
    gameActive = false;

    createMenu.call(this);
}

function createMenu() {
    // === FOND DU MENU ===
    menuElements.background = this.add.rectangle(0, 0, config.width, config.height, 0x1a1a2e)
        .setOrigin(0, 0);

    // === TITRE ===
    menuElements.title = this.add.text(config.width / 2, 180, 'NEON RUSH', {
        font: '68px "Arial Black"',
        fill: '#00ff88',
        stroke: '#00ff88',
        strokeThickness: 8,
        shadow: { offsetX: 0, offsetY: 0, color: '#00ff88', blur: 20, stroke: false, fill: false }
    }).setOrigin(0.5);
    menuElements.title.setShadow(0, 0, '#00ff88', 15, false, true);

    // Pulsation du titre
    this.tweens.add({
        targets: menuElements.title,
        scale: 1.05,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // === SOUS-TITRE ===
    menuElements.subtitle = this.add.text(config.width / 2, 250, '60 secondes pour le max score', {
        font: '24px Arial',
        fill: '#aaaaaa'
    }).setOrigin(0.5);

    // === BOUTON JOUER ===
    menuElements.playButton = this.add.text(config.width / 2, 350, 'JOUER', {
        font: '40px Arial',
        fill: '#ffffff',
        backgroundColor: '#00ff88',
        padding: { x: 40, y: 15 },
        align: 'center'
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Effet hover
    menuElements.playButton.on('pointerover', () => {
        menuElements.playButton.setStyle({ fill: '#000000', backgroundColor: '#00ffcc' });
        menuElements.playButton.setScale(1.1);
    });
    menuElements.playButton.on('pointerout', () => {
        menuElements.playButton.setStyle({ fill: '#ffffff', backgroundColor: '#00ff88' });
        menuElements.playButton.setScale(1);
    });

    // Clic → démarrer le jeu
    menuElements.playButton.on('pointerdown', () => {
        startGame.call(this);
    });

    // === MEILLEUR SCORE ===
    menuElements.bestScoreText = this.add.text(config.width / 2, 450, `Meilleur: ${bestScore}`, {
        font: '28px Arial',
        fill: '#ffff00'
    }).setOrigin(0.5);

    // === INSTRUCTIONS MOBILE (petit texte en bas) ===
    menuElements.instructions = this.add.text(config.width / 2, config.height - 50, 'Flèches ou Touch pour jouer', {
        font: '16px Arial',
        fill: '#666666'
    }).setOrigin(0.5);
}

function destroyMenu() {
    // Destruction de tous les éléments du menu
    for (let key in menuElements) {
        if (menuElements[key]) {
            menuElements[key].destroy();
            menuElements[key] = null;
        }
    }
}

// === DÉMARRER LE JEU ===
function startGame() {
    if (!menuActive) return;
    
    menuActive = false;
    
    // Destruction immédiate du menu avant la transition
    destroyMenu.call(this);

    // Fade out de la caméra
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
        initGame.call(this);
        this.cameras.main.fadeIn(500);
    });
}

// === INITIALISATION DU JEU ===
function initGame() {
    gameActive = true;
    score = 0;

    // Nettoyage des éventuels restes de jeu précédent
    if (this.carre) this.carre.destroy();
    if (this.object) this.object.destroy();
    if (scoreText) scoreText.destroy();
    if (timerText) timerText.destroy();
    if (timedEvent) timedEvent.remove();

    // Réinitialisation des contrôles
    this.input.keyboard.off('keydown-R');

    // === JOUEUR ===
    this.carre = this.add.rectangle(200, 300, 20, 20, 0x00ff00);
    this.physics.add.existing(this.carre);
    this.carre.body.setCollideWorldBounds(true);
    this.carre.body.setBounce(0.2);

    // === OBJET ===
    this.object = this.add.circle(0, 0, 25, 0xff0000);
    this.physics.add.existing(this.object);
    randomizeObjectPosition.call(this);

    // === CONTRÔLES ===
    this.cursors = this.input.keyboard.createCursorKeys();

    // === COLLISION ===
    this.physics.add.overlap(this.carre, this.object, collectObject, null, this);

    // === UI : SCORE ===
    scoreText = this.add.text(10, 40, 'Score: 0', {
        font: '20px Arial',
        fill: '#ffff00'
    }).setScrollFactor(0);

    // === UI : TIMER ===
    timerText = this.add.text(700, 40, '60', {
        font: '24px Arial',
        fill: '#ff3333',
        align: 'right'
    }).setOrigin(1, 0).setScrollFactor(0);

    // === TIMER ===
    this.remainingTime = 60;
    updateTimerText.call(this);

    timedEvent = this.time.addEvent({
        delay: 1000,
        callback: updateTimer,
        callbackScope: this,
        loop: true
    });
}

function update() {
    if (!gameActive || menuActive) return;

    this.carre.body.setVelocity(0);

    if (this.cursors.left.isDown) {
        this.carre.body.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
        this.carre.body.setVelocityX(200);
    }
    if (this.cursors.up.isDown) {
        this.carre.body.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
        this.carre.body.setVelocityY(200);
    }
}

// === TIMER ===
function updateTimer() {
    this.remainingTime--;
    updateTimerText.call(this);

    if (this.remainingTime <= 0) {
        endGame.call(this);
    }
}

function updateTimerText() {
    timerText.setText(this.remainingTime);
    if (this.remainingTime <= 10) {
        timerText.setTint(0xff0000);
        timerText.setScale(this.remainingTime % 2 === 0 ? 1.1 : 1);
    } else {
        timerText.setTint(0xff3333);
        timerText.setScale(1);
    }
}

// === FIN DU JEU ===
function endGame() {
    gameActive = false;
    if (timedEvent) timedEvent.remove();

    // Mise à jour meilleur score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('neonRushBestScore', bestScore);
    }

    // Nettoyage des éléments de jeu
    if (this.carre) {
        this.carre.destroy();
        this.carre = null;
    }
    if (this.object) {
        this.object.destroy();
        this.object = null;
    }

    // Écran Game Over
    const gameOverBg = this.add.rectangle(config.width / 2, config.height / 2, 420, 220, 0x000000, 0.9)
        .setOrigin(0.5);

    const gameOverText = this.add.text(config.width / 2, config.height / 2 - 70, 'TEMPS ÉCOULÉ !', {
        font: '42px Arial',
        fill: '#ff0066',
        stroke: '#000',
        strokeThickness: 5
    }).setOrigin(0.5);

    const scoreFinalText = this.add.text(config.width / 2, config.height / 2 - 10, `Score: ${score}`, {
        font: '32px Arial',
        fill: '#ffff00'
    }).setOrigin(0.5);

    const bestScoreFinalText = this.add.text(config.width / 2, config.height / 2 + 30, `Meilleur: ${bestScore}`, {
        font: '28px Arial',
        fill: '#00ff88'
    }).setOrigin(0.5);

    const replayText = this.add.text(config.width / 2, config.height / 2 + 80, 'Appuyez sur R', {
        font: '22px Arial',
        fill: '#ffffff'
    }).setOrigin(0.5);

    // Clignotement
    this.tweens.add({
        targets: replayText,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
    });

    // Rejouer - avec gestion propre
    const restartKey = this.input.keyboard.addKey('R');
    restartKey.once('down', () => {
        // Nettoyage complet avant redémarrage
        gameOverBg.destroy();
        gameOverText.destroy();
        scoreFinalText.destroy();
        bestScoreFinalText.destroy();
        replayText.destroy();
        restartKey.destroy();
        
        if (scoreText) scoreText.destroy();
        if (timerText) timerText.destroy();
        
        // Redémarrage direct du jeu sans passer par le menu
        initGame.call(this);
    });
}

// === COLLECTE ===
function collectObject(carre, object) {
    if (!gameActive) return;

    score += 1;
    scoreText.setText('Score: ' + score);
    randomizeObjectPosition.call(this);
}

// === POSITION ALÉATOIRE ===
function randomizeObjectPosition() {
    const margin = 80;
    const x = Phaser.Math.Between(margin, config.width - margin);
    const y = Phaser.Math.Between(margin, config.height - margin);
    this.object.setPosition(x, y);
    this.object.setScale(1);
}