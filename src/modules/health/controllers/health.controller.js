
import db from '../../../config/firebase/firebase.js';

// Define el nombre de la colección y el ID del documento que se usará para el "ping".
const PING_COLLECTION = 'reposo';
const PING_DOC_ID = '123';

/**
 * @name checkDatabaseConnection
 * @description Realiza una consulta simple a la base de datos para verificar la conexión
 * y mantener el servicio activo.
 * @param {object} req - Objeto de solicitud de Express.
 * @param {object} res - Objeto de respuesta de Express.
 */
export const checkDatabaseConnection = async (req, res) => {
    try {
        console.log(`[Health Check] Se recibió un ping. Buscando en la colección '${PING_COLLECTION}' el documento con id '${PING_DOC_ID}'.`);

        const collectionRef = db.collection(PING_COLLECTION);
        // Realizamos la consulta buscando un documento donde el campo 'id' sea igual a '123'.
        const snapshot = await collectionRef.where('id', '==', PING_DOC_ID).limit(1).get();

        if (snapshot.empty) {
            console.warn(`[Health Check] No se encontró el documento de ping. La colección '${PING_COLLECTION}' o el documento con id '${PING_DOC_ID}' no existen.`);
            return res.status(404).json({
                status: 'error',
                message: `El documento de salud con id '${PING_DOC_ID}' no fue encontrado.`,
            });
        }
        
        const doc = snapshot.docs[0];
        console.log(`[Health Check] ¡Éxito! Documento encontrado (ID de Firestore: ${doc.id}). El servidor está activo.`);

        return res.status(200).json({
            status: 'ok',
            message: 'Servicio activo y base de datos conectada.',
            data: {
                firestore_doc_id: doc.id,
                queried_id: PING_DOC_ID,
            }
        });

    } catch (error) {
        console.error('🔥 [Health Check] Error crítico al intentar conectar con la base de datos:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Ocurrió un error en el servidor al realizar el chequeo de salud.',
            error: error.message,
        });
    }
};
