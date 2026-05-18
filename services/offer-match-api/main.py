from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel

app = FastAPI(title="Offer Lanka AI Search API")

@app.get("/health")
def health_check():
    return {"status": "ok"}

class SearchRequest(BaseModel):
    query: str
    lat: float | None = None
    lng: float | None = None
    filters: dict | None = None

@app.post("/v1/search/text")
def search_text(request: SearchRequest):
    # TODO: Implement Algolia/Firestore text search
    return {"results": []}

@app.post("/v1/search/barcode")
def search_barcode(barcode: str, lat: float | None = None, lng: float | None = None):
    # TODO: Implement barcode lookup
    return {"results": []}

@app.post("/v1/search/image")
def search_image():
    # TODO: Implement image upload, OCR, and embedding search
    return {"results": []}
