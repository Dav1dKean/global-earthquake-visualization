# ---------------------------------------------------------
# PREPARE DATA FOR VIEW 2
# Animated Earthquake Timeline
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

OUTPUT_FILE = (
    ROOT
    / "web"
    / "public"
    / "data"
    / "timeline.json"
)


# ---------------------------------------------------------
# Magnitude thresholds supported by the website.
# ---------------------------------------------------------

MAGNITUDE_THRESHOLDS = [
    4.5,
    5.0,
    5.5,
    6.0,
    6.5,
    7.0,
    7.5,
    8.0
]


# ---------------------------------------------------------
# Data containers
# ---------------------------------------------------------

year_counts = defaultdict(
    lambda: {str(threshold): 0 for threshold in MAGNITUDE_THRESHOLDS}
)

first_date = {}
last_date = {}


# ---------------------------------------------------------
# Read the earthquake CSV.
# ---------------------------------------------------------

with SOURCE_FILE.open("r", encoding="utf-8") as file:

    reader = csv.DictReader(file)

    for row in reader:

        year = int(row["year"])
        date = row["date"]
        magnitude = float(row["magnitude"])

        # ---------------------------------------------
        # Track available date coverage for each year.
        # ---------------------------------------------

        if year not in first_date:
            first_date[year] = date
            last_date[year] = date

        first_date[year] = min(first_date[year], date)
        last_date[year] = max(last_date[year], date)


        # ---------------------------------------------
        # Count the earthquake under every magnitude
        # threshold that it satisfies.
        #
        # Example:
        # M7.2 counts toward:
        # 4.5+, 5+, 5.5+, 6+, 6.5+, and 7+
        # ---------------------------------------------

        for threshold in MAGNITUDE_THRESHOLDS:

            if magnitude >= threshold:
                year_counts[year][str(threshold)] += 1


# ---------------------------------------------------------
# Create complete year sequence.
# ---------------------------------------------------------

timeline = []

for year in range(1900, 2027):

    if year not in year_counts:

        status = "missing"

        timeline.append({
            "year": year,
            "status": status,
            "first_date": None,
            "last_date": None,
            "counts": {
                str(threshold): None
                for threshold in MAGNITUDE_THRESHOLDS
            }
        })

        continue


    # -----------------------------------------------------
    # We already verified that 2006 contains only
    # Dec 8–31 in this dataset.
    #
    # 2026 ends May 14 and is also a partial year.
    # -----------------------------------------------------

    if year in [2006, 2026]:
        status = "partial"
    else:
        status = "available"


    timeline.append({
        "year": year,
        "status": status,
        "first_date": first_date[year],
        "last_date": last_date[year],
        "counts": year_counts[year]
    })


# ---------------------------------------------------------
# Save JSON.
# ---------------------------------------------------------

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

with OUTPUT_FILE.open(
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        timeline,
        file,
        indent=2
    )


# ---------------------------------------------------------
# Verification output.
# ---------------------------------------------------------

missing_years = [
    row["year"]
    for row in timeline
    if row["status"] == "missing"
]

print("Timeline preparation complete.")
print(f"Output: {OUTPUT_FILE}")

print(
    "Missing years:",
    missing_years
)

print(
    "2006 coverage:",
    first_date.get(2006),
    "to",
    last_date.get(2006)
)

print(
    "2026 coverage:",
    first_date.get(2026),
    "to",
    last_date.get(2026)
)