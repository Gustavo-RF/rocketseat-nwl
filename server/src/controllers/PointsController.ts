import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController
{
	async index(request: Request, response: Response)
	{
		const { uf, city, itens } = request.query;

		const parsedItens = String(itens).split(',').map(item => Number(item.trim()))

		const points = await knex('points')
				.join('point_itens','points.id','=','point_itens.point_id')
				.whereIn('point_itens.item_id', parsedItens)
				.where('city',String(city))
				.where('uf',String(uf))
				.distinct()
				.select('points.*');

		const serializedPoints = points.map(point => {
			return {
				...points,
				image_url: `http://192.168.15.7:3333/uploads/${point.image}`
			}
		})	
		

		return response.json(serializedPoints);
	}

	async create(request: Request, response: Response) 
	{
		const {
			name, 
			email, 
			whatsapp, 
			latitude, 
			longitude, 
			city, 
			uf, 
			itens
		} = request.body;
	
		const trx = await knex.transaction();
		const point = {
			image: request.file.filename,
			name, 
			email, 
			whatsapp, 
			latitude, 
			longitude, 
			city, 
			uf
		}

		const id = await trx('points').insert(point);
	
		const pointItens = itens.split(',').map((item: String) => Number(item.trim())).map((item_id:Number) => {
			return {
				item_id,
				point_id: id[0],
			}
		})
	
		await trx('point_itens').insert(pointItens);

		await trx.commit();
	
		return response.json({
			id: id[0],
			...point
		});
	}

	async show(request: Request, response: Response)
	{
		const { id } = request.params;

		const point = await knex('points').where('id',id).first();

		if(!point) {
			return response.status(400).json({ message: 'Point not found' });
		}

		const serializedPoint = {
			...point,
			image_url: `http://192.168.15.7:3333/uploads/${point.image}`
		}

		const itens = await knex('itens')
			.join('point_itens', 'itens.id', '=', 'point_itens.item_id')
			.where('point_itens.point_id',id);

		return response.json({serializedPoint, itens});
	}
}

export default PointsController;