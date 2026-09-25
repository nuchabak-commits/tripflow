export type StopKind='flight'|'hotel'|'place'|'photo'|'food';
export type Stop={id:string;day:number;time:string;title:string;note:string;duration:string;kind:StopKind};
export type Expense={id:string;category:string;description:string;amount:number};
export type PackingItem={id:string;name:string;packed:boolean};
export type Trip={id:string;city:string;country:string;startDate:string;endDate:string;budget:number;emoji:string;gradient:string;favorite:boolean;stops:Stop[];expenses:Expense[];packing:PackingItem[];notes:string};
