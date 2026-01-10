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

SYMBOLS = ["APPL", "TSLA", "NVDA", "MSFT", "AMZN"]
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

def main():
    for symbol in SYMBOLS:
        result = get_stock_quote(symbol)
        print(f"Results for {symbol}:")
        print(f"Current Price: {result['c']}")
        print(f"Change: {result['d']}")

    


if __name__ == "__main__":
    main()


