from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import Any, Dict, List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection (MUST use env MONGO_URL)
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


# ----------------------------
# Health / template endpoints
# ----------------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=now_utc)


class StatusCheckCreate(BaseModel):
    client_name: str


@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())

    doc = status_obj.model_dump()
    doc["timestamp"] = doc["timestamp"].isoformat()

    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check.get("timestamp"), str):
            check["timestamp"] = datetime.fromisoformat(check["timestamp"])
    return status_checks


# ----------------------------
# Dental website endpoints
# ----------------------------
class SiteContentDoc(BaseModel):
    model_config = ConfigDict(extra="ignore")

    key: str = "default"
    content: Dict[str, Any]
    updated_at: datetime = Field(default_factory=now_utc)


class SiteContentUpdate(BaseModel):
    content: Dict[str, Any]


class ContactMessageCreate(BaseModel):
    fullname: str
    email: str
    phone: str
    message: str
    consent: bool


class ContactMessage(ContactMessageCreate):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=now_utc)


class AppointmentRequestCreate(BaseModel):
    fullname: str
    email: Optional[str] = None
    phone: str
    reason: str
    preferred_days: List[str] = []
    preferred_time: Optional[str] = None
    notes: Optional[str] = None
    consent: bool


class AppointmentRequest(AppointmentRequestCreate):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=now_utc)


def _serialize_dt_fields(doc: Dict[str, Any], dt_fields: List[str]) -> Dict[str, Any]:
    out = dict(doc)
    for f in dt_fields:
        if isinstance(out.get(f), datetime):
            out[f] = out[f].isoformat()
    return out


def _parse_dt_fields(doc: Dict[str, Any], dt_fields: List[str]) -> Dict[str, Any]:
    out = dict(doc)
    for f in dt_fields:
        if isinstance(out.get(f), str):
            out[f] = datetime.fromisoformat(out[f])
    return out


async def _get_or_init_site_content() -> SiteContentDoc:
    existing = await db.site_content.find_one({"key": "default"}, {"_id": 0})
    if existing:
        existing = _parse_dt_fields(existing, ["updated_at"])
        return SiteContentDoc(**existing)

    # Initialize from frontend default (duplicated here for backend bootstrap)
    default_content: Dict[str, Any] = {
        "practice": {
            "name": "Docteur Charlotte Gendre",
            "specialty": "Chirurgien-Dentiste",
            "citySeo": "Seysses",
            "address": "680 Route de Toulouse, 31600 Seysses, France",
            "phoneDisplay": "05 62 20 47 53",
            "phoneE164": "+33562204753",
        },
        "hero": {
            "title": "Des soins dentaires modernes, avec une attention sincère à votre confort",
            "subtitle": "Bienvenue au cabinet du Docteur Charlotte Gendre à Seysses. Une prise en charge claire, des explications simples, et une approche centrée sur la prévention.",
            "primaryCta": "Prendre rendez-vous",
            "secondaryCta": "Contacter le cabinet",
            "reassurance": "Cabinet à Seysses • Soins sur rendez-vous • Urgences selon disponibilité",
        },
        "aboutDoctor": {
            "title": "Le praticien",
            "text": "Le Docteur Charlotte Gendre vous reçoit dans un cadre calme et professionnel. L'objectif : vous proposer des soins adaptés, expliqués, et réalisés avec rigueur.",
            "reserved": "Zone réservée : diplômes, formations, spécialisations, équipements (à compléter).",
        },
        "aboutOffice": {
            "title": "Le cabinet",
            "text": "Un environnement soigné, une hygiène irréprochable et un parcours patient fluide. Le cabinet s'attache à instaurer un climat de confiance, notamment pour les patients anxieux.",
            "images": [
                {
                    "src": "https://images.unsplash.com/photo-1629909613638-0e4a1fad8f81?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxjYWJpbmV0JTIwZGVudGFpcmUlMjBtb2Rlcm5lfGVufDB8fHx8MTc2NTk4NDI3MXww&ixlib=rb-4.1.0&q=85",
                    "alt": "Salle de soins dentaire moderne",
                    "label": "Salle de soins",
                },
                {
                    "src": "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxjYWJpbmV0JTIwZGVudGFpcmUlMjBtb2Rlcm5lfGVufDB8fHx8MTc2NTk4NDI3MXww&ixlib=rb-4.1.0&q=85",
                    "alt": "Fauteuil dentaire",
                    "label": "Équipement",
                },
            ],
        },
        "services": {
            "title": "Soins & prestations",
            "intro": "Les contenus ci-dessous sont des emplacements modifiables : vous pourrez ajouter, retirer ou préciser chaque soin selon les besoins du cabinet.",
            "categories": [
                {
                    "id": "prevention",
                    "name": "Prévention",
                    "items": [
                        {
                            "title": "Bilan et conseils personnalisés",
                            "description": "Évaluation, explications, et recommandations adaptées à votre hygiène bucco-dentaire.",
                        },
                        {
                            "title": "Détartrage",
                            "description": "Entretien régulier visant à limiter l'inflammation gingivale et les problèmes parodontaux.",
                        },
                    ],
                },
                {
                    "id": "soins",
                    "name": "Soins dentaires",
                    "items": [
                        {
                            "title": "Traitement des caries",
                            "description": "Soins conservateurs, réalisés avec précision et explications étape par étape.",
                        },
                        {
                            "title": "Endodontie (dévitalisation)",
                            "description": "Prise en charge lorsque la pulpe est atteinte, dans le respect du confort du patient.",
                        },
                    ],
                },
                {
                    "id": "esthetique",
                    "name": "Esthétique",
                    "items": [
                        {
                            "title": "Éclaircissement (blanchiment)",
                            "description": "Option esthétique à discuter en consultation (indications, contre-indications, suivi).",
                        },
                        {
                            "title": "Facettes / restaurations esthétiques",
                            "description": "Solutions sur-mesure, selon l'indication clinique et vos objectifs.",
                        },
                    ],
                },
            ],
        },
        "practical": {
            "title": "Informations pratiques",
            "accessNote": "Vous pouvez appeler le cabinet pour toute question. En cas de douleur aiguë, expliquez vos symptômes : nous vous orienterons au mieux selon les disponibilités.",
            "hours": [
                {"day": "Lundi", "hours": "09:00–13:30 / 14:30–19:00"},
                {"day": "Mardi", "hours": "08:00–16:30"},
                {"day": "Mercredi", "hours": "09:00–19:00"},
                {"day": "Jeudi", "hours": "Fermé"},
                {"day": "Vendredi", "hours": "08:00–19:00"},
                {"day": "Samedi", "hours": "Fermé"},
                {"day": "Dimanche", "hours": "Fermé"},
            ],
        },
        "contact": {
            "title": "Contact",
            "formIntro": "Vous pouvez nous écrire via ce formulaire. Pour une demande urgente, privilégiez l'appel téléphonique.",
            "rgpdNotice": "En envoyant ce formulaire, vous acceptez que les informations saisies soient utilisées pour répondre à votre demande. Données conservées le temps du traitement.",
        },
        "faq": {
            "title": "Questions fréquentes",
            "items": [
                {
                    "q": "Le cabinet prend-il de nouveaux patients ?",
                    "a": "Zone réservée : à préciser selon la disponibilité. Vous pouvez appeler le cabinet pour confirmation.",
                },
                {
                    "q": "Proposez-vous des rendez-vous d'urgence ?",
                    "a": "Selon les disponibilités du jour. En cas de douleur importante, contactez-nous par téléphone.",
                },
                {
                    "q": "Comment préparer ma première consultation ?",
                    "a": "Apportez votre carte Vitale, votre mutuelle et, si possible, tout élément médical utile (ordonnances, radios récentes).",
                },
            ],
        },
        "legal": {
            "title": "Mentions légales & confidentialité",
            "intro": "Ce contenu est fourni à titre de base et devra être complété avec les informations légales du cabinet (SIRET, RPPS, hébergeur, email, etc.).",
            "sections": [
                {
                    "title": "Éditeur du site",
                    "content": "Docteur Charlotte Gendre – Chirurgien-Dentiste\nAdresse : 680 Route de Toulouse, 31600 Seysses, France\nTéléphone : 05 62 20 47 53\nEmail : (à compléter)",
                },
                {
                    "title": "Hébergement",
                    "content": "(à compléter : nom, adresse et contact de l'hébergeur)",
                },
                {
                    "title": "Données personnelles (RGPD)",
                    "content": "Les données collectées via le formulaire de contact sont destinées uniquement à répondre à votre demande. Vous pouvez demander l'accès, la rectification ou la suppression de vos données en contactant le cabinet (email à compléter).",
                },
                {
                    "title": "Cookies",
                    "content": "Ce site peut utiliser des cookies techniques nécessaires au bon fonctionnement. Aucun cookie publicitaire n'est mis en place par défaut.",
                },
            ],
        },
    }

    doc = SiteContentDoc(key="default", content=default_content)
    insert = _serialize_dt_fields(doc.model_dump(), ["updated_at"])
    await db.site_content.insert_one(insert)
    return doc


@api_router.get("/site-content", response_model=SiteContentDoc)
async def get_site_content():
    return await _get_or_init_site_content()


@api_router.put("/site-content", response_model=SiteContentDoc)
async def put_site_content(payload: SiteContentUpdate):
    updated = SiteContentDoc(key="default", content=payload.content, updated_at=now_utc())
    doc = _serialize_dt_fields(updated.model_dump(), ["updated_at"])

    await db.site_content.update_one(
        {"key": "default"}, {"$set": doc}, upsert=True
    )
    return updated


@api_router.post("/contact-messages", response_model=ContactMessage)
async def create_contact_message(payload: ContactMessageCreate):
    msg = ContactMessage(**payload.model_dump())
    doc = _serialize_dt_fields(msg.model_dump(), ["created_at"])
    await db.contact_messages.insert_one(doc)
    return msg


@api_router.get("/contact-messages", response_model=List[ContactMessage])
async def list_contact_messages(limit: int = Query(default=20, ge=1, le=100)):
    docs = (
        await db.contact_messages.find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(limit)


@api_router.post("/appointment-requests", response_model=AppointmentRequest)
async def create_appointment_request(payload: AppointmentRequestCreate):
    req = AppointmentRequest(**payload.model_dump())
    doc = _serialize_dt_fields(req.model_dump(), ["created_at"])
    await db.appointment_requests.insert_one(doc)
    return req


@api_router.get("/appointment-requests", response_model=List[AppointmentRequest])
async def list_appointment_requests(limit: int = Query(default=20, ge=1, le=100)):
    docs = (
        await db.appointment_requests.find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(limit)
    )
    return [
        AppointmentRequest(**_parse_dt_fields(d, ["created_at"])) for d in docs
    ]

    )
    return [ContactMessage(**_parse_dt_fields(d, ["created_at"])) for d in docs]


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()