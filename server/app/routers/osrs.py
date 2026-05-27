"""
OSRS hiscores proxy — avoids CORS by fetching on the server side.
GET /api/osrs/hiscores/{username}
"""
import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["osrs"])

SKILL_NAMES = [
    "Overall", "Attack", "Defence", "Strength", "Hitpoints", "Ranged", "Prayer",
    "Magic", "Cooking", "Woodcutting", "Fletching", "Fishing", "Firemaking",
    "Crafting", "Smithing", "Mining", "Herblore", "Agility", "Thieving",
    "Slayer", "Farming", "Runecraft", "Hunter", "Construction",
]


@router.get("/hiscores/{username}")
async def get_hiscores(username: str):
    url = (
        "https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws"
        f"?player={username}"
    )
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"Hiscores unreachable: {exc}")

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="Player not found on hiscores")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Hiscores returned an error")

    lines = resp.text.strip().split("\n")
    skills = []
    for i, line in enumerate(lines[: len(SKILL_NAMES)]):
        parts = line.strip().split(",")
        if len(parts) >= 3:
            skills.append(
                {
                    "name": SKILL_NAMES[i],
                    "rank": int(parts[0]),
                    "level": int(parts[1]),
                    "xp": int(parts[2]),
                }
            )

    return {"username": username, "skills": skills}
