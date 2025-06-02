// Import all jobs to register them with the new queue system
import "@/jobs";

// Jobs are now auto-registered when imported
// No need for manual job manager startup
export function startJobs() {
  // All jobs are automatically registered when the module is imported
  // The ServerlessQueue will process them via cron jobs
  console.log("Jobs are auto-registered and ready for processing");
}
