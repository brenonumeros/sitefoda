// Elements
const startBtn = document.getElementById('startBtn');
const mainContent = document.getElementById('mainContent');
const darkModeToggle = document.getElementById('darkModeToggle');
const musicLinkInput = document.getElementById('musicLink');
const addMusicBtn = document.getElementById('addMusicBtn');
const playlistContainer = document.getElementById('playlistContainer');
const finalizeBtn = document.getElementById('finalizeBtn');
const surpriseRecommendation = document.getElementById('surpriseRecommendation');

// New music search elements
const musicSearchInput = document.getElementById('musicSearch');
const musicResultsContainer = document.getElementById('musicResults');

// Response system elements
const sendResponseBtn = document.getElementById('sendResponseBtn');
const responseSection = document.getElementById('responseSection');
const responseForm = document.getElementById('responseForm');
const cancelSendBtn = document.getElementById('cancelSendBtn');
const sendingStatus = document.getElementById('sendingStatus');

const moviesList = document.getElementById('moviesList');
const booksList = document.getElementById('booksList');
const showsList = document.getElementById('showsList');

let playlist = JSON.parse(localStorage.getItem('playlist')) || [];
let movies = JSON.parse(localStorage.getItem('movies')) || Array(5).fill({title: '', comment: ''});
let books = JSON.parse(localStorage.getItem('books')) || Array(5).fill({title: '', comment: ''});
let shows = JSON.parse(localStorage.getItem('shows')) || Array(5).fill({title: '', comment: ''});

startBtn.addEventListener('click', () => {
    mainContent.classList.remove('hidden');
    startBtn.classList.add('hidden');
    loadSavedData();
});

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    playClickSound();
});

addMusicBtn.addEventListener('click', addMusicFromLink);
finalizeBtn.addEventListener('click', finalize);

// New event listeners
musicSearchInput.addEventListener('input', debounce(searchMusic, 300));
sendResponseBtn.addEventListener('click', showResponseForm);
cancelSendBtn.addEventListener('click', hideResponseForm);
responseForm.addEventListener('submit', handleFormSubmission);

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Drag & Drop helpers
function createDraggableItem(item, index, listName) {
    const li = document.createElement('li');
    li.className = 'draggable-item';
    li.draggable = true;
    li.dataset.index = index;
    li.dataset.list = listName;

    li.innerHTML = `
        <input type="text" class="title-input" placeholder="Título" value="${item.title}" />
        <input type="text" class="comment-input" placeholder="Comentário (opcional)" value="${item.comment}" />
        <span class="drag-handle">☰</span>
    `;

    // Event listeners for drag and input changes
    li.addEventListener('dragstart', dragStart);
    li.addEventListener('dragover', dragOver);
    li.addEventListener('drop', drop);
    li.addEventListener('dragend', dragEnd);

    li.querySelector('.title-input').addEventListener('input', (e) => {
        updateItem(listName, index, 'title', e.target.value);
    });
    li.querySelector('.comment-input').addEventListener('input', (e) => {
        updateItem(listName, index, 'comment', e.target.value);
    });

    return li;
}

function updateItem(listName, index, field, value) {
    let list = getListByName(listName);
    if (list && list[index]) {
        list[index][field] = value;
        saveList(listName, list);
    }
}

function getListByName(name) {
    if (name === 'movies') return movies;
    if (name === 'books') return books;
    if (name === 'shows') return shows;
    return null;
}

function saveList(name, list) {
    if (name === 'movies') movies = list;
    if (name === 'books') books = list;
    if (name === 'shows') shows = list;
    localStorage.setItem(name, JSON.stringify(list));
}

function renderList(listName, container) {
    container.innerHTML = '';
    let list = getListByName(listName);
    list.forEach((item, index) => {
        const li = createDraggableItem(item, index, listName);
        container.appendChild(li);
    });
}

// Drag & Drop event handlers
let draggedItem = null;

function dragStart(e) {
    draggedItem = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedItem.outerHTML);
    draggedItem.classList.add('dragging');
}

function dragOver(e) {
    e.preventDefault();
    const target = e.currentTarget;
    if (target && target !== draggedItem && target.classList.contains('draggable-item')) {
        const container = target.parentNode;
        const draggedIndex = parseInt(draggedItem.dataset.index);
        const targetIndex = parseInt(target.dataset.index);
        const listName = target.dataset.list;
        let list = getListByName(listName);

        if (draggedIndex < targetIndex) {
            container.insertBefore(draggedItem, target.nextSibling);
        } else {
            container.insertBefore(draggedItem, target);
        }
    }
}

function drop(e) {
    e.preventDefault();
    const container = e.currentTarget.parentNode;
    const listName = e.currentTarget.dataset.list;
    let newList = [];
    container.querySelectorAll('.draggable-item').forEach(li => {
        const index = parseInt(li.dataset.index);
        const list = getListByName(listName);
        newList.push(list[index]);
    });
    saveList(listName, newList);
    renderList(listName, container);
}

function dragEnd(e) {
    draggedItem.classList.remove('dragging');
    draggedItem = null;
}

// Music search and playlist - Enhanced database with Djavan and Brazilian hits
const musicDatabase = [
    // International Hits
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', artist: 'Rick Astley', thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg' },
    { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', artist: 'Luis Fonsi', thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/default.jpg' },
    { id: 'fJ9rUzIMcZQ', title: 'Queen - Bohemian Rhapsody', artist: 'Queen', thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/default.jpg' },
    { id: 'hT_nvWreIhg', title: 'Whitney Houston - I Will Always Love You', artist: 'Whitney Houston', thumbnail: 'https://i.ytimg.com/vi/hT_nvWreIhg/default.jpg' },
    { id: 'L_jWHffIx5E', title: 'Smash Mouth - All Star', artist: 'Smash Mouth', thumbnail: 'https://i.ytimg.com/vi/L_jWHffIx5E/default.jpg' },
    { id: 'ZbZSe6N_BXs', title: 'Pharrell Williams - Happy', artist: 'Pharrell Williams', thumbnail: 'https://i.ytimg.com/vi/ZbZSe6N_BXs/default.jpg' },
    { id: 'CevxZvSJLk8', title: 'Katy Perry - Roar', artist: 'Katy Perry', thumbnail: 'https://i.ytimg.com/vi/CevxZvSJLk8/default.jpg' },
    { id: 'RgKAFK5djSk', title: 'Wiz Khalifa - See You Again ft. Charlie Puth', artist: 'Wiz Khalifa', thumbnail: 'https://i.ytimg.com/vi/RgKAFK5djSk/default.jpg' },
    { id: 'YQHsXMglC9A', title: 'Adele - Hello', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/YQHsXMglC9A/default.jpg' },
    { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You', artist: 'Ed Sheeran', thumbnail: 'https://i.ytimg.com/vi/JGwWNGJdvx8/default.jpg' },
    { id: 'OPf0YbXqDm0', title: 'Mark Ronson - Uptown Funk ft. Bruno Mars', artist: 'Mark Ronson', thumbnail: 'https://i.ytimg.com/vi/OPf0YbXqDm0/default.jpg' },
    { id: 'nfWlot6h_JM', title: 'Taylor Swift - Shake It Off', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/nfWlot6h_JM/default.jpg' },
    { id: 'iLBBRuVDOo4', title: 'Gangnam Style', artist: 'PSY', thumbnail: 'https://i.ytimg.com/vi/iLBBRuVDOo4/default.jpg' },
    { id: 'lp-EO5I60KA', title: 'Imagine Dragons - Believer', artist: 'Imagine Dragons', thumbnail: 'https://i.ytimg.com/vi/lp-EO5I60KA/default.jpg' },
    { id: '60ItHLz5WEA', title: 'Alan Walker - Faded', artist: 'Alan Walker', thumbnail: 'https://i.ytimg.com/vi/60ItHLz5WEA/default.jpg' },
    { id: 'pRpeEdMmmQ0', title: 'Shakira - Waka Waka', artist: 'Shakira', thumbnail: 'https://i.ytimg.com/vi/pRpeEdMmmQ0/default.jpg' },
    { id: 'ru0K8uYEZWw', title: 'ColdPlay - Something Just Like This', artist: 'ColdPlay', thumbnail: 'https://i.ytimg.com/vi/ru0K8uYEZWw/default.jpg' },
    { id: 'hLQl3WQQoQ0', title: 'Adele - Someone Like You', artist: 'Adele', thumbnail: 'https://i.ytimg.com/vi/hLQl3WQQoQ0/default.jpg' },
    { id: 'ktvTqknDobU', title: 'Radiohead - Creep', artist: 'Radiohead', thumbnail: 'https://i.ytimg.com/vi/ktvTqknDobU/default.jpg' },
    { id: 'QcIy9NiNbmo', title: 'Taylor Swift - Anti-Hero', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/QcIy9NiNbmo/default.jpg' },
    { id: 'b_be0fkHoME', title: 'Taylor Swift - Cruel Summer', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/b_be0fkHoME/default.jpg' },
    { id: 'WcIcVapfqXw', title: 'Taylor Swift - Fortnight', artist: 'Taylor Swift', thumbnail: 'https://i.ytimg.com/vi/WcIcVapfqXw/default.jpg' },
    { id: 'P3cxB3_7Wno', title: 'Bruno Mars - Grenade', artist: 'Bruno Mars', thumbnail: 'https://i.ytimg.com/vi/P3cxB3_7Wno/default.jpg' },
    { id: 'UqyT8IEBkvY', title: 'Bruno Mars - Count On Me', artist: 'Bruno Mars', thumbnail: 'https://i.ytimg.com/vi/UqyT8IEBkvY/default.jpg' },
    { id: 'SR6iYWJxHqs', title: 'Bruno Mars - Just The Way You Are', artist: 'Bruno Mars', thumbnail: 'https://i.ytimg.com/vi/SR6iYWJxHqs/default.jpg' },
    
    // Djavan - Grandes Sucessos
    { id: 'Quem7eafRpg', title: 'Djavan - Flor de Lis', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/Quem7eafRpg/default.jpg' },
    { id: 'rFxunOJ_6Jc', title: 'Djavan - Oceano', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/rFxunOJ_6Jc/default.jpg' },
    { id: 'YQoAm2JiJf4', title: 'Djavan - Se...', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/YQoAm2JiJf4/default.jpg' },
    { id: 'Gf93ByeEjJw', title: 'Djavan - Sina', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/Gf93ByeEjJw/default.jpg' },
    { id: 'fBYVlFXsEME', title: 'Djavan - Eu Te Devoro', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/fBYVlFXsEME/default.jpg' },
    { id: 'Azp_Pb7_7Qs', title: 'Djavan - Meu Bem Querer', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/Azp_Pb7_7Qs/default.jpg' },
    { id: 'QQ2StSwg1Qk', title: 'Djavan - Samurai', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/QQ2StSwg1Qk/default.jpg' },
    { id: 'Lp4o2Ms4bDE', title: 'Djavan - Faltando um Pedaço', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/Lp4o2Ms4bDE/default.jpg' },
    { id: 'oPE9c1OnU2k', title: 'Djavan - Lilás', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/oPE9c1OnU2k/default.jpg' },
    { id: 'Hn0ni4xUjdU', title: 'Djavan - Açaí', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/Hn0ni4xUjdU/default.jpg' },
    { id: 'kJl2uPNsJEk', title: 'Djavan - Esquinas', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/kJl2uPNsJEk/default.jpg' },
    { id: 'Hn0ni4xUjdU', title: 'Djavan - Pétala', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/Hn0ni4xUjdU/default.jpg' },
    { id: 'rFxunOJ_6Jc', title: 'Djavan - Capim', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/rFxunOJ_6Jc/default.jpg' },
    { id: 'YQoAm2JiJf4', title: 'Djavan - Lambada de Serpente', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/YQoAm2JiJf4/default.jpg' },
    { id: 'Gf93ByeEjJw', title: 'Djavan - Nem Um Dia', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/Gf93ByeEjJw/default.jpg' },
    { id: 'fBYVlFXsEME', title: 'Djavan - Seduzir', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/fBYVlFXsEME/default.jpg' },
    { id: 'Azp_Pb7_7Qs', title: 'Djavan - Correnteza', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/Azp_Pb7_7Qs/default.jpg' },
    { id: 'QQ2StSwg1Qk', title: 'Djavan - Violão', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/QQ2StSwg1Qk/default.jpg' },
    { id: 'Lp4o2Ms4bDE', title: 'Djavan - Linha do Equador', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/Lp4o2Ms4bDE/default.jpg' },
    { id: 'oPE9c1OnU2k', title: 'Djavan - Solitude', artist: 'Djavan', thumbnail: 'https://i.ytimg.com/vi/oPE9c1OnU2k/default.jpg' },
    
    // Brazilian Hits
    { id: 'fiore9Z5iUg', title: 'Anitta - Envolver', artist: 'Anitta', thumbnail: 'https://i.ytimg.com/vi/fiore9Z5iUg/default.jpg' },
    { id: 'ixkoVwKQaJg', title: 'Luísa Sonza - VIP', artist: 'Luísa Sonza', thumbnail: 'https://i.ytimg.com/vi/ixkoVwKQaJg/default.jpg' },
    { id: 'hcm55lU9knw', title: 'Marília Mendonça - Supera', artist: 'Marília Mendonça', thumbnail: 'https://i.ytimg.com/vi/hcm55lU9knw/default.jpg' },
    { id: 'kDhptL26Y_E', title: 'Henrique & Juliano - Zé da Recaída', artist: 'Henrique & Juliano', thumbnail: 'https://i.ytimg.com/vi/kDhptL26Y_E/default.jpg' },
    { id: 'ddOnlypczOc', title: 'Pabllo Vittar - Corpo Sensual', artist: 'Pabllo Vittar', thumbnail: 'https://i.ytimg.com/vi/ddOnlypczOc/default.jpg' }
];

const YOUTUBE_API_KEY = 'AIzaSyB4vdDqTlyqJnYJkxOJuleGF-TQ_Q7_8-0';

function searchMusic() {
    const query = musicSearchInput.value.trim().toLowerCase();
    if (query.length < 2) {
        musicResultsContainer.innerHTML = '';
        return;
    }
    
    // Mostrar loading
    musicResultsContainer.innerHTML = '<p style="text-align: center; color: #d6336c;">🎵 Buscando músicas...</p>';
    
    // Primeiro tenta busca local
    const localResults = musicDatabase.filter(song => 
        song.title.toLowerCase().includes(query) || 
        song.artist.toLowerCase().includes(query)
    ).slice(0, 5);
    
    if (localResults.length > 0) {
        displayMusicResults(localResults, 'local');
        return;
    }
    
    // Se não encontrar localmente, tenta API do YouTube
    if (query.length >= 3) {
        searchYouTubeAPI(query);
    } else {
        musicResultsContainer.innerHTML = '<p>Digite pelo menos 3 caracteres para buscar no YouTube.</p>';
    }
}

function searchYouTubeAPI(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query + ' music')}&key=${YOUTUBE_API_KEY}&videoCategoryId=10`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na API');
            }
            return response.json();
        })
        .then(data => {
            if (data.items && data.items.length > 0) {
                displayMusicResults(data.items, 'youtube');
            } else {
                musicResultsContainer.innerHTML = '<p>Nenhuma música encontrada. Tente outro termo.</p>';
            }
        })
        .catch(error => {
            console.error('Erro na busca YouTube:', error);
            // Fallback para busca mais ampla no banco local
            const fallbackResults = musicDatabase.filter(song => 
                song.title.toLowerCase().includes(query.split(' ')[0]) || 
                song.artist.toLowerCase().includes(query.split(' ')[0])
            ).slice(0, 5);
            
            if (fallbackResults.length > 0) {
                displayMusicResults(fallbackResults, 'local');
            } else {
                musicResultsContainer.innerHTML = '<p style="color: #d6336c;">Busca no YouTube indisponível. Tente termos como: taylor swift, adele, bruno mars, queen, etc.</p>';
            }
        });
}

function displayMusicResults(items, source = 'local') {
    musicResultsContainer.innerHTML = '';
    
    if (items.length === 0) {
        musicResultsContainer.innerHTML = '<p>Nenhuma música encontrada. Tente outro termo.</p>';
        return;
    }
    
    items.forEach(item => {
        let videoId, title, artist, thumbnail;
        
        if (source === 'local') {
            videoId = item.id;
            title = item.title;
            artist = item.artist;
            thumbnail = item.thumbnail;
        } else {
            videoId = item.id.videoId;
            title = item.snippet.title;
            artist = item.snippet.channelTitle;
            thumbnail = item.snippet.thumbnails.default.url;
        }
        
        const div = document.createElement('div');
        div.className = 'music-result-item';
        div.innerHTML = `
            <img src="${thumbnail}" alt="${title}" style="width: 60px; height: 45px; border-radius: 10px; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div style="width: 60px; height: 45px; background: linear-gradient(45deg, #ffb6c1, #ff8da1); border-radius: 10px; display: none; align-items: center; justify-content: center; color: white; font-weight: bold;">🎵</div>
            <div style="flex: 1; margin-left: 10px;">
                <p style="font-weight: bold; margin-bottom: 5px; font-size: 0.9em;">${title.length > 50 ? title.substring(0, 50) + '...' : title}</p>
                <p style="font-size: 0.8em; color: #666;">${artist}</p>
            </div>
            <button onclick="addToPlaylist('${videoId}', '${title.replace(/'/g, "\\'")}')">Adicionar</button>
        `;
        musicResultsContainer.appendChild(div);
    });
}

function addToPlaylist(videoId, title) {
    if (playlist.length >= 5) {
        alert('Você já adicionou 5 músicas!');
        return;
    }
    if (playlist.find(item => item.videoId === videoId)) {
        alert('Esta música já está na lista!');
        return;
    }
    playlist.push({ videoId, title });
    savePlaylist();
    updatePlaylistDisplay();
}

function updatePlaylistDisplay() {
    playlistContainer.innerHTML = '';
    playlist.forEach(item => {
        const div = document.createElement('div');
        div.className = 'playlist-item';
        div.innerHTML = `
            <p>${item.title}</p>
            <iframe width="250" height="80" src="https://www.youtube.com/embed/${item.videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
            <button onclick="removeFromPlaylist('${item.videoId}')">Remover</button>
        `;
        playlistContainer.appendChild(div);
    });
}

function removeFromPlaylist(videoId) {
    playlist = playlist.filter(item => item.videoId !== videoId);
    savePlaylist();
    updatePlaylistDisplay();
}

function savePlaylist() {
    localStorage.setItem('playlist', JSON.stringify(playlist));
}

// Add music from YouTube link
function addMusicFromLink() {
    const link = musicLinkInput.value.trim();
    if (!link) {
        alert('Por favor, cole um link do YouTube!');
        return;
    }

    const videoId = extractVideoId(link);
    if (!videoId) {
        alert('Link do YouTube inválido! Use um formato como: https://www.youtube.com/watch?v=VIDEO_ID');
        return;
    }

    if (playlist.length >= 5) {
        alert('Você já adicionou 5 músicas!');
        return;
    }

    if (playlist.find(item => item.videoId === videoId)) {
        alert('Esta música já está na lista!');
        return;
    }

    // Try to get title from YouTube API or use a generic title
    fetchVideoTitle(videoId).then(title => {
        playlist.push({ videoId, title });
        savePlaylist();
        updatePlaylistDisplay();
        musicLinkInput.value = '';
        alert('Música adicionada com sucesso! 🎵');
    });
}

// Extract video ID from YouTube URL
function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Fetch video title from YouTube API
async function fetchVideoTitle(videoId) {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].snippet.title;
        }
    } catch (error) {
        console.error('Error fetching video title:', error);
    }
    return `Música do YouTube (${videoId})`;
}

// Response system functions
function showResponseForm() {
    responseSection.classList.remove('hidden');
    responseSection.scrollIntoView({ behavior: 'smooth' });
}

function hideResponseForm() {
    responseSection.classList.add('hidden');
}

async function handleFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(responseForm);
    const senderName = formData.get('senderName');
    const senderEmail = formData.get('senderEmail');
    const personalMessage = formData.get('personalMessage');

    // Show loading state
    responseForm.classList.add('hidden');
    sendingStatus.classList.remove('hidden');

    // Prepare data to send
    const dataToSend = {
        senderName,
        senderEmail,
        personalMessage,
        timestamp: new Date().toISOString(),
        movies: movies.filter(item => item.title.trim() !== ''),
        books: books.filter(item => item.title.trim() !== ''),
        shows: shows.filter(item => item.title.trim() !== ''),
        playlist: playlist,
        surpriseRecommendation: surpriseRecommendation.value
    };

    try {
        // Send to Vercel serverless function
        const response = await fetch('/api/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });

        if (response.ok) {
            sendingStatus.innerHTML = `
                <div style="text-align: center; padding: 30px;">
                    <h3 style="color: #d6336c; margin-bottom: 15px;">✅ Enviado com Sucesso!</h3>
                    <p>Suas escolhas foram enviadas para Maria Clara! 💖</p>
                    <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                        ${senderEmail ? 'Você receberá uma confirmação no seu email.' : ''}
                    </p>
                    <button onclick="location.reload()" class="primary-btn" style="margin-top: 20px;">
                        🔄 Fazer Nova Lista
                    </button>
                </div>
            `;
        } else {
            throw new Error('Erro no servidor');
        }
    } catch (error) {
        console.error('Error sending data:', error);
        sendingStatus.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <h3 style="color: #ff6b6b; margin-bottom: 15px;">❌ Erro ao Enviar</h3>
                <p>Houve um problema ao enviar suas escolhas.</p>
                <p style="margin-top: 10px; font-size: 0.9em;">Tente novamente ou salve localmente.</p>
                <div style="margin-top: 20px;">
                    <button onclick="retrySubmission()" class="primary-btn" style="margin-right: 10px;">
                        🔄 Tentar Novamente
                    </button>
                    <button onclick="hideResponseForm(); finalize();" class="secondary-btn">
                        💾 Salvar Localmente
                    </button>
                </div>
            </div>
        `;
    }
}

function retrySubmission() {
    responseForm.classList.remove('hidden');
    sendingStatus.classList.add('hidden');
}

function finalize() {
    localStorage.setItem('surpriseRecommendation', surpriseRecommendation.value);
    localStorage.setItem('movies', JSON.stringify(movies));
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('shows', JSON.stringify(shows));
    alert('Tudo salvo localmente! 💾 Suas escolhas estão seguras no seu navegador.');
}

function loadSavedData() {
    const savedRecommendation = localStorage.getItem('surpriseRecommendation');
    if (savedRecommendation) {
        surpriseRecommendation.value = savedRecommendation;
    }
    const savedMovies = JSON.parse(localStorage.getItem('movies'));
    if (savedMovies) movies = savedMovies;
    const savedBooks = JSON.parse(localStorage.getItem('books'));
    if (savedBooks) books = savedBooks;
    const savedShows = JSON.parse(localStorage.getItem('shows'));
    if (savedShows) shows = savedShows;
    const savedPlaylist = JSON.parse(localStorage.getItem('playlist'));
    if (savedPlaylist) playlist = savedPlaylist;

    renderList('movies', moviesList);
    renderList('books', booksList);
    renderList('shows', showsList);
    updatePlaylistDisplay();
}

// Sound effects
const clickSound = new Audio('click.mp3'); // You need to add this file or replace with a URL

function playClickSound() {
    clickSound.currentTime = 0;
    clickSound.play();
}

// Initialize empty lists if needed
function initializeEmptyLists() {
    if (!movies.length) movies = Array(5).fill({title: '', comment: ''});
    if (!books.length) books = Array(5).fill({title: '', comment: ''});
    if (!shows.length) shows = Array(5).fill({title: '', comment: ''});
}

initializeEmptyLists();
