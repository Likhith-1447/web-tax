import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { calculateTax } from '../utils/taxCalculator';
import { toast } from 'react-hot-toast';
import { LogOut, Calculator, Loader2, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { TaxDetails } from '../types';

const Dashboard = () => {
  const [formData, setFormData] = useState({
    annualIncome: '',
    investments80C: '',
    investments80D: '',
    hra: '',
    lta: '',
    otherIncome: ''
  });
  const [previousCalculations, setPreviousCalculations] = useState<TaxDetails[]>([]);
  const [calculationResult, setCalculationResult] = useState<{ taxableIncome: number; taxPayable: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadPreviousCalculations();
      } else {
        setPreviousCalculations([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadPreviousCalculations = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    try {
      const taxCalcRef = collection(db, 'taxCalculations');
      const q = query(taxCalcRef, where('userId', '==', auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const calculations: TaxDetails[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        calculations.push({
          id: doc.id,
          userId: data.userId,
          annualIncome: Number(data.annualIncome),
          investments80C: Number(data.investments80C),
          investments80D: Number(data.investments80D),
          hra: Number(data.hra),
          lta: Number(data.lta),
          otherIncome: Number(data.otherIncome),
          taxableIncome: Number(data.taxableIncome),
          taxPayable: Number(data.taxPayable),
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date(data.timestamp)
        });
      });

      setPreviousCalculations(calculations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    } catch (error) {
      console.error('Error loading calculations:', error);
      toast.error('Failed to load previous calculations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const getTaxSuggestions = (taxableIncome: number, taxPayable: number) => {
    const suggestions: string[] = [];

    if (taxableIncome > 1000000) {
      suggestions.push('Consider investing more in Section 80C instruments (e.g., ELSS, PPF, NPS) to reduce taxable income.');
    }

    if (taxPayable > 50000) {
      suggestions.push('Maximize your HRA exemption by providing proper rent receipts and rent payment proofs.');
    }

    if (formData.investments80C < 150000) {
      suggestions.push('You have not fully utilized the ₹1.5 lakh limit under Section 80C. Consider investing in tax-saving instruments.');
    }

    if (formData.investments80D < 50000) {
      suggestions.push('Increase your health insurance premium under Section 80D to claim additional deductions.');
    }

    if (formData.hra === '0') {
      suggestions.push('If you are paying rent, ensure you claim HRA exemption to reduce your taxable income.');
    }

    if (taxableIncome > 500000 && taxPayable > 100000) {
      suggestions.push('Explore tax-saving options like NPS (National Pension System) for additional deductions under Section 80CCD(1B).');
    }

    return suggestions.length > 0 ? suggestions : ['No specific suggestions available. Your tax planning seems optimal.'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast.error('Please login to calculate tax');
      return;
    }

    setIsCalculating(true);

    const values = {
      annualIncome: parseFloat(formData.annualIncome) || 0,
      investments80C: parseFloat(formData.investments80C) || 0,
      investments80D: parseFloat(formData.investments80D) || 0,
      hra: parseFloat(formData.hra) || 0,
      lta: parseFloat(formData.lta) || 0,
      otherIncome: parseFloat(formData.otherIncome) || 0
    };

    const result = calculateTax(values.annualIncome, values.investments80C, values.investments80D, values.hra, values.lta, values.otherIncome);
    setCalculationResult(result);

    // Generate tax-saving suggestions
    const suggestions = getTaxSuggestions(result.taxableIncome, result.taxPayable);
    setSuggestions(suggestions);

    try {
      const taxCalcRef = collection(db, 'taxCalculations');
      await addDoc(taxCalcRef, {
        userId: auth.currentUser.uid,
        ...values,
        taxableIncome: result.taxableIncome,
        taxPayable: result.taxPayable,
        timestamp: Timestamp.now()
      });

      toast.success('Tax calculation saved successfully!');
      await loadPreviousCalculations();
    } catch (error) {
      console.error('Error saving calculation:', error);
      toast.error('Failed to save calculation. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Tax Calculator</h1>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 capitalize mb-2">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="number"
                  name={key}
                  value={formData[key as keyof typeof formData]}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')}`}
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
              >
                {isCalculating ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Calculator className="w-5 h-5 mr-2" />
                )}
                {isCalculating ? 'Calculating...' : 'Calculate Tax'}
              </button>
            </div>
          </form>
        </div>

        {calculationResult && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Calculation Result</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Taxable Income</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(calculationResult.taxableIncome)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tax Payable</p>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(calculationResult.taxPayable)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
                Tax-Saving Suggestions
              </h2>
              <ul className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <p className="text-gray-700">{suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {previousCalculations.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Previous Calculations</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Annual Income</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Taxable Income</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-600">Tax Payable</th>
                  </tr>
                </thead>
                <tbody>
                  {previousCalculations.map((calc) => (
                    <tr key={calc.id} className="border-b border-gray-200 hover:bg-gray-50 transition-all">
                      <td className="p-3 text-sm text-gray-700">{calc.timestamp.toLocaleDateString()}</td>
                      <td className="p-3 text-sm text-gray-700">{formatCurrency(calc.annualIncome)}</td>
                      <td className="p-3 text-sm text-gray-700">{formatCurrency(calc.taxableIncome)}</td>
                      <td className="p-3 text-sm text-gray-700">{formatCurrency(calc.taxPayable)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;