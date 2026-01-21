import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

interface CreateJobModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateJobModal({ onClose, onSuccess }: CreateJobModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        method: 'GET',
        cronExpression: '* * * * *',
        body: '{}',
        headers: '{}'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate JSON
            let bodyParsed, headersParsed;
            try {
                bodyParsed = JSON.parse(formData.body);
            } catch {
                throw new Error("Invalid JSON in Body");
            }
            try {
                headersParsed = JSON.parse(formData.headers);
            } catch {
                throw new Error("Invalid JSON in Headers");
            }

            await api.post('/jobs', {
                ...formData,
                body: bodyParsed,
                headers: headersParsed
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-lg animate-slide-up">

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Create New Job</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-secondary">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded bg-red-900/50 border border-red-900 text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Job Name</label>
                        <input
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Health Check"
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1 space-y-1">
                            <label className="text-sm font-medium">Method</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.method}
                                onChange={e => setFormData({ ...formData, method: e.target.value })}
                            >
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                            </select>
                        </div>
                        <div className="col-span-3 space-y-1">
                            <label className="text-sm font-medium">Target URL</label>
                            <input
                                required
                                type="url"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.url}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                placeholder="https://api.example.com/check"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Cron Expression</label>
                        <div className="flex gap-2">
                            <input
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.cronExpression}
                                onChange={e => setFormData({ ...formData, cronExpression: e.target.value })}
                                placeholder="* * * * *"
                            />
                            <a
                                href="https://crontab.guru/"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center px-3 border border-input rounded-md hover:bg-secondary text-xs text-muted-foreground"
                            >
                                Help
                            </a>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Headers (JSON)</label>
                        <textarea
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                            value={formData.headers}
                            onChange={e => setFormData({ ...formData, headers: e.target.value })}
                        />
                    </div>

                    {formData.method !== 'GET' && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Body (JSON)</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.body}
                                onChange={e => setFormData({ ...formData, body: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Job'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
