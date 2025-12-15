// Clash detection utilities

import { timeToMinutes, formatTimeSlot } from './timetableHelpers';
import { DAY_MAP } from '../../constants/adminDashboard';

/**
 * Check if a slot has a clash
 * @param {Object} slot - Slot object
 * @param {Array} clashes - Array of clash objects
 * @returns {boolean} True if slot has a clash
 */
export const hasClash = (slot, clashes) => {
  if (!slot || !clashes || clashes.length === 0) return false;
  return clashes.some(
    (clash) =>
      (clash.slot1?.id === slot.id || clash.slot2?.id === slot.id) &&
      (clash.type === 'room' || clash.type === 'teacher'),
  );
};

/**
 * Get clash details for a slot
 * @param {Object} slot - Slot object
 * @param {Array} clashes - Array of clash objects
 * @returns {Array} Array of clash objects related to this slot
 */
export const getClashDetails = (slot, clashes) => {
  if (!slot || !clashes || clashes.length === 0) return [];
  return clashes.filter(
    (clash) => clash.slot1?.id === slot.id || clash.slot2?.id === slot.id,
  );
};

/**
 * Detect clashes in slots
 * @param {Array} slots - Array of slot objects
 * @returns {Array} Array of clash objects
 */
export const detectClashes = (slots) => {
  if (!slots || slots.length === 0) return [];
  const clashList = [];
  const roomDaySlots = new Map();
  const teacherDaySlots = new Map();

  // Group slots by room and day
  slots.forEach((slot) => {
    if (
      !slot ||
      slot.room_id === null ||
      slot.room_id === undefined ||
      slot.day_of_week === null ||
      slot.day_of_week === undefined
    )
      return;
    const key = `${slot.room_id}-${slot.day_of_week}`;
    if (!roomDaySlots.has(key)) {
      roomDaySlots.set(key, []);
    }
    roomDaySlots.get(key).push(slot);
  });

  // Group slots by teacher and day
  slots.forEach((slot) => {
    if (
      !slot ||
      slot.teacher_id === null ||
      slot.teacher_id === undefined ||
      slot.day_of_week === null ||
      slot.day_of_week === undefined
    )
      return;
    const key = `${slot.teacher_id}-${slot.day_of_week}`;
    if (!teacherDaySlots.has(key)) {
      teacherDaySlots.set(key, []);
    }
    teacherDaySlots.get(key).push(slot);
  });

  // Check for room clashes
  roomDaySlots.forEach((slots) => {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];
        if (
          !slot1 ||
          !slot2 ||
          !slot1.start_time ||
          !slot1.end_time ||
          !slot2.start_time ||
          !slot2.end_time
        )
          continue;
        const start1 = timeToMinutes(slot1.start_time);
        const end1 = timeToMinutes(slot1.end_time);
        const start2 = timeToMinutes(slot2.start_time);
        const end2 = timeToMinutes(slot2.end_time);
        if (start1 < end2 && end1 > start2) {
          clashList.push({
            type: 'room',
            slot1,
            slot2,
            room_name: slot1.room_name || 'Unknown Room',
            room_id: slot1.room_id,
            day: DAY_MAP[slot1.day_of_week],
            day_of_week: slot1.day_of_week,
            time_slot1: formatTimeSlot(slot1.start_time, slot1.end_time),
            time_slot2: formatTimeSlot(slot2.start_time, slot2.end_time),
            department1: slot1.department_name || 'Unknown Department',
            department2: slot2.department_name || 'Unknown Department',
            level1: slot1.level_name || slot1.level_code || 'Unknown Level',
            level2: slot2.level_name || slot2.level_code || 'Unknown Level',
            course1: slot1.course_name || slot1.course?.name || 'Unknown',
            course2: slot2.course_name || slot2.course?.name || 'Unknown',
            course_code1: slot1.course_code || slot1.course?.code || 'N/A',
            course_code2: slot2.course_code || slot2.course?.code || 'N/A',
            teacher1:
              slot1.teacher_name ||
              slot1.teacher?.name ||
              slot1.teacher?.full_name ||
              'TBA',
            teacher2:
              slot2.teacher_name ||
              slot2.teacher?.name ||
              slot2.teacher?.full_name ||
              'TBA',
            room1: slot1.room_name || slot1.room?.name || 'Unknown',
            room2: slot2.room_name || slot2.room?.name || 'Unknown',
          });
        }
      }
    }
  });

  // Check for teacher clashes
  teacherDaySlots.forEach((slots) => {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];
        if (
          !slot1 ||
          !slot2 ||
          !slot1.start_time ||
          !slot1.end_time ||
          !slot2.start_time ||
          !slot2.end_time
        )
          continue;
        const start1 = timeToMinutes(slot1.start_time);
        const end1 = timeToMinutes(slot1.end_time);
        const start2 = timeToMinutes(slot2.start_time);
        const end2 = timeToMinutes(slot2.end_time);
        if (start1 < end2 && end1 > start2) {
          clashList.push({
            type: 'teacher',
            slot1,
            slot2,
            teacher_name:
              slot1.teacher_name ||
              slot1.teacher?.name ||
              slot1.teacher?.full_name ||
              'Unknown Teacher',
            teacher_id: slot1.teacher_id,
            day: DAY_MAP[slot1.day_of_week],
            day_of_week: slot1.day_of_week,
            time_slot1: formatTimeSlot(slot1.start_time, slot1.end_time),
            time_slot2: formatTimeSlot(slot2.start_time, slot2.end_time),
            department1: slot1.department_name || 'Unknown Department',
            department2: slot2.department_name || 'Unknown Department',
            level1: slot1.level_name || slot1.level_code || 'Unknown Level',
            level2: slot2.level_name || slot2.level_code || 'Unknown Level',
            course1: slot1.course_name || slot1.course?.name || 'Unknown',
            course2: slot2.course_name || slot2.course?.name || 'Unknown',
            course_code1: slot1.course_code || slot1.course?.code || 'N/A',
            course_code2: slot2.course_code || slot2.course?.code || 'N/A',
            teacher1:
              slot1.teacher_name ||
              slot1.teacher?.name ||
              slot1.teacher?.full_name ||
              'TBA',
            teacher2:
              slot2.teacher_name ||
              slot2.teacher?.name ||
              slot2.teacher?.full_name ||
              'TBA',
            room1: slot1.room_name || slot1.room?.name || 'Unknown',
            room2: slot2.room_name || slot2.room?.name || 'Unknown',
          });
        }
      }
    }
  });

  return clashList;
};
