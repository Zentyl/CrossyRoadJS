window.onload = () => { // uruchomienie gry przy załadowaniu okna strony
    game.init();
}

class Game { // klasa gry
    backgrounds = []
    gameSpeed = 1;
    carSpeed = 2;
    trainSpeed = 20;
    cars = [];
    trains = [];

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

        this.carDown = new Image();
        this.carDown.src = "img/cars/down.png"; // przeszkoda
        this.carUp = new Image();
        this.carUp.src = "img/cars/up.png"; // przeszkoda
        this.carStreet = new Image();
        this.carStreet.src = "img/cars/street.png";
        this.train = new Image();
        this.train.src = "img/train/riding.png";
        this.trainIncoming = new Image();
        this.trainIncoming.src = "img/train/incoming.png";
        this.trainTrack = new Image();
        this.trainTrack.src = "img/train/track.png";
        this.trainAlert = new Image();
        this.trainAlert.src = "img/train/alert.png";

        let x1 = 0;
        let y1 = this.canvas.height - this.background.height;

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
        this.createRandomArray();
        this.getRandomObstacle();
    };

    updateGame = () => { // aktualizowanie gry
            this.drawBackgrounds();
            this.drawCars();
            this.drawTrains();
            this.drawPlayer();
            this.checkCollision();
            this.checkMove();
            this.ctx.fillStyle = "white";
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Score: " + this.score, 80, 55);
    };

    drawPlayer = () => { // rysowanie postaci gracza oraz jej fizyka
        // rysowanie postaci gracza
        this.playerY += this.gameSpeed;
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
        backgroundsToDraw.forEach(background => {
            this.ctx.drawImage(background.img, background.x, background.y); // rysowanie tła
            background.y += this.gameSpeed;

            if (background.y == 0) {
                this.backgrounds.shift(); // usuwanie tła z tablicy
                this.addBackgrounds(); // dodawanie tła do tablicy

            }

            if (background.y % 320 == 0) {
                this.getRandomObstacle();
            }
        });
    };

    addTrains = () => { // tworzenie przeszkod
        let x = this.canvas.width - this.carDown.width;
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
            },
            alert: {
                img: this.trainAlert,
                x: x,
                y: y,
                width: this.trainAlert.width,
                height: this.trainAlert.height
            },
            spawn: Math.random() * (320 - 128) + 128
        });
    };

    drawTrains = () => { // rysowanie przeszkód
        const trainsToDraw = [...this.trains]; // przeszkody oczekujace na narysowanie
        trainsToDraw.forEach(train => {
            train.track.y += this.gameSpeed;
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
                        (this.playerX + this.playerWidth >= train.riding.x && this.playerX < train.riding.x + train.riding.width)
                        && ((this.playerY >= train.riding.y) && this.playerY + this.playerHeight < train.riding.y + train.riding.height )
                    ) { // też do zrobienia Y
                        console.log()
                        this.restartGame();
                    }
                }
            }
            if (train.track.y == this.canvas.height + train.riding.height) {
                this.trains.shift(); // usuwanie przeszkód z tablicy
            }
            if (this.playerY > train.track.y - 64 && this.playerY < train.track.y + 64) { // jeżeli postać jest blisko pola pociągu ale nie jest w calosci to go przeteleportuj na pole
                this.playerY = train.track.y;
            }

        });
    };

    addCars = () => { // tworzenie przeszkod
        let x = this.canvas.width - this.carDown.width;
        let y = 64 * (-1);

        this.cars.push({ // tablica z przeszkodami
            up: {
                img: this.carUp,
                x: x - Math.random() * (100 - (-100)) + (-100),
                y: y,
                width: this.carDown.width,
                height: this.carDown.height
            },
            down: {
                img: this.carDown,
                x: Math.random() * (200 - (-200)) + (-200),
                y: y,
                width: this.carUp.width,
                height: this.carUp.height
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
            this.ctx.drawImage(car.street.img, 0, car.down.y); // prawa
            this.ctx.drawImage(car.down.img, car.down.x, car.down.y);
            this.ctx.drawImage(car.street.img, 0, car.up.y - car.street.height); // lewa
            this.ctx.drawImage(car.up.img, car.up.x, car.up.y - car.street.height);

            car.down.x += this.carSpeed;
            car.down.y += this.gameSpeed;
            car.up.x -= this.carSpeed;
            car.up.y += this.gameSpeed;

            if (
                (this.playerX + this.playerWidth >= car.down.x && this.playerX < car.down.x + car.down.width)
                && ((this.playerY == car.down.y - 2))
            ) {
                console.log("ŚMIERĆ DOWN");
            }

            if (
                (this.playerX + this.playerWidth >= car.up.x && this.playerX < car.up.x + car.up.width)
                && ((this.playerY + this.playerHeight < car.up.y) && (this.playerY >= car.up.y / 2))
            ) {
                console.log("ŚMIERĆ TOP"); // trzeba zrobic Y
            }

            if (car.down.y == this.canvas.height + car.down.height) {
                this.cars.shift();
            }

            if (this.playerY > car.down.y - 64 && this.playerY < car.down.y + 2) {
                this.playerY = car.down.y - 2;
            }
            // if(this.playerY > car.down.y - 64 && this.playerY < car.down.y + 64) {
            //     this.playerY = car.up.y;
            // }
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
        this.getRandomObstacle();
        this.gameSpeed = 2;
    };
}

const game = new Game(); // utworzenie obiektu gry
