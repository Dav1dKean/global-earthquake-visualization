"use client";

import dynamic from "next/dynamic";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const Plot = dynamic(
  () => import("react-plotly.js"),
  {
    ssr: false,
  }
);

type TimelineYear = {
  year: number;
  status:
    | "available"
    | "missing"
    | "partial";
  first_date: string | null;
  last_date: string | null;
  counts: Record<
    string,
    number | null
  >;
};

export default function Timeline() {
  const [
    timeline,
    setTimeline,
  ] = useState<TimelineYear[]>([]);

  const [
    currentYear,
    setCurrentYear,
  ] = useState(1900);

  const [
    minMagnitude,
    setMinMagnitude,
  ] = useState(4.5);

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);

  const timerRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  useEffect(() => {
    async function loadTimeline() {
      try {
        const response =
          await fetch(
            "/data/timeline.json"
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load timeline data."
          );
        }

        const data:
          TimelineYear[] =
          await response.json();

        setTimeline(data);
      } catch (error) {
        console.error(
          "Unable to load timeline:",
          error
        );
      }
    }

    loadTimeline();
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
        timerRef.current = null;
      }

      return;
    }

    timerRef.current =
      setInterval(() => {
        setCurrentYear(
          (previousYear) => {
            if (
              previousYear >= 2025
            ) {
              setIsPlaying(false);
              return 2025;
            }

            return previousYear + 1;
          }
        );
      }, 250);

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
      }
    };
  }, [isPlaying]);

  const visibleYears =
    useMemo(() => {
      return timeline.filter(
        (item) =>
          item.year >= 1900 &&
          item.year <= currentYear &&
          item.year <= 2025
      );
    }, [
      timeline,
      currentYear,
    ]);

  const magnitudeKey =
    minMagnitude.toFixed(1);

  const lineValues =
    useMemo(() => {
      return visibleYears.map(
        (item) => {
          if (
            item.status !==
            "available"
          ) {
            return null;
          }

          return item.counts[
            magnitudeKey
          ];
        }
      );
    }, [
      visibleYears,
      magnitudeKey,
    ]);

  const selectedYearData =
    timeline.find(
      (item) =>
        item.year === currentYear
    );

  const selectedCount =
    selectedYearData?.counts[
      magnitudeKey
    ] ?? null;

  function playTimeline() {
    if (currentYear >= 2025) {
      setCurrentYear(1900);
    }

    setIsPlaying(true);
  }

  function pauseTimeline() {
    setIsPlaying(false);
  }

  function previousYear() {
    setIsPlaying(false);

    setCurrentYear(
      (year) =>
        Math.max(
          1900,
          year - 1
        )
    );
  }

  function nextYear() {
    setIsPlaying(false);

    setCurrentYear(
      (year) =>
        Math.min(
          2025,
          year + 1
        )
    );
  }

  function resetTimeline() {
    setIsPlaying(false);
    setCurrentYear(1900);
    setMinMagnitude(4.5);
  }

  function yearMessage() {
    if (!selectedYearData) {
      return "Loading timeline data…";
    }

    if (
      selectedYearData.status ===
      "missing"
    ) {
      return (
        `${currentYear}: ` +
        "No records are available " +
        "in the source dataset."
      );
    }

    if (
      selectedYearData.status ===
      "partial"
    ) {
      return (
        `${currentYear}: ` +
        "Partial source coverage " +
        `(${selectedYearData.first_date} ` +
        `to ${selectedYearData.last_date}).`
      );
    }

    return (
      `${selectedCount?.toLocaleString() ?? 0} ` +
      `recorded M${minMagnitude.toFixed(1)}+ ` +
      `earthquakes in ${currentYear}`
    );
  }

  return (
    <div className="mt-10">

      <div className="mb-6 flex flex-wrap items-end justify-between gap-8">

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
            Current year
          </p>

          <p className="mt-1 font-mono text-5xl font-bold text-slate-900">
            {currentYear}
          </p>

          <p className="mt-2 text-slate-700">
            {yearMessage()}
          </p>
        </div>

        <div className="min-w-[300px]">

          <div className="mb-2 flex items-center justify-between">

            <label
              htmlFor="timeline-magnitude"
              className="font-semibold text-slate-800"
            >
              Minimum magnitude
            </label>

            <span className="font-mono text-lg font-semibold text-slate-900">
              M{minMagnitude.toFixed(1)}+
            </span>

          </div>

          <input
            id="timeline-magnitude"
            type="range"
            min="4.5"
            max="8"
            step="0.5"
            value={minMagnitude}
            onChange={(event) => {
              setMinMagnitude(
                Number(
                  event.target.value
                )
              );
            }}
            className="w-full"
          />

          <div className="mt-1 flex justify-between text-xs font-medium text-slate-600">
            <span>M4.5</span>
            <span>M8+</span>
          </div>

        </div>

      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <div className="flex flex-wrap items-center gap-3">

          <button
            type="button"
            onClick={previousYear}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            ← Previous
          </button>

          <button
            type="button"
            onClick={playTimeline}
            disabled={isPlaying}
            className="rounded-lg bg-slate-900 px-5 py-2 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ▶ Play
          </button>

          <button
            type="button"
            onClick={pauseTimeline}
            disabled={!isPlaying}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 font-semibold text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ⅱ Pause
          </button>

          <button
            type="button"
            onClick={nextYear}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Next →
          </button>

          <button
            type="button"
            onClick={resetTimeline}
            className="ml-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Reset
          </button>

        </div>

        <div className="mt-6">

          <input
            type="range"
            min="1900"
            max="2025"
            step="1"
            value={currentYear}
            onChange={(event) => {
              setIsPlaying(false);

              setCurrentYear(
                Number(
                  event.target.value
                )
              );
            }}
            className="w-full"
          />

          <div className="mt-1 flex justify-between text-xs font-medium text-slate-600">
            <span>1900</span>

            <span className="font-semibold text-slate-800">
              {currentYear}
            </span>

            <span>2025</span>
          </div>

        </div>

      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <Plot
          data={[
            {
              type: "scatter",
              mode:
                "lines+markers",

              x: visibleYears.map(
                (item) =>
                  item.year
              ),

              y: lineValues,

              connectgaps: false,

              line: {
                width: 3,
                color: "#2563eb",
              },

              marker: {
                size: 6,
                color: "#2563eb",
              },

              hovertemplate:
                "<b>Year %{x}</b><br>" +
                "Recorded earthquakes: %{y:,}" +
                "<extra></extra>",
            } as any,
          ]}

          layout={{
            autosize: true,
            height: 520,

            font: {
              color: "#334155",
              size: 14,
            },

            margin: {
              l: 95,
              r: 30,
              t: 45,
              b: 85,
            },

            xaxis: {
              title: {
                text: "Year",
                font: {
                  color: "#1e293b",
                  size: 16,
                
                },
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

              dtick: 10,

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

              zeroline: true,
            },

            paper_bgcolor:
              "#ffffff",

            plot_bgcolor:
              "#ffffff",

            showlegend: false,

            hovermode:
              "closest",
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

      <div className="mt-5 grid gap-4 text-sm leading-6 text-slate-700 md:grid-cols-2">

        <p>
          The line grows as the selected year advances.
          Breaks represent missing or incomplete source coverage,
          not years with zero earthquakes.
        </p>

        <p className="md:text-right">
          2026 is partial through May 14 and is intentionally
          excluded from annual comparisons.
        </p>

      </div>

    </div>
  );
}