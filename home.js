const API_KEY = "d0tti2pr01qlvahea590d0tti2pr01qlvahea59g";
const topTickers = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"];

const mockCandleData = {
    t: [
        1718496000, // June 16, 2024
        1718582400, // June 17, 2024
        1718668800, // June 18, 2024
        1718755200, // June 19, 2024
        1718841600  // June 20, 2024
    ],
    o: [150, 152, 155, 157, 156], // open prices
    h: [155, 157, 158, 160, 159], // high prices
    l: [149, 150, 153, 155, 154], // low prices
    c: [153, 156, 157, 158, 157], // close prices
    s: "ok"
};

document.addEventListener("DOMContentLoaded", () => {
    getTopMovers();
    renderCandleChart(topTickers[0], mockCandleData);
    getNews();
});


//Search Bar
const searchInput = document.getElementById('searchInput');
const suggestions = document.getElementById('suggestions');


function debounce(fn, delay = 300){
    let timer;
    return(...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this,args), delay);
    };
}

async function fetchSymbolSuggestions(query) {
    const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.result.slice(0, 10);
}

function renderSuggestions(list) {
    if(!list.length){
        suggestions.classList.add('hidden');
        return;
    }
    
    suggestions.innerHTML = list.map((item, idx) => 
        `<li data-symbol="${item.symbol}" ${idx === 0 ? 'class="active"' : ''}>
    <strong>${item.symbol}</strong> - ${item.description}
    </li>`).join('');
    suggestions.classList.remove('hidden');
}

const handleInput = debounce(async e => {
    const q = e.target.value.trim();
    if(q.length < 1) {
        suggestions.classList.add('hidden');
        return;
    }
    
    try {
        const matches = await fetchSymbolSuggestions(q);
        renderSuggestions(matches);
    } catch (err) {
        console.error(err);
    }
}, 300);

searchInput.addEventListener('input', handleInput);

//Mouse Click w/ search bar
suggestions.addEventListener('click', e => {
    const li = e.target.closest('li[data-symbol]');
    if(!li) {
        return;
    }
    selectSymbol(li.dataset.symbol);
});

//Keyboard functions on search bar
searchInput.addEventListener('keydown', e => {
    const rows = [...suggestions.querySelectorAll('li')];
    if (!rows.length) return;

    let idx = rows.findIndex(r => r.classList.contains('active'));

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        rows.forEach(r => r.classList.remove('active'));
        idx = (idx + 1) % rows.length;
        rows[idx].classList.add('active');
        return;
    }

    if (e.key === 'ArrowUp') {
        e.preventDefault();
        rows.forEach(r => r.classList.remove('active'));
        idx = (idx - 1 + rows.length) % rows.length;
        rows[idx].classList.add('active');
        return;
    }

    if (e.key === 'Enter') {
        e.preventDefault();
        // Fallback to first item if none are active
        if (idx === -1) idx = 0;

        if (rows[idx]) {
            const symbol = rows[idx].dataset.symbol;
            if (symbol) {
                selectSymbol(symbol);
            }
        }
    }
});

async function selectSymbol(symbol) {
    searchInput.value = symbol;
    suggestions.classList.add('hidden');

    // Update chart with mock data
    renderCandleChart(symbol, mockCandleData);

    // Show this symbol in the top card section
    const moversContainer = document.getElementById("movers-container");
    moversContainer.innerHTML = ''; // clear existing cards

    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
    const cardData = await res.json();

    const card = document.createElement("div");
    card.innerHTML = `
        <h3>${symbol}</h3>
        <p>Price: $${cardData.c}</p>
        <p>Change: ${cardData.dp.toFixed(2)}%</p>
    `;
    moversContainer.appendChild(card);

    // Load news for the selected stock
    loadNewsForSymbol(symbol);
}

async function loadNewsForSymbol(symbol) {
    const newsContainer = document.getElementById("general-news");
    newsContainer.innerHTML = ''; // Clear current articles

    const res = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=2024-06-01&to=2024-06-30&token=${API_KEY}`);
    const data = await res.json();

    if (!data.length) {
        newsContainer.innerHTML = `<p>No news found for ${symbol}</p>`;
        return;
    }

    data.slice(0, 15).forEach(article => {
        const newsItem = document.createElement("div");
        newsItem.className = "articlePost";
        newsItem.innerHTML = `
            <a href="${article.url}" target="_blank">
                <img src="${article.image}" alt="thumbnail" class="article-img">
                <strong>${article.headline}</strong><br>
                <p>${article.summary || "No summary available."}</p>
                <small>${new Date(article.datetime * 1000).toLocaleString()}</small>
            </a>
        `;
        newsContainer.appendChild(newsItem);
    });
}


//Main page default 5 cards
async function getTopMovers() {
    const moversContainer = document.getElementById("movers-container");

    //Creates the cards for each company
    for (const symbol of topTickers) {
        const cardRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);

        const now = Math.floor(Date.now() / 1000);
        const fiveDaysAgo = now - 60 * 60 * 24 * 31; // 14 days timestamp

        const cardData = await cardRes.json();

        //Creates the card variable
        const card = document.createElement("div");
        card.innerHTML = `
        <h3>${symbol}</h3>
        <p>Price: $${cardData.c}</p>
        <p>Change: ${cardData.dp.toFixed(2)}%</p>
        `;

        card.addEventListener('click', async () => {
            renderCandleChart(symbol, mockCandleData);
        });
        moversContainer.appendChild(card);
    }

}
//Renders the given chart when called
function renderCandleChart(symbol, candleData) {
    const formatted = candleData.t.map((timestamp, i) => ({
                x: new Date(timestamp * 1000),
                y: [mockCandleData.o[i], mockCandleData.h[i], mockCandleData.l[i], mockCandleData.c[i]]
            }));

            console.log("Formatted data:", formatted);

            if (window.currentChart) {
                window.currentChart.destroy();
            }

            const options = {
                chart: {
                    type: 'candlestick',
                    height: 400
                },
                series: [{
                    data: formatted
                }],
                title: {
                    text: `${symbol} - Last 5 Days`,
                    align: 'left'
                },
                xaxis: {
                    type: 'datetime'
                },
                yaxis: {
                    tooltip: {
                        enabled: true
                    }
                }
            };

            window.currentChart = new ApexCharts(document.querySelector("#candlestickChart"), options);
            window.currentChart.render();
}

//Renders the news on the main page after loading the DOM
async function getNews() {
    const newsContainer = document.getElementById("general-news");
    const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${API_KEY}`);
    const newsData = await res.json();
    newsData.slice(0, 15).forEach(article => {
        const newsItem = document.createElement("div");
        newsItem.style.marginBottom = "10px";
        newsItem.className = "articlePost";

        newsItem.innerHTML = `
            <a href="${article.url}" target="_blank">
                <img src="${article.image}" alt="thumbnail" class="article-img">
                <strong>${article.headline}</strong><br>
                <p>${article.summary || "No summary available."} </p>
                <small>${new Date(article.datetime * 1000).toLocaleString()}</small>
            </a>
        `;

        newsContainer.appendChild(newsItem);
    });
}

function clearInput() {
    document.getElementById('searchInput').value = '';
}