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

type MagnitudeCounts =
  Record<string, number>;

type YearMagnitudeData = {
  year: number;

  status:
    | "available"
    | "missing"
    | "partial";

  total_events: number;

  counts:
    MagnitudeCounts;
};

type MaximumEvent = {
  date: string;
  magnitude: number;
  depth_km: number | null;
  location: string;
};

type MagnitudeData = {
  classes: string[];

  all_years: {
    total_events: number;
    counts:
      MagnitudeCounts;
  };

  years:
    YearMagnitudeData[];

  maximum: {
    magnitude: number;
    occurrences: number;
    events:
      MaximumEvent[];
  };
};

export default function MagnitudeChart() {

  const [
    data,
    setData,
  ] =
    useState<
      MagnitudeData | null
    >(null);

  const [
    selectedPeriod,
    setSelectedPeriod,
  ] =
    useState("all");

  const [
    scaleMode,
    setScaleMode,
  ] =
    useState<
      "linear" | "log"
    >("linear");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  // -------------------------------------------------------
  // Load data
  // -------------------------------------------------------

  useEffect(() => {

    async function loadData() {

      try {

        const response =
          await fetch(
            "/data/magnitude.json"
          );

        if (!response.ok) {

          throw new Error(
            "Unable to load magnitude data."
          );

        }

        const result:
          MagnitudeData =
          await response.json();

        setData(result);

      } catch (error) {

        console.error(
          "Unable to load magnitude data:",
          error
        );

      } finally {

        setLoading(false);

      }

    }

    loadData();

  }, []);

  // -------------------------------------------------------
  // Selected data
  // -------------------------------------------------------

  const selectedData =
    useMemo(() => {

      if (!data) {
        return null;
      }

      if (selectedPeriod === "all") {
  return {
    status: "available" as const,
    total_events: data.all_years.total_events,
    counts: data.all_years.counts,
  };
}

      return (
        data.years.find(
          (item) =>
            item.year ===
            Number(
              selectedPeriod
            )
        ) ?? null
      );

    }, [
      data,
      selectedPeriod,
    ]);

  // -------------------------------------------------------
  // Values for bars
  // -------------------------------------------------------

  const counts =
    useMemo(() => {

      if (
        !data ||
        !selectedData
      ) {
        return [];
      }

      return data.classes.map(
        (category) =>
          selectedData
            .counts[
              category
            ] ?? 0
      );

    }, [
      data,
      selectedData,
    ]);

  // -------------------------------------------------------
  // Reset
  // -------------------------------------------------------

  function resetView() {

    setSelectedPeriod(
      "all"
    );

    setScaleMode(
      "linear"
    );

  }

  // -------------------------------------------------------
  // Loading
  // -------------------------------------------------------

  if (
    loading ||
    !data
  ) {

    return (
      <div className="mt-10 rounded-2xl border border-slate-200 p-10 text-center text-slate-700">
        Loading magnitude data…
      </div>
    );

  }

  if (!selectedData) {

    return (
      <div className="mt-10 rounded-2xl border border-slate-200 p-10 text-center text-slate-700">
        No magnitude data are available for this selection.
      </div>
    );

  }

  const strongestEvent =
    data.maximum
      .events[0];

  const greatCount =
    data
      .all_years
      .counts[
        "Great (M8+)"
      ] ?? 0;

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------

  return (

    <div className="mt-10">

      {/* CONTROLS */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

        <div className="grid gap-6 md:grid-cols-4">

          {/* TIME PERIOD */}

          <div>

            <label
              htmlFor="magnitude-period"
              className="mb-2 block font-semibold text-slate-800"
            >
              Time period
            </label>

            <select
              id="magnitude-period"
              value={
                selectedPeriod
              }
              onChange={(
                event
              ) =>
                setSelectedPeriod(
                  event
                    .target
                    .value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800"
            >

              <option value="all">
                All years
              </option>

              {data.years.map(
                (item) => (

                  <option
                    key={
                      item.year
                    }
                    value={
                      item.year
                    }
                  >
                    {
                      item.year
                    }
                  </option>

                )
              )}

            </select>

          </div>

          {/* EVENTS */}

          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
              Events represented
            </p>

            <p className="mt-2 font-mono text-3xl font-bold text-slate-900">
              {
                selectedData
                  .total_events
                  .toLocaleString()
              }
            </p>

          </div>

          {/* SCALE */}

          <div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
              Y-axis scale
            </p>

            <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">

              <button
                type="button"
                onClick={() =>
                  setScaleMode(
                    "linear"
                  )
                }
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  scaleMode ===
                  "linear"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Linear
              </button>

              <button
                type="button"
                onClick={() =>
                  setScaleMode(
                    "log"
                  )
                }
                className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                  scaleMode ===
                  "log"
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Log
              </button>

            </div>

          </div>

          {/* RESET */}

          <div className="flex items-end justify-end">

            <button
              type="button"
              onClick={
                resetView
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
            >
              Reset
            </button>

          </div>

        </div>

        {/* WARNINGS */}

        {selectedData.status ===
          "missing" && (

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No earthquake records are available for this year in the source dataset.
          </div>

        )}

        {selectedData.status ===
          "partial" && (

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This year contains only partial source coverage.
          </div>

        )}

      </div>

      {/* CHART */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        <Plot

          data={[
            {
              type: "bar",

              x:
                data.classes,

              y:
                counts,

              text:
                counts.map(
                  (value) =>
                    value
                      .toLocaleString()
                ),

              textposition:
                "outside",

              cliponaxis:
                false,

              marker: {
                color:
                  "#2563eb",
              },

              hovertemplate:
                "<b>%{x}</b><br>" +
                "Recorded earthquakes: %{y:,}" +
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

            title: {
              text:
                selectedPeriod ===
                "all"
                  ? "Magnitude Distribution — Full Dataset"
                  : `Magnitude Distribution — ${selectedPeriod}`,

              font: {
                color:
                  "#1e293b",
                size: 18,
              },
            },

            margin: {
              l: 115,
              r: 40,
              t: 80,
              b: 100,
            },

            xaxis: {

              title: {
                text:
                  "Magnitude Class",

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
                  scaleMode ===
                  "linear"
                    ? "Recorded Earthquakes"
                    : "Recorded Earthquakes (Log Scale)",

                font: {
                  color:
                    "#1e293b",
                  size: 16,
                },

                standoff: 24,
              },

              tickfont: {
                color:
                  "#334155",
                size: 13,
              },

              type:
                scaleMode ===
                "log"
                  ? "log"
                  : "linear",

              rangemode:
                scaleMode ===
                "linear"
                  ? "tozero"
                  : undefined,

              gridcolor:
                "#e2e8f0",

            },

            paper_bgcolor:
              "#ffffff",

            plot_bgcolor:
              "#ffffff",

            showlegend:
              false,
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

      {/* SCALE EXPLANATION */}

      <div className="mt-5 space-y-2 text-sm leading-6 text-slate-700">

        <p>
          The linear scale is the default because it preserves a direct
          comparison of earthquake counts from zero. Exact values are
          displayed above the bars so rare Major and Great earthquakes
          remain readable even when their bars are small.
        </p>

        <p>
          The optional logarithmic scale compresses the large differences
          between magnitude classes and makes rare categories easier to
          compare. Bar heights on the logarithmic scale should not be
          interpreted as linear differences.
        </p>

      </div>

      {/* ALL YEARS SUMMARY */}

      {selectedPeriod ===
        "all" && (

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          <div className="rounded-2xl border border-slate-200 bg-white p-6">

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
              Great earthquakes
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {
                greatCount
                  .toLocaleString()
              }
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              M8.0+ earthquakes appear in the complete catalog.
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-600">
              Strongest event in dataset
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              M
              {
                data
                  .maximum
                  .magnitude
                  .toFixed(1)
              }
            </p>

            <p className="mt-2 text-sm text-slate-700">
              Occurred{" "}
              {
                data
                  .maximum
                  .occurrences
              }{" "}
              time
              {
                data
                  .maximum
                  .occurrences ===
                1
                  ? ""
                  : "s"
              } in this dataset.
            </p>

            {strongestEvent && (

              <p className="mt-3 text-sm leading-6 text-slate-700">

                {
                  strongestEvent
                    .date
                }

                {" · "}

                {
                  strongestEvent
                    .location
                }

                {
                  strongestEvent
                    .depth_km !==
                  null && (
                    <>
                      {" · Depth "}
                      {
                        strongestEvent
                          .depth_km
                      }
                      {" km"}
                    </>
                  )
                }

              </p>

            )}

          </div>

        </div>

      )}

      <p className="mt-5 text-sm leading-6 text-slate-700">

        Lower-magnitude earthquakes dominate the catalog, while Major
        and Great earthquakes are comparatively rare. The exact counts
        above the bars preserve access to rare categories even when the
        linear-scale bars are very small.

      </p>

    </div>

  );
}