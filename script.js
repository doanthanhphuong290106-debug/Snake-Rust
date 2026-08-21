const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreElement = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

const box = 20;
let snake, food, direction, score, gameLoop;

// Lấy High Score từ Local Storage (nếu chưa có thì mặc định là 0)
let highScore = localStorage.getItem("snakeHighScore") || 0;
highScoreElement.innerText = highScore;

function initGame() {
    gameOverScreen.classList.add("hidden");
    
    // Reset lại style nếu ván trước vừa phá kỷ lục
    finalScoreElement.classList.remove("new-record");
    document.querySelector("#gameOverScreen h3").innerText = "GAME OVER!";
    document.querySelector("#gameOverScreen h3").style.color = "#ff3b30";
    
    snake = [
        { x: 10 * box, y: 10 * box },
        { x: 9 * box, y: 10 * box },
        { x: 8 * box, y: 10 * box }
    ];
    direction = "RIGHT";
    score = 0;
    scoreElement.innerText = score;
    
    spawnFood();
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, 120);
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        spawnFood();
    }
}

document.addEventListener("keydown", (event) => {
    if ((event.key === "ArrowLeft" || event.key === "a") && direction !== "RIGHT") direction = "LEFT";
    else if ((event.key === "ArrowUp" || event.key === "w") && direction !== "DOWN") direction = "UP";
    else if ((event.key === "ArrowRight" || event.key === "d") && direction !== "LEFT") direction = "RIGHT";
    else if ((event.key === "ArrowDown" || event.key === "s") && direction !== "UP") direction = "DOWN";
    
    if (event.key === " " && !gameOverScreen.classList.contains("hidden")) {
        initGame();
    }
});

restartBtn.addEventListener("click", initGame);

function drawRoundedRect(x, y, width, height, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();
}

function drawEyes(headX, headY) {
    ctx.fillStyle = "white";
    let eyeSize = 3;
    let pupilSize = 1.5;
    let eye1X, eye1Y, eye2X, eye2Y;
    
    if (direction === "RIGHT") {
        eye1X = headX + 14; eye1Y = headY + 5;
        eye2X = headX + 14; eye2Y = headY + 15;
    } else if (direction === "LEFT") {
        eye1X = headX + 6; eye1Y = headY + 5;
        eye2X = headX + 6; eye2Y = headY + 15;
    } else if (direction === "UP") {
        eye1X = headX + 5; eye1Y = headY + 6;
        eye2X = headX + 15; eye2Y = headY + 6;
    } else if (direction === "DOWN") {
        eye1X = headX + 5; eye1Y = headY + 14;
        eye2X = headX + 15; eye2Y = headY + 14;
    }

    ctx.beginPath(); ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2); ctx.fill();
    
    ctx.fillStyle = "black";
    ctx.beginPath(); ctx.arc(eye1X, eye1Y, pupilSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eye2X, eye2Y, pupilSize, 0, Math.PI * 2); ctx.fill();
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = food.x + box / 2;
    const centerY = food.y + box / 2;
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = "red";
    ctx.fillStyle = "#ff3b30";
    ctx.beginPath();
    ctx.arc(centerX, centerY + 2, box / 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#4caf50"; 
    ctx.beginPath();
    ctx.ellipse(centerX + 3, centerY - 6, 4, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < snake.length; i++) {
        let padding = 1; 
        if (i === 0) {
            drawRoundedRect(snake[i].x + padding, snake[i].y + padding, box - padding*2, box - padding*2, 6, "#43a047");
            drawEyes(snake[i].x, snake[i].y);
        } else {
            drawRoundedRect(snake[i].x + padding, snake[i].y + padding, box - padding*2, box - padding*2, 4, "#66bb6a");
        }
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    if (
        snakeX < 0 || 
        snakeX >= canvas.width || 
        snakeY < 0 || 
        snakeY >= canvas.height || 
        snake.some((segment, index) => index !== 0 && segment.x === snakeX && segment.y === snakeY)
    ) {
        clearInterval(gameLoop);
        
        // --- XỬ LÝ LƯU HIGH SCORE KHI GAME OVER ---
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
            highScoreElement.innerText = highScore;
            
            // Đổi giao diện chúc mừng kỷ lục mới
            document.querySelector("#gameOverScreen h3").innerText = "🏆 NEW HIGH SCORE! 🏆";
            document.querySelector("#gameOverScreen h3").style.color = "#ffeb3b";
            finalScoreElement.classList.add("new-record");
        }
        
        finalScoreElement.innerText = score;
        gameOverScreen.classList.remove("hidden");
        return;
    }

    if (snakeX === food.x && snakeY === food.y) {
        score += 10;
        scoreElement.innerText = score;
        spawnFood();
    } else {
        snake.pop(); 
    }

    let newHead = { x: snakeX, y: snakeY };
    snake.unshift(newHead);
}

initGame();