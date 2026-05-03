from sqlalchemy.orm import Session
from ..models.body_weight import BodyWeight
from ..schemas.body_weight import BodyWeightCreate, BodyWeightUpdate

def list_body_weights(db: Session) -> list[BodyWeight]:
    return db.query(BodyWeight).order_by(BodyWeight.date.asc()).all()

def get_body_weight(db: Session, bw_id: int) -> BodyWeight | None:
    return db.query(BodyWeight).filter(BodyWeight.id == bw_id).first()

def get_by_date(db: Session, date) -> BodyWeight | None:
    return db.query(BodyWeight).filter(BodyWeight.date == date).first()

def create_body_weight(db: Session, data: BodyWeightCreate) -> BodyWeight:
    bw = BodyWeight(**data.model_dump())
    db.add(bw)
    db.commit()
    db.refresh(bw)
    return bw

def update_body_weight(db: Session, bw: BodyWeight, data: BodyWeightUpdate) -> BodyWeight:
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(bw, k, v)
    db.commit()
    db.refresh(bw)
    return bw

def delete_body_weight(db: Session, bw: BodyWeight):
    db.delete(bw)
    db.commit()
