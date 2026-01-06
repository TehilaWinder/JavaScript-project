

setTimeout(() => {
    document.querySelector("#loginBox").style.display = "block";
    document.querySelector("#welcomeText").style.display = "none";
}, 5000);

const goToGame = () => {
    const password = document.querySelector('#password').value;
    const name = document.querySelector("#playerName").value;
    const p = document.querySelector("p");
    if (name !== "" && password !== "") {
        localStorage.setItem('playerName', name);
        localStorage.setItem('password', password);
        window.location.href = "game.html";
    } else {
        p.innerText = "אחד מהפרטים חסר או שגוי. נסה שוב";
    }
};

document.querySelector("button").addEventListener("click", goToGame);

// קונפטי בסגנון גיימרי
const canvas = document.querySelector("#confetti");
const ctx = canvas.getContext("2d");
let particles = [];

const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

const createParticle = () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    size: Math.random() * 6 + 4,
    speed: Math.random() * 3 + 1,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`
});

const drawParticle = (p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
};

const updateConfetti = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.y += p.speed;
        if (p.y > canvas.height) {
            p.y = -p.size;
            p.x = Math.random() * canvas.width;
        }
        drawParticle(p);
    });
    requestAnimationFrame(updateConfetti);
};

const startConfetti = () => {
    particles = Array.from({ length: 120 }, createParticle);
    updateConfetti();
};

resizeCanvas();
startConfetti();
window.onresize = resizeCanvas;