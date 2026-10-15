'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ExportableApplication = {
  applicationNumber: string | null;
  firstname: string;
  surname: string;
  email: string;
  phoneNumber: string;
  programType: string;
  programChoice: string;
  admissionSession: string;
  modeOfStudy: string;
  status: string;
  paymentReference: string;
  paymentMethod: string;
  createdAt: string;
};

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ExportApplicationsMenu({
  applications,
}: {
  applications: ExportableApplication[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (open && !target.closest('.export-applications-menu')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const exportExcel = () => {
    const rows = applications.map((application) => ({
      'Application Number': application.applicationNumber || '',
      Surname: application.surname,
      'First Name': application.firstname,
      Email: application.email,
      Phone: application.phoneNumber,
      'Program Type': application.programType,
      'Program Choice': application.programChoice,
      Session: application.admissionSession,
      'Mode of Study': application.modeOfStudy,
      Status: formatStatus(application.status),
      'Payment Reference': application.paymentReference || '',
      'Payment Method': application.paymentMethod || '',
      Submitted: formatDate(application.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 22 },
      { wch: 16 },
      { wch: 16 },
      { wch: 28 },
      { wch: 16 },
      { wch: 16 },
      { wch: 28 },
      { wch: 16 },
      { wch: 16 },
      { wch: 18 },
      { wch: 24 },
      { wch: 16 },
      { wch: 16 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');
    XLSX.writeFile(
      workbook,
      `ACE-SPED_Applications_${new Date().toISOString().split('T')[0]}.xlsx`
    );
    setOpen(false);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.setTextColor(22, 163, 74);
    doc.text('ACE-SPED Applications', 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23);
    doc.text(`Total: ${applications.length}`, 14, 29);

    autoTable(doc, {
      head: [[
        'Number',
        'Name',
        'Email',
        'Phone',
        'Program',
        'Session',
        'Status',
        'Submitted',
      ]],
      body: applications.map((application) => [
        application.applicationNumber || '',
        `${application.surname} ${application.firstname}`.trim(),
        application.email,
        application.phoneNumber,
        application.programChoice,
        application.admissionSession,
        formatStatus(application.status),
        formatDate(application.createdAt),
      ]),
      startY: 34,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`ACE-SPED_Applications_${new Date().toISOString().split('T')[0]}.pdf`);
    setOpen(false);
  };

  return (
    <div className="export-applications-menu relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
      >
        <Download className="h-4 w-4 mr-2" />
        Export applications
        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
          <button
            type="button"
            onClick={exportExcel}
            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
            Export Excel
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
          >
            <FileText className="h-4 w-4 mr-2 text-red-600" />
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}
