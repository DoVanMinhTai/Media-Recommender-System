from typing import List, Optional, Generator
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from opensearchpy import OpenSearch
from app.services.cbf_service import ContentBasedService
from app.services.embed_service import EmbeddingProvider
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def get_es_client() -> OpenSearch:
    hosts = [{"host": settings.es_host, "port": 443}]
    auth = (settings.es_username, settings.es_password)
    return OpenSearch(
        hosts=hosts,
        http_auth=auth,
        use_ssl=True,
        verify_certs=True,
        ssl_assert_hostname=False,
        ssl_show_warn=False,
    )

def get_embedding_provider() -> EmbeddingProvider:
    return EmbeddingProvider()

def get_cbf_service(
    es_client: OpenSearch = Depends(get_es_client),
    embedding_provider: EmbeddingProvider = Depends(get_embedding_provider)
) -> ContentBasedService:
    return ContentBasedService(es_client, embedding_provider)

router = APIRouter(prefix="/cbf", tags=["Content-Based Filtering"])

@router.get("/similar/{movie_id}")
async def get_similar_movies(
    movie_id: int = Path(..., ge=1),
    top_n: int = Query(10, ge=1, le=50),
    service: ContentBasedService = Depends(get_cbf_service)
):
    try:
        return await service.find_similar_movies(movie_id, top_n)
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_movies_by_text(
    query: str = Query(..., min_length=3),
    top_n: int = Query(10, ge=1),
    service: ContentBasedService = Depends(get_cbf_service)
):
    try:
        return await service.search_by_text(query, top_n)
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending")
async def get_trending_movies(
    top_n: int = Query(10, ge=1),
    service: ContentBasedService = Depends(get_cbf_service)
):
    return await service.get_trending(top_n)

@router.get("/health")
async def health_check(service: ContentBasedService = Depends(get_cbf_service)):
    try:
        es_health = service.es.cluster.health()
        return {
            "status": "healthy",
            "elasticsearch": es_health['status'],
            "mode": "No-DB (Elasticsearch Only)"
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
