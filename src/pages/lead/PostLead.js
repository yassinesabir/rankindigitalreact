import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from '../../security/axiosInstance'; // Import your axios instance
import './PostLead.css';
import { FaDownload } from "react-icons/fa"; // Updated to use download icon
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const PostLead = () => {
    const [formData, setFormData] = useState({
        nom: "",  
        email: "",
        telephone: "", 
        source: "",
        entreprise: "",
        tag: "",
        description: "",
        pdf: null, // Added for file
        valeurEstimee:"",
    });

    const [fileName, setFileName] = useState(""); // New state for file name
    const navigate = useNavigate();
    const axiosInstance = useAxios(); // Get the axios instance

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                pdf: file // Handle file input
            });
            setFileName(file.name); // Set the name of the chosen file
        } else {
            setFormData({
                ...formData,
                pdf: null
            });
            setFileName("");
        }
    };

    const validateFormData = () => {
        // Validate email
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("Email invalide");
            return false;
        }

        // Validate telephone
        if (!/^\d{9}$/.test(formData.telephone)) {
            toast.error("Le numéro de téléphone doit comporter 9 chiffres");
            return false;
        }

        // Validate valeurEstimee
        if (isNaN(formData.valeurEstimee) || formData.valeurEstimee.trim() === "") {
            toast.error("La valeur estimée doit être un nombre");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateFormData()) {
            return;
        }

        const dataToSend = new FormData();
        dataToSend.append('nom', formData.nom);
        dataToSend.append('email', formData.email);
        dataToSend.append('telephone', formData.telephone);
        dataToSend.append('source', formData.source);
        dataToSend.append('entreprise', formData.entreprise);
        dataToSend.append('tag', formData.tag);
        dataToSend.append('valeurEstimee', formData.valeurEstimee);
        dataToSend.append('description', formData.description);
        
        if (formData.pdf) {
            dataToSend.append('file', formData.pdf);
        }
    
        try {
            const response = await axiosInstance.post("/Lead", dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log('Response:', response); // Example usage
            toast.success("Lead créé avec succès!");
            setTimeout(() => navigate("/"), 2000);
        } catch (error) {
            console.error('Error:', error);
            toast.error("Erreur lors de la création du lead");
        }
    };

    return (
        <div className="post-lead-container">
            <h2>Ajouter Nouveau Lead</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="formBasicNom">Nom Complet</label>
                        <input
                            type="text"
                            name="nom" 
                            value={formData.nom} 
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="formBasicEmail">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="formBasicTelephone">Téléphone</label>
                        <div className="input-container">
                            <span className="phone-prefix">+212</span>
                            <input
                                type="tel"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleInputChange}
                                id="formBasicTelephone"
                                pattern="\d{9}"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="formBasicSource">Source</label>
                        <input
                            type="text"
                            name="source"
                            value={formData.source}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="formBasicDescription">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4" // Default number of visible rows
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="formBasicEntreprise">Entreprise</label>
                        <input
                            type="text"
                            name="entreprise"
                            value={formData.entreprise}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="formBasicTag">Tag</label>
                        <input
                            type="text"
                            name="tag"
                            value={formData.tag}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="formBasicValeurEstimee">Valeur Estimee</label>
                        <div className="input-container">
                            <input
                                type="text"
                                name="valeurEstimee"
                                value={formData.valeurEstimee}
                                onChange={handleInputChange}
                                id="formBasicValeurEstimee"
                                pattern="\d+(\.\d{1,2})?" // Optional decimal part
                                required
                            />
                            <span className="currency-symbol">MAD</span> {/* Adjust currency symbol as needed */}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="formFile">Fichier</label>
                        <button
                            type="button"
                            className="file-button"
                            onClick={() => document.getElementById('fileUpload').click()}
                        >
                            <FaDownload className="download-icon" />
                            Télécharger un fichier
                        </button>
                        <input
                            type="file"
                            id="fileUpload"
                            name="file"
                            style={{ display: 'none' }} // Hide the actual input
                            onChange={handleFileChange}
                        />
                        {fileName && <div className="file-info">{fileName}</div>} {/* Display file name */}
                    </div>
                </div>

                <button type="submit" className="submit-button">
                    Ajouter
                </button>
            </form>
            <ToastContainer /> {/* Add ToastContainer */}
        </div>
    );
};

export default PostLead;
