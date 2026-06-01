import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import {
    collection,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot,
    query
} from 'firebase/firestore';

export default function Dashboard({ onViewChange }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit Modal states
    const [editingRecord, setEditingRecord] = useState(null);
    const [editFormData, setEditFormData] = useState({
        customId: '',
        name: '',
        email: '',
        scheduleId: '',
        jobId: '',
        location: '',
        date: ''
    });
    const [saving, setSaving] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);

    // READ: Listen to real-time changes in Firestore
    useEffect(() => {
        const q = query(collection(db, "telegram_messages"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = querySnapshot.docs.map(docSnapshot => ({
                id: docSnapshot.id,
                ...docSnapshot.data()
            }));

            // Sort by date / timestamp descending if available
            data.sort((a, b) => {
                const dateA = a.date?.toDate ? a.date.toDate() : (a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.date || a.timestamp || 0));
                const dateB = b.date?.toDate ? b.date.toDate() : (b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.date || b.timestamp || 0));
                return dateB - dateA;
            });

            setRecords(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching real-time data: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // DELETE: Delete record from Firestore
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await deleteDoc(doc(db, "telegram_messages", id));
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (record) => {
        setEditingRecord(record);
        setEditFormData({
            customId: record.customId || '',
            name: record.name || record.text || '',
            email: record.email || '',
            scheduleId: record.scheduleId || '',
            jobId: record.jobId || '',
            location: record.location || '',
            date: dateToInputString(record.date || record.timestamp)
        });
    };

    // Close Edit Modal
    const handleCloseEdit = () => {
        setEditingRecord(null);
    };

    // Save Edit Form
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingRecord) return;
        setSaving(true);

        try {
            const docRef = doc(db, "telegram_messages", editingRecord.id);
            await updateDoc(docRef, {
                customId: editFormData.customId,
                name: editFormData.name,
                email: editFormData.email,
                scheduleId: editFormData.scheduleId,
                jobId: editFormData.jobId,
                location: editFormData.location,
                date: editFormData.date ? new Date(editFormData.date) : null
            });

            setShowSuccessToast(true);
            setEditingRecord(null);
            setTimeout(() => setShowSuccessToast(false), 2000);
        } catch (error) {
            console.error("Error updating document: ", error);
            alert("Failed to update record. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Helper: format date object into DD-MM-YYYY
    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        let d;
        if (typeof dateValue.toDate === 'function') {
            d = dateValue.toDate();
        } else {
            d = new Date(dateValue);
        }
        if (isNaN(d.getTime())) return 'N/A';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Helper: format date object into YYYY-MM-DD for date inputs
    const dateToInputString = (dateValue) => {
        if (!dateValue) return '';
        let d;
        if (typeof dateValue.toDate === 'function') {
            d = dateValue.toDate();
        } else {
            d = new Date(dateValue);
        }
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Filtered Records based on search
    const filteredRecords = records.filter(rec => {
        const q = searchQuery.toLowerCase();
        const customId = (rec.customId || '').toLowerCase();
        const name = (rec.name || rec.text || '').toLowerCase();
        const email = (rec.email || '').toLowerCase();
        const scheduleId = (rec.scheduleId || '').toLowerCase();
        const jobId = (rec.jobId || '').toLowerCase();
        const location = (rec.location || '').toLowerCase();
        return (
            customId.includes(q) ||
            name.includes(q) ||
            email.includes(q) ||
            scheduleId.includes(q) ||
            jobId.includes(q) ||
            location.includes(q)
        );
    });

    // Statistics calculations
    const totalRecords = records.length;
    const uniqueLocations = new Set(records.map(r => r.location).filter(Boolean)).size;
    const uniqueJobs = new Set(records.map(r => r.jobId).filter(Boolean)).size;

    return (
        <div style={{ width: '100%' }}>
            {/* Stats Summary Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-wrapper">📋</div>
                    <div className="stat-info">
                        <h4>Total Schedules</h4>
                        <p>{totalRecords}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrapper">📍</div>
                    <div className="stat-info">
                        <h4>Locations</h4>
                        <p>{uniqueLocations}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrapper">💼</div>
                    <div className="stat-info">
                        <h4>Unique Jobs</h4>
                        <p>{uniqueJobs}</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Content Container */}
            <div className="content-card">
                <div className="card-header">
                    <div className="card-title-group">
                        <h3>Records List</h3>
                        {/* <p>Showing live records synced with Firestore database</p> */}
                    </div>

                    {/* Search Field */}
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search schedules..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-wrapper">
                        <div className="spinner"></div>
                        <p>Fetching active records...</p>
                    </div>
                ) : (
                    <div className="table-container">
                        {filteredRecords.length === 0 ? (
                            <div className="empty-wrapper">
                                <span>📂</span>
                                <p>{searchQuery ? 'No records match your search criteria.' : 'No records logged yet. Use the Data Entry page to add records.'}</p>
                                {!searchQuery && (
                                    <button
                                        className="btn-primary"
                                        style={{ marginTop: '0.5rem' }}
                                        onClick={() => onViewChange('entry')}
                                    >
                                        Go to Data Entry
                                    </button>
                                )}
                            </div>
                        ) : (
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Schedule ID</th>
                                        <th>Job ID</th>
                                        <th>Location</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((rec) => (
                                        <tr key={rec.id}>
                                            <td data-label="ID">
                                                <span className="badge-id">{rec.customId || 'N/A'}</span>
                                            </td>
                                            <td data-label="Name">
                                                <strong>{rec.name || rec.text || 'Unnamed'}</strong>
                                            </td>
                                            <td data-label="Email" className="badge-email">{rec.email || 'N/A'}</td>
                                            <td data-label="Schedule ID">
                                                <span className="badge-schedule">{rec.scheduleId || 'N/A'}</span>
                                            </td>
                                            <td data-label="Job ID">
                                                <span className="badge-job">{rec.jobId || 'N/A'}</span>
                                            </td>
                                            <td data-label="Location" className="text-location">📍 {rec.location || 'N/A'}</td>
                                            <td data-label="Date">
                                                <span className="text-date">{formatDate(rec.date || rec.timestamp)}</span>
                                            </td>
                                            <td data-label="Actions">
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => handleOpenEdit(rec)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleDelete(rec.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Inline Edit Modal */}
            {editingRecord && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>✏️ Edit Schedule Record</h3>
                            <button className="btn-close" onClick={handleCloseEdit}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveEdit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Record ID</label>
                                    <input
                                        type="text"
                                        name="customId"
                                        className="form-input"
                                        value={editFormData.customId}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        value={editFormData.name}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        value={editFormData.email}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Schedule ID</label>
                                    <input
                                        type="text"
                                        name="scheduleId"
                                        className="form-input"
                                        value={editFormData.scheduleId}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Job ID</label>
                                    <input
                                        type="text"
                                        name="jobId"
                                        className="form-input"
                                        value={editFormData.jobId}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        className="form-input"
                                        value={editFormData.location}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        className="form-input"
                                        value={editFormData.date}
                                        onChange={handleEditChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={handleCloseEdit}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showSuccessToast && (
                <div className="toast-success">
                    <span>✓</span> Record updated successfully!
                </div>
            )}
        </div>
    );
}