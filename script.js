window.onload = () => { // uruchomienie gry przy załadowaniu okna strony
    game.init();
}

class Game { // klasa gry
    backgrounds = []
    backgroundSpeed = 20; // prędkość przesuwania się tła
    cars = [];
    trains = [];
    gameSpeed = 1; // prędkość poruszania się przeszkod w strone gracza

    init = () => { // konstruktor
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 900;
        this.canvas.height = 565;

        this.background = new Image();
        this.background.src = "img/background.png"; // tło

        this.player = new Image();
        this.player.src = "img/player/playerup.png"; // postać gracza
        this.playerWidth = this.player.width * 0.5;
        this.playerHeight = this.player.height * 0.5;
        this.playerX = this.canvas.width / 2 - this.player.width;
        this.playerY = this.canvas.height - this.player.height * 2 + 12;

        this.carRight = new Image();
        this.carRight.src = "img/cars/carright.png"; // przeszkoda
        this.carLeft = new Image();
        this.carLeft.src = "img/cars/carleft.png"; // przeszkoda
        this.carStreet = new Image();
        this.carStreet.src = "img/cars/street.png";
        this.train = new Image();
        this.train.src = "img/train/riding.png";
        this.trainIncoming = new Image();
        this.trainIncoming.src = "img/train/incoming.png";
        this.trainTrack = new Image();
        this.trainTrack.src = "img/train/track.png";

        let x1 = 0;
        let y1 = this.canvas.height - this.background.height;

        this.drawBoard();
        this.startGame();
    };

    drawBoard = () => {
        let bw = this.canvas.width;
        let bh = this.canvas.height;
        let p = 0;
        for (let x = 0; x <= bw; x += 64) {
            this.ctx.moveTo(0.5 + x + p, p);
            this.ctx.lineTo(0.5 + x + p, bh + p);
        }

        for (let x = 0; x <= bh; x += 64) {
            this.ctx.moveTo(p, 0.5 + x + p);
            this.ctx.lineTo(bw + p, 0.5 + x + p);
        }
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
    }

    createRandomArray = () => {
        this.randomObstacles = [
            this.addCars,
            this.addTrains,
        ];
    }

    getRandomObstacle = () => {
        this.randomObstacles[Math.floor(Math.random() * this.randomObstacles.length)]();
    }

    checkMove = () => {
        document.addEventListener(
            "keydown",
            (e) => {
                if (e.defaultPrevented) {
                    return; // Do nothing if the event was already processed
                }

                switch (e.key) {
                    case "ArrowDown":
                        this.playerY += 64;
                        this.player.src = "img/player/playerdown.png";
                        break;
                    case "ArrowUp":
                        this.playerY -= 64;
                        this.player.src = "img/player/playerup.png";
                        break;
                    case "ArrowLeft":
                        this.playerX -= 64;
                        this.player.src = "img/player/playerleft.png";
                        break;
                    case "ArrowRight":
                        this.playerX += 64;
                        this.player.src = "img/player/playerright.png";
                        break;
                    case "Enter":
                        this.restartGame();
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

    startGame = () => {  // rozpoczęcie gry
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
                then = now - (delta % interval);
            }
        }
        update();
        this.addBackgrounds();
        // this.addCars();
        this.createRandomArray();
        this.getRandomObstacle();
    };

    updateGame = () => { // aktualizowanie gry
        this.gameOver();
        if (!this.isOver) {
            this.drawBackgrounds();

            this.drawCars();
            this.drawTrains();
            this.drawPlayer();
            this.checkCollision();
            this.checkMove();
            this.drawBoard();
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Score: " + this.score, 80, 55);
        }
    };

    drawPlayer = () => { // rysowanie postaci gracza oraz jej fizyka
        // rysowanie postaci gracza
        this.ctx.drawImage(this.player, this.playerX, this.playerY);
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
        console.log(this.backgrounds);
        backgroundsToDraw.forEach(background => {
            this.ctx.drawImage(background.img, background.x, background.y); // rysowanie tła
            background.y += this.gameSpeed;



            if (background.y == 0) {
                this.backgrounds.shift(); // usuwanie tła z tablicy
                this.addBackgrounds(); // dodawanie tła do tablicy

            }

            if (background.y % 300 == 0) {
                this.getRandomObstacle();
            }
        });
    };

    addTrains = () => { // tworzenie przeszkod
        let x = this.canvas.width - this.carRight.width;
        let y = 64 * (-1);

        this.trains.push({ // tablica z przeszkodami
            riding: {
                img: this.train,
                x: x,
                y: y,
                width: this.train.width,
                height: this.train.height
            },
            incoming: {
                img: this.trainIncoming,
                x: x,
                y: y,
                width: this.trainIncoming.width,
                height: this.trainIncoming.height
            },
            track: {
                img: this.trainTrack,
                x: x,
                y: y,
                width: this.trainTrack.width,
                height: this.trainTrack.height
            }
        });
    };

    drawTrains = () => { // rysowanie przeszkód
        const trainsToDraw = [...this.trains]; // przeszkody oczekujace na narysowanie
        trainsToDraw.forEach(train => {

            train.incoming.y += this.gameSpeed;
            train.riding.y = train.incoming.y;
            console.log(train.riding.x);
            this.ctx.drawImage(train.incoming.img, 0, train.incoming.y);
            if (train.riding.y >= 128) {
                this.ctx.drawImage(train.track.img, 0, train.riding.y);
                if (train.riding.x > train.riding.width * (-1)) {
                    this.ctx.drawImage(train.riding.img, train.riding.x, train.riding.y);
                    train.riding.x -= this.backgroundSpeed * 2;
                }
            }

            if (train.riding.y == this.canvas.height + train.riding.height) {
                this.trains.shift(); // usuwanie przeszkód z tablicy
            }
        });
    };

    addCars = () => { // tworzenie przeszkod
        let x = this.canvas.width - this.carRight.width;
        let y = 64 * (-1);

        this.cars.push({ // tablica z przeszkodami
            left: {
                img: this.carLeft,
                x: 0,
                y: y,
                width: this.carLeft.width,
                height: this.carLeft.height
            },
            right: {
                img: this.carRight,
                x: x,
                y: y,
                width: this.carRight.width,
                height: this.carRight.height
            },
            street: {
                img: this.carStreet,
                x: x,
                y: y,
                width: this.carStreet.width,
                height: this.carStreet.height
            }
        });
    };

    drawCars = () => { // rysowanie przeszkód
        const carsToDraw = [...this.cars]; // przeszkody oczekujace na narysowanie

        carsToDraw.forEach(car => {
            this.ctx.drawImage(car.street.img, 0, car.left.y - car.street.height); // lewa
            this.ctx.drawImage(car.left.img, car.left.x, car.left.y - car.street.height);
            this.ctx.drawImage(car.street.img, 0, car.right.y); // prawa
            this.ctx.drawImage(car.right.img, car.right.x, car.right.y);

            car.left.x += this.backgroundSpeed / 10;
            car.left.y += this.gameSpeed;
            car.right.x -= this.backgroundSpeed / 10;
            car.right.y += this.gameSpeed;

            if (car.x == 50) {
                this.addCars(); // dodawanie przeszkód do tablicy
            }
            if (car.right.y == this.canvas.height + car.right.height) {
                this.cars.shift();
            }
        });
    };

    checkCollision = () => { // sprawdzanie kolizji przeszkody z graczem
        const carsToCheck = [...this.cars]; // przeszkody oczekujace na sprawdzenie kolizji
        carsToCheck.forEach(car => {
            if (car.x == this.playerX) {
                this.score++; // jeśli gracz przeskoczył przeszkodę dodaj punkt
                if (this.score % 15 == 0) { // zwiększ prędkość ruchu przeszkód gdy ilość zdobytych punktow to wielokrotność 15
                    if (this.gameSpeed == 15) {
                        this.gameSpeed = 20;
                    }
                    else {
                        this.gameSpeed += 4;
                    }

                }
            }
            // warunek sprawdzajacy czy przeszkoda nie dotknęła gracza

            this.isOver = false;


        })
    };

    gameOver = () => { // funkcja kończąca grę
        if (this.isOver) {
            this.clearCanvas();
            this.checkHighscore();
            this.ctx.drawImage(this.background, 0, 0);
            // wyswietlanie komunikatu końcowego
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Score: " + this.score, this.canvas.width / 2.5, this.canvas.height / 2 - 70);
            this.ctx.fillText("High score: " + this.getHighScore(), this.canvas.width / 2.5, this.canvas.height / 2 - 40);
            this.ctx.fillText("Press Enter to restart", this.canvas.width / 2.5, this.canvas.height / 2 - 10);
        }
    };

    clearCanvas = () => { // czyszczenie canvy
        this.ctx.fillStyle = "white";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    restartGame = () => { // restartowanie gry
        this.score = 0;
        this.playerY = this.canvas.height - this.player.height * 2 + 12;
        this.backgrounds = [];
        this.cars = [];
        this.trains = [];
        this.addBackgrounds();
        // this.addCars();
        this.getRandomObstacle();
        this.isOver = false;
        this.gameSpeed = 1;
    };
}

const game = new Game(); // utworzenie obiektu gry
