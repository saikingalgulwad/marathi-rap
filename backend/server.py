from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')

# Security
security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    auth_provider: str = "email"  # email, google, linkedin

class Resume(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    full_name: str
    email: str
    phone: str
    title: str
    summary: str
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    skills: List[str] = []
    ai_suggestions: Optional[Dict[str, Any]] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ResumeCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    title: str
    summary: str
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    skills: List[str] = []

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    location: str
    description: str
    requirements: List[str]
    salary_range: Optional[str] = None
    job_type: str  # full-time, part-time, contract
    source: str  # LinkedIn, Indeed, Naukri
    posted_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    match_score: Optional[float] = None

class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    job_id: str
    resume_id: str
    status: str = "submitted"  # submitted, interview, rejected, accepted
    applied_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    notes: Optional[str] = None

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    message: str
    type: str  # application, match, system
    read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AutoApplySettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    enabled: bool = False
    min_match_score: float = 70.0
    job_types: List[str] = ["full-time"]
    locations: List[str] = []
    max_applications_per_day: int = 10

# ============= HELPER FUNCTIONS =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============= AI FUNCTIONS =============

async def optimize_resume_with_ai(resume_data: dict) -> dict:
    """Use GPT-5 to analyze and suggest resume improvements"""
    try:
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=f"resume_{uuid.uuid4()}",
            system_message="You are an expert resume reviewer and career advisor. Provide specific, actionable suggestions to improve resumes."
        ).with_model("openai", "gpt-5")
        
        resume_text = f"""
Resume:
Name: {resume_data.get('full_name')}
Title: {resume_data.get('title')}
Summary: {resume_data.get('summary')}
Skills: {', '.join(resume_data.get('skills', []))}
Experience: {resume_data.get('experience')}
Education: {resume_data.get('education')}
"""
        
        message = UserMessage(
            text=f"Analyze this resume and provide 5 specific improvements. Return as JSON with keys: summary_improvement, skills_to_add, experience_tips, overall_score (0-100), action_items (array). {resume_text}"
        )
        
        response = await chat.send_message(message)
        
        # Try to parse as JSON, fallback to text
        import json
        try:
            suggestions = json.loads(response)
        except:
            suggestions = {
                "summary_improvement": response[:200],
                "skills_to_add": [],
                "experience_tips": "Review the AI feedback",
                "overall_score": 75,
                "action_items": ["Review AI suggestions"]
            }
        
        return suggestions
    except Exception as e:
        logging.error(f"AI optimization error: {e}")
        return {
            "summary_improvement": "Unable to generate suggestions at this time",
            "skills_to_add": [],
            "experience_tips": "Try again later",
            "overall_score": 70,
            "action_items": []
        }

async def calculate_job_match_score(resume: dict, job: dict) -> float:
    """Calculate match score between resume and job using AI"""
    try:
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id=f"match_{uuid.uuid4()}",
            system_message="You are an expert job matching AI. Analyze resume-job compatibility and return only a number between 0-100."
        ).with_model("openai", "gpt-5")
        
        message = UserMessage(
            text=f"""
Resume Skills: {', '.join(resume.get('skills', []))}
Resume Title: {resume.get('title')}
Job Title: {job.get('title')}
Job Requirements: {', '.join(job.get('requirements', []))}

Return ONLY a match score number between 0-100. No explanation.
"""
        )
        
        response = await chat.send_message(message)
        
        # Extract number from response
        import re
        numbers = re.findall(r'\d+', response)
        if numbers:
            score = float(numbers[0])
            return min(max(score, 0), 100)
        
        return 50.0
    except Exception as e:
        logging.error(f"Match score error: {e}")
        # Fallback: simple keyword matching
        resume_skills = set([s.lower() for s in resume.get('skills', [])])
        job_reqs = set([r.lower() for r in job.get('requirements', [])])
        if resume_skills and job_reqs:
            overlap = len(resume_skills.intersection(job_reqs))
            return min((overlap / len(job_reqs)) * 100, 100)
        return 50.0

# ============= AUTH ROUTES =============

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        phone=user_data.phone
    )
    user_dict = user.model_dump()
    user_dict['password'] = hash_password(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    token = create_token(user.id, user.email)
    
    return {
        "token": token,
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name}
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user.get('password', '')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'], user['email'])
    
    return {
        "token": token,
        "user": {"id": user['id'], "email": user['email'], "full_name": user['full_name']}
    }

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"user": {"id": user['id'], "email": user['email'], "full_name": user['full_name'], "phone": user.get('phone')}}

# ============= RESUME ROUTES =============

@api_router.post("/resume", response_model=Resume)
async def create_resume(resume_data: ResumeCreate, user: dict = Depends(get_current_user)):
    resume = Resume(
        user_id=user['id'],
        **resume_data.model_dump()
    )
    
    doc = resume.model_dump()
    await db.resumes.insert_one(doc)
    
    return resume

@api_router.get("/resume", response_model=List[Resume])
async def get_resumes(user: dict = Depends(get_current_user)):
    resumes = await db.resumes.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    return resumes

@api_router.get("/resume/{resume_id}", response_model=Resume)
async def get_resume(resume_id: str, user: dict = Depends(get_current_user)):
    resume = await db.resumes.find_one({"id": resume_id, "user_id": user['id']}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@api_router.post("/resume/{resume_id}/optimize")
async def optimize_resume(resume_id: str, user: dict = Depends(get_current_user)):
    resume = await db.resumes.find_one({"id": resume_id, "user_id": user['id']}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    suggestions = await optimize_resume_with_ai(resume)
    
    # Update resume with suggestions
    await db.resumes.update_one(
        {"id": resume_id},
        {"$set": {"ai_suggestions": suggestions, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"suggestions": suggestions}

@api_router.put("/resume/{resume_id}")
async def update_resume(resume_id: str, resume_data: ResumeCreate, user: dict = Depends(get_current_user)):
    resume = await db.resumes.find_one({"id": resume_id, "user_id": user['id']}, {"_id": 0})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    update_data = resume_data.model_dump()
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.resumes.update_one({"id": resume_id}, {"$set": update_data})
    
    return {"message": "Resume updated successfully"}

# ============= JOB ROUTES =============

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(user: dict = Depends(get_current_user)):
    jobs = await db.jobs.find({}, {"_id": 0}).to_list(100)
    
    # Get user's latest resume
    resume = await db.resumes.find_one({"user_id": user['id']}, {"_id": 0}, sort=[("created_at", -1)])
    
    if resume:
        # Calculate match scores for all jobs
        for job in jobs:
            job['match_score'] = await calculate_job_match_score(resume, job)
        
        # Sort by match score
        jobs.sort(key=lambda x: x.get('match_score', 0), reverse=True)
    
    return jobs

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# ============= APPLICATION ROUTES =============

@api_router.post("/applications")
async def create_application(job_id: str, resume_id: str, user: dict = Depends(get_current_user)):
    # Check if already applied
    existing = await db.applications.find_one({"user_id": user['id'], "job_id": job_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")
    
    application = Application(
        user_id=user['id'],
        job_id=job_id,
        resume_id=resume_id
    )
    
    doc = application.model_dump()
    await db.applications.insert_one(doc)
    
    # Create notification
    notification = Notification(
        user_id=user['id'],
        message=f"Your application has been submitted successfully",
        type="application"
    )
    await db.notifications.insert_one(notification.model_dump())
    
    return {"message": "Application submitted", "application_id": application.id}

@api_router.get("/applications", response_model=List[Application])
async def get_applications(user: dict = Depends(get_current_user)):
    applications = await db.applications.find({"user_id": user['id']}, {"_id": 0}).to_list(100)
    return applications

@api_router.get("/applications/stats")
async def get_application_stats(user: dict = Depends(get_current_user)):
    applications = await db.applications.find({"user_id": user['id']}, {"_id": 0}).to_list(1000)
    
    total = len(applications)
    by_status = {}
    for app in applications:
        status = app.get('status', 'submitted')
        by_status[status] = by_status.get(status, 0) + 1
    
    return {
        "total_applications": total,
        "submitted": by_status.get('submitted', 0),
        "interview": by_status.get('interview', 0),
        "rejected": by_status.get('rejected', 0),
        "accepted": by_status.get('accepted', 0)
    }

# ============= NOTIFICATION ROUTES =============

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": user['id']}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return notifications

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": user['id']},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

# ============= AUTO-APPLY ROUTES =============

@api_router.get("/auto-apply/settings")
async def get_auto_apply_settings(user: dict = Depends(get_current_user)):
    settings = await db.auto_apply_settings.find_one({"user_id": user['id']}, {"_id": 0})
    if not settings:
        # Create default settings
        default_settings = AutoApplySettings(user_id=user['id'])
        await db.auto_apply_settings.insert_one(default_settings.model_dump())
        return default_settings.model_dump()
    return settings

@api_router.put("/auto-apply/settings")
async def update_auto_apply_settings(settings: AutoApplySettings, user: dict = Depends(get_current_user)):
    settings.user_id = user['id']
    await db.auto_apply_settings.update_one(
        {"user_id": user['id']},
        {"$set": settings.model_dump()},
        upsert=True
    )
    return {"message": "Settings updated"}

@api_router.post("/auto-apply/trigger")
async def trigger_auto_apply(user: dict = Depends(get_current_user)):
    """Mock auto-apply simulation"""
    settings = await db.auto_apply_settings.find_one({"user_id": user['id']}, {"_id": 0})
    if not settings or not settings.get('enabled'):
        raise HTTPException(status_code=400, detail="Auto-apply is not enabled")
    
    # Get user's resume
    resume = await db.resumes.find_one({"user_id": user['id']}, {"_id": 0}, sort=[("created_at", -1)])
    if not resume:
        raise HTTPException(status_code=400, detail="No resume found")
    
    # Get jobs
    jobs = await db.jobs.find({}, {"_id": 0}).to_list(100)
    
    applied_count = 0
    min_score = settings.get('min_match_score', 70)
    max_applications = settings.get('max_applications_per_day', 10)
    
    for job in jobs:
        if applied_count >= max_applications:
            break
        
        # Check if already applied
        existing = await db.applications.find_one({"user_id": user['id'], "job_id": job['id']}, {"_id": 0})
        if existing:
            continue
        
        # Calculate match score
        match_score = await calculate_job_match_score(resume, job)
        
        if match_score >= min_score:
            # Auto-apply
            application = Application(
                user_id=user['id'],
                job_id=job['id'],
                resume_id=resume['id'],
                notes=f"Auto-applied with {match_score:.1f}% match"
            )
            await db.applications.insert_one(application.model_dump())
            applied_count += 1
            
            # Create notification
            notification = Notification(
                user_id=user['id'],
                message=f"Auto-applied to {job['title']} at {job['company']} ({match_score:.1f}% match)",
                type="application"
            )
            await db.notifications.insert_one(notification.model_dump())
    
    return {"applied_count": applied_count, "message": f"Successfully applied to {applied_count} jobs"}

# ============= SEED DATA ROUTE =============

@api_router.post("/seed-jobs")
async def seed_jobs():
    """Create mock job listings"""
    mock_jobs = [
        {
            "title": "Senior Full Stack Developer",
            "company": "TechCorp Inc",
            "location": "San Francisco, CA",
            "description": "We are seeking an experienced Full Stack Developer to join our growing team.",
            "requirements": ["React", "Node.js", "MongoDB", "AWS", "5+ years experience"],
            "salary_range": "$120k - $160k",
            "job_type": "full-time",
            "source": "LinkedIn"
        },
        {
            "title": "Frontend Developer",
            "company": "StartupXYZ",
            "location": "Remote",
            "description": "Join our team to build amazing user interfaces.",
            "requirements": ["React", "TypeScript", "CSS", "3+ years experience"],
            "salary_range": "$90k - $130k",
            "job_type": "full-time",
            "source": "Indeed"
        },
        {
            "title": "Python Backend Engineer",
            "company": "DataSolutions Ltd",
            "location": "New York, NY",
            "description": "Build scalable backend systems with Python and FastAPI.",
            "requirements": ["Python", "FastAPI", "PostgreSQL", "Docker", "4+ years experience"],
            "salary_range": "$110k - $150k",
            "job_type": "full-time",
            "source": "Naukri"
        },
        {
            "title": "DevOps Engineer",
            "company": "CloudTech",
            "location": "Austin, TX",
            "description": "Manage and scale cloud infrastructure.",
            "requirements": ["AWS", "Kubernetes", "Docker", "CI/CD", "3+ years experience"],
            "salary_range": "$100k - $140k",
            "job_type": "full-time",
            "source": "LinkedIn"
        },
        {
            "title": "Mobile App Developer",
            "company": "MobileFirst Inc",
            "location": "Seattle, WA",
            "description": "Create beautiful mobile experiences for iOS and Android.",
            "requirements": ["React Native", "JavaScript", "Mobile UI/UX", "2+ years experience"],
            "salary_range": "$95k - $125k",
            "job_type": "full-time",
            "source": "Indeed"
        },
        {
            "title": "UI/UX Designer",
            "company": "DesignStudio",
            "location": "Los Angeles, CA",
            "description": "Design intuitive and beautiful user interfaces.",
            "requirements": ["Figma", "Adobe XD", "User Research", "Prototyping", "3+ years experience"],
            "salary_range": "$85k - $115k",
            "job_type": "full-time",
            "source": "LinkedIn"
        },
        {
            "title": "Data Scientist",
            "company": "AI Analytics Co",
            "location": "Boston, MA",
            "description": "Apply machine learning to solve business problems.",
            "requirements": ["Python", "Machine Learning", "TensorFlow", "SQL", "4+ years experience"],
            "salary_range": "$130k - $170k",
            "job_type": "full-time",
            "source": "Naukri"
        },
        {
            "title": "Product Manager",
            "company": "ProductTech",
            "location": "Chicago, IL",
            "description": "Lead product strategy and development.",
            "requirements": ["Product Management", "Agile", "User Stories", "Analytics", "5+ years experience"],
            "salary_range": "$115k - $155k",
            "job_type": "full-time",
            "source": "Indeed"
        }
    ]
    
    # Clear existing jobs
    await db.jobs.delete_many({})
    
    # Insert new jobs
    for job_data in mock_jobs:
        job = Job(**job_data)
        await db.jobs.insert_one(job.model_dump())
    
    return {"message": f"Seeded {len(mock_jobs)} jobs successfully"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()