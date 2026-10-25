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

type CalendarCell = {
  events: number;
  opportunities: number;
  rate: number;
};

type DayRow = {
  day: number;
  events: number;
  opportunities: number;
  rate: number;
};

type CalendarData = {
  start_year: number;
  end_year: number;
  excluded_years: number[];

  month_weekday: Record<
    string,
    CalendarCell[][]
  >;

  day_of_month: Record<
    string,
    DayRow[]
  >;
};

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const months = [
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
];

export default function CalendarPatterns() {
  const [data, setData] =
    useState<CalendarData | null>(null);

  const [mode, setMode] =
    useState<
      "heatmap" | "day"
    >("heatmap");

  const [minMagnitude, setMinMagnitude] =
    useState(4.5);

  useEffect(() => {
    async function loadData() {
      try {
        const response =
          await fetch(
            "/data/calendar.json"
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load calendar data."
          );
        }

        const result:
          CalendarData =
          await response.json();

        setData(result);
      } catch (error) {
        console.error(
          "Unable to load calendar data:",
          error
        );
      }
    }

    loadData();
  }, []);

  const magnitudeKey =
    minMagnitude.toFixed(1);

  const heatmapRates =
    useMemo(() => {
      if (!data) return [];

      return data.month_weekday[
        magnitudeKey
      ].map((row) =>
        row.map(
          (cell) =>
            cell.rate
        )
      );
    }, [
      data,
      magnitudeKey,
    ]);

  const heatmapCustomData =
    useMemo(() => {
      if (!data) return [];

      return data.month_weekday[
        magnitudeKey
      ].map((row) =>
        row.map(
          (cell) => [
            cell.events,
            cell.opportunities,
          ]
        )
      );
    }, [
      data,
      magnitudeKey,
    ]);

  const dayData =
    useMemo(() => {
      if (!data) return [];

      return data.day_of_month[
        magnitudeKey
      ];
    }, [
      data,
      magnitudeKey,
    ]);

  function resetView() {
    setMode("heatmap");
    setMinMagnitude(4.5);
  }

  if (!data) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 p-10 text-center text-slate-700">
        Loading calendar patterns…
      </div>
    );
  }

  return (
    <div className="mt-10">

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

        <div className="flex flex-wrap items-end justify-between gap-8">

          <div>
            <p className="mb-2 font-semibold text-slate-800">
              Calendar view
            </p>

            <div className="flex rounded-lg border border-slate-300 bg-white p-1">

              <button
                type="button"
                onClick={() =>
                  setMode("heatmap")
                }
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  mode === "heatmap"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Month × Weekday
              </button>

              <button
                type="button"
                onClick={() =>
                  setMode("day")
                }
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  mode === "day"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Day of Month
              </button>

            </div>
          </div>

          <div className="min-w-[300px]">

            <div className="mb-2 flex items-center justify-between">

              <label
                htmlFor="calendar-magnitude"
                className="font-semibold text-slate-800"
              >
                Minimum magnitude
              </label>

              <span className="font-mono text-lg font-semibold text-slate-900">
                M{minMagnitude.toFixed(1)}+
              </span>

            </div>

            <input
              id="calendar-magnitude"
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

            <div className="mt-1 flex justify-between text-xs font-medium text-slate-600">
              <span>M4.5</span>
              <span>M8+</span>
            </div>

          </div>

          <button
            type="button"
            onClick={resetView}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Reset
          </button>

        </div>

      </div>

      {mode === "heatmap" && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

          <Plot
            data={[
              {
                type: "heatmap",

                x: weekdays,
                y: months,

                z: heatmapRates,

                customdata:
                  heatmapCustomData,

                colorscale:
                  "Blues",

                reversescale:
                  true,

                colorbar: {
                  title: {
                    text:
                      "Average events per<br>matching day",

                    font: {
                      color:
                        "#1e293b",
                      size: 14,
                    },
                  },

                  tickfont: {
                    color:
                      "#334155",
                    size: 12,
                  },
                },

                hovertemplate:
                  "<b>%{y}, %{x}</b><br>" +
                  "Rate: %{z:.2f} events/opportunity<br>" +
                  "Events: %{customdata[0]:,}<br>" +
                  "Calendar opportunities: %{customdata[1]:,}" +
                  "<extra></extra>",
              } as any,
            ]}

            layout={{
              autosize: true,
              height: 560,

              font: {
                color:
                  "#334155",
                size: 14,
              },

              margin: {
                l: 135,
                r: 120,
                t: 50,
                b: 80,
              },

              xaxis: {
                title: {
                  text:
                    "Day of Week",

                  font: {
                    color:
                      "#1e293b",
                    size: 16,
                  },
                   standoff: 18,
                },

                tickfont: {
                  color:
                    "#334155",
                  size: 13,
                },
              },

              yaxis: {
                title: {
                  text:
                    "Month",

                  font: {
                    color:
                      "#1e293b",
                    size: 16,
                  },
                   standoff: 22,
                },

                tickfont: {
                  color:
                    "#334155",
                  size: 13,
                },

                autorange:
                  "reversed",
              },

              paper_bgcolor:
                "#ffffff",

              plot_bgcolor:
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

        </div>
      )}

      {mode === "day" && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

          <Plot
            data={[
              {
                type: "bar",

                x: dayData.map(
                  (row) =>
                    row.day
                ),

                y: dayData.map(
                  (row) =>
                    row.rate
                ),

                customdata:
                  dayData.map(
                    (row) => [
                      row.events,
                      row.opportunities,
                    ]
                  ),

                marker: {
                  color:
                    "#2563eb",
                },

                hovertemplate:
                  "<b>Day %{x}</b><br>" +
                  "Rate: %{y:.2f} events/opportunity<br>" +
                  "Events: %{customdata[0]:,}<br>" +
                  "Calendar opportunities: %{customdata[1]:,}" +
                  "<extra></extra>",
              } as any,
            ]}

            layout={{
              autosize: true,
              height: 520,

              font: {
                color:
                  "#334155",
                size: 14,
              },

              margin: {
                l: 90,
                r: 30,
                t: 50,
                b: 70,
              },

              xaxis: {
                title: {
                  text:
                    "Day of Month",

                  font: {
                    color:
                      "#1e293b",
                    size: 16,
                  },
                },

                tickfont: {
                  color:
                    "#334155",
                  size: 13,
                },

                dtick: 1,
              },

              yaxis: {
                title: {
                  text:
                    "Average Earthquakes per Calendar Day",

                  font: {
                    color:
                      "#1e293b",
                    size: 16,
                  },
                },

                tickfont: {
                  color:
                    "#334155",
                  size: 13,
                },

                rangemode:
                  "tozero",
              },

              paper_bgcolor:
                "#ffffff",

              plot_bgcolor:
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

        </div>
      )}

      <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">

        <p>
          Rates are normalized by the number of times each calendar
          condition actually occurred. This avoids unfair comparisons
          caused by unequal month lengths, leap years, or the fact that
          days 29–31 occur less often.
        </p>

        <p>
          Missing and incomplete source years are excluded from this
          calendar comparison. These patterns describe the historical
          catalog and are not earthquake predictions.
        </p>

        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
          <strong>
            Interpretation caution:
          </strong>{" "}
          Higher magnitude thresholds contain far fewer earthquakes,
          so differences across weekdays, months, or calendar dates can
          become more variable. These descriptive differences should not
          be interpreted as a preferred earthquake day or month.
        </p>

      </div>

    </div>
  );
}