import express from 'express';
import PointsController from './controllers/PointsController';
import ItensController from './controllers/ItensController';
import multer from 'multer';
import MulterConfig from './config/multer';
import { celebrate, Joi } from 'celebrate';

const routes = express.Router();
const pointsController = new PointsController();
const itensController = new ItensController();
const upload = multer(MulterConfig);

routes.get('/', (request, response) => {
	return response.json('Hello');
});

routes.get('/itens', itensController.index);

routes.post('/points', 
	upload.single('image'),
	celebrate({
		body: Joi.object().keys({
			name: Joi.string().required(),
			email: Joi.string().required().email(), 
			whatsapp: Joi.string().required(), 
			latitude: Joi.number().required(), 
			longitude: Joi.number().required(), 
			city: Joi.string().required(), 
			uf: Joi.string().required().max(2),
			itens: Joi.string().required()
		})
	}, {
		abortEarly: false,
	}),
	pointsController.create);
routes.get('/points', pointsController.index);
routes.get('/points/:id', pointsController.show);

export default routes;