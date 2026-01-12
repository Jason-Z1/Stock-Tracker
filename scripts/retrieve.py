import time
import os
from datetime import datetime, timezone

import requests
from pathlib import Path
from dotenv import load_dotenv
import sqlite3

load_dotenv(Path(__file__).with_name(".env"))
base_url = "https://finnhub.io/api/v1"

API_KEY = os.getenv("API_KEY")
if not API_KEY:
    raise RuntimeError("Missing API_KEY in .env")

SYMBOLS = ["AAPL", "TSLA", "NVDA", "MSFT", "AMZN"]
OUT_FILE = "data/all"



def get_stock_quote(symbol: str):
    url = f"{base_url}/quote"
    params = {
        "symbol": symbol,
        "token": API_KEY
    }
    response = requests.get(url, params=params)
    return response.json()

def get_company_prof(symbol: str):
    url = f"{base_url}/stock/profile2"
    params = {
        "symbol": symbol,
        "token": API_KEY
    }
    response = requests.get(url, params=params)
    return response.json()

def get_company_news(symbol: str, startTime: str, endTime:  str):
    url = f"{base_url}/company-news"
    params = {
        "symbol": symbol,
        "from": startTime,
        "to": endTime,
        "token": API_KEY
    }
    response = requests.get(url, params=params)
    return response.json()


def main():
    for symbol in SYMBOLS:
        result = get_stock_quote(symbol)
        print(f"Results for {symbol}: {result}")
        print(f"Current Price: {result['c']}")
        print(f"Change: {result['d']}")

        """
        Don't have access
        result = get_company_prof(symbol)
        print(f"JSON Data: {result}")
        print(f"\nCountry: {result["country"]}")
        print(f"Currency: {result["currency"]}")
        print(f"Name: {result["name"]}")
        """

        result = get_company_news(symbol, "2025-12-01", "2025-12-31")
        #print(f"Company news: {result}")
        first_article = result[0]
        print(f"\nHeadline: {first_article["headline"]}")
        print(f"ID: {first_article["id"]}")
        print(f"Related: {first_article["related"]}")
        print(f"URL: {first_article["url"]}\n")

    


if __name__ == "__main__":
    main()


