import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from "react-icons/fi";
import Logo from '../../assets/logo.svg';
import { Map, TileLayer, Marker } from "react-leaflet";
import api from '../../services/api';
import axios from 'axios';
import './styles.css';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone';

interface Item {
	id: number;
	title: string;
	image_url: string;
}

interface IBGEUfResponse {
	sigla: string;
}

interface IBGECityResponse {
	nome: string;
}

const CreatePoint = () => {

	const [ itens, setItens ] = useState<Array<Item>>([]);
	const [ ufs, setUfs ] = useState<Array<string>>([]);
	const [ cities, setCities ] = useState<Array<string>>([]);
	const [ selectedUf, setSelectedUf ] = useState('0');
	const [ selectedCity, setSelectedCity ] = useState('0');
	const [ selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
	const [ initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
	const [ selectedItens, setSelectedItens ] = useState<number[]>([])
	const [ selectedFile, setSelectedFile ] = useState<File>();

	const [ formData, setFormData ] = useState({
		name: '',
		email:'',
		whatsapp: ''
	});

	const history = useHistory();

	useEffect(() => {
		api.get('itens').then(response => {
			setItens(response.data);
		})
	}, []);


	useEffect(() => {
		axios.get<IBGEUfResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
			const ufInitials = response.data.map(uf => uf.sigla);
			setUfs(ufInitials);
		})
	}, []);

	useEffect(() => {
		console.log('mudou')
		if(selectedUf === '0') return;

		axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
			const cityNames = response.data.map(city => city.nome);
			setCities(cityNames);
		})
	}, [selectedUf]);

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(position => {
			const { latitude, longitude } = position.coords;

			setInitialPosition([latitude, longitude]);
		})
	},[])


	function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
		const uf = event.target.value;
		console.log(uf)
		setSelectedUf(uf);
	}

	function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
		const city = event.target.value;
		console.log(city)
		setSelectedCity(city);
	}

	function handleMapClick(event:LeafletMouseEvent) {
		console.log(event.latlng)
		setSelectedPosition([
			event.latlng.lat,
			event.latlng.lng
		])
	}

	function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormData({ ...formData, [name]: value });
	}

	function handleSelectItem(id: number) {
		const alreadySelected = selectedItens.findIndex(item => item === id);

		if(alreadySelected > 0) {
			const filteredItens = selectedItens.filter(item => item !== id );
			setSelectedItens(filteredItens);
		}
		else {
			setSelectedItens([ ...selectedItens, id])
		}
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();


		const { name, email, whatsapp } = formData;
		const uf = selectedUf;
		const city = selectedCity;
		const [latitude, longitude] = selectedPosition;
		const itens = selectedItens;

		const data = new FormData();

		data.append('name',name);
		data.append('email',email);
		data.append('whatsapp',whatsapp);
		data.append('uf',uf);
		data.append('city',city);
		data.append('latitude',String(latitude));
		data.append('longitude',String(longitude));
		data.append('itens',itens.join(','));
		if(selectedFile) data.append('image',selectedFile);


		// const data = {
		// 	name, email, whatsapp, uf, city, latitude, longitude, itens
		// };

		console.log(data)

		await api.post('points',data);
		alert('Foi de boa')
		history.push('/');
	}	


	return (
		<div id="page-create-point">
			<header>
				<img src={Logo} alt=""/>
				<Link to="/">
					<FiArrowLeft />
					Voltar para home
				</Link>
			</header>
			<form onSubmit={handleSubmit}>
				<h1>Cadastro do <br />ponto de coleta</h1>

				<Dropzone onFileUpload={setSelectedFile} />

				<fieldset>
					<legend>
						<h2>Dados</h2>
					</legend>
					<div className="field">
						<label htmlFor="name">Nome da entidade</label>
						<input type="text" name="name" id="name" onChange={handleInputChange} />
					</div>
					<div className="field-group">
						<div className="field">
							<label htmlFor="email">Email</label>
							<input type="email" name="email" id="email" onChange={handleInputChange} />
						</div>
						<div className="field">
							<label htmlFor="whatsapp">Whatsapp</label>
							<input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
						</div>
					</div>
				</fieldset>
				<fieldset>
					<legend>
						<h2>Endereço</h2>
						<span>Selecione o endereço do mapa</span>
					</legend>
					<Map center={initialPosition} zoom={15} onClick={handleMapClick}>
					<TileLayer
						attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						 	<Marker position={selectedPosition}>
							
							</Marker>
					</Map>
					<div className="field-group">
						<div className="field">
							<label htmlFor="uf">Estado (UF)</label>
							<select name="uf" value={selectedUf} onChange={handleSelectedUf}>
								<option value="0">Selecione um estado</option>
								{
									ufs.map(uf => (
										<option key={uf} value={uf}>{uf}</option>
									))
								}
							</select>
						</div>
						<div className="field">
							<label htmlFor="city">Cidade</label>
							<select name="city" value={selectedCity} onChange={handleSelectedCity}>
								<option value="0">Selecione uma cidade</option>
								{
									cities.map(city => (
										<option key={city} value={city}>{city}</option>
									))
								}
							</select>
						</div>
					</div>
				</fieldset>
				<fieldset>
					<legend>
						<h2>Itens de coleta</h2>
						<span>Selecione um ou mais itens abaixo</span>
					</legend>
					<ul className="items-grid">
						{
							itens.map(item => (
								<li key={item.id} onClick={ () => handleSelectItem(item.id)} className={selectedItens.includes(item.id) ? 'selected' : ''}>
									<img src={item.image_url} alt={item.title} />
									<span>{item.title}</span>
								</li>
							))
						}
						
					</ul>
				</fieldset>
				<button type="submit">Cadastrar ponto de coleta</button>
			</form>
		</div>
	)
}

export default CreatePoint;