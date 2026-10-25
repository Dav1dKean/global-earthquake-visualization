"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";


// Plotly uses browser APIs, so we load it only in the browser.
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
});


type EarthquakeEvent = {
  date: string;
  lat: number;
  lon: number;
  magnitude: number;
  depth_km: number | null;
  location: string;
};


type YearData = {
  year: number;
  status: "available" | "missing";
  first_date: string | null;
  last_date: string | null;
  event_count: number;
  events: EarthquakeEvent[];
};


export default function EarthquakeMap() {
  const [year, setYear] = useState(2025);
  const [minMagnitude, setMinMagnitude] = useState(4.5);

  const [yearData, setYearData] = useState<YearData | null>(null);

  const [loading, setLoading] = useState(true);


  // -------------------------------------------------------
  // Load only the JSON file for the selected year.
  // -------------------------------------------------------

  useEffect(() => {
    async function loadYear() {
      setLoading(true);

      try {
        const response = await fetch(`/data/map/${year}.json`);

        if (!response.ok) {
          throw new Error("Unable to load earthquake data.");
        }

        const data: YearData = await response.json();

        setYearData(data);
      } catch (error) {
        console.error(error);
        setYearData(null);
      } finally {
        setLoading(false);
      }
    }

    loadYear();
  }, [year]);


  // -------------------------------------------------------
  // Apply the minimum-magnitude filter.
  // -------------------------------------------------------

  const filteredEvents = useMemo(() => {
    if (!yearData) return [];

    return yearData.events.filter(
      (event) => event.magnitude >= minMagnitude
    );
  }, [yearData, minMagnitude]);


  // -------------------------------------------------------
  // Reset View 1 controls.
  // -------------------------------------------------------

  function resetView() {
    setYear(2025);
    setMinMagnitude(4.5);
  }


  // -------------------------------------------------------
  // Marker sizing.
  //
  // We intentionally keep circles fairly small so the map
  // remains readable when thousands of events are present.
  // -------------------------------------------------------

  const markerSizes = filteredEvents.map((event) => {
    return Math.max(5, (event.magnitude - 4) * 4);
  });


  return (
    <div className="mt-10">

      {/* --------------------------------------------------
          CONTROLS
      -------------------------------------------------- */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

        <div className="grid gap-6 md:grid-cols-2">

          {/* YEAR */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="map-year"
                className="font-semibold text-slate-700"
              >
                Year
              </label>

              <span className="font-mono text-lg font-semibold">
                {year}
              </span>
            </div>

            <input
              id="map-year"
              type="range"
              min="1900"
              max="2026"
              step="1"
              value={year}
              onChange={(event) =>
                setYear(Number(event.target.value))
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
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="map-magnitude"
                className="font-semibold text-slate-700"
              >
                Minimum magnitude
              </label>

              <span className="font-mono text-lg font-semibold">
                M{minMagnitude.toFixed(1)}+
              </span>
            </div>

            <input
              id="map-magnitude"
              type="range"
              min="4.5"
              max="8"
              step="0.5"
              value={minMagnitude}
              onChange={(event) =>
                setMinMagnitude(Number(event.target.value))
              }
              className="w-full"
            />

            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>M4.5</span>
              <span>M8+</span>
            </div>
          </div>

        </div>


        {/* SUMMARY */}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">

          <div>
            <p className="font-semibold text-slate-800">
              {loading
                ? "Loading earthquakes…"
                : `${filteredEvents.length.toLocaleString()} events shown`}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Larger circles represent stronger earthquakes. Orange markers highlight M7.0+ events.
            </p>
          </div>


          <button
            type="button"
            onClick={resetView}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Reset
          </button>

        </div>


        {/* DATA COVERAGE NOTES */}

        {yearData?.status === "missing" && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No earthquake records are available for {year} in the source dataset.
          </div>
        )}


        {year === 2026 && (
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            2026 is a partial year. The dataset ends on May 14, 2026.
          </div>
        )}

      </div>


      {/* --------------------------------------------------
          MAP
      -------------------------------------------------- */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">

        {loading ? (
          <div className="flex h-[600px] items-center justify-center text-slate-400">
            Loading map…
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex h-[600px] items-center justify-center px-6 text-center text-slate-500">
            No earthquake events match the selected year and magnitude.
          </div>
        ) : (
          <Plot
            data={[
              {
                type: "scattergeo",
                mode: "markers",

                lat: filteredEvents.map((event) => event.lat),
                lon: filteredEvents.map((event) => event.lon),

                text: filteredEvents.map((event) => event.location),

                customdata: filteredEvents.map((event) => [
                  event.date,
                  event.magnitude,
                  event.depth_km,
                ]),

                hovertemplate:
                  "<b>%{text}</b><br>" +
                  "Date: %{customdata[0]}<br>" +
                  "Magnitude: %{customdata[1]}<br>" +
                  "Depth: %{customdata[2]} km" +
                  "<extra></extra>",

                marker: {
  size: markerSizes,

  // Use blue for most earthquakes and orange
  // to highlight major/great earthquakes (M7+).
  color: filteredEvents.map((event) =>
    event.magnitude >= 7.0 ? "#ea580c" : "#2563eb"
  ),

  opacity: 0.6,

  line: {
    width: 0.4,
    color: "#ffffff",
  },
},
              },
            ]}
            layout={{
              autosize: true,
              height: 600,

              margin: {
                l: 10,
                r: 10,
                t: 30,
                b: 10,
              },

              geo: {
                projection: {
                  type: "natural earth",
                },

                showland: true,
                landcolor: "#f1f5f9",

                showocean: true,
                oceancolor: "#ffffff",

                showcountries: true,
                countrycolor: "#cbd5e1",

                showcoastlines: true,
                coastlinecolor: "#94a3b8",

                bgcolor: "#ffffff",
              },

              paper_bgcolor: "#ffffff",
              plot_bgcolor: "#ffffff",
            }}
            config={{
  responsive: true,
  displaylogo: false,

  // Keep normal webpage scrolling when the mouse
  // passes over the map.
  scrollZoom: false,

  // Keep Plotly's map controls available.
  displayModeBar: true,
}}
            style={{
              width: "100%",
            }}
          />
        )}

      </div>


      {/* --------------------------------------------------
          INTERPRETATION NOTE
      -------------------------------------------------- */}

      <div className="mt-5 flex flex-wrap justify-between gap-4 text-sm text-slate-500">

        <span>
          Hover over an earthquake to inspect its date, magnitude,
          depth, and location.
        </span>

        <span>
          Position = epicenter · Circle size = magnitude · Orange = M7.0+
        </span>

      </div>

    </div>
  );
}