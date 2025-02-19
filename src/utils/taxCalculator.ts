export const calculateTax = (
  annualIncome: number,
  investments80C: number,
  investments80D: number,
  hra: number,
  lta: number,
  otherIncome: number
) => {
  // Calculate total deductions
  const totalDeductions = Math.min(investments80C, 150000) + 
                         Math.min(investments80D, 25000) +
                         hra + 
                         lta;

  // Calculate taxable income
  const totalIncome = annualIncome + otherIncome;
  const taxableIncome = Math.max(0, totalIncome - totalDeductions);

  // Calculate tax as per new regime (FY 2024-25)
  let tax = 0;
  
  if (taxableIncome <= 300000) {
    tax = 0;
  } else if (taxableIncome <= 600000) {
    tax = (taxableIncome - 300000) * 0.05;
  } else if (taxableIncome <= 900000) {
    tax = 15000 + (taxableIncome - 600000) * 0.10;
  } else if (taxableIncome <= 1200000) {
    tax = 45000 + (taxableIncome - 900000) * 0.15;
  } else if (taxableIncome <= 1500000) {
    tax = 90000 + (taxableIncome - 1200000) * 0.20;
  } else {
    tax = 150000 + (taxableIncome - 1500000) * 0.30;
  }

  // Add 4% cess
  tax = tax + (tax * 0.04);

  return {
    taxableIncome,
    taxPayable: Math.round(tax)
  };
};