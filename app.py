from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize

app = FastAPI(title="Course Recommender")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class CourseRecommender:
    def __init__(self):
        self.sparse_matrix = None
        self.course_ids = None
        self.course_titles = None
        self.genre_names = None
        self.course_df = None
        self.is_fitted = False

    def load_data_csv(self, csv_file: str):
        self.course_df = pd.read_csv(csv_file)
        self.course_ids = self.course_df['COURSE_ID'].tolist()
        self.course_titles = self.course_df['TITLE'].tolist()
        genre_df = self.course_df.iloc[:, 2:]
        self.genre_names = genre_df.columns.tolist()
        self.sparse_matrix = csr_matrix(genre_df.values)

    def preprocess(self):
        self.sparse_matrix = normalize(self.sparse_matrix, norm='l2', axis=1)
        self.is_fitted = True

    def recommend(self, selected_courses: List[str], n_recommendations: int = 5):
        selected_idx = [self.course_ids.index(course) for course in selected_courses]
        user_profile = np.asarray(self.sparse_matrix[selected_idx].mean(axis=0)).ravel()
        scores = cosine_similarity(user_profile.reshape(1, -1), self.sparse_matrix).flatten()
        for idx in selected_idx:
            scores[idx] = -1
        top_indices = np.argsort(scores)[::-1][:n_recommendations]
        recommendations = []
        for i in top_indices:
            if scores[i] > 0:
                recommendations.append((self.course_ids[i], self.course_titles[i], scores[i]))
        return recommendations[:n_recommendations]


print("Loading courses from CSV...")
rec = CourseRecommender()
rec.load_data_csv('course_genre.csv')
rec.preprocess()
print(f"READY: {len(rec.course_ids)} courses loaded!")


@app.get("/courses")
async def get_courses():
    courses = [{"id": cid, "title": title} for cid, title in zip(rec.course_ids, rec.course_titles)]
    return {"courses": courses}


@app.post("/recommend")
async def get_recommendations(selected_courses: List[str], n: int = 5):
    n = max(1, min(10, n))
    recommendations = rec.recommend(selected_courses, n_recommendations=n)
    return {
        "recommendations": [
            {"course_id": cid, "title": title, "score": float(score)}
            for cid, title, score in recommendations
        ]
    }


if __name__ == "__main__":
    import uvicorn
    print("Server LIVE at http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)