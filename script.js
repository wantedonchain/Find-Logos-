// Game Configuration
const GAME_CONFIG = {
    timePerImage: 30,
    xpPerCorrect: 250,
    xpFinalBonus: 1.5,
    totalImages: 10,
    resetHours: 2,
    leaderboardSize: 50
};

// Game State
let gameState = {
    players: new Map(),
    currentImage: 0,
    currentPlayer: '',
    score: 0
};

// IMAGE ANSWERS - WITH ACTUAL IMAGE URLs
const IMAGE_ANSWERS = [
    { 
        image: "https://i.ibb.co/BVwBS1w2/Screenshot-2025-10-29-20-10-57-19-84c9ef400ab248a2e4a3b31139e21163.jpg",
        answer: "arbitrum"
    },
    { 
        image: "https://i.ibb.co/1YdknzYT/Screenshot-2025-10-29-20-12-33-98-84c9ef400ab248a2e4a3b31139e21163.jpg",
        answer: "tron"
    },
    { 
        image: "https://i.ibb.co/7NYMW0xN/Screenshot-2025-10-29-20-14-56-03-84c9ef400ab248a2e4a3b31139e21163.jpg",
        answer: "aave"
    },
    { 
        image: "https://i.ibb.co/5X8kgVks/Screenshot-2025-10-29-20-16-20-45-84c9ef400ab248a2e4a3b31139e21163.jpg",
        answer: "ton"
    },
    { 
        image: "https://i.ibb.co/qLyzZw93/Screenshot-2025-10-29-20-17-27-75-84c9ef400ab248a2e4a3b31139e21163.jpg",
        answer: "floki"
    },
    { 
        image: "https://i.ibb.co/84zc3yZQ/Screenshot-2025-10-29-20-19-06-98-84c9ef400ab248a2e4a3b31139e21163.jpg",
        answer: "sui"
    },
    { 
        image: "https://i.ibb.co/LDXKC4LS/Screenshot-2025-10-29-20-20-36-13-84c9ef400ab248a2e4a3b31139e21163.jpg",
        answer: "polkadot"
    },
    { 
        image: "https://i.ibb.co/Myjg1fzK/Screenshot-2025-10-29-20-22-42-74-84c9ef400ab248a2e4a3b31139e21163.jpg",
        answer: "bnb"
    },
    { 
        image: "https://i.ibb.co/DPxpySKd/Screenshot-2025-10-29-20-24-11-20-84c9ef400ab248a2e4a3b31139e21163.jpg",
        answer: "xrp"
    },
    { 
        image: "https://i.ibb.co/XkxT6BBv/Screenshot-2025-10-29-20-25-54-55-84c9ef400ab248a2e4a3b31139e21163.jpg",
        answer: "cardano"
    }
];

// Zoom functionality
let isZoomed = false;
let zoomLevel = 1;
let currentTimer = null;

// SIMPLE INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Hidden Logo Game loaded!');
    initializeGame();
});

function initializeGame() {
    console.log('🎯 Initializing game...');
    
    loadPlayers();
    updatePlayerDisplay();
    
    // Get elements
    const joinBtn = document.getElementById('joinBtn');
    const usernameInput = document.getElementById('usernameInput');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const submitBtn = document.getElementById('submitBtn');
    const answerInput = document.getElementById('answerInput');
    const questionImage = document.getElementById('questionImage');
    
    console.log('Join button found:', !!joinBtn);
    console.log('Username input found:', !!usernameInput);
    
    // Event listeners - FIXED: Using addEventListener instead of onclick
    if (joinBtn) {
        joinBtn.addEventListener('click', handleStartGame);
    }
    
    if (usernameInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleStartGame();
        });
        
        // Username validation - only letters, numbers, underscore
        usernameInput.addEventListener('input', function(e) {
            const value = e.target.value;
            const validated = value.replace(/[^a-zA-Z0-9_]/g, '');
            if (value !== validated) {
                e.target.value = validated;
                const usernameError = document.getElementById('usernameError');
                if (usernameError) {
                    usernameError.textContent = 'Only letters, numbers, and underscore allowed';
                    usernameError.style.color = '#ff6b6b';
                }
            }
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmitAnswer);
    }
    
    if (answerInput) {
        answerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleSubmitAnswer();
        });
    }
    
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', function() {
            showScreen('usernameScreen');
            const usernameInput = document.getElementById('usernameInput');
            if (usernameInput) {
                usernameInput.value = '';
                usernameInput.focus();
            }
        });
    }
    
    // Zoom functionality for images
    if (questionImage) {
        questionImage.addEventListener('click', function() {
            toggleZoom();
        });
        
        questionImage.addEventListener('wheel', function(e) {
            e.preventDefault();
            if (isZoomed) {
                zoomLevel += e.deltaY * -0.01;
                zoomLevel = Math.min(Math.max(1, zoomLevel), 3);
                questionImage.style.transform = `scale(${zoomLevel})`;
            }
        });
    }
    
    startResetTimer();
    console.log('✅ Game initialized!');
}

function toggleZoom() {
    const questionImage = document.getElementById('questionImage');
    if (!questionImage) return;
    
    if (!isZoomed) {
        // Enable zoom
        isZoomed = true;
        zoomLevel = 1.5;
        questionImage.style.transform = `scale(${zoomLevel})`;
        questionImage.style.cursor = 'zoom-out';
        questionImage.style.transformOrigin = 'center center';
    } else {
        // Disable zoom
        isZoomed = false;
        zoomLevel = 1;
        questionImage.style.transform = 'scale(1)';
        questionImage.style.cursor = 'zoom-in';
    }
}

function handleStartGame() {
    console.log('🎯 Join button clicked! Handling start game...');
    
    const usernameInput = document.getElementById('usernameInput');
    const usernameError = document.getElementById('usernameError');
    
    if (!usernameInput) {
        console.error('❌ Username input not found!');
        return;
    }
    
    const username = usernameInput.value.trim();
    console.log('Username entered:', username);
    
    // Validation
    if (!username) {
        if (usernameError) {
            usernameError.textContent = 'Please enter a username!';
            usernameError.style.color = '#ff6b6b';
        }
        return;
    }
    
    if (username.length < 3) {
        if (usernameError) {
            usernameError.textContent = 'Username must be at least 3 characters!';
            usernameError.style.color = '#ff6b6b';
        }
        return;
    }
    
    // Validate username format (letters, numbers, underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        if (usernameError) {
            usernameError.textContent = 'Only letters, numbers, and underscore allowed!';
            usernameError.style.color = '#ff6b6b';
        }
        return;
    }
    
    // Clean up old players
    cleanupOldPlayers();
    
    // Check if username exists
    if (gameState.players.has(username)) {
        if (usernameError) {
            usernameError.textContent = 'Username used recently. Try after 2 hours.';
            usernameError.style.color = '#ff6b6b';
        }
        return;
    }
    
    // Clear error
    if (usernameError) {
        usernameError.textContent = '';
    }
    
    // START THE GAME
    startGame(username);
}

function startGame(username) {
    console.log('🚀 Starting game for:', username);
    
    // Reset zoom state
    isZoomed = false;
    zoomLevel = 1;
    const questionImage = document.getElementById('questionImage');
    if (questionImage) {
        questionImage.style.transform = 'scale(1)';
        questionImage.style.cursor = 'zoom-in';
    }
    
    // Add player
    gameState.players.set(username, {
        username: username,
        score: 0,
        joinedAt: new Date().toISOString()
    });
    
    savePlayers();
    updatePlayerDisplay();
    
    // Set current player
    gameState.currentPlayer = username;
    gameState.score = 0;
    gameState.currentImage = 0;
    
    // Update UI
    const gameUsername = document.getElementById('gameUsername');
    const currentScore = document.getElementById('currentScore');
    
    if (gameUsername) gameUsername.textContent = username;
    if (currentScore) currentScore.textContent = '0';
    
    // Show game screen
    showScreen('gameScreen');
    
    // Load first image
    loadImage();
}

function showScreen(screenName) {
    console.log('🔄 Showing screen:', screenName);
    
    // Hide all screens
    const screens = ['usernameScreen', 'gameScreen', 'leaderboardScreen'];
    screens.forEach(screenId => {
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenName);
    if (targetScreen) {
        targetScreen.classList.add('active');
        console.log('✅ Screen shown:', screenName);
    } else {
        console.error('❌ Screen not found:', screenName);
    }
}

function loadImage() {
    console.log('🖼️ Loading image:', gameState.currentImage + 1);
    
    if (gameState.currentImage >= GAME_CONFIG.totalImages) {
        endGame();
        return;
    }
    
    const currentQuestion = IMAGE_ANSWERS[gameState.currentImage];
    const questionImage = document.getElementById('questionImage');
    const currentImage = document.getElementById('currentImage');
    const answerInput = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const bonusNotice = document.getElementById('bonusNotice');
    
    if (currentImage) currentImage.textContent = gameState.currentImage + 1;
    if (questionImage) {
        questionImage.src = currentQuestion.image;
        questionImage.style.transform = 'scale(1)';
        questionImage.style.cursor = 'zoom-in';
        // Add error handling
        questionImage.onerror = function() {
            console.error('❌ Failed to load image:', currentQuestion.image);
            handleImageError();
        };
    }
    if (answerInput) {
        answerInput.value = '';
        answerInput.disabled = false;
        answerInput.focus();
    }
    if (feedback) {
        feedback.textContent = '';
        feedback.className = 'feedback';
    }
    
    // Reset zoom state for new image
    isZoomed = false;
    zoomLevel = 1;
    
    // Show bonus notice for final round
    if (bonusNotice) {
        if (gameState.currentImage === GAME_CONFIG.totalImages - 1) {
            bonusNotice.style.display = 'block';
        } else {
            bonusNotice.style.display = 'none';
        }
    }
    
    // Start timer
    startTimer();
}

function handleImageError() {
    console.error('❌ Failed to load image');
    const feedback = document.getElementById('feedback');
    if (feedback) {
        feedback.textContent = 'Error loading image. Moving to next question.';
        feedback.className = 'feedback incorrect';
    }
    setTimeout(() => {
        gameState.currentImage++;
        loadImage();
    }, 2000);
}

function startTimer() {
    // Clear any existing timer
    if (currentTimer) {
        clearInterval(currentTimer);
    }
    
    let timeLeft = GAME_CONFIG.timePerImage;
    const timeLeftEl = document.getElementById('timeLeft');
    const timerProgress = document.getElementById('timerProgress');
    
    if (timeLeftEl) timeLeftEl.textContent = `${timeLeft}s`;
    if (timerProgress) {
        timerProgress.style.width = '100%';
        timerProgress.style.background = 'linear-gradient(90deg, #ffd700, #ffc107, #ffa500)';
    }
    
    currentTimer = setInterval(() => {
        timeLeft--;
        if (timeLeftEl) timeLeftEl.textContent = `${timeLeft}s`;
        if (timerProgress) timerProgress.style.width = `${(timeLeft / GAME_CONFIG.timePerImage) * 100}%`;
        
        // Visual warning when time is low
        if (timeLeft <= 10 && timerProgress) {
            timerProgress.style.background = 'linear-gradient(90deg, #ff4444, #ff6b6b)';
            if (timeLeftEl) timeLeftEl.style.color = '#ff6b6b';
        }
        
        if (timeLeft <= 0) {
            clearInterval(currentTimer);
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    const feedback = document.getElementById('feedback');
    const answerInput = document.getElementById('answerInput');
    
    if (answerInput) answerInput.disabled = true;
    
    if (feedback) {
        feedback.textContent = 'Time\'s up! No points.';
        feedback.className = 'feedback incorrect';
    }
    
    setTimeout(() => {
        gameState.currentImage++;
        loadImage();
    }, 2000);
}

function handleSubmitAnswer() {
    console.log('📝 Submitting answer...');
    
    // Clear timer
    if (currentTimer) {
        clearInterval(currentTimer);
    }
    
    const answerInput = document.getElementById('answerInput');
    const feedback = document.getElementById('feedback');
    const currentScore = document.getElementById('currentScore');
    
    if (!answerInput) {
        console.error('❌ Answer input not found!');
        return;
    }
    
    const userAnswer = answerInput.value.trim().toLowerCase();
    
    if (!userAnswer) {
        if (feedback) {
            feedback.textContent = 'Please enter an answer!';
            feedback.className = 'feedback incorrect';
        }
        return;
    }
    
    // Disable input
    answerInput.disabled = true;
    
    const currentQuestion = IMAGE_ANSWERS[gameState.currentImage];
    const correctAnswer = currentQuestion.answer.toLowerCase();
    
    console.log('User answer:', userAnswer, 'Correct answer:', correctAnswer);
    
    // Check if answer is correct (case insensitive, exact match only)
    const isCorrect = userAnswer === correctAnswer;
    
    if (isCorrect) {
        let pointsEarned = GAME_CONFIG.xpPerCorrect;
        
        // Bonus points for final round
        if (gameState.currentImage === GAME_CONFIG.totalImages - 1) {
            pointsEarned = Math.floor(GAME_CONFIG.xpPerCorrect * GAME_CONFIG.xpFinalBonus);
        }
        
        gameState.score += pointsEarned;
        
        if (feedback) {
            if (gameState.currentImage === GAME_CONFIG.totalImages - 1) {
                feedback.textContent = `Correct! +${pointsEarned} XP (Final Round Bonus!) 🎯`;
            } else {
                feedback.textContent = `Correct! +${pointsEarned} XP 🎉`;
            }
            feedback.className = 'feedback correct';
        }
        
        if (currentScore) currentScore.textContent = gameState.score;
        
        // Update player's score
        if (gameState.players.has(gameState.currentPlayer)) {
            const player = gameState.players.get(gameState.currentPlayer);
            player.score += pointsEarned;
            savePlayers();
        }
    } else {
        if (feedback) {
            feedback.textContent = `Wrong! The correct answer was: ${currentQuestion.answer}`;
            feedback.className = 'feedback incorrect';
        }
    }
    
    setTimeout(() => {
        gameState.currentImage++;
        loadImage();
    }, 3000);
}

function endGame() {
    console.log('🏁 Game ended');
    showLeaderboard();
    showScreen('leaderboardScreen');
}

function showLeaderboard() {
    cleanupOldPlayers();
    
    const playersArray = Array.from(gameState.players.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, GAME_CONFIG.leaderboardSize);
    
    const leaderboard = document.getElementById('leaderboard');
    if (leaderboard) {
        leaderboard.innerHTML = '';
        
        if (playersArray.length === 0) {
            leaderboard.innerHTML = '<div class="leaderboard-item"><div class="player-name">No active players</div></div>';
            return;
        }
        
        playersArray.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = `leaderboard-item ${index < 3 ? 'rank-' + (index + 1) : ''}`;
            item.innerHTML = `
                <div class="rank">#${index + 1}</div>
                <div class="player-name">${player.username}</div>
                <div class="player-score">${player.score} XP</div>
            `;
            leaderboard.appendChild(item);
        });
    }
}

// UTILITY FUNCTIONS
function cleanupOldPlayers() {
    const now = new Date();
    gameState.players.forEach((player, username) => {
        const joinedAt = new Date(player.joinedAt);
        const hoursSinceJoin = (now - joinedAt) / (1000 * 60 * 60);
        if (hoursSinceJoin >= GAME_CONFIG.resetHours) {
            gameState.players.delete(username);
        }
    });
    savePlayers();
}

function updatePlayerDisplay() {
    const currentPlayers = document.getElementById('currentPlayers');
    if (currentPlayers) currentPlayers.textContent = gameState.players.size;
}

function savePlayers() {
    try {
        const playersArray = Array.from(gameState.players.entries());
        localStorage.setItem('gamePlayers', JSON.stringify(playersArray));
    } catch (e) {
        console.error('Failed to save players:', e);
    }
}

function loadPlayers() {
    try {
        const saved = localStorage.getItem('gamePlayers');
        if (saved) {
            const playersArray = JSON.parse(saved);
            gameState.players = new Map(playersArray);
        }
    } catch (e) {
        console.error('Failed to load players:', e);
        gameState.players = new Map();
    }
}

function startResetTimer() {
    const resetTimer = document.getElementById('resetTimer');
    if (!resetTimer) return;
    
    function updateResetTimer() {
        const now = new Date();
        const nextReset = new Date(now);
        nextReset.setHours(now.getHours() + GAME_CONFIG.resetHours);
        nextReset.setMinutes(0, 0, 0);
        
        const diff = nextReset - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        resetTimer.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateResetTimer();
    setInterval(updateResetTimer, 1000);
}
