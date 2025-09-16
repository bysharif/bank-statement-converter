'use client'

import {
  Clock,
  Shield,
  FileText,
  Zap,
  Download,
  CheckCircle,
  Building,
  CreditCard,
  Users,
} from "lucide-react";
import { Check, X } from "lucide-react";
import React from "react";
import Link from "next/link";

type Feature = {
  icon: React.ReactNode;
  label: string;
  ours: true | false | "partial";
  xeroHubDoc: true | false | "partial";
  receiptBank: true | false | "partial";
};

const features: Feature[] = [
  {
    icon: <Clock className="text-gray-500" />,
    label: "Processing Speed",
    ours: true,
    xeroHubDoc: "partial",
    receiptBank: false,
  },
  {
    icon: <Shield className="text-gray-500" />,
    label: "Security & Privacy",
    ours: true,
    xeroHubDoc: true,
    receiptBank: true,
  },
  {
    icon: <FileText className="text-gray-500" />,
    label: "UK Bank Support",
    ours: true,
    xeroHubDoc: "partial",
    receiptBank: "partial",
  },
  {
    icon: <Zap className="text-gray-500" />,
    label: "AI-Powered Processing",
    ours: true,
    xeroHubDoc: false,
    receiptBank: false,
  },
  {
    icon: <Download className="text-gray-500" />,
    label: "Multiple Export Formats",
    ours: true,
    xeroHubDoc: "partial",
    receiptBank: "partial",
  },
  {
    icon: <CheckCircle className="text-gray-500" />,
    label: "99.6% Accuracy Rate",
    ours: true,
    xeroHubDoc: "partial",
    receiptBank: "partial",
  },
  {
    icon: <CreditCard className="text-gray-500" />,
    label: "No Credit Card Trial",
    ours: true,
    xeroHubDoc: false,
    receiptBank: false,
  },
  {
    icon: <Users className="text-gray-500" />,
    label: "HMRC Compliance",
    ours: true,
    xeroHubDoc: "partial",
    receiptBank: false,
  },
];

export function ComparisonTable() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Us?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compare us to our competitors and see why we're the better choice.
          </p>
        </div>

        <div className="mx-auto max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-uk-blue-600 hidden rounded-t-2xl text-left text-base font-semibold sm:flex">
            <div className="w-16 px-6 py-4"></div>
            <div className="flex-1 px-6 py-4 text-white">Feature</div>
            <div className="w-40 px-6 py-4 text-white font-bold">Our Service</div>
            <div className="w-40 px-6 py-4 text-white">Xero HubDoc</div>
            <div className="w-40 px-6 py-4 text-white">Receipt Bank</div>
          </div>

          {/* Feature Rows */}
          <div className="divide-y divide-gray-100">
            {features.map((feature, index) => (
              <div
                key={feature.label}
                className={`flex flex-col items-start text-left sm:flex-row sm:items-center ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <div className="flex w-full items-center justify-start px-6 pt-4 sm:w-16 sm:justify-center sm:py-4">
                  {feature.icon}
                  <span className="ml-3 text-base font-medium sm:hidden">
                    {feature.label}
                  </span>
                </div>
                <div className="w-full flex-1 px-6 pb-2 sm:py-4">
                  <div className="text-gray-900">{feature.label}</div>
                </div>
                <div className="flex w-full items-center justify-center px-6 pb-2 sm:w-40 sm:py-4">
                  {feature.ours === true ? (
                    <Check className="size-6 text-uk-green-600" />
                  ) : feature.ours === "partial" ? (
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">~</span>
                    </div>
                  ) : (
                    <X className="text-red-500 size-6" />
                  )}
                </div>
                <div className="flex w-full items-center justify-center px-6 pb-2 sm:w-40 sm:py-4">
                  {feature.xeroHubDoc === true ? (
                    <Check className="size-6 text-gray-600" />
                  ) : feature.xeroHubDoc === "partial" ? (
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">~</span>
                    </div>
                  ) : (
                    <X className="text-red-500 size-6" />
                  )}
                </div>
                <div className="flex w-full items-center justify-center px-6 pb-4 sm:w-40 sm:py-4">
                  {feature.receiptBank === true ? (
                    <Check className="size-6 text-gray-600" />
                  ) : feature.receiptBank === "partial" ? (
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">~</span>
                    </div>
                  ) : (
                    <X className="text-red-500 size-6" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Footer */}
          <div className="bg-white px-8 py-6 text-center border-t border-gray-100">
            <h3 className="text-gray-900 font-bold text-lg mb-2">Ready to experience the difference?</h3>
            <p className="text-gray-600 text-sm mb-4">Join 1200+ users who switched to our superior service</p>
            <Link href="/signup">
              <button className="bg-uk-blue-600 hover:bg-uk-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                Start Free Trial →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}