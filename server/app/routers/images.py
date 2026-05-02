from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from ..services.image_handler import save_upload, delete_image

router = APIRouter(tags=["images"])


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    filename = await save_upload(file)
    return {"filename": filename}


@router.delete("/{filename:path}", status_code=204)
def remove_image(filename: str):
    if not filename.startswith("custom/"):
        raise HTTPException(status_code=400, detail="Can only delete custom images")
    delete_image(filename)
