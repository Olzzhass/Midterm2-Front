const API_KEY = '3f867fec7a79bb76cd2a1eead59d8a33';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const moviesGrid = document.getElementById('movies-grid');
const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');
const movieModal = document.getElementById('movie-modal');
const movieDetails = document.getElementById('movie-details');
const bookmarkBtn = document.getElementById("heart");
const sortSelect = document.getElementById('sort-select');

let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        const query = searchInput.value;
        if (query) {
            searchMovies();
        }
    });
}

if(searchInput) {
    searchInput.addEventListener('input', () => {
        if (searchInput.value) {
            fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${searchInput.value}`)
                .then(response => response.json())
                .then(data => showSuggestions(data.results));
        } else {
            suggestions.style.display = 'none';
        }
    });
}

function showSuggestions(movies) {
    suggestions.innerHTML = '';
    suggestions.style.display = 'block';
    movies.slice(0, 5).forEach(movie => {
        const div = document.createElement('div');
        div.innerText = movie.title;
        div.addEventListener('click', () => {
            searchInput.value = movie.title;
            searchMovies();
            suggestions.style.display = 'none';
        });
        suggestions.appendChild(div);
    });
}

function hideAutocompleteResults(event) {
    if (!suggestions.contains(event.target) && event.target !== searchInput) {
        suggestions.innerHTML = "";
    }
}

function searchMovies() {
    const query = searchInput.value;
    fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`)
        .then(response => response.json())
        .then(data => displayMovies(data.results));
}

function displayMovies(movies) {
    const sortBy = sortSelect.value;

    movies.sort((a, b) => {
        if (sortBy === 'popularity') {
            return b.popularity - a.popularity;
        } else if (sortBy === 'release_date') {
            return new Date(b.release_date) - new Date(a.release_date);
        } else if (sortBy === 'vote_average') {
            return b.vote_average - a.vote_average;
        }
    });

    moviesGrid.innerHTML = '';
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        movieCard.innerHTML = `
            <img src="${IMG_URL}${movie.poster_path}" alt="${movie.title}">
            <div class="movie-info">
                <div>
                    <h3>${movie.title}</h3>
                    <p>Rating: ${movie.vote_average}</p>
                    <p>Release date: ${movie.release_date}</p>
                </div>
                <i class="fa ${isInWatchlist(movie.id) ? 'fa-bookmark' : 'fa-bookmark-o'} bookmark" 
                       onclick="toggleWatchlist(event, ${movie.id}, '${movie.title}', '${movie.poster_path}', this)"></i>
            </div>
        `;
        movieCard.addEventListener('click', () => openMovieModal(movie.id));
        moviesGrid.appendChild(movieCard);
    });
}

function isInWatchlist(movieId) {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || {};
    return movieId in watchlist;
}

function toggleWatchlist(event, movieId, title, image, icon) {
    event.stopPropagation();

    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || {};
    
    if(watchlist[movieId]) {
        delete watchlist[movieId];
        icon.classList.remove("fa-bookmark");
        icon.classList.add("fa-bookmark-o");
    } else {
        watchlist[movieId] = {id: movieId, title, image};
        icon.classList.remove("fa-bookmark-o");
        icon.classList.add("fa-bookmark");
    }

    localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

function openMovieModal(movieId) {
    fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos,reviews`)
        .then(response => response.json())
        .then(movie => {
            movieDetails.innerHTML = `
                <div class="img-cnt">
                    <img class="movieDetails-img" src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
                </div>
                <h2>${movie.title}</h2>
                <p>${movie.overview}</p>
                <p>Rating: ${movie.vote_average}</p>
                <p>Runtime: ${movie.runtime} mins</p>
                <h3>Cast:</h3>
                <ul>${movie.credits.cast.slice(0, 5).map(actor => `<li>${actor.name}</li>`).join('')}</ul>
            `;
            movieModal.style.display = 'flex';
        });
}

function loadWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || {};
    displayMovies(Object.values(watchlist));
}

function openWatchlistPage() {
    window.location.href = "/MoviesApp/watchlist.html"
}

function goToSearchPage() {
    window.location.href = "/MoviesApp/index.html";
}

function closeModal() {
    movieModal.style.display = 'none';
}

window.addEventListener("load", () => {
    if (window.location.pathname.endsWith("watchlist.html")) {
        loadWatchlist();
    }
});

if(bookmarkBtn) {
    bookmarkBtn.addEventListener("click", openWatchlistPage);
}

document.addEventListener("click", hideAutocompleteResults);