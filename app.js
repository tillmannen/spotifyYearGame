const clientId = 'secret';
const clientSecret = 'secret';

const startGameBtn = document.getElementById('start-game');
const gameContainer = document.getElementById('game-container');
const preview = document.getElementById('preview');
const options = document.getElementById('options');
const message = document.getElementById('message');

startGameBtn.addEventListener('click', async () => {
    startGameBtn.style.display = 'none';
    gameContainer.style.display = 'block';
    await loadNewTrack();
});

async function loadNewTrack() {
    const token = await getAccessToken();
    const track = await getRandomTrack(token);
    preview.src = track.preview_url;
    createYearOptions(track.album.release_date.substring(0, 4));
}

async function getRandomTrack(token) {
    const response = await fetch('https://api.spotify.com/v1/playlists/37i9dQZEVXbMDoHDwVN2tF', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    const tracks = data.tracks.items;
    const randomIndex = Math.floor(Math.random() * tracks.length);
    return tracks[randomIndex].track;
}

function createYearOptions(correctYear) {
    const yearOptions = generateYearOptions(correctYear);
    options.innerHTML = '';
    yearOptions.forEach(year => {
        const btn = document.createElement('button');
        btn.textContent = year;
        btn.addEventListener('click', () => {
            checkAnswer(year, correctYear);
        });
        options.appendChild(btn);
    });
}

function generateYearOptions(correctYear) {
    const yearSet = new Set([correctYear]);
    while (yearSet.size < 4) {
        const offset = Math.floor(Math.random() * 7) - 3;
        yearSet.add(String(Number(correctYear) + offset));
    }
    return Array.from(yearSet).sort((a, b) => a - b);
}

function checkAnswer(selectedYear, correctYear) {
    if (selectedYear === correctYear) {
        showMessage('Great Job!', 'green');
    } else {
        showMessage(`Incorrect! The correct year was ${correctYear}.`, 'red');
    }
    setTimeout(async () => {
        showMessage('');
        await loadNewTrack();
    }, 2000);
}

function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}

async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}
