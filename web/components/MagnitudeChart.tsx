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


type YearMagnitudeData = {
  year: number;
  status:
    | "available"
    | "missing"
    | "partial";

  total_events: number;

  counts:
    | Record<string, number>
    | null;
};


type MaximumEvent = {
  date: string;
  magnitude: number;
  location: string;
  depth_km: number | null;
};


type MagnitudeData = {
  classes: string[];

  all_years: {
    total_events: number;
    counts: Record<string, number>;
  };

  years: YearMagnitudeData[];

  maximum: {
    magnitude: number;
    occurrences: number;
    events: MaximumEvent[];
  };
};


export default function MagnitudeChart() {

  const [
    data,
    setData,
  ] = useState<MagnitudeData | null>(
    null
  );


  // -------------------------------------------------------
  // "all" means entire dataset.
  // Otherwise it stores a year such as "2025".
  // -------------------------------------------------------

  const [
    selectedPeriod,
    setSelectedPeriod,
  ] = useState("all");


  // -------------------------------------------------------
  // Load prepared magnitude data.
  // -------------------------------------------------------

  useEffect(() => {

    async function loadMagnitudeData() {

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

      }

    }

    loadMagnitudeData();

  }, []);


  // -------------------------------------------------------
  // Determine which counts should be shown.
  // -------------------------------------------------------

  const selectedData =
    useMemo(() => {

      if (!data) return null;


      if (
        selectedPeriod === "all"
      ) {

        return {
          label: "1900–2026",
          status: "available",
          total:
            data.all_years
              .total_events,
          counts:
            data.all_years.counts,
        };

      }


      const year =
        Number(selectedPeriod);


      const yearData =
        data.years.find(
          (item) =>
            item.year === year
        );


      if (!yearData) {
        return null;
      }


      return {
        label:
          String(year),

        status:
          yearData.status,

        total:
          yearData.total_events,

        counts:
          yearData.counts,
      };

    }, [
      data,
      selectedPeriod,
    ]);


  // -------------------------------------------------------
  // Reset View 4
  // -------------------------------------------------------

  function resetView() {

    setSelectedPeriod("all");

  }


  if (
    !data ||
    !selectedData
  ) {

    return (
      <div className="mt-10 rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
        Loading magnitude data…
      </div>
    );

  }


  // -------------------------------------------------------
  // Chart values
  // -------------------------------------------------------

  const counts =
    data.classes.map(
      (category) =>

        selectedData.counts
          ? selectedData.counts[
              category
            ] ?? 0
          : 0

    );


  const maximumEvent =
    data.maximum.events[0];


  return (

    <div className="mt-10">

      {/* --------------------------------------------------
          CONTROLS
      -------------------------------------------------- */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

        <div className="flex flex-wrap items-end justify-between gap-6">


          {/* PERIOD SELECTOR */}

          <div>

            <label
              htmlFor="magnitude-period"
              className="mb-2 block font-semibold text-slate-700"
            >
              Time period
            </label>


            <select
              id="magnitude-period"
              value={selectedPeriod}
              onChange={(event) =>
                setSelectedPeriod(
                  event.target.value
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
                    key={item.year}
                    value={item.year}
                  >
                    {item.year}
                  </option>

                )
              )}

            </select>

          </div>


          {/* SUMMARY */}

          <div>

            <p className="text-sm uppercase tracking-[0.12em] text-slate-500">
              Events represented
            </p>

            <p className="mt-1 font-mono text-2xl font-bold">
              {selectedData.total.toLocaleString()}
            </p>

          </div>


          {/* RESET */}

          <button
            type="button"
            onClick={resetView}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Reset
          </button>

        </div>


        {/* MISSING/PARTIAL WARNINGS */}

        {selectedData.status ===
          "missing" && (

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No earthquake records are available for {selectedData.label} in the source dataset.
          </div>

        )}


        {selectedData.status ===
          "partial" && (

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {selectedData.label} contains only partial source coverage and should not be compared directly with complete years.
          </div>

        )}

      </div>


      {/* --------------------------------------------------
          MAGNITUDE BAR CHART
      -------------------------------------------------- */}

      {selectedData.status !==
        "missing" && (

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
                    (count) =>
                      count.toLocaleString()
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
    color: "#334155",
    size: 14,
  },

  title: {
    text:
      selectedPeriod ===
      "all"
        ? "Magnitude Distribution — Full Dataset"
        : `Magnitude Distribution — ${selectedPeriod}`,

    font: {
      color: "#1e293b",
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
        color: "#1e293b",
        size: 16,
      },

      standoff: 18,
    },

    tickfont: {
      color: "#334155",
      size: 13,
    },
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

    rangemode:
      "tozero",

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
              responsive: true,
              displaylogo: false,
            }}


            style={{
              width: "100%",
            }}

          />

        </div>

      )}


      {/* --------------------------------------------------
          EXTREME-EVENT FACTS
      -------------------------------------------------- */}

      {selectedPeriod ===
        "all" && (

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          {/* M8+ */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
              Great earthquakes
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-900">
              {
                data.all_years
                  .counts[
                  "Great (M8+)"
                ]
              }
            </p>

            <p className="mt-2 text-slate-600">
              M8.0+ earthquakes appear in the complete catalog.
            </p>

          </div>


          {/* MAXIMUM */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
              Strongest event in dataset
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-900">
              M{data.maximum.magnitude}
            </p>

            <p className="mt-2 text-slate-600">

              Occurred {
                data.maximum
                  .occurrences
              } time{
                data.maximum
                  .occurrences === 1
                  ? ""
                  : "s"
              } in this dataset.

            </p>


            {maximumEvent && (

              <p className="mt-3 text-sm leading-6 text-slate-500">

                {maximumEvent.date}

                {" · "}

                {maximumEvent.location}

                {maximumEvent.depth_km !==
                  null && (
                  <>
                    {" · "}
                    Depth{" "}
                    {
                      maximumEvent
                        .depth_km
                    }{" "}
                    km
                  </>
                )}

              </p>

            )}

          </div>

        </div>

      )}


      {/* --------------------------------------------------
          INTERPRETATION
      -------------------------------------------------- */}

      <div className="mt-5 text-sm leading-6 text-slate-500">

        <p>
          Lower-magnitude earthquakes dominate the catalog,
          while Major and Great earthquakes are comparatively
          rare. Exact counts are displayed above the bars so
          rare categories remain readable even when their bars
          are very small.
        </p>

      </div>

    </div>

  );
}