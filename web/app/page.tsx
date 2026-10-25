import EarthquakeMap from "@/components/EarthquakeMap";
import Timeline from "@/components/Timeline";
import CalendarPatterns from "@/components/CalendarPatterns";
import MagnitudeChart from "@/components/MagnitudeChart";
import DepthChart from "@/components/DepthChart";
import RegionComparison from "@/components/RegionComparison";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* --------------------------------------------------
          HERO / INTRODUCTION
      -------------------------------------------------- */}
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            David Vasquez · CPS 5745 · Dynamic Scientific Storytelling
          </p>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl">
            Exploring Global Earthquake Patterns
          </h1>

          <p className="mt-4 max-w-3xl text-2xl text-slate-600">
            Where, When, and How Earthquakes Occur
          </p>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-600">
            Explore more than a century of recorded earthquakes through six
            connected interactive views. The story examines where earthquakes
            occur, how recorded activity changes over time, calendar patterns,
            magnitude, depth, and regional differences.
          </p>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-500">
            <span>Data source: USGS Earthquake Catalog</span>
            <span>Magnitude threshold: M4.5+</span>
            <span>Coverage: 1900–2026</span>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------
          VIEW 1
      -------------------------------------------------- */}
      <section
        id="view-1"
        className="mx-auto max-w-6xl border-b border-slate-200 px-6 py-20"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          View 1 · Place
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          Where Do Earthquakes Occur?
        </h2>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Explore the geographic distribution of earthquake epicenters around
          the world.
        </p>

<EarthquakeMap />

      </section>

      {/* --------------------------------------------------
          VIEW 2
      -------------------------------------------------- */}
      <section
        id="view-2"
        className="mx-auto max-w-6xl border-b border-slate-200 px-6 py-20"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          View 2 · Time
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          How Has Earthquake Activity Changed Over Time?
        </h2>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Follow the earthquake record year by year using an animated timeline.
        </p>

        <Timeline />
      </section>

      {/* --------------------------------------------------
          VIEW 3
      -------------------------------------------------- */}
      <section
        id="view-3"
        className="mx-auto max-w-6xl border-b border-slate-200 px-6 py-20"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          View 3 · Calendar
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          Are There Calendar Patterns?
        </h2>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Compare earthquake occurrence across weekdays, months, and days of
          the month.
        </p>

        <CalendarPatterns />
      </section>

      {/* --------------------------------------------------
          VIEW 4
      -------------------------------------------------- */}
      <section
        id="view-4"
        className="mx-auto max-w-6xl border-b border-slate-200 px-6 py-20"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          View 4 · Magnitude
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          How Strong Are Earthquakes?
        </h2>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Compare the frequency of Light, Moderate, Strong, Major, and Great
          earthquakes.
        </p>

        <MagnitudeChart />
      </section>

      {/* --------------------------------------------------
          VIEW 5
      -------------------------------------------------- */}
      <section
        id="view-5"
        className="mx-auto max-w-6xl border-b border-slate-200 px-6 py-20"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          View 5 · Depth
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          How Deep Do Earthquakes Occur?
        </h2>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Examine how far below Earth&apos;s surface earthquakes originate.
        </p>

        <DepthChart />
      </section>

      {/* --------------------------------------------------
          VIEW 6
      -------------------------------------------------- */}
      <section
        id="view-6"
        className="mx-auto max-w-6xl px-6 py-20"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          View 6 · Regions
        </p>

        <h2 className="mt-3 text-4xl font-bold">
          How Do Earthquake Patterns Differ by Region?
        </h2>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Compare earthquake activity, magnitude, and depth between selected
          regions.
        </p>

        <RegionComparison />
      </section>
    </main>
  );
}