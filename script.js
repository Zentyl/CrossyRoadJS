window.onload = () => { // uruchomienie gry przy załadowaniu okna strony
    game.init();
}

class Game { // klasa gry
    backgrounds = []
    gameSpeed = 3;
    lilySpeed = 20;
    trainSpeed = 20;
    carSpeed = 2;
    newHighScore = false;
    lilies = [];
    trains = [];
    cars = [];
    isStarted = false; // zmienna sprawdzająca czy gra zostala rozpoczęta
    isOver = false; // zmienna sprawdzająca czy gra zostala skończona
    spawnRate = 300;
    difficulty = "Normal";


    init = () => { // konstruktor
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = 900;
        this.canvas.height = 565;

        this.background = new Image();
        this.background.src = "img/background.png"; // tło

        this.playerImg = new Image();
        this.playerImg.src = "img/player/up.png"; // postać gracza
        this.playerStartX = this.canvas.width / 2 - this.playerImg.width;
        this.playerStartY = this.canvas.height - this.playerImg.height * 2 - 128;

        this.lilyRiverImg = new Image();
        this.lilyRiverImg.src = "img/lily/river.png";
        this.lilyPadImg = new Image();
        this.lilyPadImg.src = "img/lily/pad.png";
        this.lilySunkenImg = new Image();
        this.lilySunkenImg.src = "img/lily/sunken.png";
        this.trainRidingImg = new Image();
        this.trainRidingImg.src = "img/train/riding.png";
        this.trainIncomingImg = new Image();
        this.trainIncomingImg.src = "img/train/incoming.png";
        this.trainTrackImg = new Image();
        this.trainTrackImg.src = "img/train/track.png";
        this.trainAlertImg = new Image();
        this.trainAlertImg.src = "img/train/alert.png";
        this.carDownImg = new Image();
        this.carDownImg.src = "img/cars/down.png"; // przeszkoda
        this.carUpImg = new Image();
        this.carUpImg.src = "img/cars/up.png"; // przeszkoda
        this.carDownStreet = new Image();
        this.carDownStreet.src = "img/cars/downstreet.png";
        this.carUpStreet = new Image();
        this.carUpStreet.src = "img/cars/upstreet.png";

        this.randomObstacles = [
            this.addLilies,
            this.addTrains,
            this.addCars
        ];

        this.player = {
            width: this.playerImg.width * 0.5,
            height: this.playerImg.height * 0.5,
            x: this.playerStartX,
            y: this.playerStartY
        };

        this.setFramerate();
    };

    titleScreen = () => { // ekran tytułowy gry
        if (!this.isStarted) { // wyświetlanie ekranu tytułowego dopóki gracz nie wciśnie Enter
            this.clearCanvas();
            this.ctx.drawImage(this.background, 0, 0);
            if (this.difficulty == "Normal") {
                this.ctx.fillStyle = "white";
            }
            else
                this.ctx.fillStyle = "red";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Press Enter to start", this.canvas.width / 2.5, this.canvas.height / 2 - 60);
            this.ctx.fillText("High score: " + this.getHighScore(), this.canvas.width / 2.5, this.canvas.height / 2 - 20);
            this.ctx.fillText("Difficulty: " + this.difficulty, this.canvas.width / 2.5, this.canvas.height / 2 + 20);
            this.ctx.fillText("Press C to change difficulty", this.canvas.width / 2.5, this.canvas.height / 2 + 60);

        }
    };

    getRandomObstacle = () => {
        this.randomObstacles[Math.floor(Math.random() * this.randomObstacles.length)]();
    }

    getHighScore = () => { // pobierz zapisany lokalnie rekord i go zwróć
        if (this.difficulty == "Normal") {
            this.highScore = localStorage.getItem('FroggerNormalHighScore');
            if (this.highScore) {
                return parseInt(this.highScore);
            }
            else {
                return 0;
            }
        }
        else {
            this.highScore = localStorage.getItem('FroggerHardHighScore');
            if (this.highScore) {
                return parseInt(this.highScore);
            }
            else {
                return 0;
            }
        }
    }

    checkHighscore = () => { // sprawdź czy został ustanowiony nowy rekord i go zapisz lokalnie
        if (this.difficulty == "Normal") {
            if (this.getHighScore() < this.score) {
                localStorage.setItem('FroggerNormalHighScore', this.score);
                this.newHighScore = true;
            }
        }
        else {
            if (this.getHighScore() < this.score) {
                localStorage.setItem('FroggerHardHighScore', this.score);
                this.newHighScore = true;
            }
        }
    }

    setControls = () => {
        document.addEventListener(
            "keydown",
            (e) => {
                if (e.repeat) { return }
                if (e.defaultPrevented) {
                    return; // Do nothing if the event was already processed
                }
                switch (e.key) {
                    case "ArrowDown":
                    case "s":
                    case "S":
                        this.player.y += 64;
                        this.playerImg.src = "img/player/down.png";
                        break;

                    case "ArrowUp":
                    case "w":
                    case "W":
                        this.player.y -= 64;
                        this.playerImg.src = "img/player/up.png";
                        break;
                    case "ArrowLeft":
                    case "a":
                    case "A":
                        this.player.x -= 64;
                        this.playerImg.src = "img/player/left.png";
                        break;

                    case "ArrowRight":
                    case "d":
                    case "D":
                        this.player.x += 64;
                        this.playerImg.src = "img/player/right.png";
                        break;
                    case "Enter":
                        this.restartGame();
                        break;
                    case "c":
                    case "C":
                        if (!this.isStarted || this.isOver) {
                            this.changeDifficulty();
                        }
                        break;
                    default:
                        return; // Quit when this doesn't handle the key event.
                }
                // Cancel the default action to avoid it being handled twice
                e.preventDefault();
            },
            true,
        );

    }

    checkWallsCollision = () => {
        if (
            (this.player.x < 10) // lewo
            || (this.player.x + this.player.width > this.canvas.width) // prawo
            || (this.player.y + this.player.height < 16 * (-1)) // góra
            || (this.player.y > this.canvas.height + 16) // dół
        ) {
            this.isOver = true;
        }
    }


    changeDifficulty = () => {
        if (this.difficulty == "Normal") {
            this.spawnRate = 150;
            this.difficulty = "Hard";
        }
        else {
            this.spawnRate = 300;
            this.difficulty = "Normal";
        }
    }

    setFramerate = () => {  // rozpoczęcie gry
        // ustawienie częstotliwości wyswietlania klatek
        let framerate = 30;
        let now;
        let then = Date.now();
        let delta = 0;
        let interval = 1000 / framerate;

        const update = () => {
            requestAnimationFrame(update);
            now = Date.now();
            delta = now - then;

            if (delta > interval) {
                this.updateGame();
                this.titleScreen();
                then = now - (delta % interval);
            }
        }
        update();

        this.startGame();
    };

    startGame = () => {
        this.setControls();
        if (this.isStarted) {
            this.addBackgrounds();
            this.getRandomObstacle();
        }
    }

    updateGame = () => { // aktualizowanie gry
        this.gameOver();
        console.log(this.difficulty);
        if (!this.isOver) {
            this.drawBackgrounds();
            this.drawLilies();
            this.drawTrains();
            this.drawCars();
            this.drawPlayer();
            this.checkWallsCollision();
            this.checkHighscore();
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Score: " + this.score, 80, 55);
        }
    };

    gameOver = () => { // funkcja kończąca grę
        if (this.isOver) {
            this.clearCanvas();
            this.ctx.drawImage(this.background, 0, 0);
            // wyswietlanie komunikatu końcowego
            if (this.difficulty == "Normal") {
                this.ctx.fillStyle = "white";
            }
            else
                this.ctx.fillStyle = "red";
            this.ctx.font = "20px Verdana";

            this.ctx.fillText("Press Enter to restart", this.canvas.width / 2.5, this.canvas.height / 2 - 80);
            this.ctx.fillText("Score: " + this.score, this.canvas.width / 2.5, this.canvas.height / 2 - 40);
            this.ctx.fillText("High score: " + this.getHighScore(), this.canvas.width / 2.5, this.canvas.height / 2);
            this.ctx.fillText("Difficulty: " + this.difficulty, this.canvas.width / 2.5, this.canvas.height / 2 + 40);
            this.ctx.fillText("Press C to change difficulty", this.canvas.width / 2.5, this.canvas.height / 2 + 80);
        }
    };

    drawPlayer = () => { // rysowanie postaci gracza oraz jej fizyka
        // rysowanie postaci gracza
        this.player.y += this.gameSpeed;
        this.ctx.drawImage(this.playerImg, this.player.x, this.player.y);
    };

    addBackgrounds = () => { // tworzenie tła
        let x = 0
        let y = -582;

        this.backgrounds.push({ // tablica z tłami
            img: this.background,
            x: x,
            y: y,
            width: this.background.width,
            height: this.background.height
        });
    };

    drawBackgrounds = () => { // rysowanie tła
        this.clearCanvas();
        const backgroundsToDraw = [...this.backgrounds]; // tła oczekujące na narysowanie
        backgroundsToDraw.forEach(background => {
            this.ctx.drawImage(background.img, background.x, background.y); // rysowanie tła
            background.y += this.gameSpeed;

            if (background.y == 0) {
                this.backgrounds.shift(); // usuwanie tła z tablicy
                this.addBackgrounds(); // dodawanie tła do tablicy
            }
            // hard difficulty 150 zamiast 300
            if (background.y % this.spawnRate == 0) {
                this.getRandomObstacle();
            }
        });
    };

    addLilies = () => {
        const possibleX2 = [
            320, 384, 448, 512, 576
        ]
        let randomPosition = 0;
        let x1 = 0;
        let y = 0;
        let x2 = 0;
        do {
            do {
                randomPosition = (Math.floor(Math.random() * 14 / 2) * 2);
            } while (randomPosition == 0)
            x1 = this.canvas.width - this.lilyPadImg.width * randomPosition;
            y = 64 * (-1);
            x2 = x1 - possibleX2[Math.floor(Math.random() * possibleX2.length)];
            if (x2 <= 0) {
                x2 *= (-1);
            }
        } while (
            x1 + 56 == x2 || x1 - 8 == x2 || x1 - 72 == x2 || x1 + 120 == x2 || x1 - 200 == x2
            || x1 - 136 == x2 || x1 - 264 == x2 || x1 + 248 == x2 || x1 + 184 == x2 // niepożądane lokalizacje lilii
        )
        this.lilies.push({ // tablica z przeszkodami
            pad: {
                img: this.lilyPadImg,
                x1: x1,
                y: y,

                x2: x2,
                width: this.lilyPadImg.width,
                height: this.lilyPadImg.height
            },
            river: {
                img: this.lilyRiverImg,
                x1: x1,
                y: y,
                x2: x2,
                width: this.lilyRiverImg.width,
                height: this.lilyRiverImg.height,
            },
            point: true
        });
    }

    drawLilies = () => { // rysowanie przeszkód
        const liliesToDraw = [...this.lilies]; // przeszkody oczekujace na narysowanie
        liliesToDraw.forEach(lily => {
            this.ctx.drawImage(lily.river.img, 0, lily.pad.y); // prawa
            this.ctx.drawImage(lily.pad.img, lily.pad.x1, lily.pad.y);
            this.ctx.drawImage(lily.pad.img, lily.pad.x2, lily.pad.y);

            lily.pad.y += this.gameSpeed;

            if (this.player.y < lily.pad.y - 2) {
                if (lily.point) {
                    this.score++
                    lily.point = false;
                }
            }

            if (
                !((this.player.x == lily.pad.x1 - 2 || this.player.x == lily.pad.x2 - 2))
                && (this.player.y == lily.pad.y - 4)
            ) {
                console.log("ŚMIERĆ RZEKA");
                this.isOver = true;
            }

            if (this.player.y > lily.pad.y - 34 && this.player.y < lily.pad.y + 32) {
                this.player.y = lily.pad.y - 4;
            }

            if (lily.pad.y == this.canvas.height + lily.pad.height) {
                this.lilies.shift();
            }


        });

    };


    addTrains = () => { // tworzenie przeszkod
        let x = this.canvas.width - this.carDownImg.width;
        let y = 64 * (-1);

        this.trains.push({ // tablica z przeszkodami
            riding: {
                img: this.trainRidingImg,
                x: x,
                y: y,
                width: this.trainRidingImg.width,
                height: this.trainRidingImg.height
            },
            incoming: {
                img: this.trainIncomingImg,
                x: x,
                y: y,
                width: this.trainIncomingImg.width,
                height: this.trainIncomingImg.height
            },
            track: {
                img: this.trainTrackImg,
                x: x,
                y: y,
                width: this.trainTrackImg.width,
                height: this.trainTrackImg.height
            },
            alert: {
                img: this.trainAlertImg,
                x: x,
                y: y,
                width: this.trainAlertImg.width,
                height: this.trainAlertImg.height
            },
            spawn: Math.random() * (320 - 128) + 128,
            point: true
        });
    };

    drawTrains = () => { // rysowanie przeszkód
        const trainsToDraw = [...this.trains]; // przeszkody oczekujace na narysowanie
        trainsToDraw.forEach(train => {

            train.track.y += this.gameSpeed;

            if (this.player.y < train.track.y - 2) {
                if (train.point) {
                    this.score++
                    train.point = false;
                }
            }

            if (train.track.y < train.spawn - 32) {
                this.ctx.drawImage(train.incoming.img, 0, train.track.y);
            }
            else if (train.track.y >= train.spawn - 32 && train.track.y < train.spawn) {
                this.ctx.drawImage(train.alert.img, 0, train.track.y);
            }
            else {
                this.ctx.drawImage(train.track.img, 0, train.track.y);
                if (train.riding.x > train.riding.width * (-1)) { // rysowanie pociagu tylko wtedy gdy go widac
                    this.ctx.drawImage(train.riding.img, train.riding.x, train.track.y);
                    train.riding.x -= this.trainSpeed;

                    if (

                        ((this.player.x + this.player.width >= train.riding.x) && (this.player.x < train.riding.x + train.riding.width))
                        && ((this.player.y >= train.track.y) && (this.player.y + 16 < train.track.y + train.riding.height))

                    ) {
                        console.log("ŚMIERĆ POCIĄG");
                        this.isOver = true;
                    }
                }
            }
            if (train.track.y == this.canvas.height + train.riding.height) {
                this.trains.shift(); // usuwanie przeszkód z tablicy
            }


            if (this.player.y > train.track.y - 34 && this.player.y < train.track.y + 32) { // jeżeli postać jest blisko pola pociągu ale nie jest w calosci to go przeteleportuj na pole
                this.player.y = train.track.y;
            }

        });
    };



    addCars = () => { // tworzenie przeszkod
        let x = this.canvas.width - this.carDownImg.width;
        let y = 64 * (-1);

        this.cars.push({ // tablica z przeszkodami
            up: {
                img: this.carUpImg,
                x: x - Math.random() * (100 - (-100)) + (-100),
                y: y,
                width: this.carDownImg.width,
                height: this.carDownImg.height
            },
            down: {
                img: this.carDownImg,
                x: Math.random() * (200 - (-200)) + (-200),
                y: y,
                width: this.carUpImg.width,
                height: this.carUpImg.height
            },
            downStreet: {
                img: this.carDownStreet,
                x: x,
                y: y,
                width: this.carDownStreet.width,
                height: this.carDownStreet.height
            },
            upStreet: {
                img: this.carUpStreet,
                x: x,
                y: y,
                width: this.carUpStreet.width,
                height: this.carUpStreet.height
            },
            point: true
        });
    };

    drawCars = () => { // rysowanie przeszkód
        const carsToDraw = [...this.cars]; // przeszkody oczekujace na narysowanie
        carsToDraw.forEach(car => {
            this.ctx.drawImage(car.downStreet.img, 0, car.down.y); // prawa
            this.ctx.drawImage(car.down.img, car.down.x, car.down.y);
            this.ctx.drawImage(car.upStreet.img, 0, car.up.y - car.upStreet.height); // lewa
            this.ctx.drawImage(car.up.img, car.up.x, car.up.y - car.upStreet.height);

            car.down.x += this.carSpeed;
            car.down.y += this.gameSpeed;
            car.up.x -= this.carSpeed;
            car.up.y += this.gameSpeed;

            if (this.player.y < car.up.y - 64) {
                if (car.point) {
                    this.score++
                    car.point = false;
                }
            }

            if (
                (this.player.x + this.player.width >= car.down.x && this.player.x < car.down.x + car.down.width)
                && ((this.player.y == car.down.y))
            ) {
                console.log("ŚMIERĆ DOWN");
                this.isOver = true;
            }
            if (
                ((this.player.x + this.player.width * 2 >= car.up.x) && (this.player.x < car.up.x + car.up.width))
                && ((this.player.y == car.up.y - 64))
            ) {
                console.log("ŚMIERĆ UP"); // trzeba zrobic Y
                this.isOver = true;
            }
            if (this.player.y > car.down.y - 44 && this.player.y < car.down.y + 42) {
                this.player.y = car.down.y;
            }
            if (car.down.y == this.canvas.height + car.down.height) {
                this.cars.shift();
            }



        });
    };

    clearCanvas = () => { // czyszczenie canvy
        this.ctx.fillStyle = "white";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    restartGame = () => { // restartowanie gry
        this.score = 0;
        this.isStarted = true;
        this.isOver = false;
        this.player.x = this.playerStartX;
        this.player.y = this.playerStartY;
        this.isOver = false;
        this.backgrounds = [];
        this.lilies = [];
        this.trains = [];
        this.cars = [];
        this.blockDown = false;
        this.addBackgrounds();
        this.getRandomObstacle();
        this.gameSpeed = 3;
    };
}

const game = new Game(); // utworzenie obiektu gry
