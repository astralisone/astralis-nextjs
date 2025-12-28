import { z } from 'zod';

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'email' | 'select' | 'checkbox';

export interface FormField {
    name: string;
    label: string;
    type: FieldType;
    required?: boolean;
    placeholder?: string;
    options?: string[]; // For select inputs
    description?: string;
}

export const TASK_INPUT_DEFINITIONS: Record<string, FormField[]> = {
    BOOKING_REQUEST_V1: [
        { name: 'clientName', label: 'Client Name', type: 'text', required: true, placeholder: 'e.g. Acme Corp' },
        { name: 'contactEmail', label: 'Contact Email', type: 'email', required: true },
        { name: 'preferredDate', label: 'Preferred Date', type: 'date', required: true },
        { name: 'duration', label: 'Duration (minutes)', type: 'number', required: false, placeholder: 'e.g. 60' },
    ],
    SUPPORT_REQUEST_V1: [
        { name: 'issueCategory', label: 'Issue Category', type: 'select', required: true, options: ['Bug', 'Feature Request', 'Account Access', 'Billing', 'Other'] },
        { name: 'severity', label: 'Severity', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Critical'] },
        { name: 'stepsToReproduce', label: 'Steps to Reproduce', type: 'textarea', required: true },
    ],
    BILLING_QUESTION_V1: [
        { name: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true },
        { name: 'clientAccount', label: 'Client Account ID', type: 'text', required: false },
        { name: 'questionType', label: 'Question Type', type: 'select', required: true, options: ['Dispute', 'Payment Method', 'Refund Request', 'Clarification'] },
    ],
    DOCUMENT_REVIEW_V1: [
        { name: 'documentLink', label: 'Document Link', type: 'text', required: true, placeholder: 'https://...' },
        { name: 'reviewDeadline', label: 'Review Deadline', type: 'date', required: true },
        { name: 'reviewFocus', label: 'Key Areas to Focus On', type: 'textarea', required: false },
    ],
    REQUEST_MORE_INFO_V1: [
        { name: 'clientName', label: 'Client Name', type: 'text', required: true },
        { name: 'missingInformation', label: 'What info is needed?', type: 'textarea', required: true },
        { name: 'context', label: 'Context (Project/Deal)', type: 'text', required: false },
    ],
    INTERNAL_FOLLOWUP_V1: [
        { name: 'targetPerson', label: 'Target Person/Team', type: 'text', required: true },
        { name: 'actionItem', label: 'Action Item', type: 'textarea', required: true },
        { name: 'dueDate', label: 'Due Date', type: 'date', required: false },
    ],
    GENERIC_TASK_V1: [
        { name: 'taskDetails', label: 'Task Details', type: 'textarea', required: true },
        { name: 'assigneeHint', label: 'Suggested Assignee', type: 'text', required: false },
    ],
    CLIENT_ONBOARDING_V1: [
        { name: 'clientCompanyName', label: 'Client Company Name', type: 'text', required: true },
        { name: 'contractValue', label: 'Contract Value', type: 'number', required: false },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'primaryContact', label: 'Primary Contact Name', type: 'text', required: true },
    ],
    NEW_HIRE_ONBOARDING_V1: [
        { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { name: 'role', label: 'Role/Position', type: 'text', required: true },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'department', label: 'Department', type: 'select', required: true, options: ['Engineering', 'Sales', 'Marketing', 'Product', 'HR', 'Finance', 'Operations'] },
    ],
    STAFF_REVIEW_V1: [
        { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { name: 'reviewPeriod', label: 'Review Period', type: 'text', required: true, placeholder: 'e.g. Q4 2024' },
        { name: 'reviewType', label: 'Review Type', type: 'select', required: true, options: ['Annual', 'Mid-Year', 'Probation', 'Performance Improvement'] },
    ],
    PAYROLL_MANAGEMENT_V1: [
        { name: 'payPeriodEnd', label: 'Pay Period End Date', type: 'date', required: true },
        { name: 'payrollGroup', label: 'Payroll Group', type: 'select', required: true, options: ['US Full-Time', 'Contractors', 'International'] },
        { name: 'specialAdjustments', label: 'Special Adjustments Needed?', type: 'checkbox', required: false },
    ],
    ORDER_FULFILLMENT_V1: [
        { name: 'orderId', label: 'Order ID', type: 'text', required: true },
        { name: 'customerName', label: 'Customer Name', type: 'text', required: true },
        { name: 'shippingPriority', label: 'Shipping Priority', type: 'select', required: true, options: ['Standard', 'Express', 'Overnight'] },
    ],
    ORDER_PLACEMENT_V1: [
        { name: 'productName', label: 'Product Name', type: 'text', required: true },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
        { name: 'customerEmail', label: 'Customer Email', type: 'email', required: true },
        { name: 'deliveryAddress', label: 'Delivery Address', type: 'textarea', required: false },
    ],
    INVENTORY_MANAGEMENT_V1: [
        { name: 'sku', label: 'Stock Keeping Unit (SKU)', type: 'text', required: true },
        { name: 'location', label: 'Warehouse Location', type: 'text', required: false },
        { name: 'adjustmentType', label: 'Type', type: 'select', required: true, options: ['Restock', 'Audit', 'Damage', 'Return'] },
        { name: 'count', label: 'Count', type: 'number', required: true },
    ],
    DOC_MANAGEMENT_V1: [
        { name: 'documentTitle', label: 'Document Title', type: 'text', required: true },
        { name: 'category', label: 'Category', type: 'select', required: true, options: ['Contract', 'Policy', 'Report', 'Invoice'] },
        { name: 'confidentiality', label: 'Confidentiality Level', type: 'select', required: true, options: ['Public', 'Internal', 'Confidential', 'Restricted'] },
    ],
    FRONT_OFFICE_MANAGER_V1: [
        { name: 'visitorName', label: 'Visitor/Caller Name', type: 'text', required: true },
        { name: 'purpose', label: 'Purpose of Visit/Call', type: 'text', required: true },
        { name: 'hostEmployee', label: 'Host Employee', type: 'text', required: true },
    ],
    TIME_KEEPER_V1: [
        { name: 'employeeId', label: 'Employee ID', type: 'text', required: true },
        { name: 'weekEnding', label: 'Week Ending', type: 'date', required: true },
        { name: 'totalHours', label: 'Total Hours', type: 'number', required: true },
        { name: 'billableHours', label: 'Billable Hours', type: 'number', required: false },
    ],
    NOTE_TAKER_V1: [
        { name: 'meetingTitle', label: 'Meeting Title', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'attendees', label: 'Attendees (comma separated)', type: 'text', required: false },
        { name: 'keyDecisions', label: 'Key Decisions', type: 'textarea', required: false },
    ],
};
