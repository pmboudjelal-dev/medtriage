'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { restorePatient, permanentDeletePatient } from '@/actions/patient.actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, RotateCcw, User } from 'lucide-react';
import { toast } from 'sonner';

interface DeletedPatient {
  id: string;
  name: string;
  dob: string;
  phone: string;
  deleted_at: string;
}

export default function RecycleBinPage() {
  const supabase = createClient();
  const [patients, setPatients] = useState<DeletedPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchDeleted = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, name, dob, phone, deleted_at')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    setPatients(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleRestore = async (patientId: string) => {
    setLoadingId(patientId);
    const result = await restorePatient(patientId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Patient restored successfully!');
      fetchDeleted();
    }
    setLoadingId(null);
  };

  const handlePermanentDelete = async (patientId: string) => {
    if (!confirm('This will permanently delete the patient. Are you sure?')) return;
    setLoadingId(patientId);
    const result = await permanentDeletePatient(patientId);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Patient permanently deleted');
      fetchDeleted();
    }
    setLoadingId(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Recycle Bin
          </h1>
          <p className="text-sm text-slate-500">
            Deleted patients can be restored or permanently removed
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Trash2 className="w-12 h-12 text-slate-300" />
          <p className="text-slate-400 font-medium">Recycle bin is empty</p>
          <p className="text-slate-400 text-sm">
            Deleted patients will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map((patient) => (
            <Card
              key={patient.id}
              className="border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">

                  {/* Patient Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {patient.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        DOB: {patient.dob} · {patient.phone}
                      </p>
                      <p className="text-xs text-red-400 mt-0.5">
                        🗑️ Deleted: {formatDate(patient.deleted_at)}
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-green-300 text-green-600 hover:bg-green-50"
                      onClick={() => handleRestore(patient.id)}
                      disabled={loadingId === patient.id}
                    >
                      {loadingId === patient.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      Restore
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handlePermanentDelete(patient.id)}
                      disabled={loadingId === patient.id}
                    >
                      {loadingId === patient.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete Forever
                    </Button>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}