const clientId = 'e9a94a0f24ae4e8cbd871c0ecc6f2031';
const clientSecret = '46c6109585d34017881423d96f55974f';

const startGameBtn = document.getElementById('start-game');
const gameContainer = document.getElementById('game-container');
const preview = document.getElementById('preview');
const options = document.getElementById('options');
const message = document.getElementById('message');
const trackinfo = document.getElementById('trackinfo');

startGameBtn.addEventListener('click', async () => {
    startGameBtn.style.display = 'none';
    gameContainer.style.display = 'block';
    await loadNewTrack();
});

async function loadNewTrack() {
    const token = await getAccessToken();
    const track = await getRandomTrack(token);
    preview.src = track.preview_url;
    createYearOptions(track);
}

async function getRandomTrack(token) {
    const response = await fetch('https://api.spotify.com/v1/playlists/37i9dQZF1DXaKIA8E7WcJj', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await response.json();
    const tracks = data.tracks.items.filter(item => item.track.preview_url !== null);
    
    if (tracks.length === 0) {
        throw new Error('No tracks with preview_url found.');
    }

    const randomIndex = Math.floor(Math.random() * tracks.length);
    return tracks[randomIndex].track;
}

function createYearOptions(currentTrack) {
    const correctYear = currentTrack.album.release_date.substring(0, 4); 
    const yearOptions = generateYearOptions(correctYear);
    options.innerHTML = '';
    yearOptions.forEach(year => {
        const btn = document.createElement('button');
        btn.textContent = year;
        btn.addEventListener('click', () => {
            checkAnswer(year, correctYear, currentTrack);
        });
        options.appendChild(btn);
    });
}

function generateYearOptions(correctYear) {
    const currentYear = new Date().getFullYear();
    const yearSet = new Set([correctYear]);
    while (yearSet.size < 4) {
        const offset = Math.floor(Math.random() * 7) - 3;
        const newYear = Number(correctYear) + offset;
        if (newYear <= currentYear) {
            yearSet.add(String(newYear));
        }
    }
    return Array.from(yearSet).sort((a, b) => a - b);
}


const playAgainBtn = document.getElementById('play-again');

playAgainBtn.addEventListener('click', async () => {
    showMessage('');
    playAgainBtn.style.display = 'none';
    trackinfo.innerHTML = '';
    await loadNewTrack();
});

// Update the checkAnswer function to show the "Play Again" button:
function checkAnswer(selectedYear, correctYear, currentTrack) {
    if (selectedYear === correctYear) {
        showMessage('Great Job!', 'green');
    } else {
        showMessage(`Incorrect! The correct year was ${correctYear}.`, 'red');
    }
    displayTrackInfo(currentTrack);
    setTimeout(() => {
        playAgainBtn.style.display = 'inline-block';
    }, 2000);
}


function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}

function displayTrackInfo(track) {
    trackinfo.innerHTML = `
        <h2><a href="${track.external_urls.spotify}" target="_blank">${track.name}</a></h2>
        <p>Artist: <a href="${track.artists[0].external_urls.spotify}" target="_blank">${track.artists[0].name}</a></p>
    `;
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
