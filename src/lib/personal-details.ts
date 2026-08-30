export type PersonalDetails = {
  school: string;
  graduationTiming: string;
  interests: string;
};

export const emptyPersonalDetails: PersonalDetails = {
  school: "",
  graduationTiming: "",
  interests: "",
};

export function normalizePersonalDetails(value: PersonalDetails): PersonalDetails {
  return {
    school: value.school.trim().slice(0, 160),
    graduationTiming: value.graduationTiming.trim().slice(0, 80),
    interests: value.interests.trim().slice(0, 600),
  };
}

export function hasPersonalDetails(value: PersonalDetails): boolean {
  return Boolean(value.school || value.graduationTiming || value.interests);
}
