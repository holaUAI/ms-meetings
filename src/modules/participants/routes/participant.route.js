import { Router } from 'express';
import {
    saveParticipant,
    getAllHosts,
    getAllParticipants,
    getHostByHostId,
    getParticipantsByMeetingId,
    deleteParticipantById,
    deleteParticipantsByMeetingId // Importamos la nueva función
} from '../controllers/participant.controller.js';

const ParticipantRouter = Router();

ParticipantRouter.post('/save', saveParticipant);
ParticipantRouter.get('/all-participants', getAllParticipants);
ParticipantRouter.get('/all-participants-by-meeting/:meeting_id', getParticipantsByMeetingId);
ParticipantRouter.get('/all-hosts', getAllHosts);
ParticipantRouter.get('/by-host-id/:host_id', getHostByHostId);
ParticipantRouter.delete('/delete/:participant_id', deleteParticipantById);

// Nueva ruta para eliminar participantes por meeting_id
ParticipantRouter.delete('/delete/by-meeting-id/:meeting_id', deleteParticipantsByMeetingId);

export default ParticipantRouter;