import React, {useCallback, useState} from 'react'
import { FiUpload } from "react-icons/fi";
import {useDropzone} from 'react-dropzone'
import './styles.css';

interface Props {
	onFileUpload: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUpload }) => {

	const [ selectedFile, setSelectedFile ] = useState('');

	const onDrop = useCallback(acceptedFiles => {
		const file = acceptedFiles[0];
		const fileUrl = URL.createObjectURL(file);
		setSelectedFile(fileUrl);
		onFileUpload(file)

	}, [onFileUpload])

	const {getRootProps, getInputProps, isDragActive} = useDropzone({
		onDrop,
		accept: 'image/*'
	})

	return (
		<div className="dropzone" {...getRootProps()}>
			<input {...getInputProps()} accept="image/*" />
			{
				selectedFile ? 
				<img src={selectedFile} alt="Point thumb"/> :
				(
					<p>
						<FiUpload />
						Imagem do estabelecimento
					</p>
				)
			}
		</div>
	)
}

export default Dropzone;