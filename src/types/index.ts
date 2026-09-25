export type StopKind = "flight" | "hotel" | "place" | "photo" | "food";
export type Stop = {
  id: string;
  day: number;
  time: string;
  title: string;
  note: string;
  duration: string;
  kind: StopKind;
  /** v0.4: optional WGS84 coordinates; both present or both absent. */
  lat?: number;
  lng?: number;
};
export type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
};
export type PackingItem = { id: string; name: string; packed: boolean };
export type Trip = {
  coverUrl?: string;
  /** v0.4: ISO 3166-1 alpha-2 code and destination center, when picked from the list. */
  countryCode?: string;
  lat?: number;
  lng?: number;
  id: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  budget: number;
  emoji: string;
  gradient: string;
  favorite: boolean;
  stops: Stop[];
  expenses: Expense[];
  packing: PackingItem[];
  notes: string;
};
