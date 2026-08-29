import { AGE_RANGES } from "@/constants/options";

export type AgeRange = (typeof AGE_RANGES)[number];

/**
 * "YYYY-MM-DD" から満年齢を出す。
 * ミリ秒差で割るとうるう年とタイムゾーンで1日ズレるので、年月日で比較する。
 */
export function calcAge(birthDate: string, now = new Date()): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  if (!year || !month || !day) return NaN;
  const nowMonth = now.getMonth() + 1;
  const beforeBirthday =
    nowMonth < month || (nowMonth === month && now.getDate() < day);
  return now.getFullYear() - year - (beforeBirthday ? 1 : 0);
}

/**
 * 生年月日をAGE_RANGESの5区分へ落とす。
 * AIに渡すのは粗い手がかりで足りるので、20歳未満も40代超も両端に寄せる。
 * ここが例外を投げると起動が壊れるため、壊れた値も既定値で吸収する総関数にしている。
 */
export function toAgeRange(birthDate: string): AgeRange {
  const age = calcAge(birthDate);
  if (!Number.isFinite(age)) return "20代前半";
  if (age < 25) return "20代前半";
  if (age < 30) return "20代後半";
  if (age < 35) return "30代前半";
  if (age < 40) return "30代後半";
  return "40代以上";
}

/** 表示用: "1996-04-25" → "1996/04/25" */
export function formatBirthDate(birthDate: string): string {
  return birthDate.split("-").join("/");
}

/** 保存用: ISOのdate-only文字列にする（Dateだと保存/復元で型が嘘になる） */
export function toBirthDateString(
  year: number,
  month: number,
  day: number
): string {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}
