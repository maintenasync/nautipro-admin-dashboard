'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    FileText,
    RefreshCcw,
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    XCircle,
    AlertTriangle,
    Download,
    X,
    Bug,
    TriangleAlert,
    Zap,
    Bot,
    User,
    Ship,
    Clock,
    Monitor,
    FileCode,
    Database,
    Info,
    CalendarRange,
} from 'lucide-react';
import apiService from '../../../services/apiService';
import type { UserReport } from '../../../types/api';

const ITEMS_PER_PAGE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    const ms = parseInt(timestamp);
    if (isNaN(ms)) return 'N/A';
    return new Date(ms).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const CATEGORY_STYLES: Record<string, string> = {
    bug: 'bg-red-100 text-red-800',
    feature: 'bg-blue-100 text-blue-800',
    improvement: 'bg-purple-100 text-purple-800',
    crash: 'bg-orange-100 text-orange-800',
};

const PRIORITY_STYLES: Record<string, string> = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
};

const getCategoryStyle = (cat: string) =>
    CATEGORY_STYLES[cat.toLowerCase()] ?? 'bg-gray-100 text-gray-700';

const getPriorityStyle = (pri: string) =>
    PRIORITY_STYLES[pri.toLowerCase()] ?? 'bg-gray-100 text-gray-700';

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center space-x-2 mt-4 pb-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="h-4 w-4" />
            </button>
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-md ${page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

// ─── Detail Popup ─────────────────────────────────────────────────────────────

interface DetailPopupProps {
    report: UserReport | null;
    onClose: () => void;
}

const DetailPopup: React.FC<DetailPopupProps> = ({ report, onClose }) => {
    if (!report) return null;

    const hasLog = !!report.log_download_url;
    const hasDb = !!report.db_download_url;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b border-gray-200 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryStyle(report.category)}`}>
                                {report.category}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityStyle(report.priority)}`}>
                                {report.priority}
                            </span>
                            {report.is_auto && (
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
                                    <Bot className="w-3 h-3" /> Auto
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 transition-colors ml-4"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 p-6 space-y-5">

                    {/* User & Vessel */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* User card */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <img
                                src={report.user?.avatar || 'https://placehold.co/48x48/A0B9CE/white?text=U'}
                                alt={report.user?.name}
                                className="w-12 h-12 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                    <User className="w-3 h-3" /> User
                                </p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{report.user?.name || report.user_id}</p>
                                <p className="text-xs text-gray-500 truncate">{report.user?.email}</p>
                            </div>
                        </div>

                        {/* Vessel card */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <Ship className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                    <Ship className="w-3 h-3" /> Vessel
                                </p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{report.vessel?.name || report.vessel_id}</p>
                                {report.vessel?.imo && (
                                    <p className="text-xs text-gray-500">IMO: {report.vessel.imo}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Report Text */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> Report Details
                        </p>
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{report.report_text}</p>
                        </div>
                    </div>

                    {/* System Information */}
                    {report.system_information && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                                <Monitor className="w-3 h-3" /> System Information
                            </p>
                            <div className="bg-gray-900 rounded-xl p-4">
                                <p className="text-sm text-green-400 font-mono whitespace-pre-wrap leading-relaxed">
                                    {report.system_information}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Download Files */}
                    {(hasLog || hasDb) && (
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <Download className="w-3 h-3" /> Download Files
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {hasLog && (
                                    <a
                                        href={report.log_download_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <FileCode className="w-4 h-4" />
                                        Download Log
                                        <span className="text-xs opacity-75 font-mono">.nplog</span>
                                    </a>
                                )}
                                {hasDb && (
                                    <a
                                        href={report.db_download_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <Database className="w-4 h-4" />
                                        Download DB
                                        <span className="text-xs opacity-75 font-mono">.npdb</span>
                                    </a>
                                )}
                            </div>
                            <p className="text-xs text-amber-600 flex items-center gap-1 mt-2">
                                <Info className="w-3 h-3" /> Download links expire in 24 hours
                            </p>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                        <div>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Created At
                            </p>
                            <p className="text-sm text-gray-800 mt-0.5">{formatDate(report.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Updated At
                            </p>
                            <p className="text-sm text-gray-800 mt-0.5">{formatDate(report.updated_at)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserReports() {
    const [reports, setReports] = useState<UserReport[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);

    const [filters, setFilters] = useState({
        search: '',
        category: '',
        priority: '',
        isAuto: '',
        vessel: '',
        user: '',
        dateFrom: '',
        dateTo: '',
    });

    const fetchReports = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await apiService.getUserReports();
            setReports(res.data ?? []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user reports');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // ── Derived filter options from data ──
    const categories = useMemo(
        () => Array.from(new Set(reports.map(r => r.category).filter(Boolean))).sort(),
        [reports],
    );
    const priorities = useMemo(
        () => Array.from(new Set(reports.map(r => r.priority).filter(Boolean))).sort(),
        [reports],
    );
    const vesselOptions = useMemo(() => {
        const map = new Map<string, string>();
        reports.forEach(r => {
            if (r.vessel_id) map.set(r.vessel_id, r.vessel?.name || r.vessel_id);
        });
        return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [reports]);
    const userOptions = useMemo(() => {
        const map = new Map<string, string>();
        // If a vessel is selected, only show users who have reports on that vessel
        const source = filters.vessel
            ? reports.filter(r => r.vessel_id === filters.vessel)
            : reports;
        source.forEach(r => {
            if (r.user_id) map.set(r.user_id, r.user?.name || r.user_id);
        });
        return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    }, [reports, filters.vessel]);

    // ── Filtered data ──
    const filtered = useMemo(() => {
        const q = filters.search.toLowerCase();
        const fromMs = filters.dateFrom ? new Date(filters.dateFrom).getTime() : null;
        // dateTo: end of the selected day
        const toMs = filters.dateTo ? new Date(filters.dateTo + 'T23:59:59').getTime() : null;
        return reports.filter(r => {
            const matchSearch =
                !q ||
                r.title.toLowerCase().includes(q) ||
                (r.user?.name ?? '').toLowerCase().includes(q) ||
                (r.user?.email ?? '').toLowerCase().includes(q) ||
                (r.vessel?.name ?? '').toLowerCase().includes(q);
            const matchCategory = !filters.category || r.category === filters.category;
            const matchPriority = !filters.priority || r.priority === filters.priority;
            const matchAuto =
                !filters.isAuto ||
                (filters.isAuto === 'auto' ? r.is_auto : !r.is_auto);
            const matchVessel = !filters.vessel || r.vessel_id === filters.vessel;
            const matchUser = !filters.user || r.user_id === filters.user;
            const reportMs = parseInt(r.created_at);
            const matchDateFrom = !fromMs || (!isNaN(reportMs) && reportMs >= fromMs);
            const matchDateTo = !toMs || (!isNaN(reportMs) && reportMs <= toMs);
            return matchSearch && matchCategory && matchPriority && matchAuto &&
                matchVessel && matchUser && matchDateFrom && matchDateTo;
        });
    }, [reports, filters]);

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const displayed = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            // When vessel changes, reset user (selected user may not belong to new vessel)
            ...(key === 'vessel' ? { user: '' } : {}),
        }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({ search: '', category: '', priority: '', isAuto: '', vessel: '', user: '', dateFrom: '', dateTo: '' });
        setCurrentPage(1);
    };

    // ── Stats ──
    const stats = useMemo(() => ({
        total: reports.length,
        bugs: reports.filter(r => r.category.toLowerCase() === 'bug').length,
        highPriority: reports.filter(r => ['high', 'critical'].includes(r.priority.toLowerCase())).length,
        auto: reports.filter(r => r.is_auto).length,
    }), [reports]);

    return (
        <div className="min-h-screen text-gray-900 p-6 font-sans">
            {/* Detail Popup */}
            {selectedReport && (
                <DetailPopup report={selectedReport} onClose={() => setSelectedReport(null)} />
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">User Reports</h1>
                    <p className="text-gray-600 mt-1">View and download reports submitted by users</p>
                </div>
                <button
                    onClick={fetchReports}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition-colors duration-150"
                >
                    <RefreshCcw className="w-5 h-5" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Bug className="w-4 h-4 text-red-400" />
                        <h3 className="text-sm font-medium text-gray-500">Bug Reports</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{stats.bugs}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                        <TriangleAlert className="w-4 h-4 text-orange-400" />
                        <h3 className="text-sm font-medium text-gray-500">High / Critical</h3>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{stats.highPriority}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-medium text-gray-500">Auto Reports</h3>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">{stats.auto}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-6">
                {/* Row 1: Search + Category + Priority + Source */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    {/* Search */}
                    <div className="col-span-1 lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Title, user, vessel..."
                                value={filters.search}
                                onChange={e => handleFilterChange('search', e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            />
                            {filters.search && (
                                <button
                                    onClick={() => handleFilterChange('search', '')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <XCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <div className="relative">
                            <select
                                value={filters.category}
                                onChange={e => handleFilterChange('category', e.target.value)}
                                className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <div className="relative">
                            <select
                                value={filters.priority}
                                onChange={e => handleFilterChange('priority', e.target.value)}
                                className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Priorities</option>
                                {priorities.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Auto / Manual */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <div className="relative">
                            <select
                                value={filters.isAuto}
                                onChange={e => handleFilterChange('isAuto', e.target.value)}
                                className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Sources</option>
                                <option value="auto">Auto</option>
                                <option value="manual">Manual</option>
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Row 2: Vessel + User + Date From + Date To */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mt-4">
                    {/* Vessel */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Ship className="w-3 h-3" /> Vessel
                        </label>
                        <div className="relative">
                            <select
                                value={filters.vessel}
                                onChange={e => handleFilterChange('vessel', e.target.value)}
                                className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Vessels</option>
                                {vesselOptions.map(([id, name]) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* User */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> User
                        </label>
                        <div className="relative">
                            <select
                                value={filters.user}
                                onChange={e => handleFilterChange('user', e.target.value)}
                                className="w-full appearance-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            >
                                <option value="">All Users</option>
                                {userOptions.map(([id, name]) => (
                                    <option key={id} value={id}>{name}</option>
                                ))}
                            </select>
                            <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Date From */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <CalendarRange className="w-3 h-3" /> From
                        </label>
                        <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={e => handleFilterChange('dateFrom', e.target.value)}
                            max={filters.dateTo || undefined}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <CalendarRange className="w-3 h-3" /> To
                        </label>
                        <input
                            type="date"
                            value={filters.dateTo}
                            onChange={e => handleFilterChange('dateTo', e.target.value)}
                            min={filters.dateFrom || undefined}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-500">{filtered.length} report{filtered.length !== 1 ? 's' : ''} found</p>
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Table / Loading / Error / Empty */}
            {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse border border-gray-200">
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-10 bg-gray-200 rounded-md" />
                        ))}
                    </div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="text-red-800 flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-medium">Error: {error}</p>
                            <button
                                onClick={fetchReports}
                                className="mt-2 bg-red-100 text-red-800 px-3 py-1 text-sm rounded-md hover:bg-red-200 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-3 text-sm font-medium text-gray-700">No reports found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {reports.length === 0
                            ? 'No user reports have been submitted yet.'
                            : 'No reports match your current filters.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vessel</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Files</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {displayed.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{report.id}</td>

                                        {/* User */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={report.user?.avatar || 'https://placehold.co/32x32/A0B9CE/white?text=U'}
                                                    alt={report.user?.name}
                                                    className="w-8 h-8 rounded-full object-cover shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                                        {report.user?.name || report.user_id}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                                        {report.user?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Vessel */}
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-900 truncate max-w-[120px]">
                                                {report.vessel?.name || report.vessel_id}
                                            </p>
                                            {report.vessel?.imo && (
                                                <p className="text-xs text-gray-500">IMO: {report.vessel.imo}</p>
                                            )}
                                        </td>

                                        {/* Title */}
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-900 max-w-[180px] truncate" title={report.title}>
                                                {report.title}
                                            </p>
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCategoryStyle(report.category)}`}>
                                                {report.category}
                                            </span>
                                        </td>

                                        {/* Priority */}
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityStyle(report.priority)}`}>
                                                {report.priority}
                                            </span>
                                        </td>

                                        {/* Source */}
                                        <td className="px-4 py-3">
                                            {report.is_auto ? (
                                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1 w-fit">
                                                    <Bot className="w-3 h-3" /> Auto
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 flex items-center gap-1 w-fit">
                                                    <Zap className="w-3 h-3" /> Manual
                                                </span>
                                            )}
                                        </td>

                                        {/* Files */}
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {report.log_download_url ? (
                                                    <a
                                                        href={report.log_download_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Download Log File"
                                                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        <FileCode className="w-3 h-3" /> Log
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                                {report.db_download_url && (
                                                    <a
                                                        href={report.db_download_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Download DB File"
                                                        className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <Database className="w-3 h-3" /> DB
                                                    </a>
                                                )}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                            {formatDate(report.created_at)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setSelectedReport(report)}
                                                className="text-blue-600 hover:underline text-sm font-medium transition-colors"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
}
