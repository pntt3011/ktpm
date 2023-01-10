import uvicorn

from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from config import settings
from nodes import nodes
from json2torch.node_manager import NodeManager

FILE = Path(__file__).resolve()
ROOT = FILE.parent


app = FastAPI()
app.mount("/static", StaticFiles(directory=ROOT / "static"))


@app.get("/", response_class=HTMLResponse)
async def home():
    with open(ROOT / "templates/index.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=200)


@app.get("/nodes", response_class=JSONResponse)
async def get_nodes():
    return JSONResponse(nodes, status_code=200)


@app.post("/export", response_class=JSONResponse)
async def export_graph(nodes: list):
    nm = NodeManager(json_data=nodes, name='ResNet', key_field='id')
    code = nm.export_code()
    return JSONResponse({"result": code}, status_code=200)


if __name__ == "__main__":
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
