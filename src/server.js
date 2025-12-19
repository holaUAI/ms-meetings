
import express from 'express';
import morgan from 'morgan';
import corsMiddleware from './middleware/cors.js';
import MeetingRouter from './modules/meetings/routes/meeting.route.js';
import ParticipantRouter from './modules/participants/routes/participant.route.js';
import RatingRouter from './modules/ratings/routers/rating.router.js';
import UserRouter from './modules/users/routers/user.route.js';
import HealthRouter from './modules/health/routes/health.routes.js';

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;

        // --- CORRECCIÓN ---
        // La ruta vuelve a estar en singular, como la has usado siempre.
        this.meeting_path = '/ms/v1/meeting';
        this.participant_path = '/ms/v1/participant';
        this.rating_path = '/ms/v1/rating';
        this.user_path = '/ms/v1/user';
        this.health_path = '/ms/v1/health';

        this.middlewares();
        this.routes();
    }

    middlewares() {
        // Aumentar el límite del tamaño del payload a 50mb
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));

        this.app.use(corsMiddleware);
        this.app.use(morgan('dev'));
    }

    routes() {
        this.app.get('/', (req, res) => {
            res.status(200).json({ status: 'ok', message: 'API is alive!' });
        });

        this.app.use(this.meeting_path, MeetingRouter);
        this.app.use(this.participant_path, ParticipantRouter);
        this.app.use(this.rating_path, RatingRouter);
        this.app.use(this.user_path, UserRouter);
        this.app.use(this.health_path, HealthRouter);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`👾 I'M ALIVE => PORT: ${this.port}`);
        });
    }
}

export default Server;
