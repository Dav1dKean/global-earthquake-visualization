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

type DepthEvent = {
  date: string;
  longitude: number;
  latitude: number;
  depth_km: number;
  magnitude: number;
  location: string;
};

type YearDepthData = {
  year: number;

  status:
    | "available"
    | "missing"
    | "partial";

  known_depth_events: number;

  missing_depth_events: number;

  events: DepthEvent[];
};

export default function DepthChart() {

  const [year, setYear] =
    useState(2025);

  const [minMagnitude, setMinMagnitude] =
    useState(4.5);

  const [maxDepth, setMaxDepth] =
    useState(700);

  const [viewMode, setViewMode] =
    useState<"2d" | "3d">("2d");

  const [data, setData] =
    useState<YearDepthData | null>(null);

  const [loading, setLoading] =
    useState(true);

  // -------------------------------------------------------
  // Load selected year's data.
  // -------------------------------------------------------

  useEffect(() => {

    async function loadDepthData() {

      setLoading(true);

      try {

        const response =
          await fetch(
            `/data/depth/${year}.json`
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load depth data."
          );
        }

        const result:
          YearDepthData =
          await response.json();

        setData(result);

      } catch (error) {

        console.error(
          "Unable to load depth data:",
          error
        );

        setData(null);

      } finally {

        setLoading(false);

      }

    }

    loadDepthData();

  }, [year]);

  // -------------------------------------------------------
  // Apply magnitude and depth filters.
  // -------------------------------------------------------

  const filteredEvents =
    useMemo(() => {

      if (!data) {
        return [];
      }

      return data.events.filter(
        (event) =>
          event.magnitude >= minMagnitude &&
          event.depth_km <= maxDepth
      );

    }, [
      data,
      minMagnitude,
      maxDepth,
    ]);

  // -------------------------------------------------------
  // Marker sizes.
  // -------------------------------------------------------

  const markerSizes =
    filteredEvents.map(
      (event) =>
        Math.max(
          5,
          (event.magnitude - 4) * 4
        )
    );

  // -------------------------------------------------------
  // Marker colors.
  // -------------------------------------------------------

  const markerColors =
    filteredEvents.map(
      (event) =>
        event.magnitude >= 7
          ? "#ea580c"
          : "#2563eb"
    );

  // -------------------------------------------------------
  // Reset controls.
  // -------------------------------------------------------

  function resetView() {

    setYear(2025);
    setMinMagnitude(4.5);
    setMaxDepth(700);
    setViewMode("2d");

  }

  return (

    <div className="mt-10">

      {/* --------------------------------------------------
          CONTROLS
      -------------------------------------------------- */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

        <div className="grid gap-6 lg:grid-cols-4">

          {/* YEAR */}

          <div>

            <div className="mb-2 flex justify-between">

              <label
                htmlFor="depth-year"
                className="font-semibold text-slate-700"
              >
                Year
              </label>

              <span className="font-mono text-lg font-semibold">
                {year}
              </span>

            </div>

            <input
              id="depth-year"
              type="range"
              min="1900"
              max="2026"
              step="1"
              value={year}
              onChange={(event) =>
                setYear(
                  Number(
                    event.target.value
                  )
                )
              }
              className="w-full"
            />

            <div className="mt-1 flex justify-between text-xs text-slate-400">

              <span>1900</span>
              <span>2026</span>

            </div>

          </div>

          {/* MINIMUM MAGNITUDE */}

          <div>

            <div className="mb-2 flex justify-between">

              <label
                htmlFor="depth-magnitude"
                className="font-semibold text-slate-700"
              >
                Minimum magnitude
              </label>

              <span className="font-mono text-lg font-semibold">
                M{minMagnitude.toFixed(1)}+
              </span>

            </div>

            <input
              id="depth-magnitude"
              type="range"
              min="4.5"
              max="8"
              step="0.5"
              value={minMagnitude}
              onChange={(event) =>
                setMinMagnitude(
                  Number(
                    event.target.value
                  )
                )
              }
              className="w-full"
            />

            <div className="mt-1 flex justify-between text-xs text-slate-400">

              <span>M4.5</span>
              <span>M8+</span>

            </div>

          </div>

          {/* MAXIMUM DEPTH */}

          <div>

            <div className="mb-2 flex justify-between">

              <label
                htmlFor="depth-max"
                className="font-semibold text-slate-700"
              >
                Maximum depth
              </label>

              <span className="font-mono text-lg font-semibold">
                {maxDepth} km
              </span>

            </div>

            <input
              id="depth-max"
              type="range"
              min="50"
              max="700"
              step="50"
              value={maxDepth}
              onChange={(event) =>
                setMaxDepth(
                  Number(
                    event.target.value
                  )
                )
              }
              className="w-full"
            />

            <div className="mt-1 flex justify-between text-xs text-slate-400">

              <span>50 km</span>
              <span>700 km</span>

            </div>

          </div>

          {/* VIEW MODE */}

          <div>

            <p className="mb-2 font-semibold text-slate-700">
              View
            </p>

            <div className="flex rounded-lg border border-slate-300 bg-white p-1">

              <button
                type="button"
                onClick={() =>
                  setViewMode("2d")
                }
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  viewMode === "2d"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                2D Depth
              </button>

              <button
                type="button"
                onClick={() =>
                  setViewMode("3d")
                }
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  viewMode === "3d"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                3D Spatial
              </button>

            </div>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">

          <div>

            <p className="font-semibold text-slate-800">

              {loading
                ? "Loading depth data…"
                : `${filteredEvents.length.toLocaleString()} earthquakes shown`
              }

            </p>

            {data && (

              <p className="mt-1 text-sm text-slate-500">

                {
                  data
                    .missing_depth_events
                    .toLocaleString()
                } records in this year lack a depth value.

              </p>

            )}

          </div>

          <button
            type="button"
            onClick={resetView}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Reset
          </button>

        </div>

        {/* DATA WARNINGS */}

        {data?.status === "missing" && (

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No earthquake records are available for {year} in the source dataset.
          </div>

        )}

        {data?.status === "partial" && (

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {year} contains only partial source coverage.
          </div>

        )}

      </div>

      {/* --------------------------------------------------
          CHART
      -------------------------------------------------- */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {loading ? (

          <div className="flex h-[560px] items-center justify-center text-slate-500">
            Loading depth visualization…
          </div>

        ) : filteredEvents.length === 0 ? (

          <div className="flex h-[560px] items-center justify-center px-6 text-center text-slate-500">
            No earthquakes match the selected filters.
          </div>

        ) : viewMode === "2d" ? (

          /* ------------------------------------------------
             2D LONGITUDE × DEPTH VIEW
          ------------------------------------------------ */

          <Plot

            data={[
              {
                type: "scatter",

                mode: "markers",

                x:
                  filteredEvents.map(
                    (event) =>
                      event.longitude
                  ),

                y:
                  filteredEvents.map(
                    (event) =>
                      event.depth_km
                  ),

                text:
                  filteredEvents.map(
                    (event) =>
                      event.location
                  ),

                customdata:
                  filteredEvents.map(
                    (event) => [
                      event.date,
                      event.magnitude,
                      event.latitude,
                    ]
                  ),

                marker: {
                  size: markerSizes,
                  color: markerColors,
                  opacity: 0.55,

                  line: {
                    width: 0.4,
                    color: "#ffffff",
                  },
                },

                hovertemplate:
                  "<b>%{text}</b><br>" +
                  "Date: %{customdata[0]}<br>" +
                  "Magnitude: %{customdata[1]}<br>" +
                  "Depth: %{y:.1f} km<br>" +
                  "Latitude: %{customdata[2]:.2f}°<br>" +
                  "Longitude: %{x:.2f}°" +
                  "<extra></extra>",

              } as any,
            ]}

            layout={{
  autosize: true,

  height: 560,

  font: {
    color: "#334155",
    size: 14,
  },

  margin: {
    l: 120,
    r: 35,
    t: 45,
    b: 105,
  },

  xaxis: {
    title: {
      text:
        "Longitude (West ↔ East)",

      font: {
        color: "#1e293b",
        size: 16,
      },

      standoff: 22,
    },

    tickfont: {
      color: "#334155",
      size: 13,
    },

    ticklabelstandoff: 10,

    range: [
      -180,
      180,
    ],

    tickmode:
      "array",

    tickvals: [
      -180,
      -120,
      -60,
      0,
      60,
      120,
      180,
    ],

    ticktext: [
      "180°W",
      "120°W",
      "60°W",
      "0°",
      "60°E",
      "120°E",
      "180°E",
    ],

    gridcolor:
      "#e2e8f0",

    zerolinecolor:
      "#64748b",
  },

  yaxis: {
    title: {
      text:
        "Depth Below Surface (km)",

      font: {
        color: "#1e293b",
        size: 16,
      },

      standoff: 26,
    },

    tickfont: {
      color: "#334155",
      size: 13,
    },

    ticklabelstandoff: 10,

    // 0 km is the surface.
    // Larger values extend downward.
    range: [
      maxDepth,
      0,
    ],

    gridcolor:
      "#e2e8f0",

    zerolinecolor:
      "#64748b",
  },

  paper_bgcolor:
    "#ffffff",

  plot_bgcolor:
    "#ffffff",

  showlegend:
    false,
}}

            config={{
              responsive: true,
              displaylogo: false,
            }}

            style={{
              width: "100%",
            }}

          />

        ) : (

          /* ------------------------------------------------
             3D LONGITUDE × LATITUDE × DEPTH VIEW
          ------------------------------------------------ */

          <Plot

            data={[
              {
                type:
                  "scatter3d",

                mode:
                  "markers",

                x:
                  filteredEvents.map(
                    (event) =>
                      event.longitude
                  ),

                y:
                  filteredEvents.map(
                    (event) =>
                      event.latitude
                  ),

                // Use negative depth so deeper
                // earthquakes extend downward.
                z:
                  filteredEvents.map(
                    (event) =>
                      -event.depth_km
                  ),

                text:
                  filteredEvents.map(
                    (event) =>
                      event.location
                  ),

                customdata:
                  filteredEvents.map(
                    (event) => [
                      event.date,
                      event.magnitude,
                      event.depth_km,
                    ]
                  ),

                marker: {
                  size:
                    markerSizes.map(
                      (size) =>
                        Math.max(
                          2,
                          size * 0.65
                        )
                    ),

                  color:
                    markerColors,

                  opacity:
                    0.6,
                },

                hovertemplate:
                  "<b>%{text}</b><br>" +
                  "Date: %{customdata[0]}<br>" +
                  "Magnitude: %{customdata[1]}<br>" +
                  "Depth: %{customdata[2]:.1f} km<br>" +
                  "Longitude: %{x:.2f}°<br>" +
                  "Latitude: %{y:.2f}°" +
                  "<extra></extra>",

              } as any,
            ]}

            layout={{
              autosize: true,

              height: 620,

              margin: {
                l: 20,
                r: 20,
                t: 30,
                b: 20,
              },

              scene: {

                xaxis: {
                  title: {
                    text:
                      "Longitude",
                  },

                  range: [
                    -180,
                    180,
                  ],
                },

                yaxis: {
                  title: {
                    text:
                      "Latitude",
                  },

                  range: [
                    -90,
                    90,
                  ],
                },

                zaxis: {
                  title: {
                    text:
                      "Depth (km)",
                  },

                  range: [
                    -maxDepth,
                    0,
                  ],

                  tickmode:
                    "array",

                  tickvals: [
                    0,
                    -100,
                    -200,
                    -300,
                    -400,
                    -500,
                    -600,
                    -700,
                  ].filter(
                    (value) =>
                      Math.abs(value)
                      <= maxDepth
                  ),

                  ticktext: [
                    "0",
                    "100",
                    "200",
                    "300",
                    "400",
                    "500",
                    "600",
                    "700",
                  ].slice(
                    0,
                    Math.floor(
                      maxDepth / 100
                    ) + 1
                  ),
                },

                camera: {
                  eye: {
                    x: 1.6,
                    y: 1.6,
                    z: 0.9,
                  },
                },

                bgcolor:
                  "#ffffff",
              },

              paper_bgcolor:
                "#ffffff",
            }}

            config={{
              responsive: true,
              displaylogo: false,
            }}

            style={{
              width: "100%",
            }}

          />

        )}

      </div>

      {/* --------------------------------------------------
          EXPLANATION
      -------------------------------------------------- */}

      <div className="mt-5 grid gap-4 text-sm leading-6 text-slate-500 md:grid-cols-2">

        {viewMode === "2d" ? (

          <p>
            The 2D depth profile uses longitude from west to east
            and places zero kilometers at the surface. Greater depth
            values extend downward so the vertical direction matches
            the physical idea of earthquakes occurring underground.
          </p>

        ) : (

          <p>
            The 3D view uses longitude, latitude, and depth as three
            spatial dimensions. You can drag to rotate the scene and
            inspect where shallow and deep earthquakes occur around
            the world.
          </p>

        )}

        <p className="md:text-right">
          Blue points represent earthquakes below M7.0 and orange
          points highlight M7.0+ events. Records without reported
          depth are excluded only from this view.
        </p>

      </div>

      {/* 3D caution */}

      {viewMode === "3d" && (

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">

          <strong>
            3D interpretation:
          </strong>{" "}
          This visualization shows catalog coordinates in a rectangular
          longitude–latitude–depth space. It is not a 3D globe or a
          geological model of Earth&apos;s interior.

        </div>

      )}

    </div>

  );

}