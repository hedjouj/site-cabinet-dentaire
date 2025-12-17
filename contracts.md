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

## Intégration Frontend
- Remplacer `loadContent()/saveContent()` et le stockage `localStorage` par appels API.
- Au chargement: GET `/api/site-content`.
- Sauvegarde: PUT `/api/site-content`.
- Formulaire: POST `/api/contact-messages`.
- Liste “Messages récents (démo)” devient une liste réelle: GET `/api/contact-messages`.
- CTA “Prendre rendez-vous”: tant que l’URL n’est pas connue, afficher un toast; plus tard, ajouter `content.practice.appointment_url` et ouvrir le lien.
