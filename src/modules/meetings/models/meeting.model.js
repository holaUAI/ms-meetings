
import db from '../../../config/firebase/firebase.js';
import Participant from '../../participants/models/participant.model.js';
import Rating from '../../ratings/models/rating.model.js';
import { parseDate } from '../../shared/utils/parseDate.js';

class Meeting {
    constructor({
        meeting_id,
        uuid,
        topic,
        start_time,
        join_url,
        start_url, // Añadido para la URL de inicio del anfitrión
        status,
        duration,
        host_id,
        host_email,
        occurrence_id,
        limit_month = null, // 1. Valor por defecto cambiado a null para un string
        delay = false,
        delay_min = 0,
        summary = null,
        actualStartTime = null,
    }) {
        this.meeting_id = meeting_id;
        this.uuid = uuid;
        this.topic = topic;
        this.start_time = start_time;
        this.join_url = join_url || null;
        this.start_url = start_url || null; // Añadido para la URL de inicio del anfitrión
        this.status = status;
        this.duration = duration;
        this.host_id = host_id;
        this.host_email = host_email || null;
        this.occurrence_id = occurrence_id || null;
        this.limit_month = limit_month; // 2. Asignación del valor (esto se mantiene)
        this.delay = delay || false;
        this.delay_min = delay_min || 0;
        this.summary = summary;
        this.actualStartTime = actualStartTime;
    }

    static collection() {
        return db.collection('reuniones');
    }

    static fromZoomPayload(payload) {
        const obj = payload?.object;

        return new Meeting({
            meeting_id: obj?.id ? Number(obj.id) : null,
            uuid: obj?.uuid,
            topic: obj?.topic,
            start_time: obj?.start_time,
            join_url: obj?.join_url,
            start_url: obj?.start_url, // Añadido para la URL de inicio del anfitrión
            status: obj?.status,
            duration: obj?.duration,
            host_id: obj?.host_id,
            host_email: obj?.host_email || null,
            occurrence_id: obj?.occurrence_id,
            summary: obj?.summary || null,
            limit_month: null, // 3. Valor por defecto cambiado a null al crear desde Zoom
        });
    }
    
    static async findByMeetingAndOccurrenceId(meetingId, occurrenceId) {
        console.log(`[DB] Buscando con meetingId: ${meetingId} (tipo: ${typeof meetingId}) y occurrenceId: ${occurrenceId} (tipo: ${typeof occurrenceId})`);

        if (!meetingId || !occurrenceId) {
            console.log('[DB] Búsqueda abortada: meetingId o occurrenceId no proporcionados.');
            return null;
        }
    
        const meetingIdAsNumber = Number(meetingId);
        const meetingIdAsString = String(meetingId);
    
        console.log(`[DB] Buscando con meeting_id IN [${meetingIdAsNumber}, "${meetingIdAsString}"]`);
        const query = Meeting.collection().where('meeting_id', 'in', [meetingIdAsNumber, meetingIdAsString]);
        const snapshot = await query.get();
    
        if (snapshot.empty) {
            console.log('[DB] No se encontraron documentos con ese meeting_id.');
            return null;
        }
        
        console.log(`[DB] Se encontraron ${snapshot.docs.length} documento(s) con el meeting_id. Filtrando por occurrence_id...`);

        const foundDoc = snapshot.docs.find(doc => {
            const data = doc.data();
            console.log(`[DB] Comparando occurrence_id: ${data.occurrence_id} == ${occurrenceId}`);
            return data.occurrence_id == occurrenceId;
        });
    
        if (foundDoc) {
            console.log(`[DB] ¡Coincidencia encontrada! ID del documento: ${foundDoc.id}`);
        } else {
            console.log('[DB] No se encontró ningún documento que coincida también con el occurrence_id.');
        }

        return foundDoc || null;
    }

    static async findMeetingByMixedId(meetingId) {
        if (!meetingId) return null;

        const numericId = Number(meetingId);
        const stringId = String(meetingId);

        const snapshot = await Meeting.collection()
            .where('meeting_id', 'in', [numericId, stringId])
            .limit(1)
            .get();
        
        if (snapshot.empty) return null;
        return snapshot.docs[0];
    }

    static async getById(id) {
        const doc = await Meeting.collection().doc(id).get();
        if (!doc.exists) return null;
        return new Meeting({ id: doc.id, ...doc.data() });
    }

    static async getByMeetingId(meetingId, occurrenceId = null) {
        if (!meetingId) {
            console.error("No se proporcionó meetingId.");
            return null;
        }
    
        // Búsqueda robusta para meeting_id (como número y como texto)
        const meetingIdAsNumber = Number(meetingId);
        const meetingIdAsString = String(meetingId);
    
        const query = Meeting.collection().where('meeting_id', 'in', [meetingIdAsNumber, meetingIdAsString]);
        const snapshot = await query.get();
    
        if (snapshot.empty) {
            return null;
        }
    
        // Si no hay occurrenceId, devolvemos el primer resultado
        if (!occurrenceId) {
            const doc = snapshot.docs[0];
            return new Meeting({ id: doc.id, ...doc.data() });
        }
    
        // Si hay occurrenceId, filtramos en el código para máxima robustez
        // La comparación con `==` maneja casos de texto vs número (ej: 123 == '123')
        const foundDoc = snapshot.docs.find(doc => {
            const docData = doc.data();
            return docData.occurrence_id == occurrenceId;
        });
    
        if (!foundDoc) {
            return null;
        }
    
        return new Meeting({ id: foundDoc.id, ...foundDoc.data() });
    }

    static async getAllByMeetingId(meetingId) {
        if (!meetingId) {
            return [];
        }

        const meetingIdAsNumber = Number(meetingId);
        const meetingIdAsString = String(meetingId);

        const query = Meeting.collection().where('meeting_id', 'in', [meetingIdAsNumber, meetingIdAsString]);
        const snapshot = await query.get();

        if (snapshot.empty) {
            return [];
        }

        const meetings = [];
        snapshot.forEach(doc => {
            meetings.push(new Meeting({ id: doc.id, ...doc.data() }));
        });

        return meetings;
    }

    static async getAllByFilters(filters) {
        let query = Meeting.collection();

        for (const key in filters) {
            if (Object.prototype.hasOwnProperty.call(filters, key)) {
                let value = filters[key];

                // Manejo especial para valores 'true', 'false' y 'null'
                if (value === 'true') {
                    value = true;
                } else if (value === 'false') {
                    value = false;
                } else if (value === 'null') {
                    value = null;
                }

                query = query.where(key, '==', value);
            }
        }

        const snapshot = await query.get();

        if (snapshot.empty) {
            return [];
        }

        const meetings = [];
        snapshot.forEach(doc => {
            meetings.push(new Meeting({ id: doc.id, ...doc.data() }));
        });

        return meetings;
    }

    async save() {
        const dataToSave = { ...this };
        delete dataToSave.id;

        if (this.id) {
            await Meeting.collection().doc(this.id).set(dataToSave);
        } else {
            const docRef = await Meeting.collection().add(dataToSave);
            this.id = docRef.id;
        }

        return this;
    }

    static async updateStatusByMeetingId(meetingId, newStatus) {
        const doc = await Meeting.findMeetingByMixedId(meetingId);
        if (!doc) return null;

        await Meeting.collection().doc(doc.id).update({ status: newStatus });
        return { id: doc.id, status: newStatus };
    }

    static async updateSummaryByMeetingId(meeting_id, summary) {
        const doc = await Meeting.findMeetingByMixedId(meeting_id);
        if (!doc) return null;

        await Meeting.collection().doc(doc.id).update({ summary });
        return { id: doc.id, meeting_id: doc.data().meeting_id, summary };
    }

    static async updateMeetingByMeetingId(meetingId, dataToUpdate) {
        const doc = await Meeting.findMeetingByMixedId(meetingId);
        if (!doc) return null;
        
        await Meeting.collection().doc(doc.id).update(dataToUpdate);
        return { id: doc.id, ...dataToUpdate };
    }
    
    static async updateMeetingByOccurrenceId(occurrenceId, meetingId, dataToUpdate) {
        const docToUpdate = await this.findByMeetingAndOccurrenceId(meetingId, occurrenceId);
        if (!docToUpdate) return null;
    
        await Meeting.collection().doc(docToUpdate.id).update(dataToUpdate);
        return { id: docToUpdate.id, ...dataToUpdate };
    }
    
    static async updateStatusByOccurrenceId(occurrenceId, meetingId, newStatus) {
        const docToUpdate = await this.findByMeetingAndOccurrenceId(meetingId, occurrenceId);
        if (!docToUpdate) return null;
        await Meeting.collection().doc(docToUpdate.id).update({ status: newStatus });
        return { id: docToUpdate.id, status: newStatus };
    }

    static async updateSummaryByOccurrenceId(occurrenceId, meetingId, summary) {
        console.log(`[API] Iniciando actualización de resumen para occurrenceId: ${occurrenceId} y meetingId: ${meetingId}`);
        
        const docToUpdate = await this.findByMeetingAndOccurrenceId(meetingId, occurrenceId);
    
        if (!docToUpdate) {
            console.log('[API] No se encontró ningún documento para actualizar. La operación termina.');
            return null;
        }
    
        console.log(`[API] Documento encontrado con ID: ${docToUpdate.id}. Procediendo a actualizar el resumen.`);
        
        try {
            await Meeting.collection().doc(docToUpdate.id).update({ summary });
            console.log(`[API] ¡Éxito! El resumen para el documento ${docToUpdate.id} fue actualizado en la base de datos.`);
            return { id: docToUpdate.id, summary };
        } catch (error) {
            console.error(`[API] 🔥 ¡Error al actualizar en Firestore! Documento ID: ${docToUpdate.id}`, error);
            return null; // Devuelve null para que el controlador sepa que algo falló.
        }
    }

    static async getAll() {
        const snapshot = await Meeting.collection().get();
        const meetings = [];
        snapshot.forEach(doc => {
            meetings.push(new Meeting({ id: doc.id, ...doc.data() }));
        });
        return meetings;
    }

    static async getLastMeetings(limit = 20) {
        const snapshot = await Meeting.collection().orderBy('start_time', 'desc').limit(limit).get();
        const meetings = [];
        snapshot.forEach(doc => {
            meetings.push(new Meeting({ id: doc.id, ...doc.data() }));
        });
        return meetings;
    }

    static async getTodayMeetings() {
        const snapshot = await Meeting.collection().orderBy('start_time', 'desc').get();
        const meetings = [];
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        snapshot.forEach(doc => {
            const data = doc.data();
            const startTime = parseDate(data.start_time);
            if (startTime && startTime.toISOString().split('T')[0] === todayStr) {
                meetings.push(new Meeting({ id: doc.id, ...data }));
            }
        });
        return meetings;
    }

    static async updateDelayByMeetingId(meetingId, delay, delay_min) {
        const doc = await Meeting.findMeetingByMixedId(meetingId);
        if (!doc) return null;

        await Meeting.collection().doc(doc.id).update({ delay, delay_min });
        return { id: doc.id, delay, delay_min };
    }

    static async deleteByMeetingId(meetingId) {
        const doc = await Meeting.findMeetingByMixedId(meetingId);
        if (!doc) return null;

        await Meeting.collection().doc(doc.id).delete();
        return { id: doc.id };
    }

    static async getGroupedDelaysByHostId() {
        const snapshot = await Meeting.collection()
            .where('delay', '==', true)
            .get();

        const delayMap = new Map();

        snapshot.forEach(doc => {
            const data = doc.data();
            const { host_id, delay_min } = data;

            if (!host_id) return;

            if (!delayMap.has(host_id)) {
                delayMap.set(host_id, {
                    host_id,
                    amount_delay: 0,
                    amount_delay_min: 0,
                });
            }

            const current = delayMap.get(host_id);
            current.amount_delay += 1;
            current.amount_delay_min += delay_min || 0;
        });

        const enriched = await Promise.all(
            Array.from(delayMap.values()).map(async (item) => {
                let user_name = null;
                let email = null;

                const host = await Participant.getHostByHostId(item.host_id);
                if (host) {
                    user_name = host.user_name || null;
                    email = host.email || null;
                }

                return {
                    ...item,
                    user_name,
                    email,
                };
            })
        );

        return enriched;
    }

    static async getTopDelayedHosts(limit) {
        const snapshot = await Meeting.collection()
            .where('delay', '==', true)
            .get();

        const delayMap = new Map();

        snapshot.forEach(doc => {
            const data = doc.data();
            const { host_id, delay_min } = data;

            if (!host_id) return;

            if (!delayMap.has(host_id)) {
                delayMap.set(host_id, {
                    host_id,
                    amount_delay: 0,
                    amount_delay_min: 0,
                });
            }

            const current = delayMap.get(host_id);
            current.amount_delay += 1;
            current.amount_delay_min += delay_min || 0;
        });

        const enriched = await Promise.all(
            Array.from(delayMap.values()).map(async (item) => {
                let user_name = null;
                let email = null;

                const host = await Participant.getHostByHostId(item.host_id);
                if (host) {
                    user_name = host.user_name || null;
                    email = host.email || null;
                }

                return {
                    ...item,
                    user_name,
                    email,
                };
            })
        );

        const sorted = enriched.sort((a, b) => b.amount_delay - a.amount_delay);

        return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
    }

    static async getAllByHostId(hostId) {
        const snapshot = await Meeting.collection()
            .where('host_id', '==', hostId)
            .get();

        const meetings = [];
        snapshot.forEach(doc => {
            meetings.push(new Meeting({ id: doc.id, ...doc.data() }));
        });

        return meetings;
    }

    static async getHostsMoreInfo(limit) {
        const snapshot = await Meeting.collection().get();

        const delayMap = new Map();

        snapshot.forEach(doc => {
            const data = doc.data();
            const { host_id, delay_min } = data;

            if (!host_id) return;

            if (!delayMap.has(host_id)) {
                delayMap.set(host_id, {
                    host_id,
                    amount_delay: 0,
                    amount_delay_min: 0,
                });
            }

            const current = delayMap.get(host_id);
            current.amount_delay += 1;
            current.amount_delay_min += delay_min || 0;
        });

        const enriched = await Promise.all(
            Array.from(delayMap.values()).map(async (item) => {
                let user_name = null;
                let email = null;
                let num_reuniones = 0;
                let average = 0;

                const host = await Participant.getHostByHostId(item.host_id);
                if (host) {
                    user_name = host.user_name || null;
                    email = host.email || null;
                }

                const reuniones = await Meeting.getAllByHostId(item.host_id);
                num_reuniones = reuniones.length;

                const ratings = await Rating.getAllByHostId(item.host_id);
                if (ratings.length) {
                    const total = ratings.reduce((acc, r) => acc + (r.score || 0), 0);
                    average = parseFloat((total / ratings.length).toFixed(2));
                }

                return {
                    ...item,
                    num_reuniones,
                    average,
                    user_name,
                    email,
                };
            })
        );

        const sorted = enriched.sort((a, b) => b.amount_delay - a.amount_delay);

        return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
    }
}

export default Meeting;
