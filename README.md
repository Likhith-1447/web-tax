Tax Calculator Dashboard:


This project is a Tax Calculator Dashboard built with React, TypeScript, and Firebase. It allows users to calculate their taxable income and tax payable based on their financial inputs. Additionally, it provides tax-saving suggestions to help users optimize their tax planning.

Features

* Tax Calculation:

1) Users can input their financial details (e.g., annual income, investments under Sections 80C and 80D, HRA, LTA, and other income).

2)The system calculates the taxable income and tax payable using a predefined tax calculation logic.

* Tax-Saving Suggestions:

1)Based on the calculated taxable income and tax payable, the system provides actionable suggestions to help users reduce their tax liability.

2)Suggestions include maximizing deductions under Sections 80C, 80D, HRA, and exploring tax-saving instruments like NPS.

* Previous Calculations:

  Users can view their previous tax calculations, which are stored in Firebase Firestore.

*Responsive UI:

The dashboard is designed with a modern and responsive UI using Tailwind CSS.

How It Works
1. Tax Calculation Process
Input Fields:

Users enter their financial details in the form, including:

Annual Income

Investments under Section 80C (e.g., ELSS, PPF)

Investments under Section 80D (e.g., health insurance premiums)

HRA (House Rent Allowance)

LTA (Leave Travel Allowance)

Other Income

Tax Calculation Logic:

The calculateTax function computes the taxable income and tax payable based on the inputs.

The formula used is:

Taxable Income = Annual Income - (Investments under 80C + Investments under 80D + HRA + LTA + Other Deductions)
Tax Payable = Apply tax slabs on Taxable Income


How to Use
Login:

Users must log in to access the dashboard.

Enter Financial Details:

Fill in the form with your financial details.

Calculate Tax:

Click the "Calculate Tax" button to see your taxable income and tax payable.

View Suggestions:

Review the tax-saving suggestions provided by the system.

View Previous Calculations:

Check the "Previous Calculations" table to see your past tax calculations.


Technologies Used:
Frontend:

React

TypeScript

Tailwind CSS

Lucide React (for icons)

Backend:

Firebase Firestore (for data storage)

Firebase Authentication (for user management)
