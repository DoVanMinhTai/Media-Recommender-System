from typing import List, Any, Optional, Dict
from app.schemas.recommendation import (
    PersonalizedResponse,
    RecommendationItem,
    SimilarUsersResponse,
    UserRecommendationRequest
)
from app.constants.cf_queries import CollaborativeQueries, CFStrategy
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CollaborativeService:
    def __init__(self, es_client=None):
        self.es = es_client
    
    async def get_user_recommendations(self, user_id: int, top_n: int = 10) -> PersonalizedResponse:
        logger.warning(f"CF requested for user {user_id} but DB is disabled. Falling back to popularity.")
        
        return PersonalizedResponse(
            strategy=CFStrategy.COLLABORATIVE,
            recommendations=[]
        )
    
    async def get_item_based_similar(self, movie_id: int, top_n: int = 10) -> PersonalizedResponse:
        return PersonalizedResponse(
            strategy=CFStrategy.ITEM_BASED,
            recommendations=[]
        )
