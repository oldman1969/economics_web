# Economics Web 后端

基于 FastAPI + AKShare 的 A 股数据后端，用来补上前端拿不到的财务数据、解决限流和 CORS。

## 启动

```bash
cd server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 接口

启动后访问 `http://localhost:8000/docs` 查看自动生成的接口文档。

- `GET /api/stock/list` — 全市场 A 股列表（行情 + 估值）
- `GET /api/stock/financial/{code}` — 个股财务指标（如 `/api/stock/financial/600519`）
- `GET /api/stock/kline/{code}` — 个股日 K（前复权，可加 `start`/`end` 参数）

## 说明

- 已开 CORS，前端可直接跨域调用
- AKShare 底层是爬虫，字段名偶尔变动，接口已用 `.get()` 容错
- 统一返回格式：`{ "code": 0, "data": ..., "message": "ok" }`
