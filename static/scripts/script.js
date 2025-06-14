const apiKey = "NCBDWBN-3HWMK71-M9XMCZS-QGQX57Y";
const moviesContainer = document.querySelector('.film__list');
const searchInput = document.getElementById('search');
const searchBtn = document.querySelector('.header__search--button');
let currentSearchQuery = '';

async function fetchMovie() {
    try {
        const response = await fetch(
            `https://api.kinopoisk.dev/v1.4/movie?page=1&limit=20&sortField=votes.kp&sortType=-1`, {
            headers: {
                'X-API-KEY': apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP запроса ${response.status}`);
        }

        const data = await response.json();

        displayMovies(data.docs);

    } catch (Error) {
        moviesContainer.innerHTML = `<div class="errorFilmContainer">
            Не удалось загрузить фильмы: ${Error.message}
            </div>`;
    }
}

function displayMovies(movies) {
    moviesContainer.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = document.createElement('li');
        movieCard.className = 'film__item';

        movieCard.dataset.movieId = movie.id;

        movieCard.innerHTML = `
                <article class="film--card">
                    <div class="film--card__preview">
                        <img class="film--card__preview--image" src="${movie.backdrop?.url || '/static/image/alt.jpg'}"
                            alt="" loading="lazy" />
                    </div>
                    <div class="film--card__down">
                        <div class="film--card__down--primary">
                            <p class="film--card__down--primary--name">${movie.name || 'Н/Д'}</p>
                            <p class="film--card__down--primary--year">${movie.year || 'Н/Д'}</p>
                        </div>
                        <div class="film--card__down--secondary">
                            <p class="film--card__down--secondary--hd">HD</p>
                            <div class="film--card__down--secondary--stats">
                                <div class="film--card__down--secondary--stats--time">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                        viewBox="0 0 24 24">
                                        <path fill="#1DB954"
                                            d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8" />
                                        <path fill="#1DB954"
                                            d="M12.5 7H11v6l5.25 3.15l.75-1.23l-4.5-2.67z" />
                                    </svg>
                                    <p>${minToEpisode(movie) || 'Н/Д'}</p>
                                </div>
                                <div class="film--card__down--secondary--stats--rate">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                        viewBox="0 0 24 24">
                                        <path fill="#1DB954"
                                            d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z" />
                                    </svg>
                                    <p>${movie.rating?.kp?.toFixed(1) || `Н/Д`}</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </article>
                `;

        movieCard.addEventListener('click', () => {

            localStorage.setItem('selectedMovieId', movie.id);
            window.location.href = 'info.html';
        });

        moviesContainer.appendChild(movieCard);
    });


};

const minToEpisode = (movie) => {
    if (movie.type === "movie") {
        return movie.movieLength ? `${movie.movieLength} Мин` : `Н/Д`;
    } else if (movie.type === "tv-series") {
        return `${movie.seriesLength} Мин серия`;

    }
};

async function searchMovies(query) {
    try {
        const response = await fetch(`https://api.kinopoisk.dev/v1.4/movie/search?page=1&limit=20&query=${encodeURIComponent(query)}`,
            {
                headers: {
                    'X-API-KEY': apiKey,
                }
            });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
        if (!data.docs || data.docs.length === 0) {
            moviesContainer.innerHTML = `<div class="no-result">Ничего не найдено</div>`;
            return;
        }
        displayMovies(data.docs);
    } catch (error) {
        moviesContainer.innerHTML = `<div class="error">Ошибка поиска: ${error.message}</div>`
    }
}

searchBtn.addEventListener('click', () => {
    if (searchInput.value.trim()) {
        currentSearchQuery = searchInput.value.trim();
        searchMovies(currentSearchQuery);
    }
});

searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
        currentSearchQuery = searchInput.value.trim();
        searchMovies(currentSearchQuery);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchMovie();
});