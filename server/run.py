import os
import uvicorn

if __name__ == "__main__":
    # Render provides PORT env var; default to 8000 for local dev
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=os.environ.get("DEV_RELOAD") == "1",
    )
