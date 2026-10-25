# ---------------------------------------------------------
# PREPARE YEAR-BY-YEAR DATA FOR VIEW 1
# Global Earthquake Map
# ---------------------------------------------------------

import csv
import json
from pathlib import Path
from collections import defaultdict


# ---------------------------------------------------------
# File locations
# ---------------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent

SOURCE_FILE = ROOT / "sources" / "earthquakes.csv"

OUTPUT_FOLDER = ROOT / "web" / "public" / "data" / "map"


# Create the output folder if it does not already exist.
OUTPUT_FOLDER.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# Store earthquake records by year.
# ---------------------------------------------------------

events_by_year = defaultdict(list)

first_date_by_year = {}
last_date_by_year = {}


# ---------------------------------------------------------
# Read the original earthquake CSV.
# ---------------------------------------------------------

with SOURCE_FILE.open("r", encoding="utf-8") as file:

    reader = csv.DictReader(file)

    for row in reader:

        year = int(row["year"])
        date = row["date"]

        # Keep track of the first and last dates available
        # for each year. This helps us document data coverage.
        if year not in first_date_by_year:
            first_date_by_year[year] = date
            last_date_by_year[year] = date

        if date < first_date_by_year[year]:
            first_date_by_year[year] = date

        if date > last_date_by_year[year]:
            last_date_by_year[year] = date


        # Depth can be missing, so convert it safely.
        depth = None

        if row["depth_km"].strip():
            depth = round(float(row["depth_km"]), 1)


        # Save only the variables needed by the map.
        event = {
            "date": date,
            "lat": round(float(row["lat"]), 4),
            "lon": round(float(row["lon"]), 4),
            "magnitude": round(float(row["magnitude"]), 2),
            "depth_km": depth,
            "location": row["location_desc"]
        }

        events_by_year[year].append(event)


# ---------------------------------------------------------
# Write one JSON file for every year from 1900–2026.
#
# This keeps individual browser downloads small.
# Missing years will still get a file with zero events.
# ---------------------------------------------------------

manifest = []

for year in range(1900, 2027):

    events = events_by_year.get(year, [])

    if len(events) == 0:
        status = "missing"
        first_date = None
        last_date = None
    else:
        status = "available"
        first_date = first_date_by_year[year]
        last_date = last_date_by_year[year]


    year_data = {
        "year": year,
        "status": status,
        "first_date": first_date,
        "last_date": last_date,
        "event_count": len(events),
        "events": events
    }


    output_file = OUTPUT_FOLDER / f"{year}.json"

    with output_file.open("w", encoding="utf-8") as file:
        json.dump(
            year_data,
            file,
            separators=(",", ":"),
            ensure_ascii=False
        )


    manifest.append({
        "year": year,
        "status": status,
        "first_date": first_date,
        "last_date": last_date,
        "event_count": len(events)
    })


# ---------------------------------------------------------
# Save a small manifest describing coverage by year.
# ---------------------------------------------------------

manifest_file = OUTPUT_FOLDER / "manifest.json"

with manifest_file.open("w", encoding="utf-8") as file:
    json.dump(
        manifest,
        file,
        indent=2,
        ensure_ascii=False
    )


# ---------------------------------------------------------
# Confirmation
# ---------------------------------------------------------

print("Map data preparation complete.")
print(f"Source: {SOURCE_FILE}")
print(f"Output: {OUTPUT_FOLDER}")
print(f"Years created: {len(manifest)}")
print(f"Total events processed: {sum(len(v) for v in events_by_year.values()):,}")