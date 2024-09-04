import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAxios from '../../security/axiosInstance';
import './UpdateLead.css';
import { FaDownload } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateLead = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isFetched = useRef(false);

    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        telephone: "",
        source: "",
        entreprise: "",
        tag: "",
        description: "",
        statut: "Nouveau",
        currentFile: "",
        valeurEstimee: ""
    });
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");
    const statuses = ["Nouveau", "En cours", "Gagné", "Abandonné"];
    const axiosInstance = useAxios();

    useEffect(() => {
        const fetchLead = async () => {
            if (!isFetched.current) {
                try {
                    const response = await axiosInstance.get(`Lead/${id}`);
                    if (response.status === 200) {
                        const { data } = response;
                        setFormData({
                            ...data,
                            statut: data.statut || "Nouveau",
                            currentFile: data.pdfFileName || ""
                        });
                        setFileName(data.pdfFileName || "");
                        isFetched.current = true;
                    } else {
                        console.error(`Failed to fetch lead: ${response.statusText}`);
                    }
                } catch (error) {
                    console.error(`Error fetching lead: `, error.message);
                }
            }
        };
        fetchLead();
    }, [id, axiosInstance]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setFile(file);
        setFileName(file.name);
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

        try {
            const updateResponse = await axiosInstance.patch(`Lead/${id}`, formData);
            if (updateResponse.status === 200) {
                toast.success("Lead Modifié avec succès!");

                if (file) {
                    const formDataWithFile = new FormData();
                    formDataWithFile.append('file', file);
                    await axiosInstance.post(`/Lead/${id}/update-file`, formDataWithFile, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                }

                setTimeout(() => navigate("/"), 2000); // Delay redirect to show toast
            } else {
                toast.error("Erreur lors de la modification du lead");
            }
        } catch (error) {
            toast.error("Erreur lors de la modification du lead");
        }
    };

    return (
        <div className="update-lead-container">
            <div className="form-title">
                <h2>Modifier les détails</h2>
            </div>
            <form onSubmit={handleSubmit} className="update-lead-form">
                <div className="form-left">
                    <div className="form-group">
                        <label htmlFor="formBasicNom">Nom Complet</label>
                        <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleInputChange}
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
                        <label htmlFor="formBasicEntreprise">Entreprise</label>
                        <input
                            type="text"
                            name="entreprise"
                            value={formData.entreprise}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="formBasicDescription">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Modifier
                    </button>

                </div>

                <div className="form-right">
                    <div className="form-group">
                        <label htmlFor="formBasicTag">Tag</label>
                        <input
                            type="text"
                            name="tag"
                            value={formData.tag}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="formBasicStatut">Statut</label>
                        <select
                            name="statut"
                            value={formData.statut}
                            onChange={handleInputChange}
                        >
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="formBasicValeurEstimee">Valeur Estimee</label>
                        <div className="input-container2">
                            <input
                                type="text"
                                name="valeurEstimee"
                                value={formData.valeurEstimee}
                                onChange={handleInputChange}
                                id="formBasicValeurEstimee"
                                pattern="\d+(\.\d{1,2})?" // Optional decimal part
                                required
                            />
                            <span className="currency-symbol">MAD</span>
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

                    <div className="form-group">
                        <label htmlFor="formBasicFile">Fichier</label>
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
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        {fileName && <div className="file-info">{fileName}</div>}
                    </div>

                </div>
            </form>
            <ToastContainer />
        </div>
    );
};

export default UpdateLead;
