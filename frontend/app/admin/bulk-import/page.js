'use client';
import { useState } from 'react';
import RoleLayout from '@/components/layout/RoleLayout';
import BulkImportForm from '@/components/admin/BulkImportCSV';

export default function BulkImportPage() {
  return (
    <RoleLayout allowedRoles={['admin']}>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Bulk Import Students</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            <strong>Instructions:</strong> Upload a CSV file with student data. A temporary password will be set to the student's roll number. All imported students will be pre-approved.
          </div>
          <BulkImportForm />
        </div>
      </div>
    </RoleLayout>
  );
}
