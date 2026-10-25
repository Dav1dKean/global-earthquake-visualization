# ---------------------------------------------------------
# PREPARE DATA FOR VIEW 4
# Earthquake Magnitude Distribution
# ---------------------------------------------------------

import csv
import json
from pathlib import Path
from collections import defaultdict


ROOT = Path(__file__).resolve().parent.parent

SOURCE_FILE = ROOT / "sources" / "earthquakes.csv"

OUTPUT_FILE = (
    ROOT
    / "web"
    / "public"
    / "data"
    / "magnitude.json"
)


# ---------------------------------------------------------
# Magnitude categories used by the project.
# ---------------------------------------------------------

CLASSES = [
    "Light (M4.5-4.9)",
    "Moderate (M5-5.9)",
    "Strong (M6-6.9)",
    "Major (M7-7.9)",
    "Great (M8+)",
]


# ---------------------------------------------------------
# Store counts by year and for the full dataset.
# ---------------------------------------------------------

year_counts = defaultdict(
    lambda: {category: 0 for category in CLASSES}
)

all_counts = {
    category: 0
    for category in CLASSES
}

year_event_counts = defaultdict(int)

max_magnitude = None
max_events = []


# ---------------------------------------------------------
# Read earthquake CSV.
# ---------------------------------------------------------

with SOURCE_FILE.open(
    "r",
    encoding="utf-8"
) as file:

    reader = csv.DictReader(file)

    for row in reader:

        year = int(row["year"])
        magnitude = float(row["magnitude"])
        category = row["magnitude_class"]

        year_event_counts[year] += 1

        # Count predefined magnitude classes.
        if category in CLASSES:
            year_counts[year][category] += 1
            all_counts[category] += 1

        # Track maximum magnitude event(s).
        if (
            max_magnitude is None
            or magnitude > max_magnitude
        ):
            max_magnitude = magnitude

            max_events = [{
                "date": row["date"],
                "magnitude": magnitude,
                "location": row["location_desc"],
                "depth_km": (
                    float(row["depth_km"])
                    if row["depth_km"].strip()
                    else None
                ),
            }]

        elif magnitude == max_magnitude:

            max_events.append({
                "date": row["date"],
                "magnitude": magnitude,
                "location": row["location_desc"],
                "depth_km": (
                    float(row["depth_km"])
                    if row["depth_km"].strip()
                    else None
                ),
            })


# ---------------------------------------------------------
# Build year-by-year output.
# ---------------------------------------------------------

years = []

for year in range(1900, 2027):

    if year not in year_event_counts:

        years.append({
            "year": year,
            "status": "missing",
            "total_events": 0,
            "counts": None,
        })

    else:

        years.append({
            "year": year,
            "status": (
                "partial"
                if year in [2006, 2026]
                else "available"
            ),
            "total_events":
                year_event_counts[year],
            "counts":
                year_counts[year],
        })


# ---------------------------------------------------------
# Final JSON
# ---------------------------------------------------------

output = {
    "classes": CLASSES,

    "all_years": {
        "total_events":
            sum(year_event_counts.values()),
        "counts":
            all_counts,
    },

    "years":
        years,

    "maximum": {
        "magnitude":
            max_magnitude,
        "occurrences":
            len(max_events),
        "events":
            max_events,
    },
}


OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

with OUTPUT_FILE.open(
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        output,
        file,
        indent=2,
        ensure_ascii=False
    )


print("Magnitude data preparation complete.")
print(f"Output: {OUTPUT_FILE}")

print(
    "M8+ earthquakes:",
    all_counts["Great (M8+)"]
)

print(
    "Maximum magnitude:",
    max_magnitude
)

print(
    "Maximum magnitude occurrences:",
    len(max_events)
)