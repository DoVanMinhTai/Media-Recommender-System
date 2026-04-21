import os
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy import create_engine, text
import time
from typing import List, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class CFPrecompute:
    def __init__(self, db_url: str):
        self.engine = create_engine(db_url)
        
    def load_ratings(self) -> pd.DataFrame:
        query = "SELECT user_id, mediacontent_id as movie_id, score as rating FROM ratings"
        return pd.read_sql(query, self.engine)
    
    def compute_item_similarity(self, ratings_df: pd.DataFrame, top_k: int = 100) -> List[Tuple]:
        print(f"Creating ratings matrix for {len(ratings_df)} ratings...")
        ratings_matrix = ratings_df.pivot_table(
            index='user_id',
            columns='movie_id',
            values='rating',
            fill_value=0
        )
        
        print(f"Matrix shape: {ratings_matrix.shape} (Users x Movies)")
        print("Computing cosine similarity (Item-Item)...")
        
        item_similarity = cosine_similarity(ratings_matrix.T)
        
        print(f"Extracting top-{top_k} similar items per movie...")
        similarities = []
        movie_ids = ratings_matrix.columns.tolist()
        
        for i, movie_id_1 in enumerate(movie_ids):
            sim_scores = item_similarity[i]
            top_indices = np.argsort(sim_scores)[::-1]
            
            count = 0
            for idx in top_indices:
                if count >= top_k: break
                movie_id_2 = movie_ids[idx]
                if movie_id_1 == movie_id_2: continue 
                
                similarity = float(sim_scores[idx])
                if similarity > 0.01:
                    similarities.append((int(movie_id_1), int(movie_id_2), similarity))
                    count += 1
            
            if (i + 1) % 500 == 0:
                print(f"Processed {i+1}/{len(movie_ids)} movies...")
        
        return similarities
    
    def batch_insert_similarities(self, similarities: List[Tuple], method: str = 'item_cf', batch_size: int = 5000):
        print(f"Inserting {len(similarities)} similarity pairs into PostgreSQL...")
        
        with self.engine.connect() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS item_similarity (
                    movie_id_1 INTEGER NOT NULL,
                    movie_id_2 INTEGER NOT NULL,
                    similarity FLOAT NOT NULL,
                    method VARCHAR(50) DEFAULT 'item_cf',
                    computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (movie_id_1, movie_id_2, method)
                )
            """))
            conn.execute(text(f"DELETE FROM item_similarity WHERE method = '{method}'"))
            conn.commit()
        
        df = pd.DataFrame(similarities, columns=['movie_id_1', 'movie_id_2', 'similarity'])
        df['method'] = method
        
        df.to_sql('item_similarity', self.engine, if_exists='append', index=False, chunksize=batch_size)
        
        print("Database sync complete!")
    
    def run_full_precompute(self, top_k: int = 100):
        start_time = time.time()
        
        try:
            ratings_df = self.load_ratings()
            if ratings_df.empty:
                print("No ratings found in database.")
                return

            similarities = self.compute_item_similarity(ratings_df, top_k)
            self.batch_insert_similarities(similarities, method='item_cf')
            
            duration = int(time.time() - start_time)
            print(f"=== Pre-computation Success ({duration}s) ===")
            
        except Exception as e:
            print(f"Error during pre-compute: {e}")
    
def main():
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
    DB_URL = os.getenv("DATABASE_URL")
    if not DB_URL:
        print("Error: DATABASE_URL not found in environment.")
        return
        
    cf = CFPrecompute(DB_URL)
    cf.run_full_precompute(top_k=50)

if __name__ == "__main__":
    main()
