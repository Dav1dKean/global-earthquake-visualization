# ---------------------------------------------------------
# PREPARE DATA FOR VIEW 5
# Earthquake Depth Visualization
# ---------------------------------------------------------

import csv
import json
from pathlib import Path
from collections import defaultdict


ROOT = Path(__file__).resolve().parent.parent

SOURCE_FILE = ROOT / "sources" / "earthquakes.csv"

OUTPUT_FOLDER = (
    ROOT
    / "web"
    / "public"
    / "data"
    / "depth"
)

OUTPUT_FOLDER.mkdir(
    parents=True,
    exist_ok=True
)


# ---------------------------------------------------------
# Store usable depth events by year.
# ---------------------------------------------------------

events_by_year = defaultdict(list)

missing_depth_by_year = defaultdict(int)


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

        # Depth can be missing.
        if not row["depth_km"].strip():

            missing_depth_by_year[year] += 1

            continue

        depth = float(
            row["depth_km"]
        )

        magnitude = float(
            row["magnitude"]
        )


        events_by_year[year].append({
            "date":
                row["date"],

            "longitude":
                round(
                    float(
                        row["lon"]
                    ),
                    4
                ),

            "latitude":
                round(
                    float(
                        row["lat"]
                    ),
                    4
                ),

            "depth_km":
                round(
                    depth,
                    1
                ),

            "magnitude":
                round(
                    magnitude,
                    2
                ),

            "location":
                row[
                    "location_desc"
                ],
        })


# ---------------------------------------------------------
# Write one JSON file per year.
# ---------------------------------------------------------

manifest = []

for year in range(
    1900,
    2027
):

    events = (
        events_by_year
        .get(
            year,
            []
        )
    )

    missing_depth = (
        missing_depth_by_year
        .get(
            year,
            0
        )
    )


    if (
        len(events) == 0
        and missing_depth == 0
    ):

        status = "missing"

    elif year in [
        2006,
        2026
    ]:

        status = "partial"

    else:

        status = "available"


    year_data = {
        "year":
            year,

        "status":
            status,

        "known_depth_events":
            len(events),

        "missing_depth_events":
            missing_depth,

        "events":
            events,
    }


    output_file = (
        OUTPUT_FOLDER
        / f"{year}.json"
    )

    with output_file.open(
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            year_data,
            file,
            separators=(
                ",",
                ":"
            ),
            ensure_ascii=False
        )


    manifest.append({
        "year":
            year,

        "status":
            status,

        "known_depth_events":
            len(events),

        "missing_depth_events":
            missing_depth,
    })


# ---------------------------------------------------------
# Write manifest.
# ---------------------------------------------------------

with (
    OUTPUT_FOLDER
    / "manifest.json"
).open(
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        manifest,
        file,
        indent=2
    )


print(
    "Depth data preparation complete."
)

print(
    "Total known-depth events:",
    sum(
        len(events)
        for events
        in events_by_year.values()
    )
)

print(
    "Total missing-depth events:",
    sum(
        missing_depth_by_year.values()
    )
)