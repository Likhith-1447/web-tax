export interface TaxDetails {
  id?: string;
  userId: string;
  annualIncome: number;
  investments80C: number;
  investments80D: number;
  hra: number;
  lta: number;
  otherIncome: number;
  taxableIncome: number;
  taxPayable: number;
  timestamp: Date;
}

export interface User {
  uid: string;
  email: string | null;
}