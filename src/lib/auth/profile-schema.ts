import { z } from "zod";

export const PROFILE_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "pt", label: "Portuguese" },
] as const;

export const profileLanguageValues = PROFILE_LANGUAGES.map((l) => l.value) as [
  string,
  ...string[],
];

export const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(80),
  last_name: z.string().trim().min(1, "Last name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  username: z
    .string()
    .trim()
    .max(60)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  home_city: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  home_country: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  additional_info: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  photo_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  language: z.enum(profileLanguageValues),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
