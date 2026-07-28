import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  XCircle, 
  ShieldAlert, 
  Info,
  Package
} from 'lucide-react';

export type StatusVariant = 
  | 'IN_STOCK' 
  | 'LOW_STOCK' 
  | 'OUT_OF_STOCK'
  | 'RESERVED'
  | 'SEVERE_ALERT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const normStatus = (status || '').toUpperCase();

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Info;
  let text = label || normStatus;

  switch (normStatus) {
    case 'IN_STOCK':
    case 'APPROVED':
    case 'VERIFIED':
    case 'ACTIVE':
    case 'TAKEN':
      bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = CheckCircle2;
      text = label || (normStatus === 'IN_STOCK' ? 'In Stock' : normStatus === 'APPROVED' ? 'Approved' : 'Active');
      break;

    case 'LOW_STOCK':
    case 'MODERATE':
    case 'SNOOZED':
      bgClass = 'bg-amber-50 text-amber-800 border-amber-200';
      Icon = AlertTriangle;
      text = label || (normStatus === 'LOW_STOCK' ? 'Low Stock' : 'Moderate');
      break;

    case 'OUT_OF_STOCK':
    case 'REJECTED':
    case 'SKIPPED':
    case 'EXPIRED':
    case 'CANCELLED':
      bgClass = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      text = label || (normStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : normStatus === 'REJECTED' ? 'Rejected' : 'Expired');
      break;

    case 'RESERVED':
      bgClass = 'bg-teal-50 text-teal-800 border-teal-200 font-mono';
      Icon = Clock;
      text = label || 'Reserved (60m)';
      break;

    case 'SEVERE':
    case 'SEVERE_ALERT':
      bgClass = 'bg-red-100 text-red-800 border-red-300 font-semibold animate-pulse';
      Icon = ShieldAlert;
      text = label || 'Severe DDI Alert';
      break;

    case 'PENDING':
    case 'PENDING_REVIEW':
      bgClass = 'bg-sky-50 text-sky-800 border-sky-200';
      Icon = Clock;
      text = label || 'Pending Review';
      break;
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${bgClass} ${px}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{text}</span>
    </span>
  );
};
