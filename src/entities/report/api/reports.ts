import { apiRequest } from "@/shared/api/client";
import type { Report, ReportListItem, ShareLink } from "../model/types";

const id = (v: string) => encodeURIComponent(v);

export const listMyReports = (signal?: AbortSignal) =>
  apiRequest<{ reports: ReportListItem[]; total: number }>(
    "/me/reports?limit=50",
    { signal },
  );

export const getMyReport = (reportId: string, signal?: AbortSignal) =>
  apiRequest<{ report: Report }>(`/me/reports/${id(reportId)}`, {
    signal,
  }).then((d) => d.report);

export const getOrderReport = (
  orderId: string,
  access?: string | null,
  signal?: AbortSignal,
) =>
  apiRequest<{ report: Report }>(`/orders/${id(orderId)}/report`, {
    orderAccess: access,
    signal,
  }).then((d) => d.report);

export const getPublicReportByToken = (token: string, signal?: AbortSignal) =>
  apiRequest<{ report: Report }>(`/public/r/${id(token)}`, { signal }).then(
    (d) => d.report,
  );

export const getPublicReportByCode = (code: string, signal?: AbortSignal) =>
  apiRequest<{ report: Report }>(`/public/code/${id(code)}`, { signal }).then(
    (d) => d.report,
  );

export const renewReport = (reportId: string) =>
  apiRequest<{
    order: { id: string };
    accessToken: string;
    checkoutUrl: string | null;
  }>(`/me/reports/${id(reportId)}/renew`, { method: "POST", body: {} });

export const listShareLinks = (reportId: string, signal?: AbortSignal) =>
  apiRequest<{ shareLinks: ShareLink[] }>(
    `/me/reports/${id(reportId)}/share-links`,
    { signal },
  ).then((d) => d.shareLinks);

export const createShareLink = (reportId: string, ttlHours: number) =>
  apiRequest<{ shareLink: ShareLink }>(
    `/me/reports/${id(reportId)}/share-links`,
    {
      method: "POST",
      body: { ttlHours },
    },
  ).then((d) => d.shareLink);

export const revokeShareLink = (linkId: string) =>
  apiRequest<{ shareLink: ShareLink }>(`/me/share-links/${id(linkId)}`, {
    method: "DELETE",
  }).then((d) => d.shareLink);
