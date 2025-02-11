import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import Constants from "expo-constants";
import { Feather as Icon } from "@expo/vector-icons";
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from "react-native-maps";
import { SvgUri } from "react-native-svg";
import api from '../../services/api';
import * as Location from "expo-location";

interface Item {
	id: number,
	title: string,
	image_url: string
};

interface Point {
	id: number,
	name: string,
	image: string,
	image_url: string,
	latitude: number,
	longitude: number
}

const Points = () => {
	const navigation = useNavigation();
	const [ itens, setItens ] = useState<Item[]>([]);
	const [ selectedItens, setSelectedItens] = useState<number[]>([])
	const [ initialPosition, setInitialPosition ] = useState<[number,number]>([0,0])
	const [ points, setPoints ] = useState<Point[]>([])

	useEffect(() => {
		api.get<Item[]>('itens').then(response => {
			setItens(response.data);
		})
	} ,[])

	useEffect(() => {
		async function loadPosition() {
			const { status } = await Location.requestPermissionsAsync();

			if(status !== 'granted') {
				Alert.alert('Ops. Precisamos de sua permissão para obter a localização.');
				return
			}

			const location = await Location.getCurrentPositionAsync();
			const { latitude, longitude } = location.coords;
			setInitialPosition([latitude, longitude]);
		}

		loadPosition();
	}), [];

	useEffect( () => {
		api.get('points', {
			params: {
				city: 'Vitória',
				uf: 'ES',
				itens: [1,2,3,4,5,6]
			}
		}).then(response => {
			console.log(response.data);
			setPoints(response.data)
		})
	}, [])

	function handleNavigateBack() {
		navigation.goBack()
	}

	function handleNavigateDetail(point_id:number) {
		navigation.navigate('Detail' ,{ point_id })
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

	return (
		<>
		<View style={styles.container}>
			<TouchableOpacity onPress={handleNavigateBack}>
				<Icon name="arrow-left" size={20} color="#34cd79"></Icon>
			</TouchableOpacity>

			<Text style={styles.title}>
				Bem vindo.
			</Text>
			<Text style={styles.description}>
				Encontre no mapa um ponto de coleta.
			</Text>
			<View style={styles.mapContainer}>
				{
					initialPosition[0] !== 0 && (
						<MapView style={styles.map} loadingEnabled={initialPosition[0] === 0} initialRegion={{ 
							latitude: initialPosition[0],
							longitude: initialPosition[1],
							latitudeDelta: 0.014,
							longitudeDelta: 0.014,
						 }}>
							{
								points.map(point => (
									<Marker key={String(point.id)} coordinate={{ 
										latitude: point.latitude,
										longitude: point.longitude,
									}} style={styles.mapMarker} onPress={() => handleNavigateDetail(point.id)}>
										<View style={styles.mapMarkerContainer}>
											<Image style={styles.mapMarkerImage} source={{ uri: point.image_url }} />
											<Text style={styles.mapMarkerTitle}>{point.name}</Text>
										</View>
									</Marker>
								))
							}
						 </MapView>
					)
				}
			</View>
		</View>

		<View style={styles.itemsContainer}>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:28 }}>
				{
					itens.map(item => (
						<TouchableOpacity key={String(item.id)} 
						style={[
							styles.item,
							selectedItens.includes(item.id) ? styles.selectedItem : {}
						]} activeOpacity={0.6} onPress={() => {handleSelectItem(item.id)}}>
							<SvgUri width={42} height={42} uri={item.image_url} />
							<Text style={styles.itemTitle}>{ item.title }</Text>
						</TouchableOpacity>
					))
				}

			</ScrollView>


		</View>
		</>
	)
}

export default Points;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 32,
		paddingTop: 20 + Constants.statusBarHeight,
	},

	title: {
		fontSize: 20,
		fontFamily: 'Ubuntu_700Bold',
		marginTop: 24,
	},

	description: {
		color: '#6C6C80',
		fontSize: 16,
		marginTop: 4,
		fontFamily: 'Roboto_400Regular',
	},

	mapContainer: {
		flex: 1,
		width: '100%',
		borderRadius: 10,
		overflow: 'hidden',
		marginTop: 16,
	},

	map: {
		width: '100%',
		height: '100%',
	},

	mapMarker: {
		width: 90,
		height: 80, 
	},

	mapMarkerContainer: {
		width: 90,
		height: 70,
		backgroundColor: '#34CB79',
		flexDirection: 'column',
		borderRadius: 8,
		overflow: 'hidden',
		alignItems: 'center'
	},

	mapMarkerImage: {
		width: 90,
		height: 45,
		resizeMode: 'cover',
	},

	mapMarkerTitle: {
		flex: 1,
		fontFamily: 'Roboto_400Regular',
		color: '#FFF',
		fontSize: 13,
		lineHeight: 23,
	},

	itemsContainer: {
		flexDirection: 'row',
		marginTop: 16,
		marginBottom: 32,
	},

	item: {
		backgroundColor: '#fff',
		borderWidth: 2,
		borderColor: '#eee',
		height: 120,
		width: 120,
		borderRadius: 8,
		paddingHorizontal: 16,
		paddingTop: 20,
		paddingBottom: 16,
		marginRight: 8,
		alignItems: 'center',
		justifyContent: 'space-between',

		textAlign: 'center',
	},

	selectedItem: {
		borderColor: '#34CB79',
		borderWidth: 2,
	},

	itemTitle: {
		fontFamily: 'Roboto_400Regular',
		textAlign: 'center',
		fontSize: 13,
	},
});