import db from '../../../config/firebase/firebase.js';

class Participant {
    constructor({
        id,
        user_id,
        participant_user_id,
        user_name,
        email,
        join_time,
        is_host,
        host_id,
        meeting_id,
        meeting_uuid,
    }) {
        this.id = id;
        this.user_id = user_id ? Number(user_id) : user_id;
        this.participant_user_id = participant_user_id || null;
        this.user_name = user_name || null;
        this.email = email || null;
        this.join_time = join_time;
        // SOLUCIÓN: Asegurar que is_host tenga un valor booleano por defecto.
        this.is_host = is_host === true; // Predetermina a false si no es estrictamente true
        this.host_id = host_id ? Number(host_id) : host_id;
        this.meeting_id = meeting_id ? Number(meeting_id) : meeting_id;
        this.meeting_uuid = meeting_uuid;
    }

    static collection() {
        return db.collection('participantes');
    }

    static async findOrCreate(participantData) {
        const { meeting_id, user_id, email } = participantData;

        let existingParticipantDoc = null;

        if (meeting_id && (user_id || email)) {
            const numericMeetingId = Number(meeting_id);
            const stringMeetingId = String(meeting_id);

            let query;
            if (user_id) {
                const numericUserId = Number(user_id);
                const stringUserId = String(user_id);
                query = Participant.collection()
                    .where('user_id', 'in', [numericUserId, stringUserId])
                    .where('meeting_id', 'in', [numericMeetingId, stringMeetingId]);
            } else if (email) {
                query = Participant.collection()
                    .where('email', '==', email)
                    .where('meeting_id', 'in', [numericMeetingId, stringMeetingId]);
            }

            if (query) {
                const snapshot = await query.limit(1).get();
                if (!snapshot.empty) {
                    existingParticipantDoc = snapshot.docs[0];
                }
            }
        }

        if (existingParticipantDoc) {
            return {
                participant: new Participant({ id: existingParticipantDoc.id, ...existingParticipantDoc.data() }),
                created: false,
            };
        }

        const newParticipant = new Participant(participantData);
        await newParticipant.save();
        return {
            participant: newParticipant,
            created: true
        };
    }

    async save() {
        const dataToSave = { ...this };
        if (dataToSave.meeting_id) dataToSave.meeting_id = Number(dataToSave.meeting_id);
        if (dataToSave.user_id) dataToSave.user_id = Number(dataToSave.user_id);
        if (dataToSave.host_id) dataToSave.host_id = Number(dataToSave.host_id);
        dataToSave.is_host = this.is_host; // Asegurar que el booleano se guarde
        
        delete dataToSave.id;

        Object.keys(dataToSave).forEach(key => {
            if (dataToSave[key] === undefined) delete dataToSave[key];
        });

        if (this.id) {
            await Participant.collection().doc(this.id).set(dataToSave, { merge: true });
        } else {
            const docRef = await Participant.collection().add(dataToSave);
            this.id = docRef.id;
        }
        return this;
    }

    static async getAllByMeetingId(meeting_id) {
        const numericId = Number(meeting_id);
        const stringId = String(meeting_id);

        const snapshot = await Participant.collection()
            .where('meeting_id', 'in', [numericId, stringId])
            .get();

        const participants = [];
        snapshot.forEach(doc => {
            participants.push(new Participant({ id: doc.id, ...doc.data() }));
        });
        return participants;
    }

    static async getAllParticipantsByMeetingId(meeting_id) {
        const allForMeeting = await Participant.getAllByMeetingId(meeting_id);
        // SOLUCIÓN: Filtrar en el código para no depender de la consulta a la BD.
        return allForMeeting.filter(p => p.is_host === false);
    }

    static async getHostByHostId(hostId) {
        const numericHostId = Number(hostId);
        const stringHostId = String(hostId);

        const snapshot = await Participant.collection()
            .where('is_host', '==', true)
            .where('host_id', 'in', [numericHostId, stringHostId])
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return new Participant({ id: doc.id, ...doc.data() });
    }
    
    static async getById(id) {
        const doc = await Participant.collection().doc(id).get();
        if (!doc.exists) return null;
        return new Participant({ id: doc.id, ...doc.data() });
    }

    static async getAllHosts() {
        const snapshot = await Participant.collection().where('is_host', '==', true).get();
        const hosts = [];
        snapshot.forEach(doc => {
            hosts.push(new Participant({ id: doc.id, ...doc.data() }));
        });
        return hosts;
    }

    static async getAllParticipants() {
        const snapshot = await Participant.collection().where('is_host', '==', false).get();
        const participants = [];
        snapshot.forEach(doc => {
            participants.push(new Participant({ id: doc.id, ...doc.data() }));
        });
        return participants;
    }

    static async deleteById(id) {
        const docRef = Participant.collection().doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return { affectedRows: 0 };
        }

        await docRef.delete();
        return { affectedRows: 1 };
    }

    static async deleteByMeetingId(meeting_id) {
        const numericId = Number(meeting_id);
        const stringId = String(meeting_id);

        const snapshot = await Participant.collection()
            .where('meeting_id', 'in', [numericId, stringId])
            .get();

        if (snapshot.empty) {
            return { affectedRows: 0 };
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        return { affectedRows: snapshot.size };
    }
}

export default Participant;