import { isValidPhoneInput } from "@/lib/customer-club/normalize";

export type CareerFormField = "fullName" | "phone" | "residenceArea" | "age" | "experience";
export type CareerApplicationResult =
  | { success: true }
  | { success: false; fieldErrors?: Partial<Record<CareerFormField, string>>; message?: string };

export function parseCareerApplication(formData: FormData) {
  const text = (field: string) => {
    const value = formData.get(field);
    return typeof value === "string" ? value.trim() : "";
  };
  const fullName = text("fullName").replace(/\s+/g, " ");
  const phone = text("phone");
  const residenceArea = text("residenceArea").replace(/\s+/g, " ");
  const rawAge = text("age");
  const experience = text("experience");
  const age = Number(rawAge);
  const fieldErrors: Partial<Record<CareerFormField, string>> = {};
  if (fullName.length < 2 || fullName.length > 120) fieldErrors.fullName = "יש למלא שם מלא (עד 120 תווים).";
  if (phone.length > 40 || !isValidPhoneInput(phone)) fieldErrors.phone = "יש למלא מספר טלפון תקין.";
  if (residenceArea.length < 2 || residenceArea.length > 120) fieldErrors.residenceArea = "יש למלא עיר או אזור מגורים (עד 120 תווים).";
  // Data sanity only; no employment eligibility decision is made here.
  if (!/^\d{1,3}$/.test(rawAge) || age < 1 || age > 120) fieldErrors.age = "יש למלא גיל תקין במספר שלם.";
  if (formData.getAll("experience").length !== 1 || !["yes", "no"].includes(experience)) fieldErrors.experience = "יש לבחור אם יש ניסיון קודם או אין ניסיון.";
  if (Object.keys(fieldErrors).length) return { ok: false as const, fieldErrors };
  return { ok: true as const, value: { fullName, phone, residenceArea, age, hasExperience: experience === "yes" } };
}
