import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import entityService from '@/services/entityService';
import managerService from '@/services/managerService';
import { clientService } from '@/services/clientService';

const EntityList = () => {
    const [entities, setEntities] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentEntity, setCurrentEntity] = useState<any>(null);
    const [managers, setManagers] = useState<any>([]);
    const [clients, setClients] = useState<any>([]);
    const [editingEntity, setEditingEntity] = useState({
        name: '',
        status: '',
        managerId: '',
        clientId: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [location, navigate] = useLocation();
    const { clientId } = useParams();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([fetchEntities(), fetchManagers(), fetchClients()]);
            } catch (error) {
                console.error('Error loading initial data:', error);
                setError('Failed to load initial data. Please try again.');
            }
        };
        loadInitialData();
    }, [clientId, searchQuery, statusFilter]);

    const fetchManagers = async () => {
        try {
            const managersData = await managerService.getAllManagers();
            setManagers(managersData);
        } catch (error) {
            console.error('Error fetching managers:', error);
        }
    };

    const fetchClients = async () => {
        try {
            const clientsData = await clientService.getAllClients();
            setClients(clientsData);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchEntities = async () => {
        try {
            setLoading(true);
            const data = clientId ? await entityService.getByClientId(clientId) : await entityService.getAllEntities();
            let filteredData = data;
            if (searchQuery) {
                filteredData = filteredData.filter((entity: any) =>
                    entity.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            if (statusFilter) {
                filteredData = filteredData.filter((entity: any) => entity.status === statusFilter);
            }
            setEntities(filteredData);
        } catch (error) {
            console.error('Error loading entities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (entity: any) => {
        setCurrentEntity(entity);
        setEditingEntity({
            name: entity.name,
            status: entity.status,
            managerId: entity.managerId || '',
            clientId: entity.clientId || clientId || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (entityId: any) => {
        if (window.confirm('Are you sure you want to delete this entity?')) {
            try {
                await entityService.deleteEntity(entityId);
                await fetchEntities();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } catch (error) {
                console.error('Error deleting entity:', error);
            }
        }
    };

    const handleAddOrEditEntity = async (e: any) => {
        e.preventDefault();
        try {
            const entityData = {
                ...editingEntity,
                clientId: editingEntity.clientId || clientId
            };

            if (currentEntity) {
                await entityService.updateEntity(currentEntity.id, entityData);
            } else {
                await entityService.createEntity(entityData);
            }
            setShowModal(false);
            setEditingEntity({ name: '', status: '', managerId: '', clientId: '' });
            setCurrentEntity(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            await fetchEntities();
        } catch (error) {
            console.error('Error saving entity:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(clientId ? '/clients' : '/')}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Back to {clientId ? 'Clients' : 'Dashboard'}
                </button>
                <h1 className="text-2xl font-bold">{clientId ? 'Client Entities' : 'All Entities'}</h1>
                <button
                    onClick={() => {
                        setCurrentEntity(null);
                        setEditingEntity({ name: '', status: '', managerId: '', clientId: clientId || '' });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                >
                    Add Entity
                </button>
            </div>

            {/* Filters */}
            <div className="flex space-x-4 mb-4">
                <input
                    type="text"
                    placeholder="Search entities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-800"
                />
                <select
                    className="p-2 border rounded dark:bg-gray-800"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            {/* Entity Table */}
            {loading ? (
                <p className="text-center">Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                        <thead className="bg-gray-200 dark:bg-gray-800">
                            <tr>
                                <th className="border p-2">Name</th>
                                <th className="border p-2">Status</th>
                                <th className="border p-2">Manager</th>
                                <th className="border p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entities.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center p-4">
                                        No entities found
                                    </td>
                                </tr>
                            ) : (
                                entities.map((entity: any) => (
                                    <tr key={entity.id} className="border">
                                        <td className="border p-2">{entity.name}</td>
                                        <td className="border p-2">{entity.status}</td>
                                        <td className="border p-2">{entity.managerName}</td>
                                        <td className="border p-2 space-x-2">
                                            <button onClick={() => handleEdit(entity)} className="bg-green-500 text-white px-2 py-1 rounded">Edit</button>
                                            <button onClick={() => handleDelete(entity.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Success Notification */}
            {showSuccess && <p className="text-green-500 mt-4">Operation successful!</p>}
        </div>
    );
};

export default EntityList;
