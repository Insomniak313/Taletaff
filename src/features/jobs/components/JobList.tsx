import { JobCard } from "@/features/jobs/components/JobCard";
import type { JobRecord } from "@/types/job";

interface JobListProps {
  jobs: JobRecord[];
}

export const JobList = ({ jobs }: JobListProps) => {
  if (!jobs.length) {
    return (
      <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Aucune offre ne correspond à vos filtres pour le moment.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};
