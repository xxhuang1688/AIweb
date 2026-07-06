import type { ProposalJson } from "@/types/proposal";

export type ManualPaymentMethod = "bank" | "paypay";

export type ManualPaymentOrderRequest = {
  proposal: ProposalJson;
  customerEmail: string;
  payerName: string;
  paymentMethod: ManualPaymentMethod;
  note?: string;
};

export type ManualPaymentOrderResponse = {
  status: "received" | "invalid_request";
  errors: string[];
  order: {
    orderId: string;
    amountJpy: number;
    companyName: string;
    customerEmail: string;
    payerName: string;
    paymentMethod: ManualPaymentMethod;
    createdAt: string;
    demoPrepared: boolean;
    fileCount: number;
    downloadUrl: string;
    statusUrl: string;
  } | null;
  payment: {
    receiverEmail: string;
    ccEmail: string;
    bank: {
      bankName: string;
      bankCode: string;
      branchCode: string;
      accountNumber: string;
      accountHolder: string;
    };
    paypayNote: string;
  } | null;
  mailtoUrl: string | null;
};

export type ManualPaymentStoredOrder = {
  orderId: string;
  accessCode: string;
  customerToken: string;
  amountJpy: number;
  companyName: string;
  customerEmail: string;
  payerName: string;
  paymentMethod: ManualPaymentMethod;
  note: string;
  status: "pending_manual_confirmation" | "confirmed";
  createdAt: string;
  confirmedAt?: string;
  downloadUrl: string;
  statusUrl: string;
  files: Array<{
    fileName: string;
    label: string;
    contentType: string;
  }>;
};
