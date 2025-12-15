import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFromStorage } from '../../utils/storage';
import {
  timetablesAPI,
  departmentsAPI,
  levelsAPI,
  coursesAPI,
  roomsAPI,
  teachersAPI,
} from '../../utils/api';

/**
 * Custom hook for Admin Dashboard data management
 */
export const useAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timetables, setTimetables] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [levels, setLevels] = useState([]);
  const [courses, setCourses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const token = getFromStorage('auth_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch essential data first (fast - without slots)
  useEffect(() => {
    const fetchEssentialData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch essential data in parallel (without slots - much faster)
        const [
          timetablesData,
          departmentsData,
          levelsData,
          coursesData,
          roomsData,
          teachersData,
        ] = await Promise.all([
          timetablesAPI.getAll({ include_slots: false }),
          departmentsAPI.getAll(),
          levelsAPI.getAll({ active_only: true }),
          coursesAPI.getAll(),
          roomsAPI.getAll(),
          teachersAPI.getAll(),
        ]);

        // Set timetables without slots
        setTimetables(
          Array.isArray(timetablesData)
            ? timetablesData
            : timetablesData.data || [],
        );

        // Set departments
        setDepartments(
          Array.isArray(departmentsData)
            ? departmentsData
            : departmentsData.data || [],
        );

        // Set levels, courses, rooms, teachers
        setLevels(
          Array.isArray(levelsData) ? levelsData : levelsData.data || [],
        );
        setCourses(
          Array.isArray(coursesData) ? coursesData : coursesData.data || [],
        );
        setRooms(Array.isArray(roomsData) ? roomsData : roomsData.data || []);
        setTeachers(
          Array.isArray(teachersData) ? teachersData : teachersData.data || [],
        );
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load data');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEssentialData();
  }, []); // Empty dependency array - fetch only once on mount

  // Auto-dismiss success messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Auto-dismiss error messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    activeTab,
    setActiveTab,
    timetables,
    setTimetables,
    departments,
    setDepartments,
    levels,
    courses,
    rooms,
    teachers,
    loading,
    error,
    setError,
    success,
    setSuccess,
  };
};
