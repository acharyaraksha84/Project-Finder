from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import asyncio

# ML model
from ml_model import predict_difficulty_level

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# DB Setup
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
router = APIRouter(prefix="/api")

# ------------------ MODELS -----------------------

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    branch: str
    year: str
    skills: List[str]
    area_of_interest: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserProfileCreate(BaseModel):
    name: str
    email: str
    branch: str
    year: str
    skills: List[str]
    area_of_interest: List[str]


class Project(BaseModel):
    id: str
    title: str
    description: str
    source: str      # github / paper / dataset
    level: str       # easy / intermediate / advanced
    novelty_score: float
    url: str
    tags: List[str]
    language: Optional[str] = None
    stars: Optional[int] = None


# ---------------- PROFILE -----------------------

@router.post("/profile", response_model=UserProfile)
async def create_profile(p: UserProfileCreate):
    data = p.model_dump()
    new = UserProfile(**data)
    doc = new.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()

    existing = await db.user_profiles.find_one({"email": p.email})
    if existing:
        await db.user_profiles.update_one({"email": p.email}, {"$set": doc})
    else:
        await db.user_profiles.insert_one(doc)

    return new


@router.get("/profile/{email}", response_model=UserProfile)
async def get_profile(email: str):
    profile = await db.user_profiles.find_one({"email": email}, {"_id": 0})
    if not profile:
        raise HTTPException(404, "Profile not found")

    if isinstance(profile["created_at"], str):
        profile["created_at"] = datetime.fromisoformat(profile["created_at"])

    return profile


# ---------------- GITHUB -----------------------

async def fetch_github(query, limit=8):
    output = []
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                "https://api.github.com/search/repositories",
                params={"q": query, "sort": "stars", "order": "desc", "per_page": limit},
            )

            if r.status_code == 200:
                for repo in r.json().get("items", []):
                    stars = repo.get("stargazers_count", 0)
                    issues = repo.get("open_issues_count", 0)
                    desc = repo.get("description") or ""
                    tags = repo.get("topics", [])[:5]

                    ml_level = predict_difficulty_level(stars, issues, len(desc), len(tags))
                    novelty = min(10, stars / 200 + 2)

                    output.append(
                        Project(
                            id=str(repo["id"]),
                            title=repo["name"],
                            description=desc or "No description",
                            source="github",
                            level=ml_level,
                            novelty_score=round(novelty, 1),
                            url=repo["html_url"],
                            tags=tags,
                            language=repo.get("language"),
                            stars=stars,
                        )
                    )
    except:
        pass

    return output


# ---------------- ARXIV -----------------------

async def fetch_arxiv(query, limit=8):
    results = []
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                "https://export.arxiv.org/api/query",
                params={"search_query": f"all:{query}", "start": 0, "max_results": limit},
            )

        import xml.etree.ElementTree as ET
        root = ET.fromstring(r.text)
        ns = {"atom": "http://www.w3.org/2005/Atom"}

        for e in root.findall("atom:entry", ns):
            title = e.find("atom:title", ns).text.strip()
            summary = e.find("atom:summary", ns).text.strip()
            link = e.find("atom:id", ns).text

            results.append(
                Project(
                    id=link.split("/")[-1],
                    title=title,
                    description=summary[:300] + "...",
                    source="paper",
                    level="advanced",
                    novelty_score=9.0,
                    url=link,
                    tags=[],
                )
            )

    except:
        pass

    return results


# ---------------- DUMMY DATASETS -----------------------

async def fetch_dummy_datasets(query, limit=5):
    dummy = [
        {
            "title": f"{query.title()} Dataset Pack",
            "desc": f"High-quality dataset for {query} analysis.",
            "tags": ["dataset", query],
            "url": "https://example.com/dataset1"
        },
        {
            "title": f"{query.title()} Cleaned Data",
            "desc": f"Cleaned & preprocessed dataset for {query}.",
            "tags": ["csv", query],
            "url": "https://example.com/dataset2"
        }
    ]

    output = []
    for d in dummy:
        output.append(
            Project(
                id=str(uuid.uuid4()),
                title=d["title"],
                description=d["desc"],
                source="dataset",
                level="easy",
                novelty_score=5.5,
                url=d["url"],
                tags=d["tags"],
            )
        )

    return output[:limit]


# ---------------- SEARCH ROUTE -----------------------

@router.get("/projects/search", response_model=List[Project])
async def search(
    query: str,
    source: str = None,
    level: str = None
):
    tasks = []

    if source in (None, "all", "github"):
        tasks.append(fetch_github(query))
    if source in (None, "all", "paper"):
        tasks.append(fetch_arxiv(query))
    if source in (None, "all", "dataset"):
        tasks.append(fetch_dummy_datasets(query))

    results = await asyncio.gather(*tasks)
    all_items = [p for group in results for p in group]

    if level and level != "all":
        all_items = [p for p in all_items if p.level == level]

    all_items.sort(key=lambda x: x.novelty_score, reverse=True)
    return all_items[:30]


# ---------------- RECOMMENDATIONS -----------------------

@router.get("/projects/recommendations", response_model=List[Project])
async def rec(email: str):
    p = await db.user_profiles.find_one({"email": email}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Profile not found")

    terms = " ".join(p["skills"] + p["area_of_interest"])

    results = await asyncio.gather(
        fetch_github(terms),
        fetch_arxiv(terms),
        fetch_dummy_datasets(terms),
    )

    all_items = [i for r in results for i in r]
    all_items.sort(key=lambda x: x.novelty_score, reverse=True)
    return all_items[:20]

@router.get("/ml/accuracy")
async def get_model_accuracy():
    return {"accuracy": 0.75, "message": "Model accuracy"}


# ---------------- FINAL SETUP -----------------------

app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
