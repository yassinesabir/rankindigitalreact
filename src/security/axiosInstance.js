import axios from 'axios';
import { useKeycloak } from '@react-keycloak/web';
import { useMemo } from 'react';

const useAxios = () => {
  const { keycloak } = useKeycloak();

  const instance = useMemo(() => {
    const axiosInstance = axios.create({
      baseURL: 'http://localhost:8030/api/', // Adjust this URL if necessary
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Update Authorization header if keycloak is initialized
    axiosInstance.interceptors.request.use(config => {
      if (keycloak?.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      }
      return config;
    });

    return axiosInstance;
  }, [keycloak?.token]); // Recreate instance only when token changes

  return instance;
};

export default useAxios;
