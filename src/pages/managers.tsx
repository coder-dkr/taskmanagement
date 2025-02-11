import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import debounce from 'lodash.debounce';
import managerService from '@/services/managerService';

const ManagerList: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [newManager, setNewManager] = useState<any>({
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        seniorManagerId: null,
    });
    const [managers, setManagers] = useState<any[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [selectedManager, setSelectedManager] = useState<any>(null);
    const [location,navigate] = useLocation();

    useEffect(() => {
        fetchRoles();
    }, []);

    const debouncedFetchManagers = useCallback(
        debounce(async (query: string, role: string) => {
            try {
                setLoading(true);
                const data = await managerService.getAllManagers();

                let filteredData = data;
                if (query) {
                    filteredData = filteredData.filter((manager: any) =>
                        [manager.firstName, manager.lastName, manager.email, manager.seniorManagerName]
                            .some((field) => field?.toLowerCase().includes(query.toLowerCase()))
                    );
                }
                if (role) {
                    filteredData = filteredData.filter((manager: any) => manager.role === role);
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

    const handleAddManager = async (e: React.FormEvent) => {
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

    if (loading) return <div className="text-white text-center py-10">Loading...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="bg-black min-h-screen text-white p-6">
            <div className="flex justify-between items-center mb-6">
                <button onClick={handleBack} className="bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
                    Back to Dashboard
                </button>
                <h1 className="text-2xl font-semibold">Managers</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
                    Add Manager
                </button>
            </div>

            <div className="flex space-x-4 mb-6">
                <input
                    type="text"
                    placeholder="Search managers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-gray-800 text-white px-3 py-2 rounded w-1/2"
                />
                <select
                    className="bg-gray-800 text-white px-3 py-2 rounded"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {role.replace('_', ' ')}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border border-gray-700">
                    <thead className="bg-gray-900">
                        <tr>
                            <th className="p-2 border border-gray-700">ID</th>
                            <th className="p-2 border border-gray-700">First Name</th>
                            <th className="p-2 border border-gray-700">Last Name</th>
                            <th className="p-2 border border-gray-700">Email</th>
                            <th className="p-2 border border-gray-700">Role</th>
                            <th className="p-2 border border-gray-700">Senior Manager</th>
                            <th className="p-2 border border-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {managers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-4">
                                    No managers found
                                </td>
                            </tr>
                        ) : (
                            managers.map((manager) => (
                                <tr key={manager.id} className="text-center border border-gray-700">
                                    <td className="p-2">{manager.id}</td>
                                    <td className="p-2">{manager.firstName}</td>
                                    <td className="p-2">{manager.lastName}</td>
                                    <td className="p-2">{manager.email}</td>
                                    <td className="p-2">{manager.role?.replace('_', ' ')}</td>
                                    <td className="p-2">{manager.seniorManagerName || '-'}</td>
                                    <td className="p-2 flex justify-center space-x-2">
                                        <button
                                            className="bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                                            onClick={() => setSelectedManager(manager)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                                            onClick={async () => {
                                                if (window.confirm('Are you sure you want to delete this manager?')) {
                                                    try {
                                                        await managerService.deleteManager(manager.id);
                                                        debouncedFetchManagers(searchQuery, roleFilter);
                                                    } catch (error) {
                                                        console.error('Error deleting manager:', error);
                                                    }
                                                }
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagerList;
