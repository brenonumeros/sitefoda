// Elements
const startBtn = document.getElementById('startBtn');
const mainContent = document.getElementById('mainContent');
const darkModeToggle = document.getElementById('darkModeToggle');
const musicSearchInput = document.getElementById('musicSearch');
const musicResultsContainer = document.getElementById('musicResults');
const playlistContainer = document.getElementById('playlistContainer');
const finalizeBtn = document.getElementById('finalizeBtn');
const surpriseRecommendation = document.getElementById('surpriseRecommendation');

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

musicSearchInput.addEventListener('input', debounce(searchMusic, 300));
finalizeBtn.addEventListener('click', finalize);

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

// Music search and playlist
const YOUTUBE_API_KEY = 'YOUR_YOUTUBE_API_KEY'; // Replace with your YouTube API key

function searchMusic() {
    const query = musicSearchInput.value.trim();
    if (query.length < 3) {
        musicResultsContainer.innerHTML = '';
        return;
    }
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            displayMusicResults(data.items);
        })
        .catch(() => {
            musicResultsContainer.innerHTML = '<p>Erro ao buscar músicas.</p>';
        });
}

function displayMusicResults(items) {
    musicResultsContainer.innerHTML = '';
    items.forEach(item => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const thumbnail = item.snippet.thumbnails.default.url;

        const div = document.createElement('div');
        div.className = 'music-result-item';
        div.innerHTML = `
            <img src="${thumbnail}" alt="${title}" />
            <p>${title}</p>
            <button onclick="addToPlaylist('${videoId}', '${title}')">Adicionar</button>
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

function finalize() {
    localStorage.setItem('surpriseRecommendation', surpriseRecommendation.value);
    localStorage.setItem('movies', JSON.stringify(movies));
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('shows', JSON.stringify(shows));
    alert('Tudo salvo! Agora é minha missão pessoal consumir tudo isso e não te decepcionar.');
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
