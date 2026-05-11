from datetime import date as date_type
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from ..models.fitness import WorkoutEntry, WorkoutExercise, WorkoutRun, WorkoutTemplate, WorkoutTemplateExercise
from ..schemas.fitness import WorkoutEntryCreate, WorkoutEntryUpdate, WorkoutTemplateCreate, WorkoutTemplateUpdate


def _load_entry(db: Session, entry_id: int) -> Optional[WorkoutEntry]:
    return (db.query(WorkoutEntry)
            .options(joinedload(WorkoutEntry.exercises), joinedload(WorkoutEntry.run))
            .filter(WorkoutEntry.id == entry_id).first())


def get_workouts_in_range(db: Session, start: date_type, end: date_type) -> list[WorkoutEntry]:
    return (db.query(WorkoutEntry)
            .options(joinedload(WorkoutEntry.exercises), joinedload(WorkoutEntry.run))
            .filter(WorkoutEntry.date >= start, WorkoutEntry.date <= end)
            .order_by(WorkoutEntry.date).all())


def get_workout_by_date(db: Session, d: date_type) -> Optional[WorkoutEntry]:
    return (db.query(WorkoutEntry)
            .options(joinedload(WorkoutEntry.exercises), joinedload(WorkoutEntry.run))
            .filter(WorkoutEntry.date == d).first())


def get_workout(db: Session, entry_id: int) -> Optional[WorkoutEntry]:
    return _load_entry(db, entry_id)


def create_workout(db: Session, data: WorkoutEntryCreate) -> WorkoutEntry:
    entry = WorkoutEntry(
        date=data.date, workout_type=data.workout_type,
        custom_type_label=data.custom_type_label, title=data.title,
        status=data.status, notes=data.notes,
    )
    db.add(entry)
    db.flush()
    for i, ex in enumerate(data.exercises):
        db.add(WorkoutExercise(workout_entry_id=entry.id, exercise_name=ex.exercise_name,
            sets=ex.sets, reps=ex.reps, weight=ex.weight, notes=ex.notes, sort_order=i))
    if data.run:
        db.add(WorkoutRun(workout_entry_id=entry.id, distance_miles=data.run.distance_miles,
            duration_minutes=data.run.duration_minutes, notes=data.run.notes))
    db.commit()
    return _load_entry(db, entry.id)


def update_workout(db: Session, entry: WorkoutEntry, data: WorkoutEntryUpdate) -> WorkoutEntry:
    if data.date is not None: entry.date = data.date
    if data.workout_type is not None: entry.workout_type = data.workout_type
    entry.custom_type_label = data.custom_type_label
    entry.title = data.title
    if data.status is not None: entry.status = data.status
    entry.notes = data.notes
    if data.exercises is not None:
        db.query(WorkoutExercise).filter(WorkoutExercise.workout_entry_id == entry.id).delete()
        for i, ex in enumerate(data.exercises):
            db.add(WorkoutExercise(workout_entry_id=entry.id, exercise_name=ex.exercise_name,
                sets=ex.sets, reps=ex.reps, weight=ex.weight, notes=ex.notes, sort_order=i))
    # Always sync run: delete existing, re-add if new data provided
    db.query(WorkoutRun).filter(WorkoutRun.workout_entry_id == entry.id).delete()
    if data.run is not None:
        db.add(WorkoutRun(workout_entry_id=entry.id, distance_miles=data.run.distance_miles,
            duration_minutes=data.run.duration_minutes, notes=data.run.notes))
    db.commit()
    return _load_entry(db, entry.id)


def delete_workout(db: Session, entry: WorkoutEntry) -> None:
    db.delete(entry); db.commit()


# ── Templates ─────────────────────────────────────────────────────────────────

def _load_template(db: Session, tid: int) -> Optional[WorkoutTemplate]:
    return (db.query(WorkoutTemplate)
            .options(joinedload(WorkoutTemplate.exercises))
            .filter(WorkoutTemplate.id == tid).first())


def get_templates(db: Session) -> list[WorkoutTemplate]:
    return (db.query(WorkoutTemplate)
            .options(joinedload(WorkoutTemplate.exercises))
            .order_by(WorkoutTemplate.name).all())


def get_template(db: Session, tid: int) -> Optional[WorkoutTemplate]:
    return _load_template(db, tid)


def create_template(db: Session, data: WorkoutTemplateCreate) -> WorkoutTemplate:
    t = WorkoutTemplate(name=data.name, workout_type=data.workout_type,
        custom_type_label=data.custom_type_label, notes=data.notes)
    db.add(t); db.flush()
    for i, ex in enumerate(data.exercises):
        db.add(WorkoutTemplateExercise(template_id=t.id, exercise_name=ex.exercise_name,
            sets=ex.sets, reps=ex.reps, weight=ex.weight, notes=ex.notes, sort_order=i))
    db.commit()
    return _load_template(db, t.id)


def update_template(db: Session, t: WorkoutTemplate, data: WorkoutTemplateUpdate) -> WorkoutTemplate:
    if data.name is not None: t.name = data.name
    if data.workout_type is not None: t.workout_type = data.workout_type
    if data.custom_type_label is not None: t.custom_type_label = data.custom_type_label
    if data.notes is not None: t.notes = data.notes
    if data.exercises is not None:
        db.query(WorkoutTemplateExercise).filter(WorkoutTemplateExercise.template_id == t.id).delete()
        for i, ex in enumerate(data.exercises):
            db.add(WorkoutTemplateExercise(template_id=t.id, exercise_name=ex.exercise_name,
                sets=ex.sets, reps=ex.reps, weight=ex.weight, notes=ex.notes, sort_order=i))
    db.commit()
    return _load_template(db, t.id)


def delete_template(db: Session, t: WorkoutTemplate) -> None:
    db.delete(t); db.commit()


def clear_planned_workouts(db: Session) -> int:
    result = db.query(WorkoutEntry).filter(WorkoutEntry.status == "planned").all()
    count = len(result)
    for entry in result:
        db.delete(entry)
    db.commit()
    return count


# ── Warfighter template seed data ─────────────────────────────────────────────

_WARFIGHTER_TEMPLATES = [
    # ── Full Body (from document) ─────────────────────────────────────────────
    {
        "name": "FB-01 Iron Triplet", "workout_type": "custom", "custom_type_label": "Full Body",
        "notes": "AMRAP 20 — Score: Total rounds + reps. Pace the first 5 minutes; push ups break second-most.\nWarm-up: 5 min easy cardio, 2 rounds: 10 air squats, 8 inchworms, 8 scap pull ups",
        "exercises": [
            {"exercise_name": "Pull Ups", "sets": None, "reps": "10", "weight": "Bodyweight", "notes": "Strict if possible; kipping after fatigue OK"},
            {"exercise_name": "Push Ups", "sets": None, "reps": "15", "weight": "Bodyweight", "notes": "Chest to deck"},
            {"exercise_name": "Air Squats", "sets": None, "reps": "20", "weight": "Bodyweight", "notes": "Below parallel, chest tall"},
        ]
    },
    {
        "name": "FB-02 Anchor", "workout_type": "custom", "custom_type_label": "Full Body",
        "notes": "5 Rounds For Time — Score: Total time, target sub-25:00.\nWarm-up: 5 min row easy, 2 rounds: 10 KB deadlifts, 10 push ups, 5 pull ups\nIf pull ups break in round 3, switch to ring rows or band-assisted.",
        "exercises": [
            {"exercise_name": "Run", "sets": 5, "reps": "400m", "weight": None, "notes": "Sub-2:00 per round if possible"},
            {"exercise_name": "Kettlebell Swings", "sets": 5, "reps": "21", "weight": "24kg / 16kg", "notes": "Hips drive, arms guide"},
            {"exercise_name": "Burpees", "sets": 5, "reps": "15", "weight": None, "notes": "Chest to floor, jump above hands"},
            {"exercise_name": "Pull Ups", "sets": 5, "reps": "12", "weight": "Bodyweight", "notes": "Bigger sets early"},
        ]
    },
    {
        "name": "FB-03 Compound + Conditioner", "workout_type": "lift", "custom_type_label": None,
        "notes": "Part A (strength, 20 min): Build to working weight then hit sets. Part B (conditioning): AMRAP 12.\nWarm-up: 5 min cardio, 2 rounds barbell complex @ empty bar. Don't rush Part A — conditioning is a finisher.",
        "exercises": [
            {"exercise_name": "Deadlift", "sets": 5, "reps": "5", "weight": "75-80% 1RM", "notes": "Part A — Reset every rep; brace before the pull"},
            {"exercise_name": "Bench Press", "sets": 5, "reps": "5", "weight": "70-75% 1RM", "notes": "Part A — Pause 1s on the chest"},
            {"exercise_name": "Row (200m)", "sets": None, "reps": "AMRAP", "weight": None, "notes": "Part B AMRAP 12 — Pull strong, push hard"},
            {"exercise_name": "Push Ups", "sets": None, "reps": "10", "weight": "Bodyweight", "notes": "Part B AMRAP 12"},
            {"exercise_name": "Sit Ups", "sets": None, "reps": "10", "weight": None, "notes": "Part B AMRAP 12 — Anchored or unanchored"},
        ]
    },
    {
        "name": "FB-04 Reckoning", "workout_type": "custom", "custom_type_label": "Full Body",
        "notes": "For Time — 10-9-8-7-6-5-4-3-2-1 descending pyramid. 55 reps each total. Score: Total time, target sub-18:00.\nWarm-up: 5 min light cardio, 2 rounds: 10 thrusters @ empty bar, 5 strict pull ups, 10 burpees. Pull ups will be the limiter.",
        "exercises": [
            {"exercise_name": "DB Thrusters", "sets": None, "reps": "10→1 ladder", "weight": "22.5kg / 15kg pair", "notes": "Squat-to-press in one move"},
            {"exercise_name": "Pull Ups", "sets": None, "reps": "10→1 ladder", "weight": "Bodyweight", "notes": "Strict or kipping; match DB rep count each round"},
            {"exercise_name": "Burpees (over dumbbells)", "sets": None, "reps": "10→1 ladder", "weight": None, "notes": "Lateral hop, no plate touch needed"},
        ]
    },
    {
        "name": "FB-05 The Backbone", "workout_type": "custom", "custom_type_label": "Full Body",
        "notes": "EMOM 24 (6 rounds, 4-movement rotation) — Score: Finish each minute under :50. Drop weight if you can't finish with 10s to spare.\nWarm-up: 5 min row, hang clean technique 3x5 @ empty bar to working weight",
        "exercises": [
            {"exercise_name": "Hang Cleans", "sets": 6, "reps": "8", "weight": "50kg / 35kg", "notes": "Min 1 — Drive hips, fast elbows"},
            {"exercise_name": "Push Press", "sets": 6, "reps": "10", "weight": "40kg / 30kg", "notes": "Min 2 — Dip-drive-press"},
            {"exercise_name": "Kettlebell Swings", "sets": 6, "reps": "15", "weight": "24kg / 16kg", "notes": "Min 3 — American or Russian"},
            {"exercise_name": "Run or Row", "sets": 6, "reps": "200m / 250m", "weight": None, "notes": "Min 4 — Sustainable pace"},
        ]
    },
    {
        "name": "FB-06 Build Phase Hybrid", "workout_type": "lift", "custom_type_label": None,
        "notes": "3 rounds, 12 reps each, 90s rest between rounds. Hypertrophy circuit — form over speed. Aim to add load each week.\nWarm-up: 5 min cardio, 2 rounds: 10 glute bridges, 10 band pull aparts, 10 cat-cows",
        "exercises": [
            {"exercise_name": "Goblet Squat", "sets": 3, "reps": "12", "weight": "20-24kg", "notes": "Slow eccentric"},
            {"exercise_name": "Push Ups", "sets": 3, "reps": "12", "weight": "Bodyweight", "notes": "Chest to deck"},
            {"exercise_name": "Romanian Deadlift", "sets": 3, "reps": "12", "weight": "40-50kg", "notes": "Soft knees, hips back"},
            {"exercise_name": "Bent Over Row", "sets": 3, "reps": "12", "weight": "40-50kg", "notes": "Pull to lower ribs"},
            {"exercise_name": "DB Shoulder Press", "sets": 3, "reps": "12", "weight": "12.5-17.5kg", "notes": "Both arms simultaneously"},
            {"exercise_name": "Walking Lunges", "sets": 3, "reps": "12 each leg", "weight": "Bodyweight", "notes": "Knee tracks over toe"},
            {"exercise_name": "Plank", "sets": 3, "reps": "30 sec", "weight": None, "notes": "Hollow body"},
            {"exercise_name": "Russian Twist", "sets": 3, "reps": "20 total", "weight": "5-10kg plate", "notes": "Touch each side"},
        ]
    },
    {
        "name": "FB-07 Sprint + Power Couplet", "workout_type": "custom", "custom_type_label": "Full Body",
        "notes": "5 Rounds For Time — Score: Total time, target sub-15:00. Step down off box to save knees.\nWarm-up: 5 min easy row, 2 rounds: 5 power cleans @ empty bar, 10 box step ups, 5 strict pull ups",
        "exercises": [
            {"exercise_name": "Row Sprint", "sets": 5, "reps": "250m", "weight": None, "notes": "Sub-1:00 per round"},
            {"exercise_name": "Power Cleans", "sets": 5, "reps": "10", "weight": "50kg / 35kg", "notes": "Touch and go"},
            {"exercise_name": "Box Jumps", "sets": 5, "reps": "10", "weight": "24in / 20in box", "notes": "Full hip extension at top; step down"},
        ]
    },
    {
        "name": "FB-08 Frontier", "workout_type": "custom", "custom_type_label": "Full Body",
        "notes": "For Time — Murph-inspired. Score: Total time, target sub-50:00. Partition bodyweight reps as needed. Wear 9kg plate carrier to scale up.\nWarm-up: 5 min easy jog, 2 rounds: 10 air squats, 10 push ups, 5 pull ups. Hydrate beforehand.",
        "exercises": [
            {"exercise_name": "Run", "sets": 1, "reps": "1 mile / 1.6km", "weight": None, "notes": "Pace yourself"},
            {"exercise_name": "Pull Ups", "sets": None, "reps": "50 total", "weight": "Bodyweight", "notes": "Strict, kipping, jumping, or rings — partition freely"},
            {"exercise_name": "Push Ups", "sets": None, "reps": "100 total", "weight": "Bodyweight", "notes": "Sets of 10 work well"},
            {"exercise_name": "Air Squats", "sets": None, "reps": "200 total", "weight": "Bodyweight", "notes": "Sets of 20-25"},
            {"exercise_name": "Run", "sets": 1, "reps": "1 mile / 1.6km", "weight": None, "notes": "Whatever is left"},
        ]
    },
    {
        "name": "FB-09 Triplet 21-15-9", "workout_type": "custom", "custom_type_label": "Full Body",
        "notes": "For Time — 21-15-9 reps. Score: Total time, sub-10:00 is competitive. Pick scaling that lets you do round of 21 in 2 sets.\nWarm-up: 5 min row, 2 rounds: 10 wall balls (light), 10 KB swings, 5 toes to bar progressions",
        "exercises": [
            {"exercise_name": "Wall Balls", "sets": None, "reps": "21-15-9", "weight": "20lb / 14lb to 10ft", "notes": "Below parallel, hit the target"},
            {"exercise_name": "Kettlebell Swings (American)", "sets": None, "reps": "21-15-9", "weight": "24kg / 16kg", "notes": "Bell overhead, arms locked"},
            {"exercise_name": "Toes to Bar", "sets": None, "reps": "21-15-9", "weight": None, "notes": "Or knees to elbows / knee raises — compress hollow, then extend"},
        ]
    },
    {
        "name": "FB-10 Tactical Strongman", "workout_type": "custom", "custom_type_label": "Full Body",
        "notes": "4 rounds, 90s rest between. Score: Total time or rounds completed in 20 min. Sub sandbag with farmer carry @ 24kg/16kg pair.\nWarm-up: 5 min mixed cardio, 2 rounds: 10 KB deadlifts, 10 push ups, 50m farmer carry (light)",
        "exercises": [
            {"exercise_name": "Sandbag Carry", "sets": 4, "reps": "50m", "weight": "30kg / 20kg", "notes": "Bear hug or shoulder"},
            {"exercise_name": "Deadlift", "sets": 4, "reps": "10", "weight": "1.25x bodyweight", "notes": "Pause 1s on the floor"},
            {"exercise_name": "Push Press", "sets": 4, "reps": "10", "weight": "50kg / 35kg", "notes": "Hips first, then arms"},
            {"exercise_name": "Run", "sets": 4, "reps": "200m", "weight": None, "notes": "Steady, not a sprint"},
        ]
    },
    # ── Cardio (from document) ────────────────────────────────────────────────
    {
        "name": "CA-01 Aerobic Power 400s", "workout_type": "run", "custom_type_label": None,
        "notes": "8 x 400m @ 90% PRE — Score: Average 400m time; spread fastest/slowest < 5 seconds. 1:1 work-to-rest ratio.\nWarm-up: 10 min easy jog, 2 rounds: 10 leg swings, 10 lunges, 4 strides @ 50%. If 8th rep is significantly slower, you went out too hot.",
        "exercises": [
            {"exercise_name": "Run (400m)", "sets": 8, "reps": "400m", "weight": None, "notes": "@ 90% PRE — maintain even pace across all 8"},
            {"exercise_name": "Rest", "sets": 8, "reps": "1:1 work-to-rest", "weight": None, "notes": "If 400m takes 90s, rest 90s"},
        ]
    },
    {
        "name": "CA-02 Anaerobic Lactic 100s", "workout_type": "run", "custom_type_label": None,
        "notes": "5 sets x 4 reps EMOM — 100m max effort sprints. Score: Fastest and slowest 100m, drop-off < 0.5s. Quality > volume — end session if rep is slower than 90% of best.\nWarm-up: 10 min easy jog with strides, dynamic prep: leg swings, A skips, B skips, 3 progressive sprints",
        "exercises": [
            {"exercise_name": "Sprint (100m)", "sets": 20, "reps": "100m", "weight": None, "notes": "Max effort — true sprint mechanics; 4 reps per minute on EMOM"},
            {"exercise_name": "Rest between sets", "sets": 4, "reps": "4 min", "weight": None, "notes": "Walk it off between sets of 4"},
        ]
    },
    {
        "name": "CA-03 Aerobic Endurance Steady", "workout_type": "run", "custom_type_label": None,
        "notes": "Long Steady State — Zone 2 conversational pace throughout. Score: Total time and average pace. If you can't talk in full sentences, slow down.\nOptional: 6kg / 10kg weight vest for tactical specificity.",
        "exercises": [
            {"exercise_name": "Run", "sets": 1, "reps": "10km / 6.2 miles", "weight": None, "notes": "Conversational pace throughout — Zone 2"},
        ]
    },
    {
        "name": "CA-04 Rower Hammer", "workout_type": "custom", "custom_type_label": "Cardio",
        "notes": "5 x 500m row — Score: Sum of 5 split times, target under 9:30 total. If 5th rep is 10s+ slower than 1st, ease off next time.\nWarm-up: 5 min row easy building, then: 1 min moderate, 30 sec hard, 1 min easy x 2",
        "exercises": [
            {"exercise_name": "Row (500m)", "sets": 5, "reps": "500m", "weight": None, "notes": "Target sub-1:50 per 500m"},
            {"exercise_name": "Rest", "sets": 5, "reps": "2 min", "weight": None, "notes": "Active recovery, stay on the rower"},
        ]
    },
    {
        "name": "CA-05 Ruck Conditioning", "workout_type": "hike", "custom_type_label": None,
        "notes": "For Time — Loaded carry 5 miles / 8km. Score: Total time including lunges, target under 75 min. Strong ruckers walk fast — drive with hips.\nWarm-up: 5 min walk unloaded, then 2 min with ruck before starting clock.",
        "exercises": [
            {"exercise_name": "Ruck", "sets": 1, "reps": "5 miles / 8km", "weight": "20kg / 15kg", "notes": "Mixed terrain if possible"},
            {"exercise_name": "Walking Lunges (loaded, every 1 mile)", "sets": 5, "reps": "20", "weight": "Ruck on back", "notes": "Each leg counts as 1 rep total — stop every mile/1.6km"},
        ]
    },
    {
        "name": "CA-06 Burpee Mile", "workout_type": "run", "custom_type_label": None,
        "notes": "For Time — Descending distance + burpees. Score: Total time, sub-25:00 is competitive. The 800m is where the workout is won — don't crawl through it.\nWarm-up: 5 min easy jog, 2 rounds: 10 squats, 5 burpees, 100m run",
        "exercises": [
            {"exercise_name": "Run", "sets": 1, "reps": "1 mile / 1.6km", "weight": None, "notes": "Steady"},
            {"exercise_name": "Burpees", "sets": 1, "reps": "30", "weight": None, "notes": "Chest to floor"},
            {"exercise_name": "Run", "sets": 1, "reps": "800m", "weight": None, "notes": "Push the pace — this is where the workout is won"},
            {"exercise_name": "Burpees", "sets": 1, "reps": "20", "weight": None, "notes": None},
            {"exercise_name": "Run", "sets": 1, "reps": "400m", "weight": None, "notes": "Sprint finish"},
            {"exercise_name": "Burpees", "sets": 1, "reps": "10", "weight": None, "notes": "Empty the tank"},
        ]
    },
    {
        "name": "CA-07 Cuttitude Ascending", "workout_type": "custom", "custom_type_label": "Cardio",
        "notes": "EMOM ascending — Add 1 rep each round until failure. Score: Total minutes before failure; 14 rounds = elite. Pacing is everything — sprinting early means bonking by round 8.\nWarm-up: 5 min easy row, 2 rounds: 10 burpees, 1 min row @ moderate",
        "exercises": [
            {"exercise_name": "Cal Row (ascending)", "sets": None, "reps": "Start 10, +1 each round", "weight": None, "notes": "Men 10 cal / Women 7 cal starting — add 1 each odd minute"},
            {"exercise_name": "Burpees (ascending)", "sets": None, "reps": "Start 10, +1 each round", "weight": None, "notes": "Add 1 each even minute — continue until you can't finish"},
        ]
    },
    {
        "name": "CA-08 Mixed Modal Cardio", "workout_type": "custom", "custom_type_label": "Cardio",
        "notes": "AMRAP 30 — Continuous flow, rotate machines. Score: Total rotations completed. Keep heart rate in Zone 3 throughout — sustainable pace.\nWarm-up: 3 min on each machine easy, tag your starting machine",
        "exercises": [
            {"exercise_name": "Run", "sets": None, "reps": "400m", "weight": None, "notes": "Treadmill or outdoor"},
            {"exercise_name": "Row", "sets": None, "reps": "250m", "weight": None, "notes": "Strong, sustainable"},
            {"exercise_name": "Bike or Ski Erg", "sets": None, "reps": "250m / 15 cal", "weight": None, "notes": "Either machine — rotate continuously for 30 min"},
        ]
    },
    {
        "name": "CA-09 12-Mile Ruck Standard", "workout_type": "hike", "custom_type_label": None,
        "notes": "For Time — Army 12-mile foot march standard. Score: Total time. Standard: sub-3 hours, strong: sub-2:30. Boots and pack must be fitted — lubricate feet, hydrate every 30 min.",
        "exercises": [
            {"exercise_name": "Ruck", "sets": 1, "reps": "12 miles / 19km", "weight": "35lb / 15kg", "notes": "Mixed terrain, no jogging — just walk fast"},
        ]
    },
    {
        "name": "CA-10 Anaerobic Capacity 200s", "workout_type": "run", "custom_type_label": None,
        "notes": "2 sets x 6 reps — All-out 200m efforts at 800m race pace +5%. Score: Average 200m time, spread < 2 seconds. Bad reps train you to be slow — drop reps if you can't hold pace.\nWarm-up: 10 min easy jog, 4 strides @ 80%",
        "exercises": [
            {"exercise_name": "Sprint (200m)", "sets": 12, "reps": "200m", "weight": None, "notes": "Max effort — 800m race pace + 5%; 2:1 rest (if 30s rep, rest 60s)"},
            {"exercise_name": "Rest between sets", "sets": 1, "reps": "4 min", "weight": None, "notes": "Full recovery between the two sets of 6"},
        ]
    },
    # ── Push Workouts (new) ───────────────────────────────────────────────────
    {
        "name": "P-01 Heavy Chest Day", "workout_type": "lift", "custom_type_label": "Push",
        "notes": "Strength-focused push session. Rest 2-3 min between heavy sets. Log weights and aim to increase each week.",
        "exercises": [
            {"exercise_name": "Bench Press", "sets": 5, "reps": "5", "weight": "80% 1RM", "notes": "Pause 1s on chest, drive fast"},
            {"exercise_name": "Incline DB Press", "sets": 4, "reps": "8", "weight": "22.5kg pair", "notes": "Full ROM, controlled descent"},
            {"exercise_name": "DB Chest Flys", "sets": 3, "reps": "12", "weight": "15kg pair", "notes": "Slight elbow bend, stretch at bottom"},
            {"exercise_name": "Tricep Dips", "sets": 3, "reps": "Max", "weight": "Bodyweight", "notes": "Lean forward slightly for chest emphasis"},
            {"exercise_name": "Overhead Tricep Extension", "sets": 3, "reps": "12", "weight": "15-20kg DB", "notes": "Full stretch at top"},
        ]
    },
    {
        "name": "P-02 Push Volume Day", "workout_type": "lift", "custom_type_label": "Push",
        "notes": "High-volume push hypertrophy session. Rest 60-90s between sets. Focus on the muscle, not the weight.",
        "exercises": [
            {"exercise_name": "Push Ups", "sets": 5, "reps": "20", "weight": "Bodyweight", "notes": "Full ROM, chest to deck"},
            {"exercise_name": "DB Shoulder Press", "sets": 4, "reps": "12", "weight": "17.5kg pair", "notes": "Press to lockout, lower under control"},
            {"exercise_name": "Lateral Raises", "sets": 4, "reps": "15", "weight": "8-10kg", "notes": "Lead with elbows, slight forward lean"},
            {"exercise_name": "Tricep Pushdown", "sets": 3, "reps": "15", "weight": "Cable / band", "notes": "Elbows pinned to sides"},
            {"exercise_name": "Close-Grip Bench Press", "sets": 3, "reps": "10", "weight": "60-70kg", "notes": "Elbows tucked, tricep drive"},
        ]
    },
    {
        "name": "P-03 Shoulder Dominator", "workout_type": "lift", "custom_type_label": "Push",
        "notes": "Shoulder-focused push session. Prioritize overhead strength and lateral development. Rest 90-120s on main lifts.",
        "exercises": [
            {"exercise_name": "Overhead Barbell Press", "sets": 5, "reps": "5", "weight": "70% 1RM", "notes": "Brace core, drive elbows forward at top"},
            {"exercise_name": "Arnold Press", "sets": 4, "reps": "10", "weight": "15kg pair", "notes": "Rotate through full range"},
            {"exercise_name": "Front Raises", "sets": 3, "reps": "12", "weight": "10kg pair", "notes": "Raise to shoulder height, controlled lower"},
            {"exercise_name": "Lateral Raises", "sets": 3, "reps": "15", "weight": "8kg pair", "notes": "Lead with elbows, pause at top"},
            {"exercise_name": "Face Pulls", "sets": 3, "reps": "15", "weight": "Light cable", "notes": "Pull to forehead, external rotation"},
            {"exercise_name": "Tricep Dips", "sets": 3, "reps": "12", "weight": "Bodyweight", "notes": "Upright torso for tricep focus"},
        ]
    },
    {
        "name": "P-04 Tricep Triple Threat", "workout_type": "lift", "custom_type_label": "Push",
        "notes": "Tricep isolation focus. Rest 60-90s between sets. Keep elbows locked in position throughout every movement.",
        "exercises": [
            {"exercise_name": "Skull Crushers", "sets": 4, "reps": "10", "weight": "25kg EZ bar", "notes": "Lower to forehead, extend to full lockout"},
            {"exercise_name": "Overhead Tricep Extension", "sets": 4, "reps": "12", "weight": "15kg DB", "notes": "Full stretch overhead, slow eccentric"},
            {"exercise_name": "Tricep Pushdown", "sets": 4, "reps": "15", "weight": "Cable", "notes": "Elbows stationary, full extension"},
            {"exercise_name": "Close-Grip Push Ups", "sets": 3, "reps": "Max", "weight": "Bodyweight", "notes": "Hands shoulder-width, elbows back"},
            {"exercise_name": "Diamond Push Ups", "sets": 3, "reps": "Max", "weight": "Bodyweight", "notes": "Hands form diamond shape under chest"},
        ]
    },
    {
        "name": "P-05 Push Power EMOM", "workout_type": "custom", "custom_type_label": "Push",
        "notes": "EMOM 18 (6 rounds, 3-movement rotation) — Score: Complete each minute with 10+ sec rest. If you can't, drop the weight.",
        "exercises": [
            {"exercise_name": "Push Press", "sets": 6, "reps": "8", "weight": "60-70kg", "notes": "Min 1 — Dip-drive-press, lower under control"},
            {"exercise_name": "Push Ups", "sets": 6, "reps": "20", "weight": "Bodyweight", "notes": "Min 2 — Fast and unbroken if possible"},
            {"exercise_name": "DB Chest Flys", "sets": 6, "reps": "12", "weight": "15kg pair", "notes": "Min 3 — Slow and controlled"},
        ]
    },
    {
        "name": "P-06 Incline Focus", "workout_type": "lift", "custom_type_label": "Push",
        "notes": "Upper chest emphasis. Incline movements first while fresh. Rest 2 min between heavy sets, 90s for accessories.",
        "exercises": [
            {"exercise_name": "Incline Bench Press", "sets": 5, "reps": "5", "weight": "75% 1RM", "notes": "30-45 degree incline, full ROM"},
            {"exercise_name": "Incline DB Flys", "sets": 4, "reps": "10", "weight": "15kg pair", "notes": "Deep stretch at bottom, squeeze at top"},
            {"exercise_name": "Flat Bench Press", "sets": 3, "reps": "8", "weight": "70% 1RM", "notes": "Secondary movement, maintain technique"},
            {"exercise_name": "Military Press (seated)", "sets": 3, "reps": "10", "weight": "40-50kg", "notes": "Strict — no leg drive"},
            {"exercise_name": "Tricep Dips", "sets": 3, "reps": "12", "weight": "Bodyweight", "notes": "Add weight if easy"},
        ]
    },
    {
        "name": "P-07 Dip & Press Complex", "workout_type": "lift", "custom_type_label": "Push",
        "notes": "Dip-heavy push session. If parallel bar dips are too easy, add a plate. Aim for quality reps over speed.",
        "exercises": [
            {"exercise_name": "Parallel Bar Dips", "sets": 5, "reps": "Max", "weight": "Bodyweight (+weight if >15)", "notes": "Full depth, upright for tricep emphasis"},
            {"exercise_name": "Bench Press", "sets": 5, "reps": "8", "weight": "75% 1RM", "notes": "Controlled descent, explosive drive"},
            {"exercise_name": "Ring Dips", "sets": 3, "reps": "8", "weight": "Bodyweight", "notes": "Stabilize rings, full lockout at top"},
            {"exercise_name": "Floor Press", "sets": 3, "reps": "10", "weight": "60kg", "notes": "Eliminates leg drive, pure pressing strength"},
            {"exercise_name": "Band Tricep Pushdown", "sets": 3, "reps": "20", "weight": "Band", "notes": "Finisher — pump the triceps"},
        ]
    },
    {
        "name": "P-08 Push Superset Circuit", "workout_type": "lift", "custom_type_label": "Push",
        "notes": "3 supersets, 4 rounds each. Rest 90s between supersets only. The back-to-back pairing increases metabolic demand.",
        "exercises": [
            {"exercise_name": "Bench Press (Superset A)", "sets": 4, "reps": "10", "weight": "70-75% 1RM", "notes": "Go straight to push ups"},
            {"exercise_name": "Push Ups (Superset A)", "sets": 4, "reps": "Max", "weight": "Bodyweight", "notes": "Rest 90s after push ups"},
            {"exercise_name": "DB Shoulder Press (Superset B)", "sets": 4, "reps": "12", "weight": "17.5kg pair", "notes": "Go straight to lateral raises"},
            {"exercise_name": "Lateral Raises (Superset B)", "sets": 4, "reps": "15", "weight": "8-10kg", "notes": "Rest 90s after lateral raises"},
            {"exercise_name": "Skull Crushers (Superset C)", "sets": 3, "reps": "12", "weight": "25kg EZ bar", "notes": "Go straight to pushdowns"},
            {"exercise_name": "Tricep Pushdown (Superset C)", "sets": 3, "reps": "15", "weight": "Cable", "notes": "Rest 90s after pushdowns"},
        ]
    },
    {
        "name": "P-09 Chest Press Pyramid", "workout_type": "lift", "custom_type_label": "Push",
        "notes": "Classic pyramid — descend the reps as you add weight, then descend back down. Great for strength-endurance crossover. Rest 2 min between sets.",
        "exercises": [
            {"exercise_name": "Bench Press", "sets": None, "reps": "12, 10, 8, 6, 4, 2, 4, 6, 8, 10", "weight": "Add weight each set going up, mirror going down", "notes": "Full ROM every rep — no bouncing"},
            {"exercise_name": "Cable Flys", "sets": 3, "reps": "15", "weight": "Light", "notes": "Finisher — squeeze and hold 1s at peak contraction"},
            {"exercise_name": "Tricep Dips", "sets": 3, "reps": "Max", "weight": "Bodyweight", "notes": "Finisher — go to failure"},
        ]
    },
    {
        "name": "P-10 Push AMRAP Blitz", "workout_type": "custom", "custom_type_label": "Push",
        "notes": "AMRAP 20 — Score: Total rounds + reps. Rotate efficiently. If push press form breaks down, switch to strict press.",
        "exercises": [
            {"exercise_name": "Push Ups", "sets": None, "reps": "15", "weight": "Bodyweight", "notes": "Chest to deck, full extension"},
            {"exercise_name": "DB Shoulder Press", "sets": None, "reps": "10", "weight": "15kg pair", "notes": "Both arms simultaneously"},
            {"exercise_name": "Box Dips", "sets": None, "reps": "20", "weight": "Bodyweight", "notes": "Hands on bench behind you, full depth"},
        ]
    },
    # ── Pull Workouts (new) ───────────────────────────────────────────────────
    {
        "name": "PL-01 Heavy Row Day", "workout_type": "lift", "custom_type_label": "Pull",
        "notes": "Horizontal pull strength session. Build scapular retraction strength and upper back thickness. Rest 2-3 min between heavy sets.",
        "exercises": [
            {"exercise_name": "Barbell Bent-Over Row", "sets": 5, "reps": "5", "weight": "75% 1RM", "notes": "Hinge at hip, pull to lower ribs, hold 1s"},
            {"exercise_name": "Chest-Supported Row", "sets": 4, "reps": "8", "weight": "30kg DBs", "notes": "Full retraction at top, no body swing"},
            {"exercise_name": "Single-Arm DB Row", "sets": 3, "reps": "10 each side", "weight": "30-35kg", "notes": "Brace against bench, drive elbow back"},
            {"exercise_name": "Face Pulls", "sets": 3, "reps": "15", "weight": "Cable", "notes": "Pull to forehead, external rotation"},
            {"exercise_name": "Barbell Curls", "sets": 3, "reps": "12", "weight": "30-40kg", "notes": "Full ROM, slow eccentric"},
        ]
    },
    {
        "name": "PL-02 Pull-Up Pyramid", "workout_type": "lift", "custom_type_label": "Pull",
        "notes": "Volume pull-up session using a pyramid structure. Rest as needed between sets. If bodyweight pull-ups are easy, add a plate.",
        "exercises": [
            {"exercise_name": "Pull Ups", "sets": None, "reps": "1, 2, 3, 4, 5, 4, 3, 2, 1", "weight": "Bodyweight", "notes": "Ascending then descending — full ROM, dead hang to chin over bar"},
            {"exercise_name": "Ring Rows", "sets": 3, "reps": "15", "weight": "Bodyweight", "notes": "Horizontal row — body straight, pull chest to rings"},
            {"exercise_name": "Lat Pulldown", "sets": 4, "reps": "10", "weight": "60-70kg", "notes": "Pull to upper chest, squeeze lats at bottom"},
            {"exercise_name": "Hammer Curls", "sets": 3, "reps": "12", "weight": "12.5-15kg", "notes": "Neutral grip, full supination at top"},
        ]
    },
    {
        "name": "PL-03 Back Builder", "workout_type": "lift", "custom_type_label": "Pull",
        "notes": "Full back development session — vertical and horizontal pulls combined with heavy deadlift. Rest 2-3 min on deadlifts, 90s on accessories.",
        "exercises": [
            {"exercise_name": "Deadlift", "sets": 4, "reps": "5", "weight": "80% 1RM", "notes": "Reset every rep, brace before the pull"},
            {"exercise_name": "Barbell Bent-Over Row", "sets": 4, "reps": "8", "weight": "70% 1RM", "notes": "Controlled, pause at top"},
            {"exercise_name": "Lat Pulldown", "sets": 3, "reps": "12", "weight": "60kg", "notes": "Wide grip, pull to upper chest"},
            {"exercise_name": "Seated Cable Row", "sets": 3, "reps": "12", "weight": "Medium", "notes": "Neutral grip, full retraction"},
            {"exercise_name": "Rear Delt Flys", "sets": 3, "reps": "15", "weight": "8kg pair", "notes": "Lead with elbows, slight bend in arms"},
        ]
    },
    {
        "name": "PL-04 Bicep Blaster", "workout_type": "lift", "custom_type_label": "Pull",
        "notes": "Bicep isolation focus. Rest 60-90s between sets. Use a full range of motion on every exercise — no ego lifting.",
        "exercises": [
            {"exercise_name": "Barbell Curl", "sets": 5, "reps": "10", "weight": "30-40kg", "notes": "Supinate fully at top, slow 3-count eccentric"},
            {"exercise_name": "Incline DB Curl", "sets": 4, "reps": "10", "weight": "12.5-15kg", "notes": "Full stretch at bottom, great for long head"},
            {"exercise_name": "Hammer Curls", "sets": 3, "reps": "12", "weight": "15kg pair", "notes": "Neutral grip, targets brachialis"},
            {"exercise_name": "Cable Curl", "sets": 3, "reps": "15", "weight": "Cable (light)", "notes": "Constant tension throughout ROM"},
            {"exercise_name": "21s", "sets": 3, "reps": "21 (7/7/7)", "weight": "20kg barbell", "notes": "7 bottom-half, 7 top-half, 7 full reps"},
        ]
    },
    {
        "name": "PL-05 Pull AMRAP Blitz", "workout_type": "custom", "custom_type_label": "Pull",
        "notes": "AMRAP 20 — Score: Total rounds + reps. Manage pull-up grip — chalk helps. Scale pull-ups to ring rows if needed.",
        "exercises": [
            {"exercise_name": "Pull Ups", "sets": None, "reps": "10", "weight": "Bodyweight", "notes": "Dead hang start, chin over bar"},
            {"exercise_name": "DB Row", "sets": None, "reps": "12 each arm", "weight": "25kg", "notes": "Alternate arms or do both simultaneously"},
            {"exercise_name": "Barbell Curls", "sets": None, "reps": "15", "weight": "25-30kg", "notes": "Full ROM — do not cheat"},
        ]
    },
    {
        "name": "PL-06 Deadlift + Pull Circuit", "workout_type": "lift", "custom_type_label": "Pull",
        "notes": "Strength-focused posterior chain session. Heavy and demanding — eat beforehand. Rest 2-3 min between all sets.",
        "exercises": [
            {"exercise_name": "Deadlift", "sets": 5, "reps": "5", "weight": "80% 1RM", "notes": "Reset every rep — no touch-and-go"},
            {"exercise_name": "Barbell Bent-Over Row", "sets": 5, "reps": "5", "weight": "70% 1RM", "notes": "Hinge to 45°, explosive pull"},
            {"exercise_name": "Pull Ups", "sets": 5, "reps": "Max", "weight": "Bodyweight", "notes": "Go until form breaks — stop there"},
            {"exercise_name": "Farmer Carry", "sets": 4, "reps": "50m", "weight": "24kg each hand", "notes": "Tall posture, controlled breathing"},
        ]
    },
    {
        "name": "PL-07 Pull Power EMOM", "workout_type": "custom", "custom_type_label": "Pull",
        "notes": "EMOM 18 (6 rounds, 3-movement rotation) — Score: Complete each minute with 10+ sec rest. This is explosive pull strength.",
        "exercises": [
            {"exercise_name": "Hang Cleans", "sets": 6, "reps": "6", "weight": "60-70kg", "notes": "Min 1 — Hip drive, fast elbows under"},
            {"exercise_name": "Pull Ups", "sets": 6, "reps": "8", "weight": "Bodyweight", "notes": "Min 2 — Explosive, fast up, slow down"},
            {"exercise_name": "Barbell Bent-Over Row", "sets": 6, "reps": "10", "weight": "60kg", "notes": "Min 3 — Controlled, pause at top"},
        ]
    },
    {
        "name": "PL-08 Lat Dominator", "workout_type": "lift", "custom_type_label": "Pull",
        "notes": "Lat-focused pulling session. Emphasize the stretch and contraction in every rep. Rest 90s between sets.",
        "exercises": [
            {"exercise_name": "Lat Pulldown (wide grip)", "sets": 5, "reps": "12", "weight": "60-70kg", "notes": "Pull to upper chest, squeeze lats hard"},
            {"exercise_name": "Lat Pulldown (close grip)", "sets": 4, "reps": "10", "weight": "65-75kg", "notes": "Slightly heavier, squeeze and hold 1s"},
            {"exercise_name": "Straight-Arm Pulldown", "sets": 4, "reps": "12", "weight": "Cable (light)", "notes": "Arms mostly straight, isolates lats"},
            {"exercise_name": "Single-Arm Lat Pulldown", "sets": 3, "reps": "12 each", "weight": "30-35kg", "notes": "Full stretch at top, squeeze at bottom"},
            {"exercise_name": "Pull Ups", "sets": 3, "reps": "Max", "weight": "Bodyweight", "notes": "Finisher — go to failure"},
        ]
    },
    {
        "name": "PL-09 Rear Delt & Upper Back", "workout_type": "lift", "custom_type_label": "Pull",
        "notes": "Upper back health and shoulder stability. Light but high-quality work. Rest 60s between sets — these are accessory movements.",
        "exercises": [
            {"exercise_name": "Face Pulls", "sets": 5, "reps": "15", "weight": "Light cable", "notes": "Pull to forehead, elbows high, strong external rotation"},
            {"exercise_name": "Rear Delt Flys", "sets": 4, "reps": "15", "weight": "8kg pair", "notes": "Hinge forward, lead with elbows"},
            {"exercise_name": "Band Pull-Aparts", "sets": 4, "reps": "20", "weight": "Band", "notes": "Keep arms straight, squeeze shoulder blades"},
            {"exercise_name": "Y-T-W Raises", "sets": 3, "reps": "10 each position", "weight": "5kg pair", "notes": "Prone on bench or standing hinged"},
            {"exercise_name": "Prone Cobra", "sets": 3, "reps": "20", "weight": "Bodyweight", "notes": "Lie face down, lift arms and chest off floor"},
        ]
    },
    {
        "name": "PL-10 Pull Superset Circuit", "workout_type": "lift", "custom_type_label": "Pull",
        "notes": "3 supersets, 4 rounds each. Rest 90s between supersets only. Pairing antagonistic movements maximizes volume.",
        "exercises": [
            {"exercise_name": "Barbell Bent-Over Row (Superset A)", "sets": 4, "reps": "10", "weight": "65-70kg", "notes": "Go straight to curls"},
            {"exercise_name": "Barbell Curls (Superset A)", "sets": 4, "reps": "12", "weight": "30-35kg", "notes": "Rest 90s after curls"},
            {"exercise_name": "Lat Pulldown (Superset B)", "sets": 4, "reps": "10", "weight": "65kg", "notes": "Go straight to face pulls"},
            {"exercise_name": "Face Pulls (Superset B)", "sets": 4, "reps": "15", "weight": "Light cable", "notes": "Rest 90s after face pulls"},
            {"exercise_name": "Pull Ups (Superset C)", "sets": 3, "reps": "Max", "weight": "Bodyweight", "notes": "Go straight to hammer curls"},
            {"exercise_name": "Hammer Curls (Superset C)", "sets": 3, "reps": "12", "weight": "12.5-15kg", "notes": "Rest 90s after hammer curls"},
        ]
    },
    # ── Leg Workouts (new) ────────────────────────────────────────────────────
    {
        "name": "L-01 Heavy Squat Day", "workout_type": "lift", "custom_type_label": "Legs",
        "notes": "Quad-dominant strength session. Heaviest squat day of the week. Rest 3 min between main squat sets.",
        "exercises": [
            {"exercise_name": "Back Squat", "sets": 5, "reps": "5", "weight": "80% 1RM", "notes": "Below parallel, chest tall, drive knees out"},
            {"exercise_name": "Romanian Deadlift", "sets": 4, "reps": "8", "weight": "70kg", "notes": "Soft knees, hinge until stretch, drive hips through"},
            {"exercise_name": "Leg Press", "sets": 3, "reps": "12", "weight": "120kg", "notes": "Full depth, feet shoulder width"},
            {"exercise_name": "Walking Lunges", "sets": 3, "reps": "12 each leg", "weight": "15-20kg DBs", "notes": "Knee tracks over toe, tall torso"},
            {"exercise_name": "Calf Raises", "sets": 4, "reps": "20", "weight": "Loaded (machine or barbell)", "notes": "Full stretch at bottom, pause at top"},
        ]
    },
    {
        "name": "L-02 Squat Pyramid", "workout_type": "lift", "custom_type_label": "Legs",
        "notes": "Pyramid squat session for strength-endurance crossover. Build load as reps drop, finish with a high-rep burnout set. Rest 2-3 min between sets.",
        "exercises": [
            {"exercise_name": "Back Squat", "sets": None, "reps": "12, 10, 8, 6, 4 (then 1x20 @ 50%)", "weight": "Add weight as reps decrease; 50% for finisher", "notes": "The set of 20 is the money set — ugly but honest"},
            {"exercise_name": "Box Step-Ups", "sets": 3, "reps": "15 each leg", "weight": "20kg DBs", "notes": "Drive through heel, squeeze glute at top"},
            {"exercise_name": "Goblet Squat", "sets": 3, "reps": "15", "weight": "24-32kg KB", "notes": "Elbows inside knees, tall spine"},
        ]
    },
    {
        "name": "L-03 Hamstring Focus", "workout_type": "lift", "custom_type_label": "Legs",
        "notes": "Posterior chain emphasis — hamstring and glute dominant. Rest 2 min between main lifts, 90s on accessories.",
        "exercises": [
            {"exercise_name": "Romanian Deadlift", "sets": 5, "reps": "8", "weight": "75% 1RM", "notes": "Hinge until deep hamstring stretch, drive hips forward"},
            {"exercise_name": "Leg Curl (machine)", "sets": 4, "reps": "12", "weight": "Moderate", "notes": "Full ROM, hold 1s at peak contraction"},
            {"exercise_name": "Good Mornings", "sets": 3, "reps": "12", "weight": "40-50kg", "notes": "Moderate load — hinge movement, not squat"},
            {"exercise_name": "Nordic Hamstring Curl", "sets": 3, "reps": "8", "weight": "Bodyweight", "notes": "Partner anchors feet, lower slowly — hard but worth it"},
            {"exercise_name": "Glute-Ham Raise", "sets": 3, "reps": "10", "weight": "Bodyweight (add weight if easy)", "notes": "Full extension then curl — brutal finishing movement"},
        ]
    },
    {
        "name": "L-04 Glute Builder", "workout_type": "lift", "custom_type_label": "Legs",
        "notes": "Glute-dominant leg session. Squeeze and hold at peak contraction on every rep. Rest 90s between sets.",
        "exercises": [
            {"exercise_name": "Hip Thrust", "sets": 5, "reps": "10", "weight": "80-100kg barbell", "notes": "Shoulders on bench, drive hips up hard, squeeze 2s at top"},
            {"exercise_name": "Bulgarian Split Squat", "sets": 4, "reps": "10 each leg", "weight": "20-22.5kg DBs", "notes": "Rear foot elevated, deep ROM, glute emphasis"},
            {"exercise_name": "Cable Kickback", "sets": 4, "reps": "15 each leg", "weight": "Light cable", "notes": "Keep hips square, squeeze glute at top"},
            {"exercise_name": "Glute Bridge", "sets": 3, "reps": "20", "weight": "Bodyweight (or plate on hips)", "notes": "Drive through heels, pause 1s at top"},
            {"exercise_name": "Sumo Deadlift", "sets": 4, "reps": "8", "weight": "70-80kg", "notes": "Wide stance, toes out, glute and inner thigh drive"},
        ]
    },
    {
        "name": "L-05 Leg AMRAP", "workout_type": "custom", "custom_type_label": "Legs",
        "notes": "AMRAP 20 — Score: Total rounds + reps. Don't underestimate this — the box jumps and swings will smoke you.",
        "exercises": [
            {"exercise_name": "Air Squats", "sets": None, "reps": "20", "weight": "Bodyweight", "notes": "Below parallel, chest tall, fast turnaround"},
            {"exercise_name": "Kettlebell Swings", "sets": None, "reps": "15", "weight": "24kg / 20kg", "notes": "Hip drive — not a squat movement"},
            {"exercise_name": "Box Jumps", "sets": None, "reps": "10", "weight": "24in / 20in box", "notes": "Full hip extension at top, step down"},
            {"exercise_name": "Walking Lunges", "sets": None, "reps": "20 steps", "weight": "Bodyweight", "notes": "Knee tracks over toe each step"},
        ]
    },
    {
        "name": "L-06 Hinge Day", "workout_type": "lift", "custom_type_label": "Legs",
        "notes": "Posterior chain hinge-dominant session. Deadlift is the main event. Rest 3 min between main lift sets.",
        "exercises": [
            {"exercise_name": "Conventional Deadlift", "sets": 5, "reps": "5", "weight": "85% 1RM", "notes": "Heaviest movement — set the back, brace, drive the floor away"},
            {"exercise_name": "Sumo Deadlift", "sets": 4, "reps": "6", "weight": "70% 1RM", "notes": "Wide stance variation — targets glutes and inner thigh"},
            {"exercise_name": "Kettlebell Swings", "sets": 4, "reps": "20", "weight": "24-32kg", "notes": "Explosive hip snap — condition the posterior chain"},
            {"exercise_name": "Romanian Deadlift", "sets": 3, "reps": "10", "weight": "60kg", "notes": "Lighter — focus on hamstring stretch and feel"},
            {"exercise_name": "Back Extensions", "sets": 3, "reps": "15", "weight": "Bodyweight or plate", "notes": "Finisher — squeeze glutes at top of each rep"},
        ]
    },
    {
        "name": "L-07 Bulgarian Split Squat Circuit", "workout_type": "lift", "custom_type_label": "Legs",
        "notes": "Unilateral leg strength and stability. This session will expose imbalances. Rest 90s between sets — legs need it.",
        "exercises": [
            {"exercise_name": "Bulgarian Split Squat", "sets": 5, "reps": "8 each leg", "weight": "22.5kg DBs", "notes": "Rear foot elevated, deep ROM, stay upright"},
            {"exercise_name": "Reverse Lunge", "sets": 4, "reps": "10 each leg", "weight": "20kg DBs", "notes": "Step back, knee hovers just above floor"},
            {"exercise_name": "Step-Ups", "sets": 3, "reps": "12 each leg", "weight": "20kg DBs", "notes": "Drive through lead foot, don't push off back foot"},
            {"exercise_name": "Single-Leg Romanian Deadlift", "sets": 3, "reps": "10 each leg", "weight": "15-20kg DB", "notes": "Hinge to 90° or until hamstring stretch, core braced"},
            {"exercise_name": "Single-Leg Calf Raise", "sets": 3, "reps": "20 each leg", "weight": "Bodyweight or DB", "notes": "Full stretch at bottom, pause at top"},
        ]
    },
    {
        "name": "L-08 Leg Power EMOM", "workout_type": "custom", "custom_type_label": "Legs",
        "notes": "EMOM 18 (6 rounds, 3-movement rotation) — Score: Complete each minute with 10+ sec rest. Explosive leg power development.",
        "exercises": [
            {"exercise_name": "Back Squat", "sets": 6, "reps": "5", "weight": "80% 1RM", "notes": "Min 1 — Explosive drive out of the hole, controlled descent"},
            {"exercise_name": "Box Jumps", "sets": 6, "reps": "8", "weight": "24in box", "notes": "Min 2 — Maximum height, soft landing, full hip extension at top"},
            {"exercise_name": "Kettlebell Swings", "sets": 6, "reps": "15", "weight": "24-32kg", "notes": "Min 3 — Explosive hip snap, American or Russian"},
        ]
    },
    {
        "name": "L-09 Unilateral Leg Day", "workout_type": "lift", "custom_type_label": "Legs",
        "notes": "Single-leg focus for balance, stability, and eliminating asymmetries. Rest 90s between sets. Both legs must match.",
        "exercises": [
            {"exercise_name": "Single-Leg Leg Press", "sets": 4, "reps": "12 each leg", "weight": "80-100kg", "notes": "Full depth, drive through heel"},
            {"exercise_name": "Single-Leg Romanian Deadlift", "sets": 4, "reps": "10 each leg", "weight": "15-20kg DB", "notes": "Balance challenge — move slow and controlled"},
            {"exercise_name": "Walking Lunges", "sets": 4, "reps": "15 each leg", "weight": "15-20kg DBs", "notes": "Continuous walking, keep torso tall"},
            {"exercise_name": "Step-Ups", "sets": 3, "reps": "12 each leg", "weight": "20-25kg DBs", "notes": "24in box — full hip extension at top"},
            {"exercise_name": "Single-Leg Calf Raise", "sets": 3, "reps": "20 each leg", "weight": "Bodyweight (or hold DB)", "notes": "Full range of motion — burn them out"},
        ]
    },
    {
        "name": "L-10 Leg Volume Day", "workout_type": "lift", "custom_type_label": "Legs",
        "notes": "High-volume hypertrophy session. 90s rest between sets. Volume is the driver — moderately heavy, many reps.",
        "exercises": [
            {"exercise_name": "Front Squat", "sets": 4, "reps": "10", "weight": "60-70kg", "notes": "Elbows high, upright torso, deep squat"},
            {"exercise_name": "Leg Press", "sets": 4, "reps": "15", "weight": "120-140kg", "notes": "Full ROM, feet shoulder width"},
            {"exercise_name": "Leg Extension", "sets": 3, "reps": "15", "weight": "Moderate", "notes": "Slow eccentric, hold 1s at top"},
            {"exercise_name": "Leg Curl", "sets": 3, "reps": "15", "weight": "Moderate", "notes": "Full ROM, controlled throughout"},
            {"exercise_name": "Walking Lunges", "sets": 3, "reps": "20 each leg", "weight": "10-15kg DBs", "notes": "High volume finisher — go until it burns"},
            {"exercise_name": "Calf Raises", "sets": 4, "reps": "25", "weight": "Loaded", "notes": "Full stretch every rep — don't shortchange the range"},
        ]
    },
]


def seed_warfighter_templates(db: Session) -> None:
    if db.query(WorkoutTemplate).count() > 0:
        return
    for tmpl in _WARFIGHTER_TEMPLATES:
        t = WorkoutTemplate(
            name=tmpl["name"],
            workout_type=tmpl["workout_type"],
            custom_type_label=tmpl.get("custom_type_label"),
            notes=tmpl.get("notes"),
        )
        db.add(t)
        db.flush()
        for i, ex in enumerate(tmpl.get("exercises", [])):
            db.add(WorkoutTemplateExercise(
                template_id=t.id,
                exercise_name=ex["exercise_name"],
                sets=ex.get("sets"),
                reps=ex.get("reps"),
                weight=ex.get("weight"),
                notes=ex.get("notes"),
                sort_order=i,
            ))
    db.commit()
