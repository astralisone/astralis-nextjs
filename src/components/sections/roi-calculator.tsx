"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

/**
 * ROI Calculator Component
 * Interactive calculator showing potential savings from automation
 */
export function ROICalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(10);
  const [hourlyWage, setHourlyWage] = useState(25);

  const weeklySavings = hoursPerWeek * hourlyWage;
  const monthlySavings = Math.round(weeklySavings * 4.33);
  const annualSavings = Math.round(weeklySavings * 52);

  return (
    <Card className="bg-white border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="text-2xl font-bold text-astralis-navy flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-astralis-blue">
            <line x1="12" x2="12" y1="2" y2="22"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
          ROI Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Time Spent Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-slate-700">
              Avg Time Spent on Repetitive Tasks / Week
            </Label>
            <span className="text-lg font-bold text-astralis-blue">{hoursPerWeek}h</span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-astralis-blue"
            style={{
              background: `linear-gradient(to right, #2B6CB0 0%, #2B6CB0 ${((hoursPerWeek - 5) / 35) * 100}%, #e2e8f0 ${((hoursPerWeek - 5) / 35) * 100}%, #e2e8f0 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>5h</span>
            <span>40h</span>
          </div>
        </div>

        {/* Hourly Wage Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-slate-700">
              Avg Hourly Wage
            </Label>
            <span className="text-lg font-bold text-astralis-blue">${hourlyWage}</span>
          </div>
          <input
            type="range"
            min="15"
            max="100"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-astralis-blue"
            style={{
              background: `linear-gradient(to right, #2B6CB0 0%, #2B6CB0 ${((hourlyWage - 15) / 85) * 100}%, #e2e8f0 ${((hourlyWage - 15) / 85) * 100}%, #e2e8f0 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>$15</span>
            <span>$100</span>
          </div>
        </div>

        {/* Savings Display */}
        <div className="bg-gradient-to-br from-astralis-blue via-blue-600 to-astralis-blue rounded-xl p-6 text-white shadow-lg">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-blue-100">Monthly Savings</p>
            <p className="text-5xl font-bold tracking-tight">
              ${monthlySavings.toLocaleString()}
            </p>
            <div className="pt-4 border-t border-blue-400/30 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-blue-100">Annual Savings</span>
                <span className="font-bold">${annualSavings.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="space-y-2">
          <div className="flex justify-between items-end h-40 gap-2">
            <div className="flex-1 flex flex-col items-center justify-end">
              <div
                className="w-full bg-gradient-to-t from-astralis-blue to-blue-400 rounded-t-lg transition-all duration-500 shadow-lg"
                style={{ height: `${(monthlySavings / annualSavings) * 100 * 3}%` }}
              />
              <span className="text-xs text-slate-600 mt-2 font-medium">10</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end">
              <div
                className="w-full bg-gradient-to-t from-astralis-blue to-blue-400 rounded-t-lg transition-all duration-500 shadow-lg"
                style={{ height: `${(monthlySavings / annualSavings) * 100 * 6}%` }}
              />
              <span className="text-xs text-slate-600 mt-2 font-medium">25</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end">
              <div
                className="w-full bg-gradient-to-t from-astralis-blue to-blue-400 rounded-t-lg transition-all duration-500 shadow-lg"
                style={{ height: `${(monthlySavings / annualSavings) * 100 * 10}%` }}
              />
              <span className="text-xs text-slate-600 mt-2 font-medium">50</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-end">
              <div
                className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-500 shadow-lg"
                style={{ height: '100%' }}
              />
              <span className="text-xs text-slate-600 mt-2 font-medium">360</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-center text-slate-500 italic">
          *Based on 80% reduction in manual work through automation
        </p>
      </CardContent>
    </Card>
  );
}

export type { };
