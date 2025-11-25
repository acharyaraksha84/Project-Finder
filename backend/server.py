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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
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
    source: str  # github, paper, dataset
    level: str  # easy, intermediate, advanced
    novelty_score: float
    url: str
    tags: List[str]
    language: Optional[str] = None
    stars: Optional[int] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "Project Finder API"}

@api_router.post("/profile", response_model=UserProfile)
async def create_profile(profile: UserProfileCreate):
    profile_dict = profile.model_dump()
    profile_obj = UserProfile(**profile_dict)
    
    doc = profile_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    # Check if email already exists
    existing = await db.user_profiles.find_one({"email": profile.email}, {"_id": 0})
    if existing:
        # Update existing profile
        await db.user_profiles.update_one(
            {"email": profile.email},
            {"$set": doc}
        )
    else:
        await db.user_profiles.insert_one(doc)
    
    return profile_obj

@api_router.get("/profile/{email}", response_model=UserProfile)
async def get_profile(email: str):
    profile = await db.user_profiles.find_one({"email": email}, {"_id": 0})
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if isinstance(profile['created_at'], str):
        profile['created_at'] = datetime.fromisoformat(profile['created_at'])
    
    return profile

async def fetch_github_projects(query: str, limit: int = 10) -> List[Project]:
    """Fetch projects from GitHub API"""
    projects = []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"https://api.github.com/search/repositories",
                params={
                    "q": query,
                    "sort": "stars",
                    "order": "desc",
                    "per_page": limit
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                for repo in data.get('items', [])[:limit]:
                    # Determine level based on stars and complexity
                    stars = repo.get('stargazers_count', 0)
                    if stars < 100:
                        level = "easy"
                    elif stars < 1000:
                        level = "intermediate"
                    else:
                        level = "advanced"
                    
                    # Calculate novelty score (0-10)
                    novelty = min(10, (stars / 1000) * 5 + (repo.get('open_issues_count', 0) / 100) * 3 + 2)
                    
                    projects.append(Project(
                        id=str(repo['id']),
                        title=repo['name'],
                        description=repo['description'] or "No description available",
                        source="github",
                        level=level,
                        novelty_score=round(novelty, 1),
                        url=repo['html_url'],
                        tags=repo.get('topics', [])[:5],
                        language=repo.get('language'),
                        stars=stars
                    ))
    except Exception as e:
        logging.error(f"Error fetching GitHub projects: {e}")
    
    return projects

async def fetch_arxiv_papers(query: str, limit: int = 10) -> List[Project]:
    """Fetch research papers from arXiv API"""
    projects = []
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://export.arxiv.org/api/query",
                params={
                    "search_query": f"all:{query}",
                    "start": 0,
                    "max_results": limit,
                    "sortBy": "relevance",
                    "sortOrder": "descending"
                }
            )
            
            if response.status_code == 200:
                import xml.etree.ElementTree as ET
                root = ET.fromstring(response.text)
                
                namespace = {'atom': 'http://www.w3.org/2005/Atom'}
                
                for entry in root.findall('atom:entry', namespace)[:limit]:
                    title = entry.find('atom:title', namespace)
                    summary = entry.find('atom:summary', namespace)
                    link = entry.find('atom:id', namespace)
                    published = entry.find('atom:published', namespace)
                    
                    # Determine level and novelty based on recency and complexity
                    year = int(published.text[:4]) if published is not None else 2020
                    novelty = min(10, ((year - 2020) / 5) * 5 + 5)
                    
                    if novelty > 7:
                        level = "advanced"
                    elif novelty > 5:
                        level = "intermediate"
                    else:
                        level = "easy"
                    
                    categories = [cat.get('term', '') for cat in entry.findall('atom:category', namespace)][:3]
                    
                    projects.append(Project(
                        id=link.text.split('/')[-1] if link is not None else str(uuid.uuid4()),
                        title=title.text.strip() if title is not None else "Untitled",
                        description=summary.text.strip()[:300] + "..." if summary is not None else "No summary available",
                        source="paper",
                        level=level,
                        novelty_score=round(novelty, 1),
                        url=link.text if link is not None else "",
                        tags=categories
                    ))
    except Exception as e:
        logging.error(f"Error fetching arXiv papers: {e}")
    
    return projects

async def fetch_dataset_projects(query: str, limit: int = 10) -> List[Project]:
    """Fetch dataset projects (mock data for MVP)"""
    # Mock dataset projects with realistic data
    datasets = [
        {
            "title": f"{query.title()} Dataset Collection",
            "description": f"Comprehensive dataset for {query} research with over 10,000 samples, preprocessed and ready for machine learning applications.",
            "level": "intermediate",
            "novelty": 7.5,
            "tags": ["dataset", query.lower(), "ml", "data-science"]
        },
        {
            "title": f"{query.title()} Time Series Data",
            "description": f"Historical time series data for {query} analysis, spanning multiple years with detailed annotations.",
            "level": "easy",
            "novelty": 6.2,
            "tags": ["time-series", query.lower(), "csv"]
        },
        {
            "title": f"Large-Scale {query.title()} Benchmark",
            "description": f"Industry-standard benchmark dataset for {query} with evaluation metrics and baseline models.",
            "level": "advanced",
            "novelty": 8.7,
            "tags": ["benchmark", query.lower(), "research"]
        }
    ]
    
    projects = []
    for i, ds in enumerate(datasets[:limit]):
        projects.append(Project(
            id=str(uuid.uuid4()),
            title=ds["title"],
            description=ds["description"],
            source="dataset",
            level=ds["level"],
            novelty_score=ds["novelty"],
            url=f"https://example.com/datasets/{i+1}",
            tags=ds["tags"]
        ))
    
    return projects

@api_router.get("/projects/search", response_model=List[Project])
async def search_projects(
    query: str = Query(..., description="Search query"),
    source: Optional[str] = Query(None, description="Filter by source: github, paper, dataset, or all"),
    level: Optional[str] = Query(None, description="Filter by level: easy, intermediate, advanced")
):
    """Search projects from multiple sources"""
    all_projects = []
    
    # Fetch from all sources concurrently
    tasks = []
    if source is None or source == "all" or source == "github":
        tasks.append(fetch_github_projects(query, 8))
    if source is None or source == "all" or source == "paper":
        tasks.append(fetch_arxiv_papers(query, 8))
    if source is None or source == "all" or source == "dataset":
        tasks.append(fetch_dataset_projects(query, 5))
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for result in results:
        if isinstance(result, list):
            all_projects.extend(result)
    
    # Filter by level if specified
    if level and level != "all":
        all_projects = [p for p in all_projects if p.level == level]
    
    # Sort by novelty score
    all_projects.sort(key=lambda x: x.novelty_score, reverse=True)
    
    return all_projects[:30]

@api_router.get("/projects/recommendations", response_model=List[Project])
async def get_recommendations(email: str = Query(..., description="User email")):
    """Get personalized project recommendations based on user profile"""
    # Get user profile
    profile = await db.user_profiles.find_one({"email": email}, {"_id": 0})
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found. Please create a profile first.")
    
    # Build search query from user interests and skills
    interests = profile.get('area_of_interest', [])
    skills = profile.get('skills', [])
    
    # Combine interests and skills for search
    search_terms = ' '.join(interests + skills)
    
    if not search_terms:
        search_terms = "programming"
    
    # Fetch projects from all sources
    tasks = [
        fetch_github_projects(search_terms, 10),
        fetch_arxiv_papers(search_terms, 10),
        fetch_dataset_projects(search_terms, 5)
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    all_projects = []
    for result in results:
        if isinstance(result, list):
            all_projects.extend(result)
    
    # Sort by novelty score
    all_projects.sort(key=lambda x: x.novelty_score, reverse=True)
    
    return all_projects[:25]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()