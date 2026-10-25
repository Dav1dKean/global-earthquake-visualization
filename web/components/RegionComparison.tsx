"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

const Plot = dynamic(
  () => import("react-plotly.js"),
  {
    ssr: false,
  }
);

type YearCount = {
  year: number;
  count: number;
};

type RegionData = {
  bounds: {
    lat_min: number;
    lat_max: number;
    lon_min: number;
    lon_max: number;
  };

  total_events: number;

  average_depth:
    number | null;

  magnitude_counts:
    Record<
      string,
      number
    >;

  yearly_counts:
    YearCount[];
};

type RegionsFile = {
  regions:
    Record<
      string,
      RegionData
    >;
};

const magnitudeClasses = [
  "Light (M4.5-4.9)",
  "Moderate (M5-5.9)",
  "Strong (M6-6.9)",
  "Major (M7-7.9)",
  "Great (M8+)",
];

export default function RegionComparison() {
  const [
    data,
    setData,
  ] = useState<
    RegionsFile | null
  >(null);

  const [
    regionA,
    setRegionA,
  ] = useState(
    "Japan"
  );

  const [
    regionB,
    setRegionB,
  ] = useState(
    "Chile"
  );

  // -------------------------------------------------------
  // Load regional comparison data
  // -------------------------------------------------------

  useEffect(() => {
    async function loadData() {
      try {
        const response =
          await fetch(
            "/data/regions.json"
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load regional data."
          );
        }

        const result:
          RegionsFile =
          await response.json();

        setData(result);
      } catch (error) {
        console.error(
          "Unable to load regional data:",
          error
        );
      }
    }

    loadData();
  }, []);

  // -------------------------------------------------------
  // Selected regions
  // -------------------------------------------------------

  const selectedA =
    useMemo(() => {
      if (!data) {
        return null;
      }

      return data.regions[
        regionA
      ];
    }, [
      data,
      regionA,
    ]);

  const selectedB =
    useMemo(() => {
      if (!data) {
        return null;
      }

      return data.regions[
        regionB
      ];
    }, [
      data,
      regionB,
    ]);

  // -------------------------------------------------------
  // Reset
  // -------------------------------------------------------

  function resetView() {
    setRegionA("Japan");
    setRegionB("Chile");
  }

  if (
    !data ||
    !selectedA ||
    !selectedB
  ) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 p-10 text-center text-slate-700">
        Loading regional comparison…
      </div>
    );
  }

  const regionNames =
    Object.keys(
      data.regions
    );

  return (
    <div className="mt-10">

      {/* --------------------------------------------------
          REGION SELECTORS
      -------------------------------------------------- */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

        <div className="grid gap-6 md:grid-cols-3">

          {/* REGION A */}

          <div>
            <label
              htmlFor="region-a"
              className="mb-2 block font-semibold text-slate-800"
            >
              Region A
            </label>

            <select
              id="region-a"
              value={regionA}
              onChange={(event) =>
                setRegionA(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800"
            >
              {regionNames.map(
                (name) => (
                  <option
                    key={name}
                    value={name}
                  >
                    {name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* REGION B */}

          <div>
            <label
              htmlFor="region-b"
              className="mb-2 block font-semibold text-slate-800"
            >
              Region B
            </label>

            <select
              id="region-b"
              value={regionB}
              onChange={(event) =>
                setRegionB(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800"
            >
              {regionNames.map(
                (name) => (
                  <option
                    key={name}
                    value={name}
                  >
                    {name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* RESET */}

          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={resetView}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Reset
            </button>
          </div>

        </div>

      </div>

      {/* --------------------------------------------------
          SUMMARY CARDS
      -------------------------------------------------- */}

      <div className="mt-6 grid gap-4 md:grid-cols-2">

        {/* REGION A CARD */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
            Region A
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {regionA}
          </h3>

          <div className="mt-5 grid grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-slate-600">
                Total events
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {
                  selectedA
                    .total_events
                    .toLocaleString()
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-600">
                Average depth
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {
                  selectedA
                    .average_depth
                    ?.toLocaleString()
                  ?? "N/A"
                }

                <span className="ml-1 text-lg font-normal">
                  km
                </span>
              </p>
            </div>

          </div>

        </div>

        {/* REGION B CARD */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6">

          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
            Region B
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {regionB}
          </h3>

          <div className="mt-5 grid grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-slate-600">
                Total events
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {
                  selectedB
                    .total_events
                    .toLocaleString()
                }
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-600">
                Average depth
              </p>

              <p className="mt-1 text-3xl font-bold text-slate-900">
                {
                  selectedB
                    .average_depth
                    ?.toLocaleString()
                  ?? "N/A"
                }

                <span className="ml-1 text-lg font-normal">
                  km
                </span>
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* --------------------------------------------------
          ANNUAL ACTIVITY CHART
      -------------------------------------------------- */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <Plot
          data={[
            {
              type:
                "scatter",

              mode:
                "lines",

              name:
                regionA,

              x:
                selectedA
                  .yearly_counts
                  .map(
                    (row) =>
                      row.year
                  ),

              y:
                selectedA
                  .yearly_counts
                  .map(
                    (row) =>
                      row.count
                  ),
            },

            {
              type:
                "scatter",

              mode:
                "lines",

              name:
                regionB,

              x:
                selectedB
                  .yearly_counts
                  .map(
                    (row) =>
                      row.year
                  ),

              y:
                selectedB
                  .yearly_counts
                  .map(
                    (row) =>
                      row.count
                  ),
            },
          ] as any}

          layout={{
            autosize: true,

            height: 470,

            font: {
              color: "#334155",
              size: 14,
            },

            title: {
              text:
                "Annual Recorded Earthquakes",

              font: {
                color: "#1e293b",
                size: 18,
              },
            },

            margin: {
              l: 105,
              r: 35,
              t: 85,
              b: 90,
            },

            xaxis: {
              title: {
                text: "Year",

                font: {
                  color: "#1e293b",
                  size: 16,
                },

                standoff: 20,
              },

              tickfont: {
                color: "#334155",
                size: 13,
              },

              ticklabelstandoff: 8,

              range: [
                1900,
                2025,
              ],

              gridcolor:
                "#e2e8f0",
            },

            yaxis: {
              title: {
                text:
                  "Recorded Earthquakes",

                font: {
                  color: "#1e293b",
                  size: 16,
                },

                standoff: 24,
              },

              tickfont: {
                color: "#334155",
                size: 13,
              },

              ticklabelstandoff: 8,

              rangemode:
                "tozero",

              gridcolor:
                "#e2e8f0",
            },

            paper_bgcolor:
              "#ffffff",

            plot_bgcolor:
              "#ffffff",

            legend: {
              orientation:
                "h",

              y:
                1.12,

              font: {
                color: "#334155",
                size: 13,
              },
            },
          }}

          config={{
            responsive:
              true,

            displaylogo:
              false,
          }}

          style={{
            width:
              "100%",
          }}
        />

      </div>

      {/* --------------------------------------------------
          MAGNITUDE DISTRIBUTION CHART
      -------------------------------------------------- */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <Plot
          data={[
            {
              type:
                "bar",

              name:
                regionA,

              x:
                magnitudeClasses,

              y:
                magnitudeClasses
                  .map(
                    (category) =>
                      selectedA
                        .magnitude_counts[
                          category
                        ]
                  ),
            },

            {
              type:
                "bar",

              name:
                regionB,

              x:
                magnitudeClasses,

              y:
                magnitudeClasses
                  .map(
                    (category) =>
                      selectedB
                        .magnitude_counts[
                          category
                        ]
                  ),
            },
          ] as any}

          layout={{
            autosize: true,

            height: 470,

            font: {
              color: "#334155",
              size: 14,
            },

            title: {
              text:
                "Magnitude Distribution by Region",

              font: {
                color: "#1e293b",
                size: 18,
              },
            },

            barmode:
              "group",

            margin: {
              l: 105,
              r: 35,
              t: 85,
              b: 110,
            },

            xaxis: {
              title: {
                text:
                  "Magnitude Class",

                font: {
                  color: "#1e293b",
                  size: 16,
                },

                standoff: 20,
              },

              tickfont: {
                color: "#334155",
                size: 13,
              },

              ticklabelstandoff: 8,
            },

            yaxis: {
              title: {
                text:
                  "Recorded Earthquakes",

                font: {
                  color: "#1e293b",
                  size: 16,
                },

                standoff: 24,
              },

              tickfont: {
                color: "#334155",
                size: 13,
              },

              ticklabelstandoff: 8,

              rangemode:
                "tozero",

              gridcolor:
                "#e2e8f0",
            },

            paper_bgcolor:
              "#ffffff",

            plot_bgcolor:
              "#ffffff",

            legend: {
              orientation:
                "h",

              y:
                1.12,

              font: {
                color: "#334155",
                size: 13,
              },
            },
          }}

          config={{
            responsive:
              true,

            displaylogo:
              false,
          }}

          style={{
            width:
              "100%",
          }}
        />

      </div>

      {/* --------------------------------------------------
          COMPARISON CAUTION
      -------------------------------------------------- */}

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">

        <strong>
          Comparison caution:
        </strong>{" "}

        These regions use fixed geographic bounding boxes.
        Differences in box size, seismic monitoring history,
        and catalog completeness mean that event counts should
        not be interpreted as direct measures of earthquake risk.

      </div>

    </div>
  );
}