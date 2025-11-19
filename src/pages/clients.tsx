//@ts-nocheck

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { clientService } from '@/services/clientService';
import { exportClientsList } from '@/services/exportService';
import { debounce } from '@/lib/debounce';
import { ChevronLeft , ChevronRight } from 'lucide-react';
import ExportButton from '@/components/ui/ExportButton';


const ClientList = () => {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        sector: '',
        email: ''
    });
    const [currentClient, setCurrentClient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSector, setSelectedSector] = useState(''); // New state for sector filter
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [emailError, setEmailError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [location,navigate] = useLocation();

    const debouncedLoadClients = useCallback(
        debounce(async (query, page, sector) => {
            try {
                setLoading(true);
                const data = await clientService.getByFilters(page, query, sector);
                setClients(data.clients);
                setTotalPages(data.totalPages);
                setCurrentPage((current) => Math.max(1, Math.min(current, data.totalPages)));
            } catch (error) {
                console.error('Error loading clients:', error);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        debouncedLoadClients(searchQuery, currentPage, selectedSector);
    }, [searchQuery, currentPage, selectedSector, debouncedLoadClients]);

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

    useEffect(() => {
        let filtered = clients.filter((client) =>
            client.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Apply sector filter if selected
        if (selectedSector) {
            filtered = filtered.filter((client) =>
                client.sector === selectedSector
            );
        }

        setFilteredClients(filtered);
    }, [clients, searchQuery, selectedSector]);

    const handleBack = () => {
        navigate('/');
    };

    const handleAddOrEditClient = async (e) => {
        e.preventDefault();
        try {
            if (currentClient) {
                await clientService.updateClient(currentClient.id, newClient);
            } else {
                await clientService.createClient(newClient);
            }
            setShowModal(false);
            setNewClient({ name: '', sector: '', email: '' });
            setEmailError('');
            setCurrentClient(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            debouncedLoadClients(searchQuery, currentPage, selectedSector);
        } catch (error) {
            if (error.message.includes('DUPLICATE_EMAIL')) {
                setEmailError('This email address is already in use');
            } else {
                console.error('Error adding/updating client:', error);
            }
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleSectorFilter = (e) => {
        setSelectedSector(e.target.value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSector('');
        setCurrentPage(1);
    };

    const viewEntities = (clientId) => {
        navigate(`/clients/${clientId}/entities`);
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="container bg-white dark:bg-black min-h-screen transition-colors duration-300">
    {/* Header */}
    <div className="header flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
    <h1 className="text-xl font-semibold dark:text-white text-black">Clients</h1>
    <ExportButton onClick={exportClientsList} />
</div>

    {/* Action Row with Add Client and Sector Filter */}
    <div className="action-row flex items-center justify-between mt-2 mb-4 gap-4">
        <div className="flex items-center gap-4">
            <button
                onClick={() => {
                    setCurrentClient(null);
                    setNewClient({ name: '', sector: '', email: '' });
                    setEmailError('');
                    setShowModal(true);
                }}
                className="add-client-btn bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            >
                Add Client
            </button>

            {/* Sector Filter Dropdown */}
            <div className="sector-filter flex items-center gap-2">
                <label htmlFor="sector-filter" className="text-sm font-medium dark:text-white text-black whitespace-nowrap">
                    Filter by Sector:
                </label>
                <select
                    id="sector-filter"
                    value={selectedSector}
                    onChange={handleSectorFilter}
                    className="border border-gray-300 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black min-w-[150px]"
                >
                    <option value="">All Sectors</option>
                    {sectors.map((sector) => (
                        <option key={sector} value={sector}>
                            {sector.replace('_', ' ')}
                        </option>
                    ))}
                </select>
            </div>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || selectedSector) && (
            <button
                onClick={clearFilters}
                className="clear-filters-btn bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-sm"
            >
                Clear Filters
            </button>
        )}
    </div>

    {/* Search Input */}
    <input
        type="text"
        placeholder="Search Clients..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-input w-full p-2 border border-gray-300 rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black"
    />

    {/* Active Filters Display */}
    {(searchQuery || selectedSector) && (
        <div className="active-filters mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-sm">
                <span className="font-medium dark:text-white text-black">Active filters:</span>
                {searchQuery && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                        Search: "{searchQuery}"
                    </span>
                )}
                {selectedSector && (
                    <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs">
                        Sector: {selectedSector.replace('_', ' ')}
                    </span>
                )}
            </div>
        </div>
    )}

    {/* Pagination */}
    <div className="pagination flex justify-center items-center space-x-4 my-4">
        <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-white text-black dark:hover:bg-gray-700"
        >
            <ChevronLeft />
        </button>
        <span className="dark:text-white  text-black">Page {totalPages !== 0 ? currentPage  : 0} of {totalPages}</span>
        <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 text-black dark:text-white dark:hover:bg-gray-700"
        >
            <ChevronRight />
        </button>
    </div>

    {/* Table Container */}
    <div className="table-container overflow-x-auto p-4">
        {filteredClients.length > 0 ? (
            <table className="w-full table-auto">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="px-4 py-2 text-left dark:text-white text-black">ID</th>
                        <th className="px-4 py-2 text-left dark:text-white text-black">Name</th>
                        <th className="px-4 py-2 text-left dark:text-white text-black">Sector</th>
                        <th className="px-4 py-2 text-left dark:text-white text-black">Email</th>
                        <th className="px-4 py-2 text-left dark:text-white text-black">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredClients.map((client) => (
                        <tr key={client.id} className="border-b dark:border-gray-700">
                            <td className="px-4 py-2 dark:text-white text-black">{client.id}</td>
                            <td className="px-4 py-2 dark:text-white text-black">{client.name}</td>
                            <td className="px-4 py-2 dark:text-white text-black">{client.sector}</td>
                            <td className="px-4 py-2 dark:text-white text-black">{client.email}</td>
                            <td className="px-4 py-2">
                                <div className="action-buttons flex space-x-2">
                                    <button
                                        onClick={() => viewEntities(client.id)}
                                        className="btn btn-view bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                    >
                                        View Entities
                                    </button>
                                    <button
                                        onClick={() => {
                                            setCurrentClient(client);
                                            setNewClient(client);
                                            setEmailError('');
                                            setShowModal(true);
                                        }}
                                        className="btn btn-edit bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to delete this client?')) {
                                                await clientService.deleteClient(client.id);
                                                debouncedLoadClients(searchQuery, currentPage, selectedSector);
                                            }
                                        }}
                                        className="btn btn-delete bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
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
            <div className="no-results text-center text-gray-700 dark:text-gray-300">
                {searchQuery || selectedSector 
                    ? `No clients found matching the current filters`
                    : 'No clients found'
                }
            </div>
        )}
    </div>

    {/* Modal */}
    {showModal && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="modal-content add-form bg-white dark:bg-gray-800 p-6 rounded-lg w-1/3">
                <h2 className="text-xl font-semibold mb-4 dark:text-white text-black">
                    {currentClient ? 'Edit Client' : 'Add New Client'}
                </h2>
                <form onSubmit={handleAddOrEditClient}>
                    <div className="form-group mb-4">
                        <label htmlFor="name" className="block mb-2 dark:text-white text-black">Client Name</label>
                        <input
                            id="name"
                            type="text"
                            value={newClient.name}
                            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black"
                            required
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="sector" className="block mb-2 dark:text-white text-black">Sector</label>
                        <select
                            id="sector"
                            value={newClient.sector}
                            onChange={(e) => setNewClient({ ...newClient, sector: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black"
                            required
                        >
                            <option value="">Select Sector</option>
                            {sectors.map((sector) => (
                                <option key={sector} value={sector}>
                                    {sector.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group mb-4">
                        <label htmlFor="email" className="block mb-2 dark:text-white text-black">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={newClient.email}
                            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black"
                            required
                        />
                        {emailError && <span className="error-message text-red-500 dark:text-red-400">{emailError}</span>}
                    </div>
                    <div className="modal-buttons flex justify-end space-x-2">
                        <button
                            type="button"
                            className="btn bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                            onClick={() => setShowModal(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-view bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            {currentClient ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}

    {/* Success Notification */}
    {showSuccess && (
        <div className="success-notification fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded dark:bg-green-600">
            Client {currentClient ? 'updated' : 'added'} successfully!
        </div>
    )}
</div>
    );
};

export default ClientList;