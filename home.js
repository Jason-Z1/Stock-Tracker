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

async function getTopMovers() {
    const moversContainer = document.getElementById("movers-container");

    //Creates the cards for each company
    for (const symbol of topTickers) {
        const cardRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);

        const now = Math.floor(Date.now() / 1000);
        const fiveDaysAgo = now - 60 * 60 * 24 * 31; // 14 days timestamp
        const candleRes = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${fiveDaysAgo}&to=${now}&token=${API_KEY}`);

        const cardData = await cardRes.json();
        const candleData = await candleRes.json();

        //Logging data (debug)
        console.log("Candle API response:", candleData);

        //Creates the card variable
        const card = document.createElement("div");
        card.innerHTML = `
        <h3>${symbol}</h3>
        <p>Price: $${cardData.c}</p>
        <p>Change: ${cardData.dp.toFixed(2)}%</p>
        `;

        card.addEventListener('click', async () => {

            if (!candleData || candleData.s !== "ok" || !candleData.t || candleData.t.length === 0) {
                alert("No candlestick data available.");
                return;
            }

            const formatted = candleData.t.map((timestamp, i) => ({
                x: new Date(timestamp * 1000),
                o: candleData.o[i],
                h: candleData.h[i],
                l: candleData.l[i],
                c: candleData.c[i]
            }));

            if (window.currentChart) {
                window.currentChart.destroy();
            }

            const ctx = document.getElementById("candlestickChart").getContext("2d");
            window.currentChart = new Chart(ctx, {
                type: 'candlestick',
                data: {
                    datasets: [{
                        label: `${symbol} - Last 5 Days`,
                        data: formatted
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            ticks: { autoSkip: true },
                            type: 'time',
                            time: { unit: 'day' }
                        }
                    }
                }
            });
        });

        moversContainer.appendChild(card);
    }
}

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

document.addEventListener("DOMContentLoaded", function () {
    getTopMovers();
    getNews();
});

function clearInput() {
    document.getElementById('searchInput').value = '';
}