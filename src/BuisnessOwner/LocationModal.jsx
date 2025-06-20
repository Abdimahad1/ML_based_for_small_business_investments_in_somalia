// src/BusinessOwner/LocationModal.jsx

import React, { useState, useEffect } from 'react';
import './LocationModal.css';
import { FaTimes, FaTrash, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LocationModal = ({ show, onClose, onLocationUpdate }) => {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({
    business: '',
    branch: '',
    city: '',
  });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (show) {
      fetchLocations();
    }
  }, [show]);

  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/locations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocations(res.data);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const handleChange = (e) => {
    setNewLocation({ ...newLocation, [e.target.name]: e.target.value });
  };

  const handleSaveLocation = async () => {
    if (!newLocation.business || !newLocation.branch || !newLocation.city) {
      toast.warning('Please fill all fields.');
      return;
    }
  
    if (editingId) {
      // UPDATE existing
      try {
        await axios.patch(`${API_BASE_URL}/api/locations/${editingId}`, newLocation, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Location updated successfully!');
        fetchLocations();
        setEditingId(null);
        setNewLocation({ business: '', branch: '', city: '' });
        if (onLocationUpdate) onLocationUpdate();
      } catch (err) {
        console.error('Failed to update location:', err);
        toast.error('❌ Failed to update location.');
      }
    } else {
      // ADD new
      try {
        const res = await axios.post(`${API_BASE_URL}/api/locations`, newLocation, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('✅ Location added successfully!');
        setLocations(prev => [...prev, res.data]);
        setNewLocation({ business: '', branch: '', city: '' });
        if (onLocationUpdate) onLocationUpdate();
  
        // 👉 Create New Branch Notification (ADD THIS)
        await createBranchNotification(res.data.branch, res.data.city);
  
      } catch (err) {
        console.error('Failed to add location:', err);
        toast.error('❌ Failed to add location.');
      }
    }
  };

  // 🔥 Create branch notification
const createBranchNotification = async (branchName, cityName) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.post(`${API_BASE_URL}/api/notifications`, {
      title: 'New Branch Opened',
      message: `You opened a new branch "${branchName}" in ${cityName}.`
    }, config);
  } catch (error) {
    console.error('Failed to create branch notification:', error);
  }
};

  const handleEditLocation = (location) => {
    setNewLocation({
      business: location.business,
      branch: location.branch,
      city: location.city,
    });
    setEditingId(location._id);
  };

  const handleDeleteLocation = async (id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this location?')) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/locations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('🗑️ Location deleted successfully!');
      setLocations(prev => prev.filter(loc => loc._id !== id));
      if (onLocationUpdate) onLocationUpdate(null);  // No new notification for delete
    } catch (err) {
      console.error('Failed to delete location:', err);
      toast.error('❌ Failed to delete location.');
    }
  };

  if (!show) return null;

  return (
    <div className="location-modal-overlay">
      <div className="location-modal-box">
        {/* Modal Header */}
        <div className="location-modal-header">
          <h2>Manage Locations</h2>
          <FaTimes className="close-btn" onClick={onClose} />
        </div>

        {/* Add/Update Form */}
        <div className="location-form">
          <input
            type="text"
            name="business"
            value={newLocation.business}
            onChange={handleChange}
            placeholder="Business Name"
          />
          <input
            type="text"
            name="branch"
            value={newLocation.branch}
            onChange={handleChange}
            placeholder="Branch Name"
          />
          <input
            type="text"
            name="city"
            value={newLocation.city}
            onChange={handleChange}
            placeholder="City"
          />
          <button className="save-btn" onClick={handleSaveLocation}>
            {editingId ? '✏️ Update' : '➕ Save'}
          </button>
        </div>

        {/* Locations List */}
        <div className="locations-list">
          {locations.length > 0 ? (
            locations.map((loc) => (
              <div key={loc._id} className="location-item">
                <div>
                  <strong>{loc.business}</strong> — {loc.branch} ({loc.city})
                </div>
                <div className="location-actions">
                  <FaEdit
                    className="action-icon"
                    title="Edit"
                    onClick={() => handleEditLocation(loc)}
                  />
                  <FaTrash
                    className="action-icon"
                    title="Delete"
                    onClick={() => handleDeleteLocation(loc._id)}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="no-locations">No locations added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
