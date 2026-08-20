"""FastAPI 入口：A 股数据后端"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import akshare_api

app = FastAPI(title="Economics Web API", description="基于 AKShare 的 A 股数据后端")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ok(data):
    return {"code": 0, "data": data, "message": "ok"}


def fail(msg):
    return {"code": -1, "data": None, "message": msg}


@app.get("/")
def root():
    return {"name": "Economics Web API", "docs": "/docs"}


@app.get("/api/stock/list")
def stock_list():
    try:
        return ok(akshare_api.get_stock_list())
    except Exception as e:
        return fail(str(e))


@app.get("/api/stock/financial/{code}")
def stock_financial(code: str):
    try:
        data = akshare_api.get_financial(code)
        return ok(data)
    except Exception as e:
        return fail(str(e))


@app.get("/api/stock/kline/{code}")
def stock_kline(code: str, start: str = "20240101", end: str = "20241231"):
    try:
        return ok(akshare_api.get_kline(code, start, end))
    except Exception as e:
        return fail(str(e))
