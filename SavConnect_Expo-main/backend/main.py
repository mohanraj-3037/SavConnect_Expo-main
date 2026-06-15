import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client, Client
load_dotenv()

app = FastAPI(title="PDD Backend API")

# CORS — list explicit origins so allow_credentials=True is valid.
# allow_origins=["*"] + allow_credentials=True is rejected by browsers.
CORS_ORIGINS = [
    "http://localhost:8081",        # Expo web dev server
    "http://127.0.0.1:8081",        # Expo web dev server (IP variation)
    "http://localhost:19006",       # Expo web (older SDK)
    "http://192.168.31.29:8081",   # Metro from phone on same WiFi
    "http://192.168.31.29:8000",   # direct API calls from same machine
    "exp://192.168.31.29:8081",    # Expo Go native
    "exp://localhost:8081",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize Supabase
supabase_url: str = os.environ.get("SUPABASE_URL", "")
supabase_key: str = os.environ.get("SUPABASE_KEY", "")
supabase: Client = create_client(supabase_url, supabase_key)

class HealthCheckResponse(BaseModel):
    status: str
    message: str

class JoinRequest(BaseModel):
    opportunity_id: str   # UUID string, not int
    applicant_id: str
    message: str
    contact_email: str = ""
    contact_phone: str = ""
    contact_preference: str = ""

class StatusUpdate(BaseModel):
    status: str  # 'accepted' or 'rejected'

@app.get("/", response_model=HealthCheckResponse)
def read_root():
    """
    Root endpoint for basic verification.
    Returns a welcome message.
    """
    return {"status": "ok", "message": "Welcome to the PDD FastAPI Backend"}

@app.get("/health", response_model=HealthCheckResponse)
def health_check():
    """
    Health check endpoint used by the frontend to verify connectivity.
    """
    return {"status": "ok", "message": "Backend is healthy"}



@app.post("/request-to-join")
async def request_to_join(req: JoinRequest):
    """
    Processes a student's request to join a project.
    Inserts an application into the database and triggers an EmailJS notification.
    """
    # Fetch applicant profile (name, skills, and email)
    applicant_res = supabase.table("profiles").select("full_name, skills, personal_email").eq("id", req.applicant_id).single().execute()
    applicant_data = applicant_res.data
    if not isinstance(applicant_data, dict):
        raise HTTPException(status_code=404, detail="Applicant not found")

    applicant_name_val = applicant_data.get("full_name", "Unknown Applicant")
    applicant_name = str(applicant_name_val) if applicant_name_val is not None else "Unknown Applicant"
    applicant_email_val = applicant_data.get("personal_email", "")
    applicant_email = str(applicant_email_val) if applicant_email_val is not None else ""
    applicant_skills_data = applicant_data.get("skills", [])
    applicant_skills = applicant_skills_data if isinstance(applicant_skills_data, list) else []

    # Fetch opportunity (title + skills_required) and poster profile
    opp_res = supabase.table("opportunities").select("title, skills_required, profiles(full_name, personal_email)").eq("id", req.opportunity_id).single().execute()
    opp_data = opp_res.data

    if not isinstance(opp_data, dict):
        raise HTTPException(status_code=404, detail="Opportunity not found")

    project_title_val = opp_data.get("title", "Untitled Project")
    project_title = str(project_title_val) if project_title_val is not None else "Untitled Project"
    opp_skills_data = opp_data.get("skills_required", [])
    opp_skills = opp_skills_data if isinstance(opp_skills_data, list) else []
    poster_profile = opp_data.get("profiles", {})
    if not isinstance(poster_profile, dict):
        poster_profile = {}
    owner_name_val = poster_profile.get("full_name", "Project Owner")
    owner_name = str(owner_name_val) if owner_name_val is not None else "Project Owner"
    poster_email_val = poster_profile.get("personal_email")
    poster_email = str(poster_email_val) if poster_email_val is not None else ""

    if not poster_email:
        raise HTTPException(status_code=400, detail="Poster does not have a contact email")

    # Compute matched skills (intersection of applicant skills and required skills)
    applicant_set = set(str(s).lower() for s in applicant_skills if s is not None)
    opp_set = set(str(s).lower() for s in opp_skills if s is not None)
    overlap = applicant_set & opp_set
    # Preserve original casing from the opportunity's skills_required list
    matched_skills_list = [str(s) for s in opp_skills if s is not None and str(s).lower() in overlap]
    matched_skills = ", ".join(matched_skills_list) if matched_skills_list else "None"

    # Insert into applications table first
    try:
        supabase.table("applications").insert({
            "opportunity_id": req.opportunity_id,  # UUID string
            "applicant_id": req.applicant_id,
            "message": req.message,
            "status": "pending"
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to record application")

    # Send via EmailJS using httpx — matches the updated template
    emailjs_url = "https://api.emailjs.com/api/v1.0/email/send"
    payload = {
        "service_id": os.environ.get("EMAILJS_SERVICE_ID"),
        "template_id": os.environ.get("EMAILJS_TEMPLATE_ID"),
        "user_id": os.environ.get("EMAILJS_PUBLIC_KEY"),
        "template_params": {
            "to_email": poster_email,
            "organiser_name": owner_name,
            "applicant_name": applicant_name,
            "project_name": project_title,
            "message": req.message,
            "matched_skills": matched_skills,
            "applicant_email": req.contact_email or applicant_email,
            "applicant_phone": req.contact_phone,
            "contact_preference": req.contact_preference,
        }
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(emailjs_url, json=payload)
        
    if resp.status_code != 200:
        raise HTTPException(status_code=500, detail=f"EmailJS error: {resp.text}")
        
    return {"status": "success", "message": "Join request sent successfully"}

@app.get("/my-applications/{user_id}")
async def get_my_applications(user_id: str):
    """
    Fetches all applications submitted by the current user.
    """
    try:
        res = supabase.table("applications").select("*, opportunities(title)").eq("applicant_id", user_id).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch applications")


# ─── Decision: Accept / Reject ───────────────────────────────────────────────
@app.patch("/applications/{application_id}/status")
async def update_application_status(application_id: str, body: StatusUpdate):
    """
    Update the status of an application to 'accepted' or 'rejected'.
    Only the status column is modified — id and created_at are never touched.
    """
    if body.status not in ("accepted", "rejected"):
        raise HTTPException(
            status_code=422,
            detail="Status must be 'accepted' or 'rejected'."
        )

    try:
        # Only update the status column
        res = (
            supabase.table("applications")
            .update({"status": body.status})
            .eq("id", application_id)
            .execute()
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Application not found.")
        return {"status": "success", "message": f"Application {body.status} successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update application status.")


@app.get("/incoming-requests/{user_id}")
async def get_incoming_requests(user_id: str):
    """
    Fetch all pending applications for opportunities owned by the given user.
    Joins applications with:
      - profiles (on applicant_id = profiles.id) for applicant name & skills
      - opportunities (on opportunity_id = opportunities.id) for project title
    Filters: opportunities.posted_by == user_id AND applications.status == 'pending'
    """
    try:
        # 1. Get all opportunity IDs owned by this user
        opp_res = (
            supabase.table("opportunities")
            .select("id")
            .eq("posted_by", user_id)
            .execute()
        )
        opp_data = opp_res.data
        opp_ids = []
        if isinstance(opp_data, list):
            opp_ids = [o["id"] for o in opp_data if isinstance(o, dict) and "id" in o]

        if not opp_ids:
            return []  # User has no posted opportunities

        # 2. Fetch pending applications for those opportunities,
        #    joining profiles (applicant) and opportunities (title)
        app_res = (
            supabase.table("applications")
            .select("id, message, status, created_at, "
                    "profiles!applicant_id(full_name, skills), "
                    "opportunities!opportunity_id(title)")
            .in_("opportunity_id", opp_ids)
            .eq("status", "pending")
            .order("created_at", desc=True)
            .execute()
        )
        return app_res.data or []

    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch incoming requests.")


# ─── Skill-based Matching Engine ────────────────────────────────────────────
@app.get("/recommendations/{user_id}")
async def get_recommendations(user_id: str):
    """
    Returns all opportunities sorted by skill-match score against the user's profile.
    match_score is a 0-100 integer (Jaccard similarity × 100).
    Opportunities with score >= 75 get the ⭐ Top Match badge in the frontend.
    """
    try:
        # 1. Fetch the requesting user's skills
        user_res = supabase.table("profiles").select("skills").eq("id", user_id).single().execute()
        user_skills = []
        if isinstance(user_res.data, dict):
            user_skills_data = user_res.data.get("skills", [])
            if isinstance(user_skills_data, list):
                user_skills = [str(s) for s in user_skills_data if s is not None]
        user_skill_set = set(s.lower() for s in user_skills)

        # 2. Fetch all opportunities with poster profile info
        opp_res = supabase.table("opportunities") \
            .select("*, profiles(full_name, personal_email)") \
            .order("created_at", desc=True) \
            .execute()
        raw_opportunities = opp_res.data or []
        opportunities: list[dict] = [opp for opp in raw_opportunities if isinstance(opp, dict)]

        # 3. Score each opportunity by Jaccard similarity
        def score(opp: dict) -> int:
            opp_skills_data = opp.get("skills_required", [])
            opp_skills = opp_skills_data if isinstance(opp_skills_data, list) else []
            req = set(str(s).lower() for s in opp_skills if s is not None)
            if not req:
                return 0
            intersection = len(user_skill_set & req)
            union = len(user_skill_set | req)
            return round((intersection / union) * 100) if union > 0 else 0

        for opp in opportunities:
            opp["match_score"] = score(opp)

        # 4. Sort: highest match first, then by newest
        opportunities.sort(key=lambda o: o.get("match_score", 0), reverse=True)

        return opportunities

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


# ─── Post Opportunity ────────────────────────────────────────────────────────
class OpportunityCreate(BaseModel):
    title: str
    description: str
    skills_required: list[str]
    location: str
    posted_by: str

@app.post("/opportunities", status_code=201)
async def create_opportunity(opp: OpportunityCreate):
    """
    Creates a new opportunity via the FastAPI backend.
    Validates required fields before writing to Supabase.
    """
    if len(opp.title.strip()) < 3:
        raise HTTPException(status_code=422, detail="Title must be at least 3 characters.")
    if len(opp.description.strip()) < 10:
        raise HTTPException(status_code=422, detail="Description must be at least 10 characters.")
    if not opp.skills_required:
        raise HTTPException(status_code=422, detail="At least one skill is required.")
    if len(opp.location.strip()) < 2:
        raise HTTPException(status_code=422, detail="Location must be at least 2 characters.")

    try:
        res = supabase.table("opportunities").insert({
            "title": opp.title.strip(),
            "description": opp.description.strip(),
            "skills_required": opp.skills_required,
            "location": opp.location.strip(),
            "posted_by": opp.posted_by,
        }).execute()
        if isinstance(res.data, list) and res.data:
            return res.data[0]
        elif isinstance(res.data, dict):
            return res.data
        return {"status": "created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create opportunity: {str(e)}")


# ─── Update Profile ──────────────────────────────────────────────────────────
class ProfileUpdate(BaseModel):
    id: str
    full_name: str = ""
    year_of_study: str = ""
    skills: list[str] = []
    availability: bool = True

@app.post("/profiles/update")
async def update_profile(profile: ProfileUpdate):
    """
    Upserts a user's profile via the FastAPI backend.
    """
    try:
        payload = {
            "id": profile.id,
            "full_name": profile.full_name,
            "year_of_study": profile.year_of_study,
            "skills": profile.skills,
            "availability": profile.availability,
        }

        res = supabase.table("profiles").upsert(payload).execute()
        if isinstance(res.data, list) and res.data:
            return res.data[0]
        elif isinstance(res.data, dict):
            return res.data
        return {"status": "updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")


# ─── Delete Opportunity ──────────────────────────────────────────────────────
@app.delete("/opportunities/{opportunity_id}")
async def delete_opportunity(opportunity_id: str, user_id: str):
    """
    Delete an opportunity posted by the given user.
    Also removes all associated applications.
    """
    try:
        # Verify ownership
        opp_res = (
            supabase.table("opportunities")
            .select("id, posted_by")
            .eq("id", opportunity_id)
            .single()
            .execute()
        )
        if not isinstance(opp_res.data, dict):
            raise HTTPException(status_code=404, detail="Opportunity not found.")
        if opp_res.data.get("posted_by") != user_id:
            raise HTTPException(status_code=403, detail="You can only delete your own opportunities.")

        # Delete associated applications first (foreign key)
        supabase.table("applications").delete().eq("opportunity_id", opportunity_id).execute()

        # Delete the opportunity
        supabase.table("opportunities").delete().eq("id", opportunity_id).execute()

        return {"status": "success", "message": "Opportunity deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete opportunity: {str(e)}")


# ─── Delete Application ─────────────────────────────────────────────────────
@app.delete("/applications/{application_id}")
async def delete_application(application_id: str, user_id: str):
    """
    Delete an application. Only the applicant can delete their own application.
    """
    try:
        # Verify ownership
        app_res = (
            supabase.table("applications")
            .select("id, applicant_id")
            .eq("id", application_id)
            .single()
            .execute()
        )
        if not isinstance(app_res.data, dict):
            raise HTTPException(status_code=404, detail="Application not found.")
        if app_res.data.get("applicant_id") != user_id:
            raise HTTPException(status_code=403, detail="You can only delete your own applications.")

        supabase.table("applications").delete().eq("id", application_id).execute()

        return {"status": "success", "message": "Application deleted successfully."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete application: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
