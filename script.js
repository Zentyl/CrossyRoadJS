window.onload = () => { // Uruchomienie funkcji init po załadowaniu się okna strony
    game.init();
}

class Game { // klasa gry
    backgrounds = [] // Tablica teł
    gameSpeed = 3; // Prędkość poruszania się obiektów na osi y 
    trainSpeed = 20; // Prędkość poruszania się pociągu na osi X
    carsSpeed = 2; // Prędkość poruszania się samochodów na osi X
    newHighScore = false; // Zmienna sprawdzająca czy nowy rekord score został pobity

    //Tablice obiektów
    lilies = [];
    trains = [];
    cars = [];

    isStarted = false; // Zmienna sprawdzająca czy rozgrywka zostala rozpoczęta
    isOver = false; // Zmienna sprawdzająca czy rozgrywka zostala zakończona
    isMusic = false; // Zmienna sprawdzająca czy muzyka została uruchomiona
    spawnRate = 300; // Częstotliwość pojawiania się przeszkód
    difficulty = "Normal"; // Domyślny poziom trudności

    /**********************************************
    Nazwa funkcji: init
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja ustawia parametry canvy, tworzy obiekty klasy Image przypisując do nich wczytane grafiki,
    tworzy tablicę z funkcjami do dodawania przeszkód, tworzy obiekt gracza oraz wywołuję funkcję setFramerate
    Autor: 6186
    **********************************************/
    init = () => { // konstruktor
        this.canvas = document.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = 900;
        this.canvas.height = 565;

        this.background = new Image(); // Tło
        this.background.src = "img/background.png";

        this.logoImg = new Image(); // Logo
        this.logoImg.src = "img/logo.png";
        this.logoHardImg = new Image(); // Logo gdy poziom trudności to "Hard"
        this.logoHardImg.src = "img/logohard.png";

        this.controlsImg = new Image();
        this.controlsImg.src = "img/controls.png";

        this.playerImg = new Image(); // Grafika gracza
        this.playerImg.src = "img/player/up.png";
        this.playerStartX = this.canvas.width / 2 - this.playerImg.width; // Pozycja początkowa gracza na osi X
        this.playerStartY = this.canvas.height - this.playerImg.height * 2 - 128; // Pozycja początkowa gracza na osi Y

        this.lilyRiverImg = new Image(); // Rzeka
        this.lilyRiverImg.src = "img/lily/river.png";
        this.lilyPadImg = new Image(); // Lilia wodna
        this.lilyPadImg.src = "img/lily/pad.png";

        this.trainTrackImg = new Image(); // Tor pociągu
        this.trainTrackImg.src = "img/train/track.png";
        this.trainIncomingImg = new Image();  // Tor pociągu, zanim jeszcze się pojawił
        this.trainIncomingImg.src = "img/train/incoming.png";
        this.trainAlertImg = new Image(); // Tor pociągu ze znakiem ostrzegawczym pojawiający się chwilę przed pojawieniem się pociągu
        this.trainAlertImg.src = "img/train/alert.png";
        this.trainRidingImg = new Image(); // Widoczny pociąg
        this.trainRidingImg.src = "img/train/riding.png";

        this.carDownImg = new Image(); // Dolny samochód
        this.carDownImg.src = "img/cars/down.png";
        this.carUpImg = new Image(); // Górny samochód
        this.carUpImg.src = "img/cars/up.png";
        this.carDownStreetImg = new Image(); // Ścieżka dolnego samochodu
        this.carDownStreetImg.src = "img/cars/downstreet.png";
        this.carUpStreetImg = new Image(); // Ścieżka górnego samochodu
        this.carUpStreetImg.src = "img/cars/upstreet.png";

        this.randomObstacles = [ // Tablica funkcji tworzących przeszkody
            this.addLilies,
            this.addTrains,
            this.addCars
        ];

        this.player = { // Obiekt gracza
            width: this.playerImg.width * 0.5,
            height: this.playerImg.height * 0.5,
            x: this.playerStartX,
            y: this.playerStartY
        };

        this.setFramerate();
    };

    /**********************************************
    Nazwa funkcji: setFramerate
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja, która służy do odświeżania gry
    Autor: 6186
    **********************************************/

    setFramerate = () => {
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

        this.setGame();
    };

    clearCanvas = () => {
        this.ctx.fillStyle = "white";
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    /**********************************************
    Nazwa funkcji: titleScreen
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja, która wyświetla ekran tytułowy gry zawierający logo,
    instrukcję uruchomienia rozgrywki i zmiany poziomu trudności, najwyższy zdobyty wynik przez gracza
    oraz wybrany obecnie poziom trudności
    Autor: 6186
    **********************************************/
    titleScreen = () => {
        if (!this.isStarted) { // Wyświetlanie ekranu tytułowego dopóki gracz nie wciśnie Enter
            this.clearCanvas();
            this.ctx.drawImage(this.background, 0, 0);

            if (this.difficulty == "Normal") {
                this.ctx.drawImage(this.logoImg, this.canvas.width / 4.75, this.canvas.height / 14);
                this.ctx.fillStyle = "white";
            }

            else { // Jeżeli poziom trudności to "Hard", wyświetl logo oraz napisy na czerwono
                this.ctx.drawImage(this.logoHardImg, this.canvas.width / 4.75, this.canvas.height / 4.5);
                this.ctx.fillStyle = "red";
            }


            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Press Enter to start", this.canvas.width / 2.75, this.canvas.height / 2 - 110);
            this.ctx.fillText("High score: " + this.getHighScore(), this.canvas.width / 2.75, this.canvas.height / 2 - 70);
            this.ctx.fillText("Difficulty: " + this.difficulty, this.canvas.width / 2.75, this.canvas.height / 2 - 30);
            this.ctx.fillText("Press C to change difficulty", this.canvas.width / 2.75, this.canvas.height / 2 + 10);

            this.ctx.fillText("Controls:", this.canvas.width / 2.25, this.canvas.height / 2 + 70);
            this.ctx.drawImage(this.controlsImg, this.canvas.width / 3.35, this.canvas.height*0.7);
        }
    };

    /**********************************************
    Nazwa funkcji: setGame
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja wywołująca funkcję setControls oraz w przypadku, gdy rozgrywka została uruchomiona,
    wywołuje funkcje addBackgrounds i getRandomObstacle
    Autor: 6186
    **********************************************/
    setGame = () => {
        this.setControls();

        if (this.isStarted) {
            this.addBackgrounds();
            this.getRandomObstacle();
        }
    };


    /**********************************************
    Nazwa funkcji: setControls
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja służąca do ustawienia przycisków sterowania w grze
    Autor: 6186
    **********************************************/

    setControls = () => {
        document.addEventListener(
            "keydown",
            (e) => {
                if (e.repeat) { // Zapobieganie trzymania przycisku
                    return;
                }

                if (e.defaultPrevented) {
                    return;
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
                        if (!this.isStarted || this.isOver) {
                            this.startGame();
                        }
                        break;
                    
                    case "c":
                    case "C":
                        if (!this.isStarted || this.isOver) {
                            this.changeDifficulty();
                        } // Zmiana poziomu trudności jest możliwa tylko podczas ekranu głównego i ekranu śmierci 
                        break;

                    case "Escape":
                        if (this.isStarted && !this.isOver) {
                            this.isStarted = false;
                            this.isOver = true;
                        }
                    default:
                        return;
                }
                // Zapobieganie podwójnemu wciśnięciu przycisku
                e.preventDefault();
            },
            true,
        );
    };

    /**********************************************
    Nazwa funkcji: changeDifficulty
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja ustawiająca poziom trudności (normalny i trudny)
    Autor: 6186
    **********************************************/

    changeDifficulty = () => {
        if (this.difficulty == "Normal") {
            this.spawnRate = 150;
            this.difficulty = "Hard";
        }

        else {
            this.spawnRate = 300;
            this.difficulty = "Normal";
        }
    };

    /**********************************************
    Nazwa funkcji: startGame
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja wywoływana po uruchomieniu rozgrywki generująca niezbędne zmienne
    oraz funkcje addBackgrounds i getRandomObstacle
    Autor: 6186
    **********************************************/

    startGame = () => {
        if (!this.isMusic) { // Jeżeli muzyka nie jest włączona, uruchom ją
            this.playMusic();
        }

        this.score = 0;
        this.isStarted = true; // Rozgrywka zostaje uruchomiona
        this.isOver = false; // Ekran śmierci zostaje wyłączony
        this.player.x = this.playerStartX; // Ustaw pozycję gracza na początkową na osi X
        this.player.y = this.playerStartY; // Ustaw pozycję gracza na początkową na osi Y
        this.backgrounds = [];
        this.lilies = [];
        this.trains = [];
        this.cars = [];
        this.addBackgrounds();
        this.getRandomObstacle();
        this.gameSpeed = 3;
    };

    /**********************************************
    Nazwa funkcji: updateGame
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja aktualizująca stan gry oraz wyświetlająca aktualnie zdobyte punkty w rozgrywce
    Autor: 6186
    **********************************************/

    updateGame = () => {
        this.gameOver(); // Sprawdzanie i ewentualne wyświetlanie ekranu śmierci
        if (!this.isOver) { // Sprawdzanie czy gra nie jest w ekranie śmierci
            this.drawBackgrounds();
            this.physicsLilies();
            this.physicsTrain();
            this.physicsCars();
            this.drawPlayer();
            this.checkWallsCollision();
            this.checkHighscore();

            if (this.difficulty == "Normal") {
                this.ctx.fillStyle = "white";
            }

            else { // Wyświetlanie score w kolorze czerwonym w przypadku poziomu trudności "Hard"
                this.ctx.fillStyle = "red";
            }
            this.ctx.font = "20px Verdana";
            this.ctx.fillText("Score: " + this.score, 40, 40);
        }
    };

    getRandomObstacle = () => { // Funkcja losująca funkcję tworzącą przeszkodę
        this.randomObstacles[Math.floor(Math.random() * this.randomObstacles.length)]();
    }

    /**********************************************
    Nazwa funkcji: addBackgrounds
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja tworząca tło oraz dodająca je do tablicy teł
    Autor: 6186
    **********************************************/
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

    /**********************************************
    Nazwa funkcji: drawBackgrounds
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja rysująca tła oraz zapewniająca im ruch oraz usuwanie niewidocznych już teł
    oraz wywołująca funkcję getRandomObstacle w odpowiednim momencie pozycji tła na osi Y
    Autor: 6186
    **********************************************/
    drawBackgrounds = () => {
        this.clearCanvas();
        const backgroundsToDraw = [...this.backgrounds]; // Tła oczekujące na narysowanie
        backgroundsToDraw.forEach(background => {
            this.ctx.drawImage(background.img, background.x, background.y); // Rysowanie tła
            background.y += this.gameSpeed; // Ruch tła na osi Y

            if (background.y == 0) {
                this.backgrounds.shift(); // Usuwanie tła z tablicy teł
                this.addBackgrounds(); // Dodawanie tła do tablicy teł
            }

            // Losowanie i tworzenie obiektu na podstawie pozycji tła oraz ustawionej częstotliwości pojawiania się obiektów
            if (background.y % this.spawnRate == 0) {
                this.getRandomObstacle();
            }
        });
    };

    drawPlayer = () => { // Funkcja rysująca postać gracza oraz wywołująca jej ruch
        this.player.y += this.gameSpeed;
        this.ctx.drawImage(this.playerImg, this.player.x, this.player.y);
    };

    /**********************************************
    Nazwa funkcji: addLilies
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja tworząca parę lilii wodnych w losowym rozmieszczeniu na osi X,
    a następnie dodająca parę do tablicy lilii
    Autor: 6186
    **********************************************/
    addLilies = () => {
        let randomPosition = 0;
        let x1 = 0;
        let y = 0;
        let x2 = 0;
        const possibleX2 = [ // Możliwe pozycje pojawienia się drugiej lilii
            320, 384, 448, 512, 576
        ]
        do {
            do {
                randomPosition = (Math.floor(Math.random() * 14 / 2) * 2);
            } while (randomPosition == 0) // Losowanie pozycji na osi X pierwszej lilii dopóki ta będzie różna od 0

            x1 = this.canvas.width - this.lilyPadImg.width * randomPosition;
            y = 64 * (-1);
            x2 = x1 - possibleX2[Math.floor(Math.random() * possibleX2.length)]; // Losowanie pozycji drugiej lilii na osi X

            if (x2 <= 0) {
                x2 *= (-1);
            }
        } while (
            x1 + 56 == x2 || x1 - 8 == x2 || x1 - 72 == x2 || x1 + 120 == x2 || x1 - 200 == x2
            || x1 - 136 == x2 || x1 - 264 == x2 || x1 + 248 == x2 || x1 + 184 == x2 // Niepożądane lokalizacje par lilii
        )
        this.lilies.push({ // Tablica z liliami
            pad: { // lilia
                img: this.lilyPadImg,
                x1: x1,
                y: y,
                x2: x2,
                width: this.lilyPadImg.width,
                height: this.lilyPadImg.height
            },
            river: { // rzeka na której unoszą się lilie
                img: this.lilyRiverImg,
                x1: x1,
                y: y,
                x2: x2,
                width: this.lilyRiverImg.width,
                height: this.lilyRiverImg.height,
            },
            point: true // Zmienna zawierająca informację, czy punkt do score z przeszkody został zebrany
        });
    };

    /**********************************************
    Nazwa funkcji: physicsLilies
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja tworząca parę lilii wodnych w losowym rozmieszczeniu na osi X,
    a następnie dodająca parę do tablicy lilii oraz odpowiadająca za śmierć gracza przy kontakcie z rzeką
    Autor: 6186
    **********************************************/
    physicsLilies = () => {
        const liliesToDraw = [...this.lilies]; // Lilie oczekujące na narysowanie
        liliesToDraw.forEach(lily => {
            this.ctx.drawImage(lily.river.img, 0, lily.pad.y); // Rysowanie rzeki
            // Rysowanie lilii
            this.ctx.drawImage(lily.pad.img, lily.pad.x1, lily.pad.y);
            this.ctx.drawImage(lily.pad.img, lily.pad.x2, lily.pad.y);

            lily.pad.y += this.gameSpeed;

            if (this.player.y < lily.pad.y - 2) { // Sprawdzanie czy gracz może zdobyć punkt za wejście na lilię
                if (lily.point) {
                    this.score++;
                    this.playSoundScore();
                    lily.point = false;
                }
            }

            // Sprawdzanie czy gracz wszedł na pole rzeki (śmierć)
            if (
                !((this.player.x == lily.pad.x1 - 2 || this.player.x == lily.pad.x2 - 2))
                && (this.player.y == lily.pad.y - 4)
            ) {
                this.playSoundLilyOver();
                this.isOver = true;
            }

            // Przeteleportowanie gracza na osi Y na pozycję lilii, jeśli pozycja gracza jest wystarczająco blisko
            if (this.player.y > lily.pad.y - 34 && this.player.y < lily.pad.y + 32) {
                this.player.y = lily.pad.y - 4;
            }

            // Usuwanie lilii z tablicy lilii
            if (lily.pad.y == this.canvas.height + lily.pad.height) {
                this.lilies.shift();
            }


        });

    };

    /**********************************************
    Nazwa funkcji: addTrains
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja tworząca pociąg wraz z torami oraz losąca moment pojawienia się pociągu
    Autor: 6186
    **********************************************/
    addTrains = () => {
        let x = this.canvas.width - this.carDownImg.width;
        let y = 64 * (-1);

        this.trains.push({
            riding: { // Widoczny pociąg
                img: this.trainRidingImg,
                x: x,
                y: y,
                width: this.trainRidingImg.width,
                height: this.trainRidingImg.height
            },
            incoming: { // Tory, gdy pociąg się jeszcze nie pojawił
                img: this.trainIncomingImg,
                x: x,
                y: y,
                width: this.trainIncomingImg.width,
                height: this.trainIncomingImg.height
            },
            track: { // Tory
                img: this.trainTrackImg,
                x: x,
                y: y,
                width: this.trainTrackImg.width,
                height: this.trainTrackImg.height
            },
            alert: { // Tory chwilę przed pojawieniem się pociągu
                img: this.trainAlertImg,
                x: x,
                y: y,
                width: this.trainAlertImg.width,
                height: this.trainAlertImg.height
            },
            spawn: Math.random() * (320 - 128) + 128, // Losowa pozycja Y na której pojawi się pociąg
            point: true // Punkt
        });
    };

    /**********************************************
    Nazwa funkcji: physicsTrains
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja odpowiadająca za rysowanie się pociągu, jego ruch, znikanie i śmierć gracza
    przy kolizji z nim
    Autor: 6186
    **********************************************/
    physicsTrain = () => { // rysowanie przeszkód
        const trainsToDraw = [...this.trains]; // przeszkody oczekujace na narysowanie
        trainsToDraw.forEach(train => {
            train.track.y += this.gameSpeed;

            if (this.player.y < train.track.y - 2) {
                if (train.point) {
                    this.score++;
                    this.playSoundScore();
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
                //Rysowanie pociągu po jego pojawieniu się tylko wtedy, gdy jeszcze go widać
                if (train.riding.x > train.riding.width * (-1)) { //
                    this.ctx.drawImage(train.riding.img, train.riding.x, train.track.y);
                    train.riding.x -= this.trainSpeed;
                    if (

                        ((this.player.x + this.player.width >= train.riding.x) && (this.player.x < train.riding.x + train.riding.width))
                        && ((this.player.y >= train.track.y) && (this.player.y + 16 < train.track.y + train.riding.height))

                    ) {

                        this.playSoundGameOver();
                        this.isOver = true;
                    }
                }
            }

            if (train.track.y == this.canvas.height + train.riding.height) {
                this.trains.shift();
            }

            //Przeteleportowanie gracza na osi Y na pozycję torów, jeśli pozycja gracza jest wystarczająco blisko
            if (this.player.y > train.track.y - 34 && this.player.y < train.track.y + 32) {
                this.player.y = train.track.y;
            }

        });
    };

    /**********************************************
    Nazwa funkcji: addCars
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja tworząca parę samochodów oraz ich pola ruchu
    Autor: 6186
    **********************************************/
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
                img: this.carDownStreetImg,
                x: x,
                y: y,
                width: this.carDownStreetImg.width,
                height: this.carDownStreetImg.height
            },
            upStreet: {
                img: this.carUpStreetImg,
                x: x,
                y: y,
                width: this.carUpStreetImg.width,
                height: this.carUpStreetImg.height
            },
            point: true
        });
    };

    /**********************************************
    Nazwa funkcji: physicsCars
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja rysująca dwa samochody jadące na przeciwko siebie po dwóch stronach jezdni
    rysowanych przez funkcję oraz odpowiadająca za kolizję gracza z samochodami
    Autor: 6186
    **********************************************/
    physicsCars = () => { // rysowanie przeszkód
        const carsToDraw = [...this.cars]; // przeszkody oczekujace na narysowanie
        carsToDraw.forEach(car => {
            this.ctx.drawImage(car.downStreet.img, 0, car.down.y); // prawa
            this.ctx.drawImage(car.down.img, car.down.x, car.down.y);
            this.ctx.drawImage(car.upStreet.img, 0, car.up.y - car.upStreet.height); // lewa
            this.ctx.drawImage(car.up.img, car.up.x, car.up.y - car.upStreet.height);

            car.down.x += this.carsSpeed;
            car.down.y += this.gameSpeed;
            car.up.x -= this.carsSpeed;
            car.up.y += this.gameSpeed;

            if (this.player.y < car.up.y - 64) {
                if (car.point) {
                    this.score++;
                    this.playSoundScore();
                    car.point = false;
                }
            }

            if (
                (this.player.x + this.player.width >= car.down.x && this.player.x < car.down.x + car.down.width)
                && ((this.player.y == car.down.y))
            ) {
                this.playSoundGameOver();
                this.isOver = true;
            }

            if (
                ((this.player.x + this.player.width * 2 >= car.up.x) && (this.player.x < car.up.x + car.up.width))
                && ((this.player.y == car.up.y - 64))
            ) {
                this.playSoundGameOver();
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

    /**********************************************
    Nazwa funkcji: checkWallsCollision
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja sprawdzająca kolizję gracza z bokami canvy, których dotknięcie wywołuje śmierć
    Autor: 6186
    **********************************************/
    checkWallsCollision = () => {
        if (
            (this.player.x < 10) // lewo
            || (this.player.x + this.player.width > this.canvas.width) // prawo
            || (this.player.y + this.player.height < 16 * (-1)) // góra
            || (this.player.y > this.canvas.height + 16) // dół
        ) {
            this.playSoundGameOver();
            this.isOver = true;
        }
    };

    /**********************************************
    Nazwa funkcji: getHighScore
    Argumenty: brak
    Typ zwracany: int
    Informacje: Funkcja pobierającza zapisany w pamięci lokalnej przeglądarki rekord i zwracająca go
    Autor: 6186
    **********************************************/
    getHighScore = () => {
        if (this.difficulty == "Normal") {
            this.highScore = localStorage.getItem('FroggerNormalHighScore');
        }

        else {
            this.highScore = localStorage.getItem('FroggerHardHighScore');
        }

        if (this.highScore) {
            return parseInt(this.highScore);
        }

        else {
            return 0;
        }
    };

    /**********************************************
    Nazwa funkcji: checkHighScore
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja sprawdzająca czy został pobity nowy rekord i go zapisująca
    Autor: 6186
    **********************************************/
    checkHighscore = () => {
        if (this.difficulty == "Normal") {
            if (this.getHighScore() < this.score) {
                localStorage.setItem('FroggerNormalHighScore', this.score); // Rekord dla poziomu trudności "Normal"
                this.newHighScore = true;
            }
        }

        else {
            if (this.getHighScore() < this.score) {
                localStorage.setItem('FroggerHardHighScore', this.score); // Rekord dla poziomu trudności "Hard"
                this.newHighScore = true;
            }
        }
    };

    /**********************************************
    Nazwa funkcji: playMusic
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja odpowiadająca za uruchamianie muzyki
    Autor: 6186
    **********************************************/
    playMusic = () => { // uruchom muzykę
        let music = new Audio();
        music.src = "audio/music.mp3";
        // Jeżeli muzyka się skończyła, uruchom ją ponownie
        music.addEventListener("ended", function () {
            music.currentTime = 0;
            this.isMusic = false;
            music.play();
        });
        music.play();
        this.isMusic = true; // Muzyka jest uruchomiona
    };

    playSoundGameOver = () => { // Funkcja uruchamiająca dźwięk śmierci
        let playSound = new Audio();
        playSound.src = "audio/gameover.mp3";
        playSound.play();
    };

    playSoundLilyOver = () => { // Funkcja uruchamiająca dźwięk śmierci w przypadku wpadnięcia do rzeki
        let playSound = new Audio();
        playSound.src = "audio/splash.mp3";
        playSound.play();
    };

    playSoundScore = () => { // Funkcja uruchamiająca dźwięk zdobycia punktu
        let playSound = new Audio();
        playSound.src = "audio/point.mp3";
        playSound.play();
    };

    /**********************************************
    Nazwa funkcji: gameOver
    Argumenty: brak
    Typ zwracany: brak
    Informacje: Funkcja wyświetlająca ekran śmierci zawierający takie same informacje jak ekran tytułowy,
    jednakże ze zdobytymi w rozgrywce punktami
    Autor: 6186
    **********************************************/
    gameOver = () => { // funkcja kończąca grę
        if (this.isOver) {
            this.clearCanvas();
            this.ctx.drawImage(this.background, 0, 0);

            // wyswietlanie komunikatu końcowego
            if (this.difficulty == "Normal") {
                this.ctx.drawImage(this.logoImg, this.canvas.width / 4.75, this.canvas.height / 4.5);
                this.ctx.fillStyle = "white";
            }

            else {
                this.ctx.drawImage(this.logoHardImg, this.canvas.width / 4.75, this.canvas.height / 4.5);
                this.ctx.fillStyle = "red";
            }
            this.ctx.font = "20px Verdana";

            this.ctx.fillText("Press Enter to restart", this.canvas.width / 2.75, this.canvas.height / 2 - 10);
            // Zdobyte w rozgrywce punkty
            this.ctx.fillText("Score: " + this.score, this.canvas.width / 2.75, this.canvas.height / 2 + 30);
            this.ctx.fillText("High score: " + this.getHighScore(), this.canvas.width / 2.75, this.canvas.height / 2 + 70);
            this.ctx.fillText("Difficulty: " + this.difficulty, this.canvas.width / 2.75, this.canvas.height / 2 + 110);
            this.ctx.fillText("Press C to change difficulty", this.canvas.width / 2.75, this.canvas.height / 2 + 150);
        }
    };
}

const game = new Game(); // Utworzenie obiektu gry
