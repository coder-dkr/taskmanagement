import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { clientService } from '@/services/clientService';
import { debounce } from '@/lib/debounce';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', sector: '', email: '' });
    const [currentClient, setCurrentClient] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [emailError, setEmailError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [location, navigate] = useLocation();

    const debouncedLoadClients = useCallback(
        debounce(async (query: any, page: any) => {
            try {
                setLoading(true);
                const data = await clientService.getByFilters(page, query);
                setClients(data.clients);
                setTotalPages(data.totalPages);
                setCurrentPage((current: any) => Math.max(1, Math.min(current, data.totalPages)));
            } catch (error) {
                console.error('Error loading clients:', error);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        debouncedLoadClients(searchQuery, currentPage);
    }, [searchQuery, currentPage, debouncedLoadClients]);

    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const sectorList = await clientService.getSectors();
                setSectors(sectorList);
            } catch (error) {
                console.error('Error fetching sectors:', error);
            }
        };
        fetchSectors();
    }, []);

    const handleBack = () => navigate('/');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const viewEntities = (clientId: any) => {
        navigate(`/clients/${clientId}/entities`);
    };

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen text-gray-700 dark:text-gray-300">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={handleBack} className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition">
                    Back to Dashboard
                </button>
                <h1 className="text-2xl font-bold">Clients</h1>
                <button
                    onClick={() => {
                        setCurrentClient(null);
                        setNewClient({ name: '', sector: '', email: '' });
                        setEmailError('');
                        setShowModal(true);
                    }}
                    className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
                >
                    Add Client
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search Clients..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full p-2 mb-4 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-4 mb-4">
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded bg-gray-700 text-white disabled:opacity-50"
                >
                    ◄
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded bg-gray-700 text-white disabled:opacity-50"
                >
                    ►
                </button>
            </div>

            {/* Client Table */}
            <div className="overflow-x-auto">
                {filteredClients.length > 0 ? (
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                        <thead>
                            <tr className="bg-gray-200 dark:bg-gray-700">
                                <th className="p-2 border">ID</th>
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Sector</th>
                                <th className="p-2 border">Email</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client: any) => (
                                <tr key={client.id} className="text-center">
                                    <td className="p-2 border">{client.id}</td>
                                    <td className="p-2 border">{client.name}</td>
                                    <td className="p-2 border">{client.sector}</td>
                                    <td className="p-2 border">{client.email}</td>
                                    <td className="p-2 border">
                                        <div className="space-x-2">
                                            <button onClick={() => viewEntities(client.id)} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-400">
                                                View Entities
                                            </button>
                                            <button onClick={() => {
                                                setCurrentClient(client);
                                                setNewClient(client);
                                                setEmailError('');
                                                setShowModal(true);
                                            }} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-400">
                                                Edit
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('Are you sure you want to delete this client?')) {
                                                        await clientService.deleteClient(client.id);
                                                        debouncedLoadClients(searchQuery, currentPage);
                                                    }
                                                }}
                                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-400"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center text-gray-600 dark:text-gray-400 mt-6">No clients found matching "{searchQuery}"</div>
                )}
            </div>
        </div>
    );
};

export default Clients;
