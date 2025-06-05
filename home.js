const API_KEY = "d0tti2pr01qlvahea590d0tti2pr01qlvahea59g";
const topTickers = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"];

async function getTopMovers() {
    const moversContainer = document.getElementById("movers-container");
    
    //Creates the cards for each company
    for(const symbol of topTickers){
        const cardRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
        const candleRes = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&count=5&token=${API_KEY}`);
        const cardData = await cardRes.json();
        const candleData = await candleRes.json();

        //Creates the card variable
        const card = document.createElement("div");
        card.innerHTML = `
            <h3>${symbol}</h3>
            <p>Price: $${cardData.c}</p>
            <p>Change: ${cardData.dp.toFixed(2)}%</p>
            <canvas id="chart-${symbol}" width="140" height="100></canvas>
        `;
        moversContainer.appendChild(card);

        //Running the candle data
        const formatted = candleData.t.map((timestamp, i) => ({
            x: new Date(timestamp * 1000),
            o: candleData.o[i],
            h: candleData.h[i],
            l: candleData.l[i],
            c: candleData.c[i],
        }));

        const ctx = document.getElementById(`chart-${symbol}`).getContext("2d");
        new Chart(ctx, {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: `${symbol} - Last 5 Days`,
                    data: formatted,
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: '#fff',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {autoSkip: true, maxTicksLimit: 5},
                        time: {unit: 'day'},
                        type: 'time'
                    },
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

}
document.addEventListener("DOMContentLoaded", function() {
    getTopMovers();
});

function clearInput() {
    document.getElementById('searchInput').value = '';
}