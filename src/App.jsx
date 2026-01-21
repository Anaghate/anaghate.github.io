import { useMemo } from "react";
import profileImg from "./profile.jpg";
import life1 from "./1.JPG";
import life2 from "./2.JPG";
import life3 from "./3.JPG";

function ButtonLink({ href, children, variant = "solid" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99]";
  const solid =
    "bg-zinc-900 text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400";
  const ghost =
    "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200";

  return (
    <a
      href={href}
      className={`${base} ${variant === "solid" ? solid : ghost}`}
      target={href.startsWith("#") ? "_self" : "_blank"}
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700">
      {children}
    </span>
  );
}

function Card({ children }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      {children}
    </div>
  );
}

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="scroll-mt-24 py-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 max-w-3xl text-zinc-600">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function parseMonthYear(input) {
  // Handles formats like: "Sep 2025", "Dec 2020", "May 2025", "Oct 2020", "Aug 2018", "Present"
  if (!input) return null;
  const s = input.trim().toLowerCase();
  if (s === "present" || s === "current") return null;

  const parts = input.trim().split(/\s+/); // ["Sep", "2025"]
  if (parts.length < 2) return null;

  const monthMap = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, sept: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };

  const m = monthMap[parts[0].toLowerCase()];
  const y = Number(parts[1]);
  if (Number.isNaN(m) || Number.isNaN(y)) return null;

  return new Date(y, m, 1);
}

function monthsBetween(a, b) {
  // a, b are Date
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Timeline({ startAnchor, items }) {
  // startAnchor = Date (e.g., Aug 2014)
  // items: [{ side: "left"|"right", title, org, start: Date, end: Date|null, subtitle, bullets }]
  const now = new Date();
  const normalized = items
    .map((it) => {
      const start = it.start;
      const end = it.end ?? now;
      if (!start) return null;

      const startM = monthsBetween(startAnchor, start);
      const endM = monthsBetween(startAnchor, end);
      const durM = Math.max(1, endM - startM + 1);

      return {
        ...it,
        _startM: startM,
        _endM: endM,
        _durM: durM,
      };
    })
    .filter(Boolean);

  const maxEndM = normalized.reduce((mx, it) => Math.max(mx, it._endM), 0);

  // Tweak this for spacing:
  const PX_PER_MONTH = 10;            // timeline “scale”
  const TOP_PADDING = 24;
  const HEIGHT = TOP_PADDING + (maxEndM + 2) * PX_PER_MONTH;

  // Year ticks every Aug (since anchor is Aug 2014)
  const ticks = [];
  for (let m = 0; m <= maxEndM + 12; m += 12) {
    const d = new Date(startAnchor.getFullYear(), startAnchor.getMonth() + m, 1);
    ticks.push({ monthOffset: m, label: `${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}` });
  }

  return (
    <div className="relative w-full rounded-2xl border border-zinc-200 bg-white p-4 md:p-6">
      {/* Axis container */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="relative mx-auto max-w-6xl"
          style={{ height: `${HEIGHT}px`, transform: "scaleY(-1)" }}
        >

        
        {/* Center line */}
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-zinc-200" />

        {/* Year ticks */}
        {ticks.map((t) => {
          const top = TOP_PADDING + t.monthOffset * PX_PER_MONTH;
          return (
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top }}>
              <div style={{ transform: "scaleY(-1)" }}>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-zinc-400" />
                  <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
                    {t.label}
                  </div>
                </div>
              </div>
            </div>

          );
        })}

        {/* Items */}
        {normalized.map((it) => {
          const top = TOP_PADDING + it._startM * PX_PER_MONTH;
          const h = it._durM * PX_PER_MONTH;

          const sideBase =
            it.side === "left"
              ? "right-1/2 pr-6 md:pr-10"
              : "left-1/2 pl-6 md:pl-10";

          const align =
            it.side === "left" ? "items-end text-right" : "items-start text-left";

          return (
            <div
              key={`${it.title}-${it.org}-${it._startM}`}
              className={`absolute ${sideBase} w-[min(640px,calc(50%-12px))] max-md:!left-0 max-md:!right-0 max-md:w-full max-md:px-0`}
              style={{ top, transform: "scaleY(-1)" }}
            >
              {/* connector */}
              <div className={`flex ${align} gap-3`}>
                {it.side === "left" ? (
                  <>
                    <div className="flex flex-col items-end">
                      <div
                        className="w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                        style={{ minHeight: Math.max(72, h) }}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {it.kind}
                        </div>
                        <div className="mt-1 text-sm font-bold text-zinc-900">
                          {it.title}
                        </div>
                        <div className="text-sm text-zinc-700">{it.org}</div>
                        <div className="mt-1 text-xs text-zinc-500">{it.range}</div>

                        {it.subtitle ? (
                          <div className="mt-2 text-xs text-zinc-600">{it.subtitle}</div>
                        ) : null}
                        {it.bullets?.length ? (
                          <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-zinc-700">
                            {it.bullets.slice(0, 4).map((b, idx) => (
                              <li key={idx}>{b}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 h-px w-6 bg-zinc-200" />
                    <div className="mt-2 h-3 w-3 rounded-full bg-zinc-900" />
                  </>
                ) : (
                  <>
                    <div className="mt-2 h-3 w-3 rounded-full bg-zinc-900" />
                    <div className="mt-3 h-px w-6 bg-zinc-200" />
                    <div className="flex flex-col items-start">
                      <div
                        className="w-full rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                        style={{ minHeight: Math.max(72, h) }}
                      >
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {it.kind}
                        </div>
                        <div className="mt-1 text-sm font-bold text-zinc-900">
                          {it.title}
                        </div>
                        <div className="text-sm text-zinc-700">{it.org}</div>
                        <div className="mt-1 text-xs text-zinc-500">{it.range}</div>
                        {it.subtitle ? (
                          <div className="mt-2 text-xs text-zinc-600">{it.subtitle}</div>
                        ) : null}
                        {it.coursework && (
                          <p className="mt-2 text-xs text-zinc-600">
                            <span className="font-semibold text-zinc-700">Coursework:</span>{" "}
                            {it.coursework}
                          </p>
                        )}
                        {it.bullets?.length ? (
                          <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-zinc-700">
                            {it.bullets.slice(0, 4).map((b, idx) => (
                              <li key={idx}>{b}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
      

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-600">
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-zinc-900" /> Experience
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-zinc-900" /> Education
        </span>
      </div>
    </div>
  );
}

function MilestoneTimeline({ items }) {
  // Group by year (derived from start date), descending (present on top)
  const safeItems = Array.isArray(items) ? items : [];

  const byYear = safeItems.reduce((acc, it) => {
    const year = it?.start instanceof Date ? it.start.getFullYear() : null;
    if (!year) return acc;

    acc[year] = acc[year] || [];
    acc[year].push({ ...it, year });
    return acc;
  }, {});


  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  // sort each year items (experience left + education right can mix)
  years.forEach((y) => {
    byYear[y].sort((a, b) => {
      // Keep experience on left, education on right (optional)
      if (a.side !== b.side) return a.side === "left" ? -1 : 1;

      // Within the same year: latest start month first (Accenture Dec 2020 before Rabbit Jan 2020)
      const aTime = a.start instanceof Date ? a.start.getTime() : 0;
      const bTime = b.start instanceof Date ? b.start.getTime() : 0;
      return bTime - aTime;
    });
  });

  return (
    <div className="relative w-full rounded-2xl border border-zinc-200 bg-white p-4 md:p-6">
      {/* center line */}
      <div className="absolute left-1/2 top-6 h-[calc(100%-48px)] w-px -translate-x-1/2 bg-zinc-200" />

      <div className="space-y-10">
        {years.map((year) => (
          <div key={year} className="relative">
            {/* Year badge on spine */}
            <div className="sticky top-16 z-10 flex justify-center">
              <div className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1 text-sm font-semibold text-zinc-800 shadow-sm">
                {year}
              </div>
            </div>

            {/* milestones */}
            <div className="mt-6 space-y-6">
              {byYear[year].map((it, idx) => (
                <div key={`${it.title}-${idx}`} className="relative">
                  {/* icon on spine */}
                  <div className="absolute left-1/2 top-6 -translate-x-1/2">
                    <div className="grid h-12 w-12 place-items-center rounded-full border border-zinc-200 bg-white shadow-sm">
                      <span className="text-lg">{it.icon || "•"}</span>
                    </div>
                  </div>

                  {/* content row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 md:gap-10">
                    {/* LEFT (experience) */}
                    <div className="md:pr-10">
                      {it.side === "left" ? (
                        <div className="ml-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            EXPERIENCE
                          </div>
                          <div className="mt-1 text-base font-bold text-zinc-900">
                            {it.title}
                          </div>
                          <div className="text-sm text-zinc-700">{it.org}</div>
                          <div className="mt-1 text-xs text-zinc-500">{it.range}</div>
                          
                          {it.bullets && it.bullets.length > 0 && (
                            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600">
                              {it.bullets.map((point, idx) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                          )}

                          {it.coursework && (
                            <p className="mt-3 text-xs text-zinc-600">
                              <span className="font-semibold text-zinc-700">
                                Coursework:
                              </span>{" "}
                              {it.coursework}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>

                    {/* RIGHT (education) */}
                    <div className="md:pl-10">
                      {it.side === "right" ? (
                        <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            EDUCATION
                          </div>
                          <div className="mt-1 text-base font-bold text-zinc-900">
                            {it.title}
                          </div>
                          <div className="text-sm text-zinc-700">{it.org}</div>
                          <div className="mt-1 text-xs text-zinc-500">{it.range}</div>

                          {it.coursework && (
                            <p className="mt-3 text-xs text-zinc-600">
                              <span className="font-semibold text-zinc-700">
                                Coursework:
                              </span>{" "}
                              {it.coursework}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>

                  {/* spacer so icon doesn't overlap card */}
                  <div className="h-2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function App() {
  const profile = useMemo(
    () => ({
      name: "Anagha Ghate",
      location: "Binghamton, NY",
      email: "aghate@binghamton.edu",
      github: "https://github.com/Anaghate",
      handshake: "https://binghamton.joinhandshake.com/profiles/anaghate", // TODO: replace with your real Handshake
      // linkedin: "https://www.linkedin.com/", // TODO: replace with your real LinkedIn
      headline: "Software Developer | Cloud-Native Backend Engineer",
      summary:
        "Software Developer with experience building scalable backend systems, cloud deployments, and real-time IoT integrations across Azure, GCP, and AWS. Focused on reliability, observability, and measurable product impact.",
    }),
    []
  );

  const featuredProjects = useMemo(
  () => [
    {
      name: "Hotel Reviews Analysis",
      oneLiner:
        "Flask + MongoDB analytics platform for unstructured hotel reviews with trend and loyalty insights.",
      stack: ["Flask", "MongoDB", "JavaScript", "REST APIs"],
      bullets: [
        "Built analytics workflows using MongoDB aggregation pipelines for rating trends and loyalty detection.",
        "Developed backend endpoints to serve review insights and customer segmentation.",
        "Created an interactive UI to explore trends from unstructured review text.",
      ],
      links: { github: "", live: "" },
    },
    {
      name: "Image Caption Generator",
      oneLiner:
        "End-to-end deep learning pipeline that generates descriptive captions for input images using CNN + LSTM.",
      stack: [
        "Python",
        "TensorFlow/Keras",
        "VGG16",
        "LSTM",
        "Google Colab",
        "GitHub",
      ],
      bullets: [
        "Used VGG16 for CNN feature extraction to convert images into feature vectors.",
        "Trained an LSTM sequence model to generate grammatically coherent captions.",
        "Built a custom dataset pipeline: cleaned captions, created vocabulary, aligned image-caption pairs.",
        "Optimized training with sequence padding, batching, and generator-based input pipelines.",
      ],
      links: { github: "", live: "" },
    },
    {
      name: "Bike Navigator (IoT)",
      oneLiner:
        "ESP32-based bike navigation using BLE/Wi-Fi and an OLED display for real-time distance & direction.",
      stack: ["ESP32", "BLE", "Wi-Fi", "OLED", "IoT"],
      bullets: [
        "Integrated Bluetooth Low Energy + Wi-Fi to receive navigation data.",
        "Rendered real-time distance and direction on an OLED dashboard mounted on a bike.",
        "Designed for low-latency updates suitable for outdoor usage.",
      ],
      links: { github: "", live: "" },
    },
    {
      name: "Floor Cleaning Robot",
      oneLiner:
        "Arduino (ATmega328) embedded automation project to simplify and automate floor cleaning.",
      stack: ["Arduino (ATmega328)", "Embedded C"],
      bullets: [
        "Implemented embedded control logic to automate floor cleaning tasks.",
        "Designed system behavior to reduce manual effort through automation.",
      ],
      links: { github: "", live: "" },
    },
    {
      name: "Automatic Traffic Signal Control",
      oneLiner:
        "Density-based adaptive traffic signal control system using Arduino (ATmega328).",
      stack: ["Arduino (ATmega328)", "Embedded C"],
      bullets: [
        "Implemented adaptive switching logic dependent on traffic density.",
        "Built embedded workflow for real-time signal control behavior.",
      ],
      links: { github: "", live: "" },
    },
    {
      name: "Currency Recognition & Conversion",
      oneLiner:
        "Python GUI app to identify currency and convert it to another country’s currency.",
      stack: ["Python"],
      bullets: [
        "Designed a GUI-based workflow for currency recognition and conversion.",
        "Built an end-to-end user flow from identification to converted output.",
      ],
      links: { github: "", live: "" },
    },
    {
      name: "Educational Tool for Continuous-Time LTI Systems",
      oneLiner:
        "Standalone executable application to analyze continuous-time LTI systems using Laplace transforms.",
      stack: ["MATLAB"],
      bullets: [
        "Developed a standalone tool for analyzing CT-LTI systems using Laplace transform methods.",
        "Designed an educational workflow to help users interpret system behavior.",
      ],
      links: { github: "", live: "" },
    },
  ],
  []
);


  const experience = useMemo(
    () => [
      {
        company: "Meltek Inc., USA",
        title: "Software Developer",
        dates: "Sep 2025 – Present",
        bullets: [
          "Worked with a containerized architecture on Azure Container Apps, supporting 10+ backend and worker services.",
          "Developed a role-based admin dashboard to monitor 6K+ users, transaction flows, revenue metrics, and connected IoT devices.",
          "Integrated phone + email verification using Twilio and SendGrid, reducing fraudulent or invalid signups by ~30%.",
          "Built Grafana dashboards for real-time monitoring of container health, performance metrics, and resource utilization.",
          "Integrated Enode webhooks to ingest and process real-time IoT device events, handling thousands of device updates/day in an event-driven pipeline.",
          "Improved observability using logs, metrics, and alerts; supported frequent releases with minimal downtime.",
        ],
      },
      {
        company: "Global Health Impact, Binghamton, USA",
        title: "Backend Developer",
        dates: "Oct 2024 – May 2025",
        bullets: [
          "Designed and implemented backend APIs with Python/Flask, enabling scalable forecasting services.",
          "Applied role-based access control for secure data access and compliance.",
          "Used telemetry and metrics to optimize performance and reduce latency.",
          "Partnered with product managers and engineers to deliver reliable SaaS-style features.",
        ],
      },
      {
        company: "Accenture, India",
        title: "Software Development Engineer",
        dates: "Dec 2020 – Jul 2023",
        bullets: [
          "Built backend services in Python/Flask and integrated Google Cloud AI APIs for multilingual speech-to-text, translation, and text-to-speech.",
          "Designed scalable Cloud SQL schema and data models to support cross-region workflows.",
          "Reduced manual localization effort by 60% using AI-driven voice synthesis and dubbing automation.",
          "Implemented CI/CD with Docker, Kubernetes, Cloud Build, and Cloud Run to accelerate delivery.",
          "Improved platform stability by 40% using Cloud Logging + monitoring pipelines.",
        ],
      },
      {
        company: "Rabbit & Tortoise Technology Solutions, Pune, India",
        title: "C++ Developer Intern",
        dates: "Jan 2020 – Jul 2020",
        bullets: [
          "Developed OCR preprocessing algorithms in C++ and Python, improving prediction accuracy by 12%.",
          "Modularized components using OOP patterns to improve maintainability.",
        ],
      },
      {
        company: "IEEE Student Branch, VIT",
        title: "Executive Committee Member",
        dates: "Aug 2018 – Sep 2019",
        bullets: [
          "Led a three-day intercollegiate technical event (VISHWOTSAV) at VIT Pune in collaboration with the Electronics & Telecommunication Engineering department and IEEE Pune Section.",
          "Organized and delivered technical workshops for first-year undergraduate students, inviting industry experts to bridge academic learning with real-world exposure.",
        ],
      },
    ],
    []
  );

  const skills = useMemo(
    () => ({
      Languages: ["Python", "Java", "C++", "SQL", "JavaScript", "MATLAB", "Shell"],
      "Frameworks/Libraries": ["Flask", "FastAPI", "Django", "Pandas", "NumPy", "PyTest"],
      Cloud: ["Azure", "GCP (Cloud SQL, Cloud Run, Cloud Build)", "AWS (API Gateway, Lambda, ECS)"],
      DevOps: ["Docker", "Kubernetes", "Jenkins", "Git", "CI/CD"],
      Databases: ["PostgreSQL", "MongoDB", "Redis", "Cloud SQL", "AWS RDS"],
      Testing: [
        "Unit Testing",
        "Integration Testing",
        "Functional Testing",
        "PyTest",
      ],
      "Monitoring & Security": [
        "Cloud Logging",
        "HIPAA Compliance",
        "Healthcare IT Security",
      ],
      // Certifications: [
      //   "AWS Certified Cloud Engineer",
      //   "Google Cloud Certified Associate Cloud Engineer",
      //   "PCEP (Python Institute)",
      // ],
    }),
    []
  );

  const education = useMemo(
    () => [
      {
        school: "SUNY Binghamton, NY, USA",
        degree: "Master of Science in Computer Science",
        dates: "Aug 2023 – May 2025",
        coursework:
          "Data Structures & Algorithms, Design Patterns, Data Mining, Artificial Intelligence, Databases, Distributed Systems, Programming Languages",
      },
      {
        school: "Vishwakarma Institute of Technology, Pune, India",
        degree: "Bachelor of Technology in Electronics & Telecommunication Engineering",
        dates: "Aug 2017 – May 2020",
        coursework:
          "Data Structures & Algorithms, Object Oriented Programming, Microprocessors & Microcontrollers, Digital Signal Processing, Digital Image Processing, Internet of Things, Embedded Systems",
      },
      {
        school: "Government Polytechnic, Amravati, India",
        degree: "Diploma in Electronics & Telecommunication Engineering",
        dates: "Aug 2014 – May 2017",
      },
    ],
    []
  );

  const patents = useMemo(
    () => [
      {
        title: 'US 12,393,794 B2 – "Video Translation Platform"',
        date: "Granted on August 19, 2025",
        description:
          "This patent focuses on enabling seamless video translation and transcription, where spoken content in one language can be translated, synchronized, and rendered into another language—bridging communication gaps across borders and cultures.",
        link: "https://patents.google.com/patent/US12393794B2/en?oq=US12393794B2",
      },
    ],
    []
  );

  const certifications = useMemo(
    () => [
      {
        name: "AWS Certified Cloud Engineer",
        link: "https://www.credly.com/badges/c6859be7-51a6-46c0-aea8-322fc9df6a47/public_url",
      },
      {
        name: "PCEP – Python Institute",
        link: "https://www.youracclaim.com/badges/f9b43606-e4d1-4dfb-b07c-99e5527e1750",
      },
      {
        name: "Data Structures & Algorithms – AlgoExpert",
        link: "https://certificate.algoexpert.io/AlgoExpert%20Certificate%20AE-5857f16ceb",
      },
      {
        name: "Google Cloud Certified Associate Cloud Engineer",
        link: "https://www.credly.com/",
      },
    ],
    []
  );

  const recognition = useMemo(
    () => [
      "Winner — Accenture Global Technology Innovation Competition (GTIC), selected from 5,000+ global projects",
      "Accenture Inventor Award",
    ],
    []
  );

  const timelineStart = useMemo(() => new Date(2014, 7, 1), []); // Aug 2014

  const timelineItems = useMemo(
    () => [
      // EDUCATION (RIGHT)
      {
        side: "right",
        kind: "Education",
        title: "Diploma in Electronics & Telecommunication Engineering",
        org: "Government Polytechnic, Amravati, India",
        start: parseMonthYear("Aug 2014"),
        end: parseMonthYear("May 2017"),
        range: "Aug 2014 – May 2017",
        icon: "🎓",
      },
      {
        side: "right",
        kind: "Education",
        title: "B.Tech in Electronics & Telecommunication Engineering",
        org: "Vishwakarma Institute of Technology, Pune, India",
        start: parseMonthYear("Aug 2017"),
        end: parseMonthYear("May 2020"),
        range: "Aug 2017 – May 2020",
        icon: "🎓",
        coursework:
          "Data Structures & Algorithms, Object Oriented Programming, Microprocessors & Microcontrollers, Digital Signal Processing, Digital Image Processing, Internet of Things, Embedded Systems",
      },
      {
        side: "right",
        kind: "Education",
        title: "Master of Science in Computer Science",
        org: "SUNY Binghamton, NY, USA",
        start: parseMonthYear("Aug 2023"),
        end: parseMonthYear("May 2025"),
        range: "Aug 2023 – May 2025",
        icon: "🎓",
        coursework:
          "Data Structures & Algorithms, Design Patterns, Data Mining, Artificial Intelligence, Databases, Distributed Systems, Programming Languages",
      },


      // EXPERIENCE (LEFT)
      {
        side: "left",
        kind: "Experience",
        title: "Executive Committee Member",
        org: "IEEE Student Branch, VIT (Pune, India)",
        start: parseMonthYear("Aug 2018"),
        end: parseMonthYear("Sep 2019"),
        range: "Aug 2018 – Sep 2019",
        icon: "🏆",
        bullets: [
          "Led a three-day intercollegiate technical event (VISHWOTSAV) at VIT Pune in collaboration with the Electronics & Telecommunication Engineering department and IEEE Pune Section.",
          "Organized and delivered technical workshops for first-year undergraduate students, inviting industry experts to bridge academic learning with real-world exposure.",
        ],
      },
      {
        side: "left",
        kind: "Experience",
        title: "Software Development Engineer",
        org: "Accenture, India",
        start: parseMonthYear("Dec 2020"),
        end: parseMonthYear("Jul 2023"),
        range: "Dec 2020 – Jul 2023",
        icon: "💻",
        bullets: [
          "Built backend services in Python/Flask and integrated Google Cloud AI APIs for multilingual speech-to-text, translation, and text-to-speech.",
          "Designed scalable Cloud SQL schema and data models to support cross-region workflows.",
          "Reduced manual localization effort by 60% using AI-driven voice synthesis and dubbing automation.",
          "Implemented CI/CD with Docker, Kubernetes, Cloud Build, and Cloud Run to accelerate delivery.",
          "Improved platform stability by 40% using Cloud Logging + monitoring pipelines.",
        ],
      },
      {
        side: "left",
        kind: "Experience",
        title: "C++ Developer Intern",
        org: "Rabbit & Tortoise Technology Solutions, Pune, India",
        start: parseMonthYear("Jan 2020"),
        end: parseMonthYear("Jul 2020"),
        range: "Jan 2020 – Jul 2020",
        icon: "💻",
        bullets: [
          "Developed OCR preprocessing algorithms in C++ and Python, improving prediction accuracy by 12%.",
          "Modularized components using OOP patterns to improve maintainability.",
        ],
      },
      {
        side: "left",
        kind: "Experience",
        title: "Backend Developer",
        org: "Global Health Impact, Binghamton, USA",
        start: parseMonthYear("Oct 2024"),
        end: parseMonthYear("May 2025"),
        range: "Oct 2024 – May 2025",
        icon: "💻",
        bullets: [
          "Designed and implemented backend APIs with Python/Flask, enabling scalable forecasting services.",
          "Applied role-based access control for secure data access and compliance.",
          "Used telemetry and metrics to optimize performance and reduce latency.",
          "Partnered with product managers and engineers to deliver reliable SaaS-style features.",
        ],
      },
      {
        side: "left",
        kind: "Experience",
        title: "Software Developer",
        org: "Meltek Inc., USA",
        start: parseMonthYear("Sep 2025"),
        end: null, // Present
        range: "Sep 2025 – Present",
        icon: "💻",
        bullets: [
          "Worked with a containerized architecture on Azure Container Apps, supporting 10+ backend and worker services.",
          "Developed a role-based admin dashboard to monitor 6K+ users, transaction flows, revenue metrics, and connected IoT devices.",
          "Integrated phone + email verification using Twilio and SendGrid, reducing fraudulent or invalid signups by ~30%.",
          "Built Grafana dashboards for real-time monitoring of container health, performance metrics, and resource utilization.",
          "Integrated Enode webhooks to ingest and process real-time IoT device events, handling thousands of device updates/day in an event-driven pipeline.",
          "Improved observability using logs, metrics, and alerts; supported frequent releases with minimal downtime.",
        ],
      },
    ],
    []
  );


  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#top" className="font-bold tracking-tight">
            {profile.name}
          </a>

          <nav className="hidden gap-6 text-sm text-zinc-700 md:flex">
          <a className="hover:text-zinc-900" href="#timeline">Timeline</a>
          <a className="hover:text-zinc-900" href="#projects">Projects</a>
          <a className="hover:text-zinc-900" href="#skills">Skills</a>
          <a className="hover:text-zinc-900" href="#certifications">Certifications</a>
          <a className="hover:text-zinc-900" href="#patents">Patent</a>
          <a className="hover:text-zinc-900" href="#contact">Contact</a>
        </nav>

          {/* <div className="flex items-center gap-2">
            <ButtonLink href="/resume.pdf" variant="solid">Download Resume</ButtonLink>
          </div> */}
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4">
        {/* Hero */}
        <section id="about" className="mx-auto max-w-6xl px-6 pt-16">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-center">

            {/* Photo */}
            <img
              src={profileImg}
              alt="Anagha Ghate"
              className="h-40 w-40 rounded-full object-cover shadow-md"
            />

            {/* Text */}
            <div className="text-center md:text-left max-w-xl">
              <h1 className="text-4xl font-bold text-zinc-900">
                Anagha Ghate
              </h1>

              <p className="mt-2 text-lg font-medium text-zinc-600">
                Software Developer | Cloud-Native Backend Engineer
              </p>

              <p className="mt-4 text-zinc-600 leading-relaxed">
                Software Developer with experience building scalable backend systems,
                cloud deployments, and real-time IoT integrations across Azure, GCP,
                and AWS. Focused on reliability, observability, and measurable product
                impact.
              </p>
            </div>
          </div>
        </section>


        {/* Timeline */}
        <Section
          id="timeline"
          title="Education & Experience"
          subtitle="A timeline view of my journey — experience on the left, education on the right."
        >
          <MilestoneTimeline items={timelineItems} />
        </Section>

        {/* <Section
          id="timeline"
          title="Education & Experience"
          subtitle="A timeline view of my journey — experience on the left, education on the right."
        >
          <Timeline startAnchor={timelineStart} items={timelineItems} />
        </Section> */}


        {/* Experience */}
        {/* <Section
          id="experience"
          title="Experience"
          subtitle="Cloud-native backend engineering, observability, and real-time integrations."
        >
          <div className="space-y-5">
            {experience.map((e) => (
              <Card key={`${e.company}-${e.title}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold">{e.company}</h3>
                    <p className="text-sm text-zinc-700">
                      {e.title}
                      <span className="text-zinc-500"> • {e.dates}</span>
                    </p>
                  </div>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                  {e.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Section> */}

        {/* Projects */}
        <Section
          id="projects"
          title="Featured Projects"
          subtitle="A quick snapshot of projects that show cloud, backend, data, and embedded/IOT depth."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {featuredProjects.map((p) => (
              <Card key={p.name}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    <p className="mt-2 text-sm text-zinc-600">{p.oneLiner}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <Badge key={s}>{s}</Badge>
                  ))}
                </div>

                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                  {p.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  {p.links.github ? (
                    <ButtonLink href={p.links.github} variant="ghost">GitHub</ButtonLink>
                  ) : null}
                  {p.links.live ? (
                    <ButtonLink href={p.links.live} variant="ghost">Live Demo</ButtonLink>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Education */}
        {/* <Section id="education" title="Education" subtitle="Academic foundation in CS, systems, and embedded/IOT."> */}
        {/* <Section id="education" title="Education">
          <div className="space-y-5">
            {education.map((ed) => (
              <Card key={`${ed.school}-${ed.degree}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold">{ed.degree}</h3>
                    <p className="text-sm text-zinc-700">
                      {ed.school} <span className="text-zinc-500"> • {ed.dates}</span>
                    </p>
                  </div>
                </div>
                {ed.coursework && (
                  <p className="mt-3 text-sm text-zinc-600">
                    <span className="font-semibold text-zinc-800">Coursework:</span>{" "}
                    {ed.coursework}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </Section> */}

        {/* Skills */}
        <Section id="skills" title="Skills" subtitle="Core technologies I use to build and ship production systems.">
          <div className="grid gap-5 md:grid-cols-2">
            {Object.entries(skills).map(([group, items]) => (
              <Card key={group}>
                <h3 className="text-sm font-semibold text-zinc-900">{group}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.map((x) => (
                    <Badge key={x}>{x}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* Certifications */}
        <Section
          id="certifications"
          title="Certifications"
          subtitle="Industry-recognized credentials validating cloud, programming, and algorithmic expertise."
        >
          <Card>
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <a
                  key={cert.name}
                  href={cert.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 hover:shadow-sm"
                >
                  {cert.name}
                </a>
              ))}
            </div>
          </Card>
        </Section>

        {/* Recognition */}
        <Section id="awards" title="Recognition">
          <Card>
            <ul className="list-disc space-y-2 pl-5 text-sm text-zinc-700">
              {recognition.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </Card>
        </Section>

        {/* Patents */}
        <Section
          id="patents"
          title="Patent"
          subtitle="Granted intellectual property demonstrating innovation in cloud-based AI systems."
        >
          <div className="space-y-5">
            {patents.map((patent) => (
              <Card key={patent.title}>
                <h3 className="text-lg font-bold text-zinc-900">
                  {patent.title}
                </h3>

                <p className="mt-1 text-sm font-medium text-zinc-600">
                  {patent.date}
                </p>

                <p className="mt-3 text-sm text-zinc-700">
                  {patent.description}
                </p>

                <div className="mt-4">
                  <a
                    href={patent.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    View patent details →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          id="beyond-work"
          title="Life Beyond Work"
          subtitle="What I enjoy outside of engineering and problem-solving."
          className="py-8"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-center">
  
  {/* Text */}
  <p className="max-w-xl text-zinc-600 leading-relaxed">
    Outside of software development, I enjoy painting, hiking, and exploring
    new activities and places. I’ve explored 20+ hiking trails across New York
    and Pennsylvania, and I’m always looking for new outdoor challenges and
    creative outlets that help me recharge and stay curious.
  </p>

  {/* Photos */}
  <div className="relative mx-auto h-72 w-72">
  {/* Top image */}
  <img
    src={life1}
    alt="Hiking"
    className="absolute left-1/2 top-0 z-30 h-32 w-32 -translate-x-1/2 rounded-full object-cover shadow-lg ring-4 ring-white"
  />

  {/* Bottom left (moved up + inward) */}
  <img
    src={life2}
    alt="Painting"
    className="absolute bottom-10 left-8 z-20 h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-white"
  />

  {/* Bottom right (moved up + inward) */}
  <img
    src={life3}
    alt="Exploring"
    className="absolute bottom-10 right-8 z-10 h-32 w-32 rounded-full object-cover shadow-lg ring-4 ring-white"
  />
</div>


</div>
        </Section>

        {/* Contact */}
        <Section
          id="contact"
          title="Contact"
          subtitle="Best way to reach me is email. I typically respond within a day."
        >
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-zinc-900">{profile.email}</div>
                <div className="mt-1 text-sm text-zinc-600">{profile.location}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href={`mailto:${profile.email}`} variant="solid">Email</ButtonLink>
                {/* <ButtonLink href={profile.linkedin} variant="ghost">LinkedIn</ButtonLink> */}
                <ButtonLink href={profile.github} variant="ghost">GitHub</ButtonLink>
                <ButtonLink href={profile.handshake} variant="ghost">Handshake</ButtonLink>
              </div>
            </div>
          </Card>
        </Section>

        <footer className="py-10 text-center text-sm text-zinc-500">
          Made with <span className="text-red-500">❤️</span> by Anagha
        </footer>
      </main>
    </div>
  );
}
