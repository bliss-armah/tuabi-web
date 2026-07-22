import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "@/shared/utils/api";

// AI Insights Types
export interface AIInsights {
  totalDebtAnalysis: {
    totalAmount: number;
    averageDebt: number;
    highRiskDebtors: number;
    debtGrowthRate: number;
  };
  paymentPatterns: {
    onTimePayments: number;
    latePayments: number;
    averagePaymentDelay: number;
    seasonalTrends: Array<{
      month: string;
      paymentRate: number;
    }>;
  };
  riskAssessment: {
    highRiskDebtors: Array<{
      debtorId: number;
      debtorName: string;
      riskScore: number;
      reasons: string[];
    }>;
    recommendations: string[];
  };
  forecasting: {
    expectedCollections: number;
    potentialLosses: number;
    optimalReminderTiming: Array<{
      debtorId: number;
      suggestedDate: string;
      confidence: number;
    }>;
  };
}

export interface AIInsightsResponse {
  success: boolean;
  message: string;
  data: AIInsights;
}

export interface PaymentPrediction {
  debtorId: number;
  debtorName: string;
  currentAmount: number;
  paymentProbability: number;
  suggestedReminderDate: string;
  riskFactors: string[];
  confidence: number;
}

export interface PaymentPredictionsResponse {
  success: boolean;
  message: string;
  data: {
    predictions: PaymentPrediction[];
    overallAccuracy: number;
    lastUpdated: string;
  };
}

export interface DebtorAnalysis {
  debtorId: number;
  riskScore: number;
  paymentHistory: {
    totalPayments: number;
    averagePaymentTime: number;
    missedPayments: number;
  };
  recommendations: string[];
  suggestedActions: Array<{
    action: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    expectedOutcome: string;
  }>;
}

export interface DebtorAnalysisResponse {
  success: boolean;
  message: string;
  data: DebtorAnalysis;
}

export interface AIReportRequest {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  includeForecasting?: boolean;
  includeRiskAnalysis?: boolean;
  includeRecommendations?: boolean;
}

export interface AIReport {
  id: string;
  reportType: "COMPREHENSIVE" | "RISK_ANALYSIS" | "PAYMENT_FORECAST";
  generatedAt: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalDebtors: number;
    totalAmount: number;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    keyInsights: string[];
  };
  downloadUrl?: string;
}

export interface AIReportResponse {
  success: boolean;
  message: string;
  data: AIReport;
}

export interface AskQuestionRequest {
  question: string;
}

export interface AskQuestionResponse {
  success: boolean;
  message?: string;
  data: {
    intent: string;
    answer: string;
    tokens_used?: number;
    cached?: boolean;
  };
}

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: ["AIInsights", "PaymentPredictions", "DebtorAnalysis", "AIReport"],
  endpoints: (builder) => ({
    // Get comprehensive AI insights
    getAIInsights: builder.query<AIInsightsResponse, void>({
      query: () => "/ai/insights",
      providesTags: ["AIInsights"],
    }),

    // Get payment predictions for all debtors
    getPaymentPredictions: builder.query<PaymentPredictionsResponse, void>({
      query: () => "/ai/payment-predictions",
      providesTags: ["PaymentPredictions"],
    }),

    // Get AI analysis for a specific debtor
    getDebtorAnalysis: builder.query<DebtorAnalysisResponse, number>({
      query: (debtorId) => `/ai/debtor-analysis/${debtorId}`,
      providesTags: (_result, _error, debtorId) => [
        { type: "DebtorAnalysis", id: debtorId },
      ],
    }),

    // Generate AI report
    generateAIReport: builder.mutation<AIReportResponse, AIReportRequest>({
      query: (data) => ({
        url: "/ai/generate-report",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AIReport"],
    }),

    // Get AI report by ID
    getAIReport: builder.query<AIReportResponse, string>({
      query: (reportId) => `/ai/reports/${reportId}`,
      providesTags: (_result, _error, reportId) => [
        { type: "AIReport", id: reportId },
      ],
    }),

    // Refresh AI insights (trigger re-calculation)
    refreshAIInsights: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/ai/refresh-insights",
        method: "POST",
      }),
      invalidatesTags: ["AIInsights", "PaymentPredictions"],
    }),

    askQuestion: builder.mutation<AskQuestionResponse, AskQuestionRequest>({
      query: (data) => ({
        url: "/ai/ask",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAIInsightsQuery,
  useGetPaymentPredictionsQuery,
  useGetDebtorAnalysisQuery,
  useGenerateAIReportMutation,
  useGetAIReportQuery,
  useRefreshAIInsightsMutation,
  useAskQuestionMutation,
} = aiApi;
