const API_KEY = "cf41a2fa846c4f0f9d545030f19eca35";
const topTickers = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"];

async function getTopMovers() {
    const moversContainer = document.getElementById("movers-container");

    //Creates the cards for each company
    for (const symbol of topTickers) {
        const cardRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);

        const now = Math.floor(Date.now() / 1000);
        const fiveDaysAgo = now - 60 * 60 * 24 * 7; // buffer for weekends
        const candleRes = await fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=5&apikey=${API_KEY}`);

        const cardData = await cardRes.json();
        const candleData = await candleRes.json();

        //Creates the card variable
        const card = document.createElement("div");
        card.innerHTML = `
            <h3>${symbol}</h3>
            <p>Price: $${cardData.c}</p>
            <p>Change: ${cardData.dp.toFixed(2)}%</p>
        `;
        
        card.addEventListener('click', async () => {

            if (!candleData.values) {
                alert("No candlestick data available.");
                return;
            }

            const formatted = candleData.values.reverse().map(day => ({
                x: new Date(day.datetime),
                o: parseFloat(day.open),
                h: parseFloat(day.high),
                l: parseFloat(day.low),
                c: parseFloat(day.close)
            }));

            if (window.currentChart) {
                window.currentChart.destroy();
            }

            const ctx = document.getElementById("candlestickChart").getContext("2d");
            window.currentChart = new CharacterData(ctx, {
                type: 'candlestick',
                data: {
                    datasets: [{
                        label: `${symbol} - Last 5 Days`,
                        data: foramtted
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
document.addEventListener("DOMContentLoaded", function () {
    getTopMovers();
});

function clearInput() {
    document.getElementById('searchInput').value = '';
}