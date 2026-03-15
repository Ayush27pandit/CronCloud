import { useEffect, useState } from 'react';
import { Play, Pause, Trash2, Clock, CheckCircle2, XCircle, Activity, Plus } from 'lucide-react';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { CreateJobModal } from '../components/CreateJobModal';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

// Types
interface Job {
    id: string;
    name: string;
    url: string;
    cronExpression: string;
    status: 'active' | 'paused';
    lastExecution?: string;
    method: string;
}

interface Execution {
    id: string;
    jobId: string;
    jobName: string;
    status: 'success' | 'failed';
    statusCode: number;
    duration: number;
    executedAt: string;
}

export default function Dashboard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [history, setHistory] = useState<Execution[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [jobsRes, historyRes] = await Promise.all([
                api.get('/jobs'),
                api.get('/history')
            ]);
            setJobs(jobsRes.data);
            setHistory(historyRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Set up SSE for real-time updates
        const eventSource = new EventSource('http://localhost:5000/api/events');
        
        eventSource.addEventListener('connected', () => {
            console.log('SSE connected');
        });

        eventSource.addEventListener('job:executed', (event) => {
            const data = JSON.parse(event.data);
            console.log('Job executed:', data);
            // Refresh history to show latest execution
            api.get('/history').then(res => setHistory(res.data));
        });

        eventSource.addEventListener('job:circuit-open', (event) => {
            const data = JSON.parse(event.data);
            console.log('Circuit breaker opened:', data);
            alert(`Circuit breaker triggered for job: ${data.name}. Job has been paused.`);
            fetchData();
        });

        eventSource.onerror = () => {
            console.log('SSE connection error, falling back to polling');
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    const toggleJob = async (job: Job) => {
        try {
            // Optimistic update
            const newStatus = job.status === 'active' ? 'paused' : 'active';
            setJobs(jobs.map(j => j.id === job.id ? { ...j, status: newStatus } : j));

            await api.patch(`/jobs/${job.id}/toggle`);
        } catch (error) {
            console.error('Failed to toggle job', error);
            fetchData(); // Revert
        }
    };

    const deleteJob = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            setJobs(jobs.filter(j => j.id !== id));
            await api.delete(`/jobs/${id}`);
        } catch (error) {
            console.error('Failed to delete job', error);
            fetchData();
        }
    };

    // Stats
    const activeJobs = jobs.filter(j => j.status === 'active').length;
    const totalExecutions = history.length;
    const successRate = totalExecutions > 0
        ? Math.round((history.filter(h => h.status === 'success').length / totalExecutions) * 100)
        : 100;

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                Loading dashboard...
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">

            {isModalOpen && (
                <CreateJobModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchData}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your cron jobs and monitor performance.</p>
                </div>
                <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" /> New Job
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard title="Active Jobs" value={activeJobs} icon={Activity} description={`${jobs.length} total jobs configured`} />
                <StatCard title="Total Executions" value={totalExecutions} icon={Clock} description="In the last 24 hours" />
                <StatCard title="Success Rate" value={`${successRate}%`} icon={CheckCircle2} description="Global execution reliability" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Job List */}
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="font-semibold tracking-tight text-xl">Your Jobs</h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="space-y-4">
                            {jobs.map((job) => (
                                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg bg-background/50 hover:bg-background transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("flex h-2 w-2 rounded-full", job.status === 'active' ? "bg-green-500" : "bg-yellow-500")} />
                                            <h4 className="font-medium text-white">{job.name}</h4>
                                            <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">{job.method}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-mono">{job.cronExpression}</p>
                                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">{job.url}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleJob(job)}
                                            className="p-2 rounded-full hover:bg-secondary transition-colors"
                                        >
                                            {job.status === 'active' ? <Pause className="h-4 w-4 text-yellow-500" /> : <Play className="h-4 w-4 text-green-500" />}
                                        </button>
                                        <button
                                            onClick={() => deleteJob(job.id)}
                                            className="p-2 rounded-full hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {jobs.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    No jobs created yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="font-semibold tracking-tight text-xl">Recent Activity</h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {history.map((exec) => (
                                <div key={exec.id} className="flex items-start gap-4 text-sm pb-4 border-b last:border-0 border-border/50">
                                    {exec.status === 'success' ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                    )}
                                    <div className="space-y-1 flex-1">
                                        <div className="flex justify-between">
                                            <p className="font-medium text-white">{exec.jobName || 'Unknown Job'}</p>
                                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(exec.executedAt), { addSuffix: true })}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Status: {exec.statusCode}</span>
                                            <span>{exec.duration}ms</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {history.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground">
                                    No execution history yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
