import * as z from "zod";

export const profileSchema = z.object({
  // Basic Info
  bio: z
    .string()
    .max(500, "Bio must be under 500 characters")
    .optional()
    .nullable(),

  // Academic Data
  education_level: z.enum(["High School", "Undergraduate", "Graduate", "PhD"]),
  major: z.string().min(2, "Major is required"),
  gpa: z.number().min(0).max(4.0, "GPA must be between 0 and 4.0"),
  enrolled_institution: z.string().min(2, "Institution name is required"),
  graduation_year: z.number().int().min(2024).max(2035),

  // Matching Criteria (Arrays map to z.array)
  interests: z.array(z.string()).default([]),
  extracurriculars: z.string().optional().nullable(),
  financial_need_status: z.boolean().default(false),
  ethnicity: z.array(z.string()).optional().default([]),
  location_state: z.string().optional().nullable(),
  is_international_student: z.boolean().default(false),

  // Academic Preferences
  primary_field_of_study: z.string().min(2, "Primary field is required"),
  secondary_fields_of_study: z.array(z.string()).default([]),
  academic_interests: z.array(z.string()).default([]),
  research_experience: z.string().optional().nullable(),
  study_mode: z.enum(["On-campus", "Online", "Hybrid"]),
  career_goals: z
    .string()
    .min(10, "Please provide a brief description of your goals"),
});

// Infer the TypeScript type from the schema
