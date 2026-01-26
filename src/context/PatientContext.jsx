import React, { createContext, useContext, useState, useEffect } from 'react';

const PatientContext = createContext();

import { API_URL, getAuthHeaders, handleResponse } from '../config/api';

export const usePatients = () => {
    return useContext(PatientContext);
};

export const PatientProvider = ({ children }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initial Fetch
    useEffect(() => {
        const fetchPatients = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/patients`, {
                    headers: getAuthHeaders()
                });
                const data = await handleResponse(res);
                setPatients(data);
            } catch (err) {
                console.error("Failed to fetch patients:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const addPatient = async (patientData) => {
        try {
            // Optimistic Update (optional) or wait for server
            // Here we wait for server to get the real ID

            // Map frontend fields to backend expected fields
            // Assuming patientData has id (optional), firstName, lastName, photo...
            // But api expects: patient_id, first_name, last_name, birth_date, photo

            const payload = {
                patient_id: patientData.id || `PAT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
                first_name: patientData.firstName || patientData.first_name || '',
                last_name: patientData.lastName || patientData.last_name || '',
                birth_date: patientData.birthDate || patientData.birth_date || '',
                photo: patientData.photo
            };

            const res = await fetch(`${API_URL}/patients`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const { id } = await handleResponse(res);

            // Add DB ID to the local object for future updates
            const newPatient = { ...payload, id: id, _db_id: id };
            setPatients(prev => [newPatient, ...prev]);
            return newPatient;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updatePatient = async (id, updates) => {
        // 'id' passed here is usually the string ID (PAT-...) from the UI
        // We need to find the internal DB ID (_db_id) to call the API
        const patient = patients.find(p => p.id === id || p.patient_id === id);

        if (!patient || !patient._db_id) {
            console.error("Cannot update patient: missing DB ID");
            return;
        }

        const dbId = patient._db_id;

        try {
            const payload = {
                first_name: updates.firstName || updates.first_name,
                last_name: updates.lastName || updates.last_name,
                birth_date: updates.birthDate || updates.birth_date,
                photo: updates.photo
            };

            await fetch(`${API_URL}/patients/${dbId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            // Update local state (optimistic or synced)
            setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        } catch (err) {
            console.error("Update failed:", err);
            setError(err.message);
        }
    };

    const deletePatient = async (id) => {
        // 'id' is string ID (PAT-...)
        const patient = patients.find(p => p.id === id || p.patient_id === id);
        if (!patient || !patient._db_id) {
            console.error("Cannot delete: not found or missing DB ID");
            return;
        }

        try {
            await fetch(`${API_URL}/patients/${patient._db_id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            setPatients(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
            setError(err.message);
        }
    };

    const getPatient = (id) => {
        // Handle both string ID (search) and int ID (route)
        return patients.find(p => p.id == id || p.patient_id === id);
    };

    // Analysis State Persistence (Keep Local for now or move next?)
    // Analysis is stateless in backend (log only), but this tracks "current active"
    // Keep local for UI state
    const [currentAnalysis, setCurrentAnalysis] = useState(() => {
        const saved = localStorage.getItem('elephmind_current_analysis');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (currentAnalysis) {
            localStorage.setItem('elephmind_current_analysis', JSON.stringify(currentAnalysis));
        }
    }, [currentAnalysis]);

    return (
        <PatientContext.Provider value={{
            patients, loading, error,
            addPatient, updatePatient, deletePatient, getPatient,
            currentAnalysis, setCurrentAnalysis
        }}>
            {children}
        </PatientContext.Provider>
    );
};
