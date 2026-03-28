"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const EDUCATION_LEVELS = ["High School", "Undergraduate", "Graduate", "PhD"];
const STUDY_MODES = ["On-campus", "Online", "Hybrid"];

export default function ScholarshipOnboarding() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    bio: "",
    education_level: "",
    major: "",
    gpa: "",
    enrolled_institution: "",
    graduation_year: "2026",
    interests: "", // We'll split this string into an array on submit
    extracurriculars: "",
    financial_need_status: false,
    ethnicity: "",
    location_state: "",
    is_international_student: false,
    primary_field_of_study: "",
    secondary_fields_of_study: "",
    academic_interests: "",
    research_experience: "",
    study_mode: "",
    career_goals: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value, type } = e.target;
    const val =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
  }

  async function handleSubmit() {
    console.log("Submitting form with data:", form);
    // Basic validation for required Zod fields
    if (
      !form.major ||
      !form.gpa ||
      !form.enrolled_institution ||
      !form.career_goals
    ) {
      return setError("Please fill in all required academic fields.");
    }

    setError("");
    setLoading(true);

    // Transform comma-separated strings back into arrays for the DB
    const payload = {
      ...form,
      gpa: parseFloat(form.gpa),
      graduation_year: parseInt(form.graduation_year),
      interests: form.interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      ethnicity: form.ethnicity
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
      secondary_fields_of_study: form.secondary_fields_of_study
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      academic_interests: form.academic_interests
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update profile.");

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Scholarship Profile Setup
        </h1>
        <p className="text-gray-500 mb-8 text-center">
          Complete your profile to let the AI start matching you.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Section 1: Core Academics */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">
              Academic Background
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Institution Name</label>
                <input
                  name="enrolled_institution"
                  className="p-2 border rounded-md"
                  value={form.enrolled_institution}
                  onChange={handleChange}
                  placeholder="e.g. University of Ghana"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Education Level</label>
                <select
                  name="education_level"
                  className="p-2 border rounded-md"
                  value={form.education_level}
                  onChange={handleChange}
                >
                  <option value="">Select Level</option>
                  {EDUCATION_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Major</label>
                <input
                  name="major"
                  className="p-2 border rounded-md"
                  value={form.major}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Current GPA</label>
                <input
                  name="gpa"
                  type="number"
                  step="0.01"
                  className="p-2 border rounded-md"
                  value={form.gpa}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* Section 2: AI Matching Metadata */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">
              Scholarship Criteria
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">
                  Primary Field of Study
                </label>
                <input
                  name="primary_field_of_study"
                  className="p-2 border rounded-md"
                  value={form.primary_field_of_study}
                  onChange={handleChange}
                  placeholder="e.g. Engineering"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Study Mode</label>
                <select
                  name="study_mode"
                  className="p-2 border rounded-md"
                  value={form.study_mode}
                  onChange={handleChange}
                >
                  <option value="">Select Mode</option>
                  {STUDY_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Academic Interests (comma separated)
              </label>
              <input
                name="academic_interests"
                className="p-2 border rounded-md"
                value={form.academic_interests}
                onChange={handleChange}
                placeholder="Calculus, AI, Physics"
              />
            </div>
          </section>

          {/* Section 3: Personal & Goals */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">
              Personal Statement
            </h2>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Career Goals</label>
              <textarea
                name="career_goals"
                className="p-2 border rounded-md h-24"
                value={form.career_goals}
                onChange={handleChange}
                placeholder="What do you plan to achieve?"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Bio (Brief)</label>
              <textarea
                name="bio"
                className="p-2 border rounded-md h-20"
                value={form.bio}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="financial_need_status"
                  checked={form.financial_need_status}
                  onChange={handleChange}
                />
                Financial Need
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_international_student"
                  checked={form.is_international_student}
                  onChange={handleChange}
                />
                International Student
              </label>
            </div>
          </section>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-50"
          >
            {loading ? "Optimizing Profile..." : "Complete Setup & Match →"}
          </button>
        </div>
      </div>
    </div>
  );
}
