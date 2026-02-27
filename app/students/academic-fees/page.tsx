"use client";

import React from "react";
import { Wallet, Receipt, CreditCard } from "lucide-react";
import StudentLayout from "../components/StudentLayout";

export default function AcademicFeesPage() {
  const sampleFees = [
    {
      session: "2024/2025",
      term: "First Semester",
      amount: "₦150,000",
      status: "Pending",
      dueDate: "Oct 15, 2024",
    },
    {
      session: "2023/2024",
      term: "Second Semester",
      amount: "₦145,000",
      status: "Paid",
      dueDate: "Apr 10, 2024",
    },
  ];

  return (
    <StudentLayout>
      <div className="p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Academic Fees
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View your fee breakdown, payment history and generate receipts.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl px-4 py-3">
            <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Current Balance
              </p>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-100">
                ₦0.00
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Total Paid
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                ₦0.00
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
              <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Pending Payments
              </p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                1
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30">
              <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Payment Note
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              This is a demo view. Your real invoices and payment links will
              appear here once the student payment system is connected.
            </p>
          </div>
        </div>

        {/* Fees Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Fee Summary
            </h2>
            <button className="inline-flex items-center px-3 py-2 rounded-md text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Session
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Term
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Due Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {sampleFees.map((fee) => (
                  <tr
                    key={`${fee.session}-${fee.term}`}
                    className="border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                      {fee.session}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">
                      {fee.term}
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                      {fee.amount}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          fee.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-200">
                      {fee.dueDate}
                    </td>
                    <td className="py-3 px-4">
                      {fee.status === "Pending" ? (
                        <button className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                          Pay Now
                        </button>
                      ) : (
                        <button className="text-xs font-medium text-gray-600 dark:text-gray-300 hover:underline">
                          Download Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}


