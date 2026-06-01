import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function DataEntry({ onViewChange }) {
    const [formData, setFormData] = useState({
        customId: '',
        name: '',
        email: '',
        scheduleId: '',
        jobId: '',
        location: '',
        date: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Simple client-side validation
        if (!formData.customId || !formData.name || !formData.email || !formData.scheduleId || !formData.jobId || !formData.location || !formData.date) {
            setError('Please fill in all fields.');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Write to the collection 'telegram_messages' using the structured format
            await addDoc(collection(db, "telegram_messages"), {
                customId: formData.customId,
                name: formData.name,
                email: formData.email,
                scheduleId: formData.scheduleId,
                jobId: formData.jobId,
                location: formData.location,
                // Store date as a proper JS Date object (which Firestore converts to Timestamp)
                date: new Date(formData.date),
                timestamp: new Date() // to preserve any sorting needs
            });

            // Show beautiful toast notification
            setShowToast(true);
            
            // Clear form
            setFormData({
                customId: '',
                name: '',
                email: '',
                scheduleId: '',
                jobId: '',
                location: '',
                date: ''
            });

            // Redirect back to dashboard after 1.5 seconds
            setTimeout(() => {
                setShowToast(false);
                if (onViewChange) {
                    onViewChange('dashboard');
                }
            }, 1500);

        } catch (err) {
            console.error("Error saving document: ", err);
            setError("Failed to save record. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="content-card">
            <div className="card-header">
                <div className="card-title-group">
                    <h3>➕ Create New Schedule Record</h3>
                    <p>Enter schedule and job details to upload them to the Firestore database</p>
                </div>
            </div>

            {error && (
                <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem'
                }}>
                    ⚠️ {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="customId">Record ID <span>*</span></label>
                        <input
                            type="text"
                            id="customId"
                            name="customId"
                            className="form-input"
                            placeholder="e.g. REC-101"
                            value={formData.customId}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="name">Name <span>*</span></label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="form-input"
                            placeholder="e.g. John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email <span>*</span></label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="e.g. john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="scheduleId">Schedule ID <span>*</span></label>
                        <input
                            type="text"
                            id="scheduleId"
                            name="scheduleId"
                            className="form-input"
                            placeholder="e.g. SCH-908"
                            value={formData.scheduleId}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="jobId">Job ID <span>*</span></label>
                        <input
                            type="text"
                            id="jobId"
                            name="jobId"
                            className="form-input"
                            placeholder="e.g. JOB-4022"
                            value={formData.jobId}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location <span>*</span></label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            className="form-input"
                            placeholder="e.g. New York, NY"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date <span>*</span></label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            className="form-input"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={() => onViewChange('dashboard')}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Save Record'}
                    </button>
                </div>
            </form>

            {showToast && (
                <div className="toast-success">
                    <span>✓</span> Record added successfully! Redirecting...
                </div>
            )}
        </div>
    );
}
