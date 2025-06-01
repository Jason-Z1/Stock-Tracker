const API_KEY = "d0tti2pr01qlvahea590d0tti2pr01qlvahea59g";
const topTickers = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"];

async function getTopMovers() {
    /*
    const mostUp = await fetch(`https://finnhub.io/api/v1/scan/up?token=${API_KEY}`);
    const upData = await mostUp.json();
    
    console.log("API Raw Response:", upData);
    console.log("Keys:", Object.keys(upData));

    if (!upData.stocks || upData.stocks.length === 0) {
        console.error("No data returned or API limit exceeded.");
        return;
    }

    const moversContainer = document.getElementById("movers-container");

    upData.stocks.slice(0, 5).forEach(stock => {
        const card = document.createElement("div");
        //Retrieves the data from the json file that the API sends
        card.innerHTML = `
            <h3>${stock.s}</h3>
            <p>Price: $${stock.p}</p>
            <p>Change: ${stock.dp.toFixed(2)}%</p>
        `;
        moversContainer.appendChild(card);
    });


    const labels = upData.stocks.slice(0, 5).map(stock => stock.s);
    const percentChanges = upData.stocks.slice(0, 5).map(stock => stock.dp);
    */
    const moversContainer = document.getElementById("movers-container");
    const labels = [];
    const percentChanges = [];

    for(const symbol of topTickers){
        const result = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
        const data = await result.json();

        labels.push(symbol);
        percentChanges.push(data.dp);

        const card = document.createElement("div");
        card.innerHTML = `
            <h3>${symbol}</h3>
            <p>Price: $${data.c}</p>
            <p>Change: ${data.dp.toFixed(2)}%</p>
        `;
        moversContainer.appendChild(card);
    }

    const ctx = document.getElementById("moversChart").getContext("2d");
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Top Gainers % Change',
                data: percentChanges,
                backgroundColor: 'rgba(52, 152, 219, 0.6)'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top Stocks Today'
                }
            }
        }
    });
}
document.addEventListener("DOMContentLoaded", function() {
    getTopMovers();
});

function clearInput() {
    document.getElementById('searchInput').value = '';
}