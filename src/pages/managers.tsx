//@ts-nocheck

import  { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import debounce from 'lodash.debounce';
import managerService from '@/services/managerService';


const ManagerList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newManager, setNewManager] = useState({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        seniorManagerId: null,
    });
    const [managers, setManagers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc',
    });
    const [selectedManager, setSelectedManager] = useState(null);
    const [location,navigate] = useLocation();

    useEffect(() => {
        fetchRoles();
    }, []);

    const debouncedFetchManagers = useCallback(
        debounce(async (query, role) => {
            try {
                setLoading(true);
                const data = await managerService.getAllManagers();

                let filteredData = data;
                if (query) {
                    filteredData = filteredData.filter(
                        (manager) =>
                            manager.firstName.toLowerCase().includes(query.toLowerCase()) ||
                            manager.lastName.toLowerCase().includes(query.toLowerCase()) ||
                            manager.email.toLowerCase().includes(query.toLowerCase()) ||
                            manager.seniorManagerName?.toLowerCase().includes(query.toLowerCase())
                    );
                }
                if (role) {
                    filteredData = filteredData.filter((manager) => manager.role === role);
                }

                setManagers(filteredData);
            } catch (error) {
                console.error('Error loading managers:', error);
                setError('Failed to load managers. Please try again later.');
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        debouncedFetchManagers(searchQuery, roleFilter);
    }, [searchQuery, roleFilter, debouncedFetchManagers]);

    const fetchRoles = async () => {
        try {
            const roleData = await managerService.getDistinctRoles();
            setRoles(roleData);
        } catch (error) {
            console.error('Error fetching roles:', error);
            setError('Failed to load roles. Please try again.');
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleAddManager = async (e) => {
        e.preventDefault();
        try {
            const addedManager = await managerService.createManager(newManager);
            setManagers((prev) => [...prev, addedManager]);
            setIsModalOpen(false);
            setNewManager({
                firstName: '',
                lastName: '',
                email: '',
                role: '',
                seniorManagerId: null,
            });
        } catch (error) {
            console.error('Error adding manager:', error);
            setError('Failed to add manager. Please try again.');
        }
    };

    // if (loading) return <div className="loading">Loading...</div>;
    // if (error) return <div className="error">{error}</div>;

    return (
        <div className="container bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
        {/* Header */}
        <div className="header flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
       
            <h1 className="text-xl font-semibold  text-black dark:text-white">Managers</h1>
            <button
                onClick={() => setIsModalOpen(true)}
                className="add-client-btn bg-green-500 text-white  px-4 py-2 rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            >
                Add Manager
            </button>
        </div>
    
        {/* Filter Section */}
        <div className="filter-section flex items-center p-4 space-x-4 bg-gray-50 dark:bg-gray-700 text-black dark:text-white">
            <input
                type="text"
                placeholder="Search managers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-full p-2 border border-gray-300 rounded dark:bg-gray-600 dark:border-gray-500 dark:text-white text-black"
            />
            <div className="filter-group flex items-center">
                <label className="filter-label mr-2 dark:text-white text-black">Role:</label>
                <select
                    className="filter-select border border-gray-300 rounded p-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white text-black"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">All</option>
                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {role.replace('_', ' ')}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    
        {/* Table Container */}
        <div className="table-container overflow-x-auto p-4">
            <table className="w-full table-auto">
                <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                        <th className="px-4 py-2 text-left dark:text-white text-black">ID</th>
                        <th className="px-4 py-2 text-left dark:text-white text-black">First Name</th>
                        <th className="px-4 py-2 text-left dark:text-white text-black">Last Name</th>
                        <th className="px-4 py-2 text-left dark:text-white text-black">Email</th>
                        <th className="px-4 py-2 text-left dark:text-white text-black">Role</th>
                        <th className="px-4 py-2 text-left dark:text-white text-black">Senior Manager</th>
                        <th className="px-4 py-2 text-left dark:text-white text-black">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {managers.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-4 py-2 text-center dark:text-white text-black">
                                No managers found
                            </td>
                        </tr>
                    ) : (
                        managers.map((manager) => (
                            <tr key={manager.id} className="border-b dark:border-gray-700">
                                <td className="px-4 py-2 dark:text-white  text-black">{manager.id}</td>
                                <td className="px-4 py-2 dark:text-white  text-black">{manager.firstName}</td>
                                <td className="px-4 py-2 dark:text-white  text-black">{manager.lastName}</td>
                                <td className="px-4 py-2 dark:text-white  text-black">{manager.email}</td>
                                <td className="px-4 py-2 dark:text-white  text-black">{manager.role?.replace('_', ' ')}</td>
                                <td className="px-4 py-2 dark:text-white  text-black">{manager.seniorManagerName || '-'}</td>
                                <td className="px-4 py-2">
                                    <div className="action-buttons flex space-x-2">
                                        <button
                                            className="btn btn-edit bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                                            onClick={() => setSelectedManager(manager)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to delete this manager?')) {
                                                    try {
                                                        await managerService.deleteManager(manager.id);
                                                        debouncedLoadManagers(searchQuery, currentPage);
                                                    } catch (error) {
                                                        console.error('Error deleting manager:', error);
                                                    }
                                                }
                                            }}
                                            className="btn btn-delete bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    
        {/* Edit Manager Modal */}
        {selectedManager && (
            <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="modal-content edit-form bg-white dark:bg-gray-800 p-6 rounded-lg w-1/3">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white text-black">Edit Manager</h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            await managerService.updateManager(selectedManager.id, selectedManager);
                            setSelectedManager(null);
                            debouncedFetchManagers(searchQuery, roleFilter);
                        } catch (error) {
                            console.error('Error updating manager:', error);
                        }
                    }}>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={selectedManager.firstName}
                            onChange={(e) => setSelectedManager(prev => ({...prev, firstName: e.target.value}))}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white  text-black"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={selectedManager.lastName}
                            onChange={(e) => setSelectedManager(prev => ({...prev, lastName: e.target.value}))}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white  text-black"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={selectedManager.email}
                            onChange={(e) => setSelectedManager(prev => ({...prev, email: e.target.value}))}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white  text-black"
                        />
                        <select
                            value={selectedManager.role}
                            onChange={(e) => setSelectedManager(prev => ({...prev, role: e.target.value}))}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white  text-black"
                        >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="submit"
                                className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                className="btn btn-cancel bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                                onClick={() => setSelectedManager(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    
        {/* Add Manager Modal */}
        {isModalOpen && (
            <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="modal-content add-form bg-white dark:bg-gray-800 p-6 rounded-lg w-1/3">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white  text-black">Add Manager</h2>
                    <form onSubmit={handleAddManager}>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={newManager.firstName}
                            onChange={(e) => setNewManager((prev) => ({ ...prev, firstName: e.target.value }))}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white  text-black"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={newManager.lastName}
                            onChange={(e) => setNewManager((prev) => ({ ...prev, lastName: e.target.value }))}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white  text-black"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newManager.email}
                            onChange={(e) => setNewManager((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white  text-black"
                        />
                        <select
                            value={newManager.role}
                            onChange={(e) => setNewManager((prev) => ({ ...prev, role: e.target.value }))}
                            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white  text-black"
                        >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role.replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="submit"
                                className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                className="btn btn-cancel bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
    );
};

export default ManagerList;
