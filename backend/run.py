import uvicorn
import os

if __name__ == "__main__":
    # Get port from environment or fallback to 8000
    port = int(os.getenv("BACKEND_PORT", 8000))
    print(f"[STARTING] Launching ErythroNet Backend API on http://localhost:{port}")
    print(f"[DOCS] Swagger documentation available at http://localhost:{port}/docs")
    
    uvicorn.run(
        "app.main:app", 
        host="0.0.0.0", 
        port=port, 
        reload=True
    )
