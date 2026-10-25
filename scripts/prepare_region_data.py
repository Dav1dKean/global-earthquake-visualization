# ---------------------------------------------------------
# PREPARE DATA FOR VIEW 6
# Regional Earthquake Comparison
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
    / "regions.json"
)


# ---------------------------------------------------------
# Geographic comparison boxes
#
# These are broad study areas, not political boundaries.
# ---------------------------------------------------------

REGIONS = {

    "Japan": {
        "lat_min": 24,
        "lat_max": 46,
        "lon_min": 123,
        "lon_max": 146,
    },

    "Chile": {
        "lat_min": -56,
        "lat_max": -17,
        "lon_min": -76,
        "lon_max": -66,
    },

    "California": {
        "lat_min": 32,
        "lat_max": 42,
        "lon_min": -125,
        "lon_max": -114,
    },

    "Indonesia": {
        "lat_min": -11,
        "lat_max": 6,
        "lon_min": 95,
        "lon_max": 141,
    },

    "Alaska": {
        "lat_min": 51,
        "lat_max": 72,
        "lon_min": -180,
        "lon_max": -129,
    },
}


MAG_CLASSES = [
    "Light (M4.5-4.9)",
    "Moderate (M5-5.9)",
    "Strong (M6-6.9)",
    "Major (M7-7.9)",
    "Great (M8+)",
]


# ---------------------------------------------------------
# Storage
# ---------------------------------------------------------

region_events = defaultdict(list)

year_counts = defaultdict(
    lambda: defaultdict(int)
)

magnitude_counts = defaultdict(
    lambda: {
        category: 0
        for category in MAG_CLASSES
    }
)

depth_values = defaultdict(list)


# ---------------------------------------------------------
# Helper function:
# determine whether an earthquake falls inside a region.
# ---------------------------------------------------------

def inside_region(lat, lon, region):

    return (
        region["lat_min"]
        <= lat
        <= region["lat_max"]
        and
        region["lon_min"]
        <= lon
        <= region["lon_max"]
    )


# ---------------------------------------------------------
# Read CSV
# ---------------------------------------------------------

with SOURCE_FILE.open(
    "r",
    encoding="utf-8"
) as file:

    reader = csv.DictReader(file)

    for row in reader:

        lat = float(row["lat"])
        lon = float(row["lon"])
        year = int(row["year"])

        magnitude = float(
            row["magnitude"]
        )

        magnitude_class = (
            row["magnitude_class"]
        )


        depth = None

        if row["depth_km"].strip():

            depth = float(
                row["depth_km"]
            )


        for region_name, bounds in REGIONS.items():

            if inside_region(
                lat,
                lon,
                bounds
            ):

                region_events[
                    region_name
                ].append({
                    "year":
                        year,

                    "magnitude":
                        magnitude,

                    "depth_km":
                        depth,

                    "date":
                        row["date"],

                    "location":
                        row[
                            "location_desc"
                        ],
                })


                year_counts[
                    region_name
                ][year] += 1


                if (
                    magnitude_class
                    in MAG_CLASSES
                ):

                    magnitude_counts[
                        region_name
                    ][
                        magnitude_class
                    ] += 1


                if depth is not None:

                    depth_values[
                        region_name
                    ].append(depth)


# ---------------------------------------------------------
# Build output
# ---------------------------------------------------------

output = {
    "regions": {}
}


for region_name, bounds in REGIONS.items():

    events = region_events[
        region_name
    ]


    total_events = len(events)


    avg_depth = (
        sum(
            depth_values[
                region_name
            ]
        )
        /
        len(
            depth_values[
                region_name
            ]
        )
        if depth_values[
            region_name
        ]
        else None
    )


    yearly = []

    for year in range(
        1900,
        2026
    ):

        yearly.append({
            "year":
                year,

            "count":
                year_counts[
                    region_name
                ].get(
                    year,
                    0
                ),
        })


    output[
        "regions"
    ][region_name] = {

        "bounds":
            bounds,

        "total_events":
            total_events,

        "average_depth":
            round(
                avg_depth,
                1
            )
            if avg_depth
            is not None
            else None,

        "magnitude_counts":
            magnitude_counts[
                region_name
            ],

        "yearly_counts":
            yearly,
    }


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


print(
    "Regional data preparation complete."
)

for region_name in REGIONS:

    print(
        region_name,
        ":",
        len(
            region_events[
                region_name
            ]
        ),
        "events"
    )