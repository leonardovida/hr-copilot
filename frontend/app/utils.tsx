import { format } from "date-fns";

export function convertDateFormat(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getCurrentDate(dateFormat: string = "yyyy-MM-dd"): string {
  const currentDate = new Date();
  const formattedDate = format(currentDate, dateFormat);
  return formattedDate;
}

export function validateStringLength(
  string: string | null,
  minLength: number = 3,
  maxLength: number = 255,
): boolean {
  if (string == null) {
    return false;
  }
  return string.length >= minLength && string.length <= maxLength;
}

export function getScoreColor(score: number): string {
  if (!score || score < 0.4) {
    return "bg-zinc-500";
  } else if (score < 0.8) {
    return "bg-amber-500";
  } else {
    return "bg-green-500";
  }
}
