const apiKey = "NCBDWBN-3HWMK71-M9XMCZS-QGQX57Y";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieIdFromUrl = urlParams.get('id');

    if (movieIdFromUrl) {
        localStorage.setItem('selectedMovieId', movieIdFromUrl);
    }

    const movieId = localStorage.getItem('selectedMovieId');
    if (!movieId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`https://api.kinopoisk.dev/v1.4/movie/${movieId}`, {
            headers: {
                'X-API-KEY': apiKey,
            }
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const movie = await response.json();
        renderMovieInfo(movie);
        shareMovie(movie);

    } catch (error) {
        console.error('Ошибка:', error);
        document.body.innerHTML = `
        <div class="error">
            Не удалось загрузить данные.
            <a href="index.html">Вернуться на главную</a>
        </div>
        `
    }
});

const minToEpisode = (movie) => {
    if (movie.type === "movie") {
        return movie.movieLength ? `${movie.movieLength} Мин` : `Н/Д`;
    } else if (movie.type === "tv-series") {
        return `${movie.seriesLength} Мин серия`;

    }
};

const renderMovieInfo = (movie) => {
    document.querySelector('.info__hero--name').textContent = movie.name;
    document.querySelector('.info__hero--year--p').textContent = movie.year;

    const filmType = document.querySelector('.info__hero--type');
    if (movie.type === "movie") {
        filmType.textContent = 'Фильм';
    } else if (movie.type === 'tv-series') {
        filmType.textContent = 'Сериал';
    }

    const poster = document.querySelector('.info__poster');
    poster.src = movie.poster?.url || '';
    poster.alt = movie.name;

    const textEl = document.querySelector('.info__hero--name');
    const words = textEl.textContent.split(' ');
    if (words.length > 0) {
        const lastWord = words.pop();
        const restOfText = words.join(' ');
        textEl.innerHTML = `${restOfText} <span class="lastWord">${lastWord}</span>`
    }

    document.querySelector('.info__hero--description').textContent = movie.description || 'Описание отсутствует';

    document.querySelector('.info__hero--action__rate--p').textContent = movie.rating?.kp?.toFixed(1) || 'Н/Д';

    const genresContainer = document.querySelector('.info__hero--genre');
    genresContainer.innerHTML = movie.genres?.map(genre => genre.name)
        .join(', ') || '';

    document.querySelector('.info__hero--time--p').textContent = minToEpisode(movie);

    const background = document.querySelector('.fullscreen-background');
    background.src = movie.backdrop?.url || '';

    const trailerBtn = document.querySelector('.info__hero--action__trailer button');


    if (movie.videos && movie.videos.trailers && movie.videos.trailers.length > 0) {
        const trailerUrl = movie.videos.trailers[0].url;

        trailerBtn.addEventListener('click', () => {
            window.open(trailerUrl, '_blank');
        });
    } else {
        trailerBtn.disabled = true;
        trailerBtn.style.opacity = '0.6';
    }

}

const backBtn = document.querySelector('.section__button--back');
backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

function shareMovie(movie) {
    const shareBtn = document.querySelector('.info__hero--action__share');
    shareBtn.addEventListener('click', () => {
        const movieId = localStorage.getItem('selectedMovieId');
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('id', movieId);
        const shareUrl = currentUrl.toString();

        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                const notification = document.createElement('div');
                notification.className = 'share-notification';
                notification.textContent = 'Ссылка скопирована!';
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.remove();
                }, 2000);
            })
            .catch(err => {
                console.error('Ошибка копирования: ', err);
                notification.textContent = 'Ошибка копирования!';
            });
    });
}
