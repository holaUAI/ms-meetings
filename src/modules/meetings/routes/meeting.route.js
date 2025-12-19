
import { Router } from 'express';
import { 
    saveMeeting,
    deleteMeetingByMeetingId,
    getAllMeetings,
    getMeetingById,
    getMeetingByMeetingId,
    getAllMeetingsByMeetingId, 
    getMeetingsByStatus, // 1. Importar el nuevo controlador
    getMeetingsByFilters, // Importar el nuevo controlador de filtros
    getGroupedDelays,
    getTopDelayedHosts,
    updateMeetingStatusById,
    updateMeetingSummaryById,
    getMeetingsGroupedByStatus,
    getTodayMeetingsGroupedByStatus,
    getHostsMoreInfo,
    getMeetingsByHostId,
    updateMeetingByMeetingId,
    updateMeetingByOccurrenceId,
    updateMeetingStatusByOccurrenceId,
    updateMeetingSummaryByOccurrenceId,
    checkMeetingExists
} from '../controllers/meeting.controller.js';

const MeetingRouter = Router();

// --- NUEVA RUTA DE FILTROS ---
MeetingRouter.get('/filter', getMeetingsByFilters);

MeetingRouter.get('/get-hosts-more-info', getHostsMoreInfo)
MeetingRouter.get('/last', getMeetingsGroupedByStatus);
MeetingRouter.get('/grouped-today', getTodayMeetingsGroupedByStatus);
MeetingRouter.get('/grouped-delays', getGroupedDelays);
MeetingRouter.get('/top-delayed-hosts', getTopDelayedHosts);
MeetingRouter.post('/save', saveMeeting);
MeetingRouter.delete('/delete/by-meeting-id/:meeting_id', deleteMeetingByMeetingId);
MeetingRouter.get('/by-host/:host_id', getMeetingsByHostId);
MeetingRouter.patch('/summary/by-occurrence-id/:occurrence_id', updateMeetingSummaryByOccurrenceId);
MeetingRouter.patch('/summary/:meeting_id', updateMeetingSummaryById);
MeetingRouter.patch('/update/by-meeting-id/:meeting_id', updateMeetingByMeetingId);
MeetingRouter.patch('/update/by-occurrence-id/:occurrence_id', updateMeetingByOccurrenceId);
MeetingRouter.patch('/status/by-occurrence-id/:occurrence_id', updateMeetingStatusByOccurrenceId);
MeetingRouter.get('/all', getAllMeetings);
MeetingRouter.patch('/status/:meeting_id', updateMeetingStatusById);
MeetingRouter.get('/all/by-meeting-id/:meeting_id', getAllMeetingsByMeetingId);

// --- NUEVA RUTA DE VERIFICACIÓN ---
MeetingRouter.get('/check-existence/:meeting_id/:occurrence_id', checkMeetingExists);

// --- NUEVA RUTA POR STATUS ---
MeetingRouter.get('/by-status/:status', getMeetingsByStatus);

MeetingRouter.get('/by-meeting-id/:meeting_id', getMeetingByMeetingId);
MeetingRouter.get('/:id', getMeetingById);

export default MeetingRouter;
