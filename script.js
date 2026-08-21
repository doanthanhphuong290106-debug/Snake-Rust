const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreElement = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

const box = 20;
let snake, food, direction, score, gameLoop;

// --- CẤU HÌNH TỐC ĐỘ ---
let currentSpeed;
const minSpeed = 50; // Giới hạn tốc độ tối đa (nhanh nhất)
const speedDecreaseStep = 5; // Mỗi lần ăn táo sẽ giảm đi 5ms

// --- CẤU HÌNH HIGH SCORE ---
let highScore = localStorage.getItem("snakeHighScore") || 0;
if (highScoreElement) highScoreElement.innerText = highScore;

// --- KHỞI TẠO GAME ---
function initGame() {
    // Ẩn màn hình Game Over và reset UI
    if (gameOverScreen) gameOverScreen.classList.add("hidden");
    if (finalScoreElement) finalScoreElement.classList.remove("new-record");
    
    let gameOverTitle = document.querySelector("#gameOverScreen h3");
    if (gameOverTitle) {
        gameOverTitle.innerText = "GAME OVER!";
        gameOverTitle.style.color = "#ff3b30";
    }
    
    // Thiết lập trạng thái ban đầu
    snake = [
        { x: 10 * box, y: 10 * box },
        { x: 9 * box, y: 10 * box },
        { x: 8 * box, y: 10 * box }
    ];
    direction = "RIGHT";
    score = 0;
    currentSpeed = 300; // Tốc độ khởi đầu
    
    if (scoreElement) scoreElement.innerText = score;
    
    spawnFood();
    
    // Khởi động vòng lặp game
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, currentSpeed);
}

// --- TẠO THỨC ĂN MỚI ---
function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
    
    // Đảm bảo táo không sinh ra đè lên thân rắn
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        spawnFood();
    }
}

// --- ĐIỀU KHIỂN BẰNG BÀN PHÍM ---
document.addEventListener("keydown", (event) => {
    if ((event.key === "ArrowLeft" || event.key === "a") && direction !== "RIGHT") direction = "LEFT";
    else if ((event.key === "ArrowUp" || event.key === "w") && direction !== "DOWN") direction = "UP";
    else if ((event.key === "ArrowRight" || event.key === "d") && direction !== "LEFT") direction = "RIGHT";
    else if ((event.key === "ArrowDown" || event.key === "s") && direction !== "UP") direction = "DOWN";
    
    // Bấm Space để chơi lại nhanh khi đang ở màn hình Game Over
    if (event.key === " " && gameOverScreen && !gameOverScreen.classList.contains("hidden")) {
        initGame();
    }
});

if (restartBtn) restartBtn.addEventListener("click", initGame);

// --- CÁC HÀM HỖ TRỢ VẼ ĐỒ HOẠ ---
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

    // Vẽ tròng trắng
    ctx.beginPath(); ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2); ctx.fill();
    
    // Vẽ tròng đen
    ctx.fillStyle = "black";
    ctx.beginPath(); ctx.arc(eye1X, eye1Y, pupilSize, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eye2X, eye2Y, pupilSize, 0, Math.PI * 2); ctx.fill();
}

// --- VÒNG LẶP CHÍNH CỦA GAME ---
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Vẽ táo (thức ăn)
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
    ctx.ellipse(centerX + 3, centerY - 6, 4, 2, Math.PI / 4, 0, Math.PI * 2); // Cuống lá
    ctx.fill();

    // 2. Vẽ rắn
    for (let i = 0; i < snake.length; i++) {
        let padding = 1; 
        if (i === 0) {
            drawRoundedRect(snake[i].x + padding, snake[i].y + padding, box - padding*2, box - padding*2, 6, "#43a047");
            drawEyes(snake[i].x, snake[i].y);
        } else {
            drawRoundedRect(snake[i].x + padding, snake[i].y + padding, box - padding*2, box - padding*2, 4, "#66bb6a");
        }
    }

    // 3. Tính toán toạ độ đầu rắn tiếp theo
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    // 4. Kiểm tra va chạm (Thua game)
    if (
        snakeX < 0 || 
        snakeX >= canvas.width || 
        snakeY < 0 || 
        snakeY >= canvas.height || 
        snake.some((segment, index) => index !== 0 && segment.x === snakeX && segment.y === snakeY)
    ) {
        clearInterval(gameLoop);
        
        // --- Logic lưu High Score ---
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
            if (highScoreElement) highScoreElement.innerText = highScore;
            
            // UI cho kỷ lục mới
            let gameOverTitle = document.querySelector("#gameOverScreen h3");
            if (gameOverTitle) {
                gameOverTitle.innerText = "🏆 NEW HIGH SCORE! 🏆";
                gameOverTitle.style.color = "#ffeb3b";
            }
            if (finalScoreElement) finalScoreElement.classList.add("new-record");
        }
        
        // Hiện màn hình Game Over
        if (finalScoreElement) finalScoreElement.innerText = score;
        if (gameOverScreen) gameOverScreen.classList.remove("hidden");
        return; // Dừng hàm tại đây
    }

    // 5. Xử lý ăn thức ăn và TĂNG TỐC ĐỘ
    if (snakeX === food.x && snakeY === food.y) {
        score += 10;
        if (scoreElement) scoreElement.innerText = score;
        spawnFood();
        
        // Logic tăng tốc độ
        if (currentSpeed > minSpeed) {
            currentSpeed -= speedDecreaseStep; 
            clearInterval(gameLoop); 
            gameLoop = setInterval(drawGame, currentSpeed); // Cập nhật lại tốc độ mới
        }
    } else {
        snake.pop(); // Xoá đuôi nếu không ăn được mồi
    }

    // 6. Cập nhật vị trí đầu rắn
    let newHead = { x: snakeX, y: snakeY };
    snake.unshift(newHead);
}

// Chạy game ngay khi tải trang
initGame();