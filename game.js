const backgroundMusic = document.querySelector("#backgroundMusic");
const gameArea = document.querySelector('#gameArea');
const basket = document.querySelector('#basket');
const scoreDisplay = document.querySelector('#score');
const timerDisplay = document.querySelector('#timer');
const gameOverMessage = document.querySelector('#gameOverMessage');
const finalScoreText = document.querySelector('#finalScore');
const restartBtn = document.querySelector('#restartBtn');
const loginOverlay = document.querySelector('#loginOverlay');
const newGameBtn = document.querySelector('#newGameBtn');
const continueBtn = document.querySelector('#continueBtn');
const headLine = document.querySelector('p');
let usersScore = JSON.parse(localStorage.getItem('userScore')) || [];
let score = 0;
let basketPosition = (window.innerWidth - 80) / 2;
let timeLeft = 30;
let gameInterval;
let timerInterval;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
basket.style.left = basketPosition + 'px';

const createFallingItem = () => {
  const item = document.createElement('div');
  item.classList.add('falling-item');
  item.style.left = Math.random() * (gameArea.clientWidth - 40) + 'px';
  item.style.top = '0px';
  gameArea.appendChild(item);

  let fallInterval = setInterval(() => {
    if (timeLeft <= 0) {
      item.remove();
      clearInterval(fallInterval);
    }

    let itemTop = parseFloat(item.style.top);
    item.style.top = itemTop + 5 + 'px';

    if (checkCatch(item)) {
      score++;
      scoreDisplay.textContent = `נקודות: ${score}`;
      localStorage.setItem('gameScore', score);
      item.remove();
      clearInterval(fallInterval);
    } else if (itemTop > window.innerHeight - 50) {
      item.remove();
      clearInterval(fallInterval);
    }
  }, 30);
}
const createBadItem = () => {
  const badItem = document.createElement('div');
  badItem.classList.add('bad-item');
  badItem.style.left = Math.random() * (gameArea.clientWidth - 40) + 'px';
  gameArea.appendChild(badItem);

  let fallInterval = setInterval(() => {
    let top = parseFloat(getComputedStyle(badItem).top) || 0;
    badItem.style.top = top + 5 + 'px';

    // בדיקה אם נתפס
    if (checkCatch(badItem)) {
      score = Math.max(0, score - 10); // מוריד 10 נקודות
      scoreDisplay.textContent = `נקודות: ${score}`;
      localStorage.setItem('gameScore', score); // פונקציית עידכון תצוגת נקודות
      gameArea.removeChild(badItem);
      clearInterval(fallInterval);
    }

    // אם יצא מחוץ למסך
    if (top > gameArea.clientHeight) {
      gameArea.removeChild(badItem);
      clearInterval(fallInterval);
    }
  }, 30);
}


const checkCatch = (item) => {
  const itemRect = item.getBoundingClientRect();
  const basketRect = basket.getBoundingClientRect();
  return !(
    itemRect.bottom < basketRect.top ||
    itemRect.top > basketRect.bottom ||
    itemRect.right < basketRect.left ||
    itemRect.left > basketRect.right
  );
}
gameArea.addEventListener('click', (e) => {
  handleMove(e.clientX);
});
const handleMove = (currentX) => {
  basketPosition = currentX - basket.offsetWidth / 2;

  if (basketPosition < 0) basketPosition = 0;
  if (basketPosition > window.innerWidth - basket.offsetWidth) {
    basketPosition = window.innerWidth - basket.offsetWidth;
  }

  basket.style.left = basketPosition + 'px';
}

const startGame = () => {
  backgroundMusic.volume = 0.3;
  backgroundMusic.play();
  scoreDisplay.textContent = `נקודות: ${score}`;
  timerDisplay.textContent = `זמן: ${timeLeft}`;
  gameOverMessage.style.display = 'none';
  gameInterval = setInterval(createFallingItem, 1200);
  badItemInterval = setInterval(createBadItem, 2000);
  timerInterval = setInterval(() => {
    timeLeft--;
    saveData();
    timerDisplay.textContent = `זמן: ${timeLeft}`;
    if (timeLeft <= 0) endGame();
  }, 1000);


}

const startNewGame = () => {
  score = 0;
  timeLeft = 30;
  localStorage.removeItem('gameScore');
  loginOverlay.style.display = 'none';
  startGame();
}

const continueGame = () => {
  const currentPlayer = localStorage.getItem('playerName');
  const currentPassword = localStorage.getItem('password');
  if (usersScore != null) {
    for (let user of usersScore) {
      if (currentPlayer == user.name && currentPassword == user.password) {
        score = parseInt(user.lastScore, 10);
        timeLeft = parseInt(user.time, 10);
        break;
      }
    }
  }
  loginOverlay.style.display = 'none';
  startGame();
}

const endGame = () => {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  clearInterval(badItemInterval);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);

    const newHighScoreMessage = document.querySelector('#newHighScoreMessage');
    newHighScoreMessage.style.display = 'block';

    setTimeout(() => {
      newHighScoreMessage.style.display = 'none';
    }, 3000); // 3 שניות
  }

  // יצירת רשימת 5 שחקנים מובילים עם מיון ידני
  let topPlayers = [];

  // מעבר על כל השחקנים
  for (let user of usersScore) {
    // הוספה אם יש פחות מ-5 שחקנים ברשימה
    if (topPlayers.length < 5) {
      topPlayers.push(user);
    } else {
      // מציאת הניקוד הכי נמוך ברשימה
      let minIndex = 0;
      for (let i = 1; i < topPlayers.length; i++) {
        if (topPlayers[i].lastScore < topPlayers[minIndex].lastScore) {
          minIndex = i;
        }
      }

      // החלפה אם לשחקן הנוכחי יש ניקוד גבוה יותר
      if (user.lastScore > topPlayers[minIndex].lastScore) {
        topPlayers[minIndex] = user;
      }
    }
  }

  // מיון ידני נוסף של topPlayers בסדר יורד
  for (let i = 0; i < topPlayers.length - 1; i++) {
    for (let j = i + 1; j < topPlayers.length; j++) {
      if (topPlayers[j].lastScore > topPlayers[i].lastScore) {
        let temp = topPlayers[i];
        topPlayers[i] = topPlayers[j];
        topPlayers[j] = temp;
      }
    }
  }

  // יצירת טקסט להצגה
  let topText = `<br>השיא הגבוה ביותר:<br>${highScore} נקודות<br><br>`;
  topText += "<br><br>5 השחקנים המובילים:<br>";
  for (let i = 0; i < topPlayers.length; i++) {
    topText += `${i + 1}. ${topPlayers[i].name} — ${topPlayers[i].lastScore} נקודות<br>`;
  }

  // הצגת התוצאה
  finalScoreText.innerHTML = topText;
  gameOverMessage.style.display = 'block';
}

const saveData = () => {
  const currentPlayer = localStorage.getItem('playerName');
  const currentPassword = localStorage.getItem('password');
  const player = {
    name: currentPlayer,
    password: currentPassword,
    lastScore: score,
    time: timeLeft
  };

  usersScore = usersScore.filter(u => !(u.name === currentPlayer && u.password === currentPassword));
  usersScore.push(player);
  localStorage.setItem('userScore', JSON.stringify(usersScore));

}
restartBtn.addEventListener('click', startNewGame);
newGameBtn.addEventListener('click', startNewGame);
continueBtn.addEventListener('click', continueGame);