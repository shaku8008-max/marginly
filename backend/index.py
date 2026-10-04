# Vercel FastAPI entry point.
# This file is the entrypoint for the "backend" service in vercel.json.
# It imports the FastAPI app from the application package so Vercel can
# find it at the module root.

from app.main import app  # noqa: F401