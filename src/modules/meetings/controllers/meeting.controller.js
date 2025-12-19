
import Meeting from '../models/meeting.model.js';
import Participant from '../../participants/models/participant.model.js';
import Rating from '../../ratings/models/rating.model.js';
import { parseDate } from '../../shared/utils/parseDate.js';

export const saveMeeting = async (req, res) => {
    try {
        const payload = req.body?.payload;

        if (!payload || !payload.object) return res.status(400).json({ error: 'Payload inválido' });

        const meeting = Meeting.fromZoomPayload(payload);
        await meeting.save();

        return res.status(201).json({
            status: 'ok',
            message: 'Reunión guardada exitosamente',
            data: meeting
        });
    } catch (error) {
        console.error('🔥 Error al guardar la reunión:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al guardar la reunión',
            error: error.message
        });
    }
};

export const deleteMeetingByMeetingId = async (req, res) => {
    try {
        const { meeting_id } = req.params;

        if (!meeting_id) {
            return res.status(400).json({
                status: 'error',
                message: 'meeting_id no proporcionado',
            });
        }

        const deleted = await Meeting.deleteByMeetingId(Number(meeting_id));

        if (!deleted) {
            return res.status(404).json({
                status: 'error',
                message: 'Reunión no encontrada con ese meeting_id',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Reunión eliminada exitosamente',
            data: deleted,
        });
    } catch (error) {
        console.error('🔥 Error al eliminar la reunión por meeting_id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al eliminar la reunión',
            error: error.message,
        });
    }
};

export const updateMeetingStatusById = async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const { status } = req.body;

        if (!meeting_id || !status) {
            return res.status(400).json({
                status: 'error',
                message: 'meeting_id y status son requeridos',
            });
        }

        const updated = await Meeting.updateStatusByMeetingId(Number(meeting_id), status);

        if (!updated) {
            return res.status(404).json({
                status: 'error',
                message: 'Reunión no encontrada',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Estado de reunión actualizado correctamente',
            data: updated,
        });
    } catch (error) {
        console.error('🔥 Error al actualizar status de reunión:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al actualizar status',
            error: error.message,
        });
    }
};

export const updateMeetingByMeetingId = async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const dataToUpdate = req.body;

        if (!meeting_id) {
            return res.status(400).json({
                status: 'error',
                message: 'El meeting_id es requerido',
            });
        }

        if (!dataToUpdate || Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No se proporcionaron datos para actualizar',
            });
        }

        const updated = await Meeting.updateMeetingByMeetingId(Number(meeting_id), dataToUpdate);

        if (!updated) {
            return res.status(404).json({
                status: 'error',
                message: 'Reunión no encontrada con ese meeting_id',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Reunión actualizada exitosamente',
            data: updated,
        });
    } catch (error) {
        console.error('🔥 Error al actualizar la reunión:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al actualizar la reunión',
            error: error.message,
        });
    }
};

export const updateMeetingByOccurrenceId = async (req, res) => {
    try {
        const { occurrence_id } = req.params;
        const { meeting_id, ...dataToUpdate } = req.body;

        if (!occurrence_id || !meeting_id) {
            return res.status(400).json({
                status: 'error',
                message: 'El occurrence_id (en la URL) y el meeting_id (en el body) son requeridos',
            });
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No se proporcionaron datos para actualizar',
            });
        }

        const updated = await Meeting.updateMeetingByOccurrenceId(occurrence_id, meeting_id, dataToUpdate);

        if (!updated) {
            return res.status(404).json({
                status: 'error',
                message: 'Reunión no encontrada con la combinación de occurrence_id y meeting_id',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Reunión actualizada exitosamente por occurrence_id y meeting_id',
            data: updated,
        });
    } catch (error) {
        console.error('🔥 Error al actualizar la reunión por occurrence_id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al actualizar la reunión',
            error: error.message,
        });
    }
};

export const updateMeetingStatusByOccurrenceId = async (req, res) => {
    try {
        const { occurrence_id } = req.params;
        const { status, meeting_id } = req.body;

        if (!occurrence_id || !status || !meeting_id) {
            return res.status(400).json({
                status: 'error',
                message: 'El occurrence_id (en la URL), y el status y meeting_id (en el body) son requeridos',
            });
        }

        const updated = await Meeting.updateStatusByOccurrenceId(occurrence_id, meeting_id, status);

        if (!updated) {
            return res.status(404).json({
                status: 'error',
                message: 'Reunión no encontrada con la combinación de occurrence_id y meeting_id',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Estado de reunión actualizado correctamente por occurrence_id y meeting_id',
            data: updated,
        });
    } catch (error) {
        console.error('🔥 Error al actualizar status de reunión por occurrence_id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al actualizar status',
            error: error.message,
        });
    }
};

export const updateMeetingSummaryById = async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const { summary } = req.body;

        console.log('Updating summary for meeting_id:', meeting_id, 'with summary:', summary);

        if (!meeting_id || typeof summary !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'meeting_id y summary son requeridos',
            });
        }

        const updated = await Meeting.updateSummaryByMeetingId(Number(meeting_id), summary);

        if (!updated) {
            return res.status(404).json({
                status: 'error',
                message: 'Reunión no encontrada',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Resumen actualizado correctamente',
            data: updated,
        });
    } catch (error) {
        console.error('🔥 Error al actualizar summary de reunión:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al actualizar summary',
            error: error.message,
        });
    }
};

export const updateMeetingSummaryByOccurrenceId = async (req, res) => {
    try {
        const { occurrence_id } = req.params;
        const { summary, meeting_id } = req.body;

        if (!occurrence_id || typeof summary !== 'string' || !meeting_id) {
            return res.status(400).json({
                status: 'error',
                message: 'El occurrence_id (en la URL) y el summary y meeting_id (en el body) son requeridos',
            });
        }

        const updated = await Meeting.updateSummaryByOccurrenceId(occurrence_id, meeting_id, summary);

        if (!updated) {
            return res.status(404).json({
                status: 'error',
                message: 'Reunión no encontrada con la combinación de occurrence_id y meeting_id',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Resumen actualizado correctamente por occurrence_id y meeting_id',
            data: updated,
        });
    } catch (error) {
        console.error('🔥 Error al actualizar summary de reunión por occurrence_id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al actualizar summary',
            error: error.message,
        });
    }
};

export const getAllMeetings = async (_req, res) => {
    try {
        const meetings = await Meeting.getAll();

        return res.status(200).json({
            status: 'ok',
            message: 'Reuniones obtenidas exitosamente',
            data: meetings,
        });
    } catch (error) {
        console.error('🔥 Error al obtener reuniones:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al obtener las reuniones',
            error: error.message,
        });
    }
};

export const getMeetingsByStatus = async (req, res) => {
    try {
        const { status } = req.params;

        if (!status) {
            return res.status(400).json({
                status: 'error',
                message: 'El status no fue proporcionado en la URL',
            });
        }

        const meetings = await Meeting.getAllByFilters({ status });

        return res.status(200).json({
            status: 'ok',
            message: `Se encontraron ${meetings.length} reuniones con el status: ${status}`,
            data: meetings,
        });

    } catch (error) {
        console.error(`🔥 Error al obtener reuniones por status (${status}):`, error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al obtener las reuniones por status',
            error: error.message,
        });
    }
};

export const getMeetingsByFilters = async (req, res) => {
    try {
        const filters = req.query;
        const meetings = await Meeting.getAllByFilters(filters);

        return res.status(200).json({
            status: 'ok',
            message: `Se encontraron ${meetings.length} reuniones con los filtros aplicados`,
            data: meetings,
        });

    } catch (error) {
        console.error(`🔥 Error al obtener reuniones por filtros:`, error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al obtener las reuniones por filtros',
            error: error.message,
        });
    }
};

export const getMeetingsGroupedByStatus = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const rawMeetings = await Meeting.getLastMeetings(limit);

        const now = new Date();
        const grouped = {
            pending: [],
            started: [],
            finished: [],
            not_open: [],
        };

        for (const meeting of rawMeetings) {
            const startTime = parseDate(meeting.start_time);

            if (meeting.status === 'pending') {
                if (startTime > now) {

                    console.log("startime", startTime);
                    console.log("now", now);
                    grouped.pending.push(meeting);
                } else {
                    grouped.not_open.push(meeting);
                }
            } else if (meeting.status === 'started') {
                grouped.started.push(meeting);
            } else if (meeting.status === 'finished') {
                grouped.finished.push(meeting);
            }
        }

        return res.status(200).json({
            status: 'ok',
            message: `Últimas ${limit} reuniones agrupadas correctamente`,
            data: grouped,
        });
    } catch (error) {
        console.error('🔥 Error al agrupar reuniones:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al agrupar reuniones',
            error: error.message,
        });
    }
};

export const getTodayMeetingsGroupedByStatus = async (req, res) => {
    try {
        const rawMeetings = await Meeting.getTodayMeetings();

        const now = new Date();
        const grouped = {
            pending: [],
            started: [],
            finished: [],
            not_open: [],
        };

        for (const meeting of rawMeetings) {
            const startTime = parseDate(meeting.start_time);

            if (!startTime) {
                console.warn(`⛔ start_time inválido para meeting_id ${meeting.meeting_id}: ${meeting.start_time}`);
                continue;
            }

            if (meeting.status === 'pending') {
                if (startTime > now) {
                    grouped.pending.push(meeting);
                } else {
                    grouped.not_open.push(meeting);
                }
            } else if (meeting.status === 'started') {
                grouped.started.push(meeting);
            } else if (meeting.status === 'finished') {
                grouped.finished.push(meeting);
            }
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Reuniones de hoy agrupadas correctamente',
            data: grouped,
        });
    } catch (error) {
        console.error('🔥 Error al agrupar reuniones de hoy:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al agrupar reuniones de hoy',
            error: error.message,
        });
    }
};

export const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: 'error',
                message: 'ID de la reunión no proporcionado',
            });
        }

        const meeting = await Meeting.getById(id);

        if (!meeting) {
            return res.status(404).json({
                status: 'error',
                message: 'Reunión no encontrada',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Reunión obtenida exitosamente',
            data: meeting,
        });
    } catch (error) {
        console.error('🔥 Error al obtener la reunión por ID:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al obtener la reunión',
            error: error.message,
        });
    }
};

export const getMeetingByMeetingId = async (req, res) => {
    try {
        const { meeting_id } = req.params;
        const { occurrence_id } = req.query; // Obtener el occurrence_id desde los query params

        if (!meeting_id) {
            return res.status(400).json({
                status: 'error',
                message: 'El meeting_id no fue proporcionado',
            });
        }

        const meeting = await Meeting.getByMeetingId(meeting_id, occurrence_id);

        if (!meeting) {
            return res.status(404).json({
                status: 'error',
                message: 'Reunión no encontrada con los parámetros proporcionados',
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: 'Reunión obtenida exitosamente',
            data: meeting,
        });
    } catch (error) {
        console.error('🔥 Error al obtener la reunión por meeting_id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al obtener la reunión',
            error: error.message,
        });
    }
};

export const getAllMeetingsByMeetingId = async (req, res) => {
    try {
        const { meeting_id } = req.params;

        if (!meeting_id) {
            return res.status(400).json({
                status: 'error',
                message: 'El meeting_id no fue proporcionado',
            });
        }

        const meetings = await Meeting.getAllByMeetingId(meeting_id);

        if (!meetings || meetings.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: `No se encontraron reuniones con el meeting_id: ${meeting_id}`,
            });
        }

        return res.status(200).json({
            status: 'ok',
            message: `Se encontraron ${meetings.length} reuniones con el meeting_id: ${meeting_id}`,
            data: meetings,
        });
    } catch (error) {
        console.error('🔥 Error al obtener todas las reuniones por meeting_id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error al obtener las reuniones',
            error: error.message,
        });
    }
};

/**
 * NUEVO CONTROLADOR
 * Verifica si existe una reunión que coincida con un meeting_id y occurrence_id específicos.
 */
export const checkMeetingExists = async (req, res) => {
    try {
        const { meeting_id, occurrence_id } = req.params;

        if (!meeting_id || !occurrence_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Tanto meeting_id como occurrence_id son requeridos en la URL',
            });
        }

        const meetingDoc = await Meeting.findByMeetingAndOccurrenceId(meeting_id, occurrence_id);

        // Devolvemos un booleano simple indicando si existe o no
        return res.status(200).json({
            status: 'ok',
            exists: !!meetingDoc, // Convierte el resultado (documento o null) a true/false
        });

    } catch (error) {
        console.error('🔥 Error al verificar la existencia de la reunión:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error interno al verificar la reunión',
            error: error.message,
        });
    }
};

export const getGroupedDelays = async (_req, res) => {
    try {
        const data = await Meeting.getGroupedDelaysByHostId();

        return res.status(200).json({
            status: 'ok',
            message: 'Tardanzas agrupadas por host obtenidas correctamente',
            data,
        });
    } catch (error) {
        console.error('🔥 Error al agrupar tardanzas por host:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al obtener la información de tardanza',
            error: error.message,
        });
    }
};

export const getTopDelayedHosts = async (_, res) => {
    try {
        const topDelayedHosts = await Meeting.getTopDelayedHosts(5);

        return res.status(200).json({
            status: 'ok',
            message: 'Top de hosts con más tardanzas obtenido correctamente',
            data: topDelayedHosts,
        });
    } catch (error) {
        console.error('🔥 Error al obtener top de hosts con tardanza:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al obtener el top de tardanzas',
            error: error.message,
        });
    }
};

export const getHostsMoreInfo = async (_, res) => {
    try {
        const data = await Meeting.getHostsMoreInfo();

        return res.status(200).json({
            status: 'ok',
            data,
        });
    } catch (error) {
        console.error('🔥 Error al obtener top de hosts con tardanza:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al obtener el top de tardanzas',
            error: error.message,
        });
    }
};

export const getMeetingsByHostId = async (req, res) => {
    try {
        const { host_id } = req.params;

        if (!host_id) {
            return res.status(400).json({
                status: 'error',
                message: 'host_id no proporcionado',
            });
        }

        // Traer todas las reuniones
        const meetings = await Meeting.getAllByHostId(host_id);

        if (!meetings.length) {
            return res.status(200).json({
                status: 'ok',
                message: 'No se encontraron reuniones para este host',
                data: [],
            });
        }

        // Enriquecer reuniones con el número de participantes y el promedio de score
        const enrichedMeetings = await Promise.all(
            meetings.map(async (meeting) => {
                // participantes
                const participants = await Participant.getAllParticipantsByMeetingId(
                    String(meeting.meeting_id)
                );

                // promedio de score
                const score = await Rating.getAverageByMeetingId(
                    String(meeting.meeting_id)
                );

                return {
                    ...meeting,
                    num_participants: participants.length,
                    score: score ?? null, // null si no hay ratings
                };
            })
        );

        return res.status(200).json({
            status: 'ok',
            message: `Reuniones del host ${host_id} obtenidas correctamente`,
            data: enrichedMeetings,
        });
    } catch (error) {
        console.error('🔥 Error al obtener reuniones por host_id:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno al obtener las reuniones',
            error: error.message,
        });
    }
};
