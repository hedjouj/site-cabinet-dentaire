# API Contracts — Site vitrine cabinet dentaire

## Objectif
Remplacer les données **mockées** (frontend) par une persistance MongoDB + endpoints FastAPI.

## Données initialement mockées (frontend)
Fichier : `frontend/src/mock.js`
- `DEFAULT_CONTENT` (structure complète du site : hero, cabinet, soins, infos pratiques, RGPD, mentions légales)
- Messages du formulaire (stockés en `localStorage`)
- Lien “Prendre rendez-vous” : placeholder

## Backend à implémenter
Base URL (ingress) : `/api`

### 1) Site Content
#### GET `/api/site-content`
**Réponse 200**
```json
{
  "key": "default",
  "content": { "...": "JSON du site" },
  "updated_at": "2025-08-01T12:00:00Z"
}
```
Notes:
- Si aucun contenu n’existe, le backend initialise avec un contenu par défaut.

#### PUT `/api/site-content`
**Body**
```json
{ "content": { "...": "JSON du site" } }
```
**Réponse 200**: même forme que GET.

### 2) Contact Messages
#### POST `/api/contact-messages`
**Body**
```json
{
  "fullname": "...",
  "email": "...",
  "phone": "...",
  "message": "...",
  "consent": true
}
```
**Réponse 200**
```json
{
  "id": "uuid",
  "fullname": "...",
  "email": "...",
  "phone": "...",
  "message": "...",
  "consent": true,
  "created_at": "2025-08-01T12:00:00Z"
}
```

#### GET `/api/contact-messages?limit=20`
**Réponse 200**
```json
[
  { "id": "...", "fullname": "...", "message": "...", "created_at": "..." }
]
```

## 3) Appointment Requests (Demande de rendez-vous)
### POST `/api/appointment-requests`
**Body**
```json
{
  "fullname": "...",
  "email": "... (optionnel)",
  "phone": "...",
  "reason": "...",
  "preferred_days": ["Lundi", "Mercredi"],
  "preferred_time": "Matin (optionnel)",
  "notes": "... (optionnel)",
  "consent": true
}
```
**Réponse 200**
```json
{
  "id": "uuid",
  "created_at": "2025-08-01T12:00:00Z",
  "fullname": "...",
  "email": "...",
  "phone": "...",
  "reason": "...",
  "preferred_days": ["..."],
  "preferred_time": "...",
  "notes": "...",
  "consent": true
}
```

### GET `/api/appointment-requests?limit=20`
Retourne la liste des demandes (triées par `created_at` desc).

## Intégration Frontend
- Au chargement: GET `/api/site-content`.
- Sauvegarde: PUT `/api/site-content`.
- Contact: POST `/api/contact-messages` + listing GET `/api/contact-messages`.
- Rendez-vous: ouvrir un **dialog “Demande de rendez-vous”** et POST `/api/appointment-requests`.
- Plus tard: si une URL externe est choisie, ajouter `content.practice.appointment_url` et basculer le CTA vers le lien.
