export interface SOPIssue {
  id: string;
  storeId: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  status: string;
  category: 'sop_error' | 'exception' | 'risk' | 'improvement';
  date: string;
  actor: string;
  description?: string;
  process?: string;
  occurrence?: number;
  assignee?: string;
}
