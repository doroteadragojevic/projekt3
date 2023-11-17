var myAsteroids;
var player;
var insertNewAsteroidCounter = 500; //time counter for adding new asteroid
var time;

//map of pressed keys
const keyPressed = {};
//if user presses key, key is added to keyPressed map
window.addEventListener("keydown", function (e) {
    keyPressed[e.key] = true;
});
window.addEventListener("keyup", function (e) {
    keyPressed[e.key] = false;
});

function startGame() {
    //initializing asteroids
    myAsteroids = asteroids();
    //adding player
    player = new component(
        60,
        60,
        (window.innerWidth - 2) / 2 - 25,
        (window.innerHeight - 2) / 2 - 25,
        "red",
        0,
        0
    );
    //starting the game
    myGameArea.start();
    //starting time counter
    time = new Date().getTime();
    //showing time in top right corner of canvas
    myGameArea.showTime();
    //creating stars on canvas
    myGameArea.createStars();
}

//function for formatting milliseconds to output like 00:00.000 minutes:seconds.milliseconds
function formatTime(milliseconds) {
    //getting minutes from milliseconds
    var minutes = Math.floor(milliseconds / (1000 * 60));
    //getting seconds from milliseconds
    var seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    //milliseconds
    var millis = milliseconds % 1000;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    millis =
        millis < 10 ? "00" + millis : millis < 100 ? "0" + millis : millis;

    //formatting
    return minutes + ":" + seconds + "." + millis;
}

//game area object
var myGameArea = {
    canvas: document.createElement("canvas"),
    //function for creating game area
    start: function () {
        this.canvas.id = "myGameCanvas";
        this.canvas.width = window.innerWidth - 2; //setting width to window width
        this.canvas.height = window.innerHeight - 2; //setting height to window height
        this.context = this.canvas.getContext("2d");
        this.canvas.style.margin = "0";
        this.canvas.style.padding = "0";
        this.canvas.style.backgroundColor = "black"; //setting black background
        this.canvas.style.border = "1px solid red"; //setting red border
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 20);
    },
    //function for showing time in top right corner
    showTime: function () {
        //formatting current playing time
        var formattedTime = formatTime(new Date().getTime() - time);
        //formatting best playing time
        var formattedBestTime = formatTime(
            localStorage.getItem("bestTime") != null ?
            localStorage.getItem("bestTime") :
            0
        );
        //setting fillsytpe and font for text
        this.context.fillStyle = "white";
        this.context.font = "16px Arial";
        //writing text
        this.context.fillText(
            "Najbolje Vrijeme: " + formattedBestTime,
            myGameArea.canvas.width - 200,
            20
        );
        this.context.fillText(
            "              Vrijeme: " + formattedTime,
            myGameArea.canvas.width - 200,
            40
        );
    },
    stop: function () {
        clearInterval(this.interval);
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    //stars array
    stars: [],

    //function for creating stars
    createStars: function () {
        //creating stars at random coordinates inside canvas
        for (var i = 0; i < 100; i++) {
            var x = Math.random() * this.canvas.width;
            var y = Math.random() * this.canvas.height;
            //adding to stars array
            this.stars.push({
                x: x,
                y: y
            });
        }
    },

    //function for drawing stars
    drawStars: function () {
        var ctx = this.context;
        ctx.fillStyle = "white";
        for (var i = 0; i < this.stars.length; i++) {
            var star = this.stars[i];
            ctx.fillRect(star.x, star.y, 1, 1); //point
        }
    },

    //updating stars
    updateStars: function () {
        for (var i = 0; i < this.stars.length; i++) {
            var star = this.stars[i];
            //stars move to the left
            star.x -= 1;
            //if star exits canvas, it returns from the other side
            if (star.x < 0) {
                star.x = this.canvas.width;
            }
        }
    },
};

//creating initial asteroids
function asteroids() {
    var startNumberOfAsteroids = 5; //starting number of asteroids
    var listOfComponents = [];
    for (let i = 1; i <= startNumberOfAsteroids; i++) {
        //defined coordinates for starting asteroids
        const x = [-50, 2000, 150, 500, -50];
        const y = [50, myGameArea.canvas.height + 10, -50, 1000, 500];
        const randomShade = Math.floor(Math.random() * 100) + 100; //choosing random gray shade
        const color = `rgb(${randomShade},${randomShade},${randomShade}, 255)`;
        //shoosing random speed vectors
        const x_speed = Math.floor(Math.random() * 5) + 1;
        const y_speed = Math.floor(Math.random() * 5) + 1;

        listOfComponents.push(
            new component(
                70,
                70,
                x[i - 1],
                y[i - 1],
                color,
                x_speed,
                y_speed
            )
        );
    }
    return listOfComponents;
}

function component(width, height, x, y, color, speed_x, speed_y) {
    this.width = width;
    this.height = height;
    this.speed_x = speed_x;
    this.speed_y = speed_y;
    this.x = x;
    this.y = y;
    //updating component
    this.update = function () {
        ctx = myGameArea.context;
        ctx.save();
        //translating square to new defined coordinates
        ctx.translate(this.x, this.y);

        //3d shadow
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(255, 255, 255, 0.3)";

        //drawing a square
        ctx.fillStyle = color;
        ctx.fillRect(
            this.width / -2,
            this.height / -2,
            this.width,
            this.height
        );

        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";

        ctx.restore();
    };
    //new position
    this.newPos = function () {
        //if asteroid comes to the left end of canvas, change x speed to positive value
        if (this.x - this.width / 2 < 0)
            this.speed_x = Math.abs(this.speed_x);
        //if asteroid comes to the right end of canvas, change x speed to negative value
        else if (this.x + this.width / 2 >= myGameArea.context.canvas.width)
            this.speed_x = -Math.abs(speed_x);
        //if asteroid comes to the top of canvas, change y speed to negative value
        if (this.y - this.height / 2 < 0) this.speed_y = -Math.abs(speed_y);
        //if asteroid comes to the bottom of canvas, change y speed to positive value
        else if (this.y + this.height / 2 >= myGameArea.context.canvas.height)
            this.speed_y = Math.abs(speed_y);
        this.x += this.speed_x;
        this.y -= this.speed_y;

        //if top left corner of asteroid is touching the player
        if (
            this.x > player.x &&
            this.x < player.x + player.width &&
            this.y > player.y &&
            this.y < player.y + player.height
        ) {
            gameOver();
        }
        //if top right corner of asteroid is touching the player
        if (
            this.x + this.width > player.x &&
            this.x + this.width < player.x + player.width &&
            this.y > player.y &&
            this.y < player.y + player.height
        ) {
            gameOver();
        }
        //if bottom left corner of asteroid is touching the player
        if (
            this.x > player.x &&
            this.x < player.x + player.width &&
            this.y + this.height > player.y &&
            this.y + this.height < player.y + player.height
        ) {
            gameOver();
        }
        //if bottom right corner of asteroid is touching the player
        if (
            this.x + this.width > player.x &&
            this.x + this.width < player.x + player.width &&
            this.y + this.height > player.y &&
            this.y + this.height < player.y + player.height
        ) {
            gameOver();
        }
    };

    //new position for player
    this.newPosPlayer = function () {
        //moving with the speed vector of pressed keys
        if (keyPressed["ArrowLeft"] || keyPressed["KeyLeft"]) {
            this.x -= 4;
        }

        if (keyPressed["ArrowRight"] || keyPressed["KeyRight"]) {
            this.x += 4;
        }
        if (keyPressed["ArrowUp"] || keyPressed["KeyUp"]) {
            this.y -= 4;
        }

        if (keyPressed["ArrowDown"] || keyPressed["KeyDown"]) {
            this.y += 4;
        }

        //if player exits canvas, it returns from the opposite side
        if (player.x < 0) player.x = myGameArea.context.canvas.width;
        if (player.y < 0) player.y = myGameArea.context.canvas.height;
        if (player.x > myGameArea.context.canvas.width) player.x = 0;
        if (player.y > myGameArea.context.canvas.height) player.y = 0;
    };
}

//random coordinates
const xCoordinates = [-50, 2000, 150, 500, -50, -100, 1500, 600];
const yCoordinates = [50, 1500, -50, 1000, 500, 10, 1500, 2000];

function updateGameArea() {

    if (insertNewAsteroidCounter == 0) { //if it is time for adding new asteroid
        insertNewAsteroidCounter = 500; //reset counter
        var randomNum = Math.floor(Math.random() * 8); //random number for coordinates 
        const randomShade = Math.floor(Math.random() * 100) + 100; //choose random grey shade
        const color = `rgb(${randomShade},${randomShade},${randomShade}, 255)`;
        myAsteroids.push(
            new component(
                70,
                70,
                xCoordinates[randomNum],
                yCoordinates[randomNum],
                color,
                Math.floor(Math.random() * 5) + 1,
                Math.floor(Math.random() * 5) + 1
            )
        );
    }
    insertNewAsteroidCounter = insertNewAsteroidCounter - 1;
    //clear game area
    myGameArea.clear();
    //redraw stars
    myGameArea.drawStars();
    //update stars
    myGameArea.updateStars();
    //calculate new player position
    player.newPosPlayer();
    //update players position
    player.update();
    //calculate and update asteroids positions
    for (let i = 0; i < myAsteroids.length; i++) {
        myAsteroids[i].newPos();
        myAsteroids[i].update();
    }
    myGameArea.showTime(); //show time in the corner of canvas
}

//game over function
function gameOver() {
    //clear the asteroids
    myAsteroids = [];
    //clear game area
    myGameArea.clear();
    //reset players coordinates
    player.x = (window.innerWidth - 2) / 2 - 25;
    player.y = (window.innerHeight - 2) / 2 - 25;
    //reset asteroids
    myAsteroids = asteroids();
    //reset new asteroid counter
    insertNewAsteroidCounter = 500;
    //calculate playing time
    var bestTime = new Date().getTime() - time;
    if ( //if playing time is best time, set it in local storage
        localStorage.getItem("bestTime") == null ||
        bestTime > localStorage.getItem("bestTime")
    ) {
        localStorage.setItem("bestTime", bestTime);
    }
    // reset time
    time = new Date().getTime();
}


startGame();