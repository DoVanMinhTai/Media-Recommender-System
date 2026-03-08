import pandas as pd
import os

from crawl_data import DATA_DIR

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')

df = pd.read_csv(os.path.join(DATA_DIR, 'mediacontent.csv'))
df.drop_duplicates(subset=['movieId'], keep='first', inplace=True)
df.to_csv(os.path.join(DATA_DIR, 'mediacontent_clean.csv'), index=False)