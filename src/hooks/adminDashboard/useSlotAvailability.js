import { useState, useEffect } from 'react';
import { roomsAPI, timetablesAPI } from '../../utils/api';
import { dayNameToNumber, timeToMinutes } from '../../utils/adminDashboard';

/**
 * Custom hook for checking slot availability (rooms and teachers)
 */
export const useSlotAvailability = (
  newSlot,
  selectedTimetableId,
  timetables,
  courses,
  teachers,
  showSlotModal,
  editingSlotId,
) => {
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Check availability for rooms and teachers based on selected time
  const checkAvailability = async () => {
    if (
      !newSlot.day_of_week ||
      !newSlot.start_time ||
      !newSlot.end_time ||
      !selectedTimetableId
    ) {
      setAvailableRooms([]);
      setAvailableTeachers([]);
      return;
    }

    setCheckingAvailability(true);
    try {
      const dayNumber = dayNameToNumber(newSlot.day_of_week);
      if (dayNumber === null) {
        setAvailableRooms([]);
        setAvailableTeachers([]);
        setCheckingAvailability(false);
        return;
      }

      // Check room availability
      try {
        const roomAvailability = await roomsAPI.checkAvailability({
          day_of_week: dayNumber,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
        });
        setAvailableRooms(
          roomAvailability.available_rooms || roomAvailability || [],
        );
      } catch (err) {
        console.error('Error checking room availability:', err);
        setAvailableRooms([]);
      }

      // Check teacher availability by getting all slots and filtering
      // Teachers are available if they don't have conflicting slots
      try {
        const selectedTimetable = timetables.find(
          (t) => String(t.id) === String(selectedTimetableId),
        );
        const levelId = selectedTimetable?.level_id
          ? Number(selectedTimetable.level_id)
          : null;

        // Get all slots for the same semester and academic year
        const allTimetablesData = await timetablesAPI.getAll({
          include_slots: true,
        });
        const allTimetables = Array.isArray(allTimetablesData)
          ? allTimetablesData
          : allTimetablesData.data || [];

        // Filter timetables by same semester and academic year
        const sameSemesterTimetables = allTimetables.filter((tt) => {
          return (
            tt.semester === selectedTimetable?.semester &&
            tt.academic_year === selectedTimetable?.academic_year
          );
        });

        // Get all conflicting slots
        const conflictingSlots = [];
        sameSemesterTimetables.forEach((tt) => {
          if (tt.slots && Array.isArray(tt.slots)) {
            tt.slots.forEach((slot) => {
              if (
                slot.day_of_week === dayNumber &&
                slot.start_time &&
                slot.end_time &&
                slot.teacher_id &&
                slot.id !== editingSlotId // Exclude current slot when editing
              ) {
                const slotStart = timeToMinutes(slot.start_time);
                const slotEnd = timeToMinutes(slot.end_time);
                const newStart = timeToMinutes(newSlot.start_time);
                const newEnd = timeToMinutes(newSlot.end_time);

                // Check for time overlap
                if (slotStart < newEnd && slotEnd > newStart) {
                  conflictingSlots.push(slot.teacher_id);
                }
              }
            });
          }
        });

        // Filter teachers who teach courses at this level and are available
        const levelTeachers = levelId
          ? teachers.filter((teacher) => {
              return courses.some(
                (c) =>
                  c.level_id &&
                  Number(c.level_id) === levelId &&
                  c.teacher_id &&
                  Number(c.teacher_id) === Number(teacher.id),
              );
            })
          : teachers;

        const available = levelTeachers.filter(
          (teacher) => !conflictingSlots.includes(Number(teacher.id)),
        );
        setAvailableTeachers(available);
      } catch (err) {
        console.error('Error checking teacher availability:', err);
        // Fallback: show all teachers for the level
        const selectedTimetable = timetables.find(
          (t) => String(t.id) === String(selectedTimetableId),
        );
        const levelId = selectedTimetable?.level_id
          ? Number(selectedTimetable.level_id)
          : null;
        const levelTeachers = levelId
          ? teachers.filter((teacher) => {
              return courses.some(
                (c) =>
                  c.level_id &&
                  Number(c.level_id) === levelId &&
                  c.teacher_id &&
                  Number(c.teacher_id) === Number(teacher.id),
              );
            })
          : teachers;
        setAvailableTeachers(levelTeachers);
      }
    } catch (err) {
      console.error('Error checking availability:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Check availability when time/day changes
  useEffect(() => {
    if (showSlotModal && selectedTimetableId) {
      const timeoutId = setTimeout(() => {
        checkAvailability();
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    } else {
      setAvailableRooms([]);
      setAvailableTeachers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    newSlot.day_of_week,
    newSlot.start_time,
    newSlot.end_time,
    showSlotModal,
    selectedTimetableId,
    editingSlotId,
  ]);

  const clearAvailability = () => {
    setAvailableRooms([]);
    setAvailableTeachers([]);
    setCheckingAvailability(false);
  };

  return {
    availableRooms,
    availableTeachers,
    checkingAvailability,
    clearAvailability,
  };
};
