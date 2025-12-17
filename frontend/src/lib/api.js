import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// All backend routes MUST be prefixed with /api (ingress rule)
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});
