from fastapi import Request
from sqlalchemy.orm import Session
from app.schemas.base import RecommendationItem
import numpy as np

class HybridService:
    def __init__(self, db: Session, model_dir: str):
        self.db = db
        self.model_dir = model_dir

    def hybrid_recommendation(self, request: Request, user_id: int, movie_id: int = None, top_n: int = 10):
        cbf_service = self._get_cbf_service(request)
        cf_service = self._get_cf_service(request)
        
        cbf_recs = []
        cf_recs = []
        
        if cbf_service:
            if movie_id:
                cbf_recs = cbf_service.find_similar_movies(request, movie_id, top_n)
        
        if cf_service and user_id:
            cf_recs = cf_service.collaborative_filtering(request, user_id)
        
        combined_recs = self._combine_recommendations(cbf_recs, cf_recs)
        
        return combined_recs[:top_n]

    def _get_cbf_service(self, request: Request):
        from .cbf_service import ContentBasedService
        return None  

    def _get_cf_service(self, request: Request):
        from .cf_service import CollaborativeService
        return None  

    def _combine_recommendations(self, cbf_recs, cf_recs, cbf_weight=0.3, cf_weight=0.7):
        combined_scores = {}
        
        for rec in cbf_recs:
            movie_id = rec.get('movieId', rec.get('movie_id', None))
            if movie_id:
                score = rec.get('score', 0.0)
                combined_scores[movie_id] = combined_scores.get(movie_id, 0.0) + cbf_weight * score
        
        for rec in cf_recs:
            movie_id = getattr(rec, 'movie_id', None)
            if movie_id:
                score = getattr(rec, 'score', 0.0)
                combined_scores[movie_id] = combined_scores.get(movie_id, 0.0) + cf_weight * score
        
        result = []
        for movie_id, score in sorted(combined_scores.items(), key=lambda x: x[1], reverse=True):
            result.append(RecommendationItem(movie_id=movie_id, score=score))
        
        return result