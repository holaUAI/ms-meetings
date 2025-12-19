import Participant from '../models/participant.model.js';
import Meeting from '../../meetings/models/meeting.model.js';
import { parseDate } from '../../shared/utils/parseDate.js';

export const saveParticipant = async (req, res) => {
    try {
        // Extraer el objeto de datos, tal como lo recomendaste.
        const participantData = req.body?.payload?.object;

        if (!participantData) {
            return res.status(400).json({ error: 'Payload inválido o faltante. Se esperaba req.body.payload.object.' });
        }

        // Usar el método findOrCreate con los datos ya extraídos.
        const { participant, created } = await Participant.findOrCreate(participantData);

        // La lógica para verificar el retraso del host solo se ejecuta si el participante
        // es el host y es la primera vez que se guarda (created === true).
        if (participant.is_host && created) {
            const { meeting_id, join_time } = participant;

            // Asegurarse de que join_time exista antes de proceder.
            if (join_time) {
                const meeting = await Meeting.getByMeetingId(Number(meeting_id));
                if (!meeting) {
                    console.warn(`⚠️ Reunión no encontrada para meeting_id: ${meeting_id}`);
                } else if (meeting.delay) {
                    console.log('✅ Reunión ya marcada como con delay, no se actualiza nuevamente');
                } else {
                    const joinTime = parseDate(join_time);
                    const startTime = parseDate(meeting.start_time);

                    const delayInMin = Math.floor((joinTime - startTime) / 60000);

                    if (delayInMin > 5) {
                        await Meeting.updateDelayByMeetingId(Number(meeting_id), true, delayInMin);
                        console.log(`🚨 Host tardó ${delayInMin} min en ingresar. Marcado como delay.`);
                    } else {
                        console.log('✅ Host ingresó a tiempo');
                    }
                }
            } else {
                console.warn(`⚠️ El host no tiene join_time, no se puede calcular el retraso.`);
            }
        }

        const message = created ? 'Participante guardado exitosamente' : 'El participante ya existía, no se realizaron cambios.';
        const statusCode = created ? 201 : 200;

        return res.status(statusCode).json({
            status: 'ok',
            message: message,
            data: participant,
        });
    } catch (error) {
        console.error('🔥 Error al guardar participante:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al guardar el participante',
            error: error.message,
        });
    }
};

export const getAllParticipants = async (_req, res) => {
    try {
        const participants = await Participant.getAllParticipants();

        return res.status(200).json({
            status: 'ok',
            message: 'Participantes obtenidos exitosamente',
            data: participants,
        });
    } catch (error) {
        console.error('🔥 Error al obtener participantes:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al obtener los participantes',
            error: error.message,
        });
    }
};


export const getParticipantsByMeetingId = async (req, res) => {
    try {
        const { meeting_id } = req.params;

        if (!meeting_id) {
            return res.status(400).json({ error: 'meeting_id es requerido' });
        }

        const participants = await Participant.getAllParticipantsByMeetingId(meeting_id);
        return res.json(participants);
    } catch (error) {
        console.error('Error al obtener participantes:', error);
        return res.status(500).json({ error: 'Error al obtener participantes' });
    }
};

export const getAllHosts = async (_req, res) => {
    try {
        const hosts = await Participant.getAllHosts();

        return res.status(200).json({
            status: 'ok',
            message: 'Anfitriones obtenidos exitosamente',
            data: hosts,
        });
    } catch (error) {
        console.error('🔥 Error al obtener anfitriones:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al obtener los anfitriones',
            error: error.message,
        });
    }
};

export const getHostByHostId = async (req, res) => {
    try {
        const { host_id } = req.params;

        if (!host_id) {
            return res.status(400).json({
                status: 'error',
                message: 'host_id no proporcionado',
            });
        }

        const host = await Participant.getHostByHostId(host_id);

        if (!host) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró un anfitrión con ese host_id',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Anfitrión obtenido exitosamente',
            data: host,
        });
    } catch (error) {
        console.error('🔥 Error al obtener anfitrión:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al obtener anfitrión',
            error: error.message,
        });
    }
};

export const deleteParticipantById = async (req, res) => {
    try {
        const { participant_id } = req.params;

        if (!participant_id) {
            return res.status(400).json({
                status: 'error',
                message: 'El ID del participante es requerido para la eliminación.',
            });
        }

        const result = await Participant.deleteById(participant_id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No se encontró un participante con el ID proporcionado.',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Participante eliminado exitosamente.',
        });
    } catch (error) {
        console.error('🔥 Error al eliminar participante:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al eliminar el participante.',
            error: error.message,
        });
    }
};

export const deleteParticipantsByMeetingId = async (req, res) => {
    try {
        const { meeting_id } = req.params;

        if (!meeting_id) {
            return res.status(400).json({
                status: 'error',
                message: 'El ID de la reunión es requerido para la eliminación.',
            });
        }

        const result = await Participant.deleteByMeetingId(meeting_id);

        if (result.affectedRows === 0) {
            return res.status(200).json({
                status: 'ok',
                message: 'No se encontraron participantes para la reunión con el ID proporcionado, no se eliminó nada.',
                data: { deleted_count: 0 },
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: `Se eliminaron ${result.affectedRows} participantes exitosamente.`,
            data: { deleted_count: result.affectedRows },
        });
    } catch (error) {
        console.error('🔥 Error al eliminar participantes por meeting_id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al eliminar los participantes.',
            error: error.message,
        });
    }
};
