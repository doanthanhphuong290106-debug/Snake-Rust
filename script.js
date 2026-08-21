const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreElement = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

const box = 20;
let snake, food, direction, score, gameLoop;

const eatSound = new Audio("eat.mp3");

// --- CẤU HÌNH TỐC ĐỘ ---
let currentSpeed;
const minSpeed = 50; 
const speedDecreaseStep = 5; 

// --- CẤU HÌNH HIGH SCORE ---
let highScore = localStorage.getItem("snakeHighScore") || 0;
if (highScoreElement) highScoreElement.innerText = highScore;

// --- KHỞI TẠO GAME ---
function initGame() {
    if (gameOverScreen) gameOverScreen.classList.add("hidden");
    if (finalScoreElement) finalScoreElement.classList.remove("new-record");
    
    let gameOverTitle = document.querySelector("#gameOverScreen h3");
    if (gameOverTitle) {
        gameOverTitle.innerText = "GAME OVER!";
        gameOverTitle.style.color = "#ff3b30";
    }
    
    snake = [
        { x: 10 * box, y: 10 * box },
        { x: 9 * box, y: 10 * box },
        { x: 8 * box, y: 10 * box }
    ];
    direction = "RIGHT";
    score = 0;
    currentSpeed = 210; 
    
    if (scoreElement) scoreElement.innerText = score;
    
    spawnFood();
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(drawGame, currentSpeed);
}

// --- TẠO THỨC ĂN MỚI ---
function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
    
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
    
    if (event.key === " " && gameOverScreen && !gameOverScreen.classList.contains("hidden")) {
        initGame();
    }
});

if (restartBtn) restartBtn.addEventListener("click", initGame);

// --- VÒNG LẶP CHÍNH CỦA GAME ---
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. VẼ THỨC ĂN (PHO MÁT)
    const foodCenterX = food.x + box / 2;
    const foodCenterY = food.y + box / 2;
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255, 204, 0, 0.5)"; 
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🧀", foodCenterX, foodCenterY + 2);
    ctx.shadowBlur = 0; 

    // 2. VẼ CHUỘT (Siêu Mượt & Đổi Hướng)
    for (let i = 0; i < snake.length; i++) {
        const cx = snake[i].x + box / 2;
        const cy = snake[i].y + box / 2;

        if (i === 0) {
            // --- VẼ ĐẦU CHUỘT ---
            ctx.save();
            ctx.translate(cx, cy); // Dời tâm vẽ về giữa ô hiện tại
            
            // Xoay đầu chuột theo hướng di chuyển
            let headAngle = 0;
            if (direction === "UP") headAngle = -Math.PI / 2;
            else if (direction === "RIGHT") headAngle = 0;
            else if (direction === "DOWN") headAngle = Math.PI / 2;
            else if (direction === "LEFT") headAngle = Math.PI;
            ctx.rotate(headAngle);

            // Vẽ tai
            ctx.fillStyle = "#e0e0e0"; 
            ctx.beginPath(); ctx.arc(-2, -6, 5, 0, Math.PI*2); ctx.arc(-2, 6, 5, 0, Math.PI*2); ctx.fill();
            // Lòng tai
            ctx.fillStyle = "#ffb6c1";
            ctx.beginPath(); ctx.arc(-2, -6, 2.5, 0, Math.PI*2); ctx.arc(-2, 6, 2.5, 0, Math.PI*2); ctx.fill();
            // Khuôn mặt (Hình bầu dục)
            ctx.fillStyle = "#e0e0e0";
            ctx.beginPath(); ctx.ellipse(0, 0, 9, 7, 0, 0, Math.PI*2); ctx.fill();
            // Mắt
            ctx.fillStyle = "#000";
            ctx.beginPath(); ctx.arc(3, -3, 1.5, 0, Math.PI*2); ctx.arc(3, 3, 1.5, 0, Math.PI*2); ctx.fill();
            // Mũi (Luôn nằm ở mũi nhọn của mặt)
            ctx.fillStyle = "#ff69b4";
            ctx.beginPath(); ctx.arc(9, 0, 2.5, 0, Math.PI*2); ctx.fill();
            
            ctx.restore(); // Trả lại hệ tọa độ cũ

        } else if (i === snake.length - 1) {
            // --- VẼ ĐUÔI CHUỘT ---
            const prevX = snake[i - 1].x;
            const prevY = snake[i - 1].y;
            let tailAngle = Math.atan2(prevY - snake[i].y, prevX - snake[i].x); 

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(tailAngle);

            // Nối thân cuối
            ctx.fillStyle = "#e0e0e0";
            ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI*2); ctx.fill();

            // Sợi đuôi uốn lượn hướng ra sau
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-10, 10, -15, -10, -25, 0); 
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#ffb6c1";
            ctx.stroke();

            ctx.restore();

        } else {
            // --- VẼ THÂN (Tròn liền mạch) VÀ CHÂN ---
            ctx.fillStyle = "#e0e0e0";
            ctx.beginPath();
            ctx.arc(cx, cy, 9, 0, Math.PI * 2); // Bán kính 9px đè lên nhau tạo thành thân liền mạch
            ctx.fill();

            // Vẽ chân hồng ở đốt thân đầu tiên và đốt áp chót
            if (i === 1 || i === snake.length - 2) {
                const prevX = snake[i - 1].x;
                const prevY = snake[i - 1].y;
                let segAngle = Math.atan2(prevY - snake[i].y, prevX - snake[i].x); 
                
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(segAngle);
                
                ctx.fillStyle = "#ffb6c1"; 
                ctx.beginPath(); ctx.arc(0, -9, 3, 0, Math.PI*2); ctx.fill(); // Chân trái
                ctx.beginPath(); ctx.arc(0, 9, 3, 0, Math.PI*2); ctx.fill(); // Chân phải
                
                ctx.restore();
            }
        }
    }

    // 3. TÍNH TOÁN VỊ TRÍ ĐẦU TIẾP THEO
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "LEFT") snakeX -= box;
    if (direction === "UP") snakeY -= box;
    if (direction === "RIGHT") snakeX += box;
    if (direction === "DOWN") snakeY += box;

    // 4. KIỂM TRA VA CHẠM
    if (
        snakeX < 0 || 
        snakeX >= canvas.width || 
        snakeY < 0 || 
        snakeY >= canvas.height || 
        snake.some((segment, index) => index !== 0 && segment.x === snakeX && segment.y === snakeY)
    ) {
        clearInterval(gameLoop);
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore);
            if (highScoreElement) highScoreElement.innerText = highScore;
            
            let gameOverTitle = document.querySelector("#gameOverScreen h3");
            if (gameOverTitle) {
                gameOverTitle.innerText = "🏆 NEW HIGH SCORE! 🏆";
                gameOverTitle.style.color = "#ffeb3b";
            }
            if (finalScoreElement) finalScoreElement.classList.add("new-record");
        }
        
        if (finalScoreElement) finalScoreElement.innerText = score;
        if (gameOverScreen) gameOverScreen.classList.remove("hidden");
        return; 
    }

    // 5. ĂN PHO MÁT VÀ TĂNG TỐC
    if (snakeX === food.x && snakeY === food.y) {
        eatSound.currentTime = 0; 
        eatSound.play();
        
        score += 10;
        if (scoreElement) scoreElement.innerText = score;
        spawnFood();
        
        if (currentSpeed > minSpeed) {
            currentSpeed -= speedDecreaseStep; 
            clearInterval(gameLoop); 
            gameLoop = setInterval(drawGame, currentSpeed); 
        }
    } else {
        snake.pop(); 
    }

    let newHead = { x: snakeX, y: snakeY };
    snake.unshift(newHead);
}

initGame();