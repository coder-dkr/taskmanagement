//@ts-nocheck

import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import entityService from '@/services/entityService';
import managerService from '@/services/managerService';
import { clientService } from '@/services/clientService';


const EntityList = () => {
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [currentEntity, setCurrentEntity] = useState(null);
    const [managers, setManagers] = useState([]);
    const [editingEntity, setEditingEntity] = useState({
        name: '',
        status: '',
        managerId: '',
        clientId: ''
    });
    const [clients, setClients] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [location,navigate] = useLocation();
    const { clientId } = useParams();

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([fetchEntities(), fetchManagers(), fetchClients()]);
            } catch (error) {
                console.error('Error loading initial data:', error);
                setError('Failed to load initial data. Please try again later.');
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
            setError('Failed to load managers. Please try again later.');
        }
    };

    const fetchClients = async () => {
        try {
            const clientsData = await clientService.getAllClients();
            setClients(clientsData);
        } catch (error) {
            console.error('Error fetching clients:', error);
            setError('Failed to load clients. Please try again later.');
        }
    };

    const fetchEntities = async () => {
        try {
            setLoading(true);
            let data;
            if (clientId) {
                data = await entityService.getByClientId(clientId);
            } else {
                data = await entityService.getAllEntities();
            }

            let filteredData = data;
            if (searchQuery) {
                filteredData = filteredData.filter(entity =>
                    entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    entity.managerFirstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    entity.managerLastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    entity.clientName?.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }
            if (statusFilter) {
                filteredData = filteredData.filter(entity => entity.status === statusFilter);
            }

            setEntities(filteredData);
        } catch (error) {
            console.error('Error loading entities:', error);
            setError('Failed to load entities. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (entity) => {
        setCurrentEntity(entity);
        setEditingEntity({
            name: entity.name,
            status: entity.status,
            managerId: entity.managerId || '',
            clientId: entity.clientId || clientId || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (entityId) => {
        if (window.confirm('Are you sure you want to delete this entity?')) {
            try {
                await entityService.deleteEntity(entityId);
                await fetchEntities();
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } catch (error) {
                console.error('Error deleting entity:', error);
                setError('Failed to delete entity. Please try again.');
            }
        }
    };

    const handleAddOrEditEntity = async (e) => {
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
            setEditingEntity({
                name: '',
                status: '',
                managerId: '',
                clientId: ''
            });
            setCurrentEntity(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            await fetchEntities();
        } catch (error) {
            console.error('Error adding/updating entity:', error);
            setError('Failed to save entity. Please try again.');
        }
    };

    const handleBack = () => {
        navigate(clientId ? '/clients' : '/');
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'status-active';
            case 'pending':
                return 'status-pending';
            case 'completed':
                return 'status-completed';
            default:
                return '';
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role?.toUpperCase()) {
            case 'DIRECTOR':
                return 'role-director';
            case 'SENIOR_MANAGER':
                return 'role-senior';
            case 'MANAGER':
                return 'role-manager';
            case 'EMPLOYEE':
                return 'role-employee';
            default:
                return '';
        }
    };

    const handleEntityClick = (entityId) => {
        navigate(`/entities/${entityId}/tasks`);
    };

    // if (loading) return <div className="loading">Loading...</div>;
    // if (error) return <div className="error">{error}</div>;

    return (
        <div className="w-full mx-auto bg-white dark:bg-[#1F2937] dark:text-white text-black">
        <div className="header flex justify-between items-center p-4 dark:text-white">
            <h1 className="mt-3 text-xl font-semibold dark:text-white text-black">{clientId ? 'Client Entities' : 'All Entities'}</h1>
            <div>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => {
                        setCurrentEntity(null);
                        setEditingEntity({
                            name: '',
                            status: '',
                            managerId: '',
                            clientId: clientId || ''
                        });
                        setShowModal(true);
                    }}
                >
                    Add Entity
                </button>
            </div>
        </div>
    
        <div className="filter-section flex items-center p-4 space-x-4">
            <input
                type="text"
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input dark:border-0 border px-3 py-2 w-64 dark:text-white text-black dark:bg-gray-600 outline-none rounded-md"
            />
    
            <div className="filter-group flex items-center">
                <label className="filter-label mr-2">Status:</label>
                <select
                    className="filter-select border border-gray-300 rounded px-3 py-2 dark:text-white text-black dark:bg-gray-600 "
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>
        </div>
    
        <div className="table-container overflow-x-auto p-4">
            <table className={`w-full table-auto ${clientId ? 'client-entities' : 'all-entities'}`}>
                <thead>
                    <tr className="dark:bg-gray-600 dark:text-white">
                        {!clientId && <th className="px-4 py-2 text-left bg-transparent dark:text-white">Client</th>}
                        <th className="px-4 py-2 text-left bg-transparent dark:text-white  text-black">Entity Name</th>
                        <th className="px-4 py-2 text-left bg-transparent dark:text-white text-black">Status</th>
                        <th className="px-4 py-2 text-left  bg-transparent dark:text-white text-black">Senior Manager</th>
                        <th className="px-4 py-2 text-left  bg-transparent dark:text-white text-black">Assigned Manager</th>
                        <th className="px-4 py-2 text-left  bg-transparent dark:text-white text-black">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {
                    entities.length === 0 ? (
                        <tr>
                            <td colSpan={clientId ? 5 : 6} className="px-4 py-2 text-center dark:bg-gray-600 text-black dark:text-white text-black">
                                No entities found
                            </td>
                        </tr>
                    ) : 
                    (
                        entities.map((entity) => (
                            <tr key={entity.id} className="border-b">
                                {!clientId && <td className="px-4 py-2">{entity.clientName}</td>}
                                <td className="px-4 py-2">
                                    <span
                                        onClick={() => handleEntityClick(entity.id)}
                                        className="entity-name-link text-black dark:text-white hover:text-blue-700 cursor-pointer"
                                    >
                                        {entity.name}
                                        
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    <span className={`status-badge ${getStatusClass(entity.status)} px-2 py-1 rounded-full text-sm text-black dark:text-white`}>
                                        {entity.status}
                                      
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    <div>
                                        {entity.seniorManagerFirstName} {entity.seniorManagerLastName}
                                        <span className={`role-badge ${getRoleBadgeClass(entity.seniorManagerRole)} ml-2 px-2 py-1 rounded-full text-sm text-black dark:text-white`}>
                                            {entity.seniorManagerRole}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <div>
                                        {entity.managerFirstName} {entity.managerLastName}
                                        <span className={`role-badge ${getRoleBadgeClass(entity.managerRole)} ml-2 px-2 py-1 rounded-full text-sm text-black dark:text-white`}>
                                            {entity.managerRole}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="action-buttons flex space-x-2">
                                        <button
                                            className="btn btn-edit bg-yellow-500 dark:text-white px-3 py-1 rounded hover:bg-yellow-600"
                                            onClick={() => handleEdit(entity)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-delete bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                            onClick={() => handleDelete(entity.id)}
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
    
        {showModal && (
            <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="modal-content add-form bg-white p-6 rounded-lg w-1/3">
                    <h2 className="text-xl font-semibold mb-4">{currentEntity ? 'Edit Entity' : 'Add New Entity'}</h2>
                    <form onSubmit={handleAddOrEditEntity}>
                        <div className="form-group mb-4">
                            <label htmlFor="name" className="block mb-2 text-black dark:text-white">Entity Name</label>
                            <input
                                id="name"
                                type="text"
                                value={editingEntity.name}
                                onChange={(e) => setEditingEntity({ ...editingEntity, name: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black dark:text-white"
                                required
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label htmlFor="status" className="block mb-2 text-black dark:text-white">Status</label>
                            <select
                                id="status"
                                value={editingEntity.status}
                                onChange={(e) => setEditingEntity({ ...editingEntity, status: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-black dark:text-white"
                                required
                            >
                                <option className='text-black dark:text-white' value="">Select Status</option>
                                <option className='text-black dark:text-white' value="ACTIVE">Active</option>
                                <option className='text-black dark:text-white' value="PENDING">Pending</option>
                                <option className='text-black dark:text-white' value="COMPLETED">Completed</option>
                            </select>
                        </div>
                        {!clientId && (
                            <div className="form-group mb-4">
                                <label htmlFor="clientId" className="block mb-2 text-black dark:text-white">Client</label>
                                <select
                                    id="clientId"
                                    value={editingEntity.clientId}
                                    onChange={(e) => setEditingEntity({ ...editingEntity, clientId: e.target.value })}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-black dark:text-white"
                                    required
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(client => (
                                        <option className='text-black dark:text-white' key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="form-group mb-4">
                            <label htmlFor="managerId" className="block mb-2">Manager</label>
                            <select
                                id="managerId"
                                value={editingEntity.managerId}
                                onChange={(e) => setEditingEntity({ ...editingEntity, managerId: e.target.value })}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                            >
                                <option value="">Select Manager</option>
                                {managers.map(manager => (
                                    <option className='text-black dark:text-white' key={manager.id} value={manager.id}>
                                        {manager.firstName} {manager.lastName} ({manager.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-buttons flex justify-end space-x-2">
                            <button type="button" className="btn bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-view bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                {currentEntity ? 'Update' : 'Add'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    
        {showSuccess && (
            <div className="success-notification fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded">
                Entity {currentEntity ? 'updated' : 'added'} successfully!
            </div>
        )}
    </div>
    );
};

export default EntityList;