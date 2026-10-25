# ---------------------------------------------------------
# PREPARE DATA FOR VIEW 3
# Calendar Patterns
# ---------------------------------------------------------

import csv
import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime, date, timedelta


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
    / "calendar.json"
)


# ---------------------------------------------------------
# We use 1900–2025 for full-year comparisons.
# 2026 is excluded because it is partial.
# ---------------------------------------------------------

START_YEAR = 1900
END_YEAR = 2025


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
# Missing/incomplete years identified in the source data.
# These are excluded from calendar-rate calculations.
# ---------------------------------------------------------

EXCLUDED_YEARS = {
    2000,
    2005,
    2006,
    2010,
    2011,
    2015,
    2016,
    2020,
    2021,
}


# ---------------------------------------------------------
# Calendar labels
# ---------------------------------------------------------

WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
]

MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]


# ---------------------------------------------------------
# Event counters
# ---------------------------------------------------------

month_weekday_counts = defaultdict(
    lambda: defaultdict(
        lambda: defaultdict(int)
    )
)

day_of_month_counts = defaultdict(
    lambda: defaultdict(int)
)


# ---------------------------------------------------------
# Read earthquake records
# ---------------------------------------------------------

with SOURCE_FILE.open("r", encoding="utf-8") as file:

    reader = csv.DictReader(file)

    for row in reader:

        year = int(row["year"])

        # Skip incomplete or missing years.
        if year < START_YEAR or year > END_YEAR:
            continue

        if year in EXCLUDED_YEARS:
            continue

        event_date = datetime.strptime(
            row["date"],
            "%Y-%m-%d"
        )

        magnitude = float(row["magnitude"])

        month_name = event_date.strftime("%B")
        weekday_name = event_date.strftime("%A")
        day_number = event_date.day

        # Count the event at every threshold it satisfies.
        for threshold in MAGNITUDE_THRESHOLDS:

            if magnitude >= threshold:

                key = str(threshold)

                month_weekday_counts[key][month_name][weekday_name] += 1

                day_of_month_counts[key][day_number] += 1


# ---------------------------------------------------------
# Count how many calendar opportunities exist.
#
# Example:
# How many Mondays occurred in January across all valid
# years? This lets us calculate events per calendar day
# rather than misleading raw totals.
# ---------------------------------------------------------

month_weekday_opportunities = defaultdict(
    lambda: defaultdict(int)
)

day_of_month_opportunities = defaultdict(int)


for year in range(
    START_YEAR,
    END_YEAR + 1
):

    if year in EXCLUDED_YEARS:
        continue

    current = date(year, 1, 1)
    end = date(year, 12, 31)

    while current <= end:

        month_name = current.strftime("%B")
        weekday_name = current.strftime("%A")
        day_number = current.day

        month_weekday_opportunities[
            month_name
        ][weekday_name] += 1

        day_of_month_opportunities[
            day_number
        ] += 1

        current += timedelta(days=1)


# ---------------------------------------------------------
# Build final JSON
# ---------------------------------------------------------

output = {
    "start_year": START_YEAR,
    "end_year": END_YEAR,
    "excluded_years": sorted(EXCLUDED_YEARS),
    "month_weekday": {},
    "day_of_month": {},
}


for threshold in MAGNITUDE_THRESHOLDS:

    key = str(threshold)

    # -----------------------------------------------------
    # Month × weekday rates
    # -----------------------------------------------------

    matrix = []

    for month in MONTHS:

        row = []

        for weekday in WEEKDAYS:

            events = (
                month_weekday_counts[key]
                [month]
                [weekday]
            )

            opportunities = (
                month_weekday_opportunities
                [month]
                [weekday]
            )

            rate = (
                events / opportunities
                if opportunities > 0
                else 0
            )

            row.append({
                "events": events,
                "opportunities": opportunities,
                "rate": round(rate, 4),
            })

        matrix.append(row)

    output["month_weekday"][key] = matrix


    # -----------------------------------------------------
    # Day-of-month rates
    # -----------------------------------------------------

    day_rows = []

    for day_number in range(1, 32):

        events = (
            day_of_month_counts[key]
            [day_number]
        )

        opportunities = (
            day_of_month_opportunities
            [day_number]
        )

        rate = (
            events / opportunities
            if opportunities > 0
            else 0
        )

        day_rows.append({
            "day": day_number,
            "events": events,
            "opportunities": opportunities,
            "rate": round(rate, 4),
        })

    output["day_of_month"][key] = day_rows


# ---------------------------------------------------------
# Save JSON
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
        output,
        file,
        indent=2
    )


print("Calendar data preparation complete.")
print(f"Output: {OUTPUT_FILE}")
print(
    "Excluded years:",
    sorted(EXCLUDED_YEARS)
)