import axios from 'axios';

// --- Instancias de Axios ---
// Se crean sin el header de autorización estático
const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL_BASE,
  headers: {
    'Content-Type': 'application/json',
  }
});

const ueggApiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL_UEGG_AUTH,
  headers: {
    'Content-Type': 'application/json',
  }
});

// --- Interceptores de Petición ---
// Añaden el token dinámicamente a CADA petición
apiInstance.interceptors.request.use((config) => {
   const fullUrl = `${config.baseURL}${config.url}`;
  console.log('🔹 Llamando a la URL:', fullUrl);
  const token = import.meta.env.VITE_API_TOKEN; // O p.ej. localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

ueggApiInstance.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_API_UEGG_TOKEN; // O p.ej. localStorage.getItem('uegg_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Servicio ---
class EstudianteEmbarazoService {
  
  // Métodos devuelven 'response' completo, no 'response.data'

  // Métodos para informe de embarazo
  async findInformeEmbarazoByCodSie(codSie) {
    try {
      const response = await apiInstance.get(`/ueggEmbInformeEmbarazoByCodSie/${codSie}`);
      return response; // Devolver response completo
    } catch (error) {
      this.handleError(error, 'Error al buscar informe de embarazo por código SIE');
      throw error;
    }
  }

  async findEstudianteEmbarazoByCodRude(codRude) {
    try {
      const response = await apiInstance.get(`/ueggEmbEstudianteEmbarazoByCodRude/${codRude}`);
      return response; // Devolver response completo
    } catch (error) {
      this.handleError(error, 'Error al buscar estudiante embarazada por código RUDE');
      throw error;
    }
  }

  // Métodos para búsqueda externa en API SIE
  async findEstudianteEmbarazoApiSie(data, signal) {
    try {
      const { estudianteCodigoRude, estudianteNombre, estudiantePaterno, estudianteMaterno, estudianteFechaNacimiento } = data;
      
      const response = await ueggApiInstance.get(
        `/uegg/InfoEstudiante/${encodeURIComponent(estudianteCodigoRude)}/${encodeURIComponent(estudianteNombre)}/${encodeURIComponent(estudiantePaterno)}/${encodeURIComponent(estudianteMaterno)}/${encodeURIComponent(estudianteFechaNacimiento)}`,
        { signal }
      );
      
      return response; // Devolver response completo
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Petición cancelada:', error.message);
        throw new Error('Petición cancelada por tiempo de espera');
      }
      this.handleError(error, 'Error al buscar estudiante en API externa');
      throw error;
    }
  }

  // Métodos para derechos del estudiante
  async findEstudianteDerechosByCodRude(codRude) {
    try {
      const response = await apiInstance.get(`/ueggEmbEstudianteDerechosByCodRude/${codRude}`);
      return response; // Devolver response completo
    } catch (error) {
      this.handleError(error, 'Error al buscar derechos del estudiante por código RUDE');
      throw error;
    }
  }

  async findEstudianteDerechosSegByCodRude(codRude) {
    try {
      const response = await apiInstance.get(`/ueggEmbEstudianteDerechosSegByCodRude/${codRude}`);
      return response; // Devolver response completo
    } catch (error) {
      this.handleError(error, 'Error al buscar seguimiento de derechos por código RUDE');
      throw error;
    }
  }

  // Métodos CRUD para informe de embarazo
  async createInformeEmbarazo(data) {
    try {
      const response = await apiInstance.post('/ueggEmbInformeEmbarazo', data);
      return response; // Devolver response completo
    } catch (error) {
      this.handleError(error, 'Error al crear informe de embarazo');
      throw error;
    }
  }

  async updateInformeEmbarazo(id, data) {
    try {
      const response = await apiInstance.put(`/ueggEmbInformeEmbarazo/${id}`, data);
      return response; // Devolver response completo
    } catch (error) {
      this.handleError(error, `Error al actualizar informe de embarazo con ID: ${id}`);
      throw error;
    }
  }

  // Métodos CRUD para estudiante embarazada
  async createEstudianteEmbarazo(data) {
    try {
      const response = await apiInstance.post('/ueggEmbEstudianteEmbarazo', data);
      return response; // Devolver response completo
    } catch (error) {
      this.handleError(error, 'Error al crear registro de estudiante embarazada');
      throw error;
    }
  }

  async updateEstudianteEmbarazo(id, data) {
    try {
      const response = await apiInstance.put(`/ueggEmbEstudianteEmbarazo/${id}`, data);
      return response; // Devolver response completo
    } catch (error) {
      this.handleError(error, `Error al actualizar registro de estudiante embarazada con ID: ${id}`);
      throw error;
    }
  }

  // Métodos CRUD para derechos del estudiante
  async createEstudianteDerechos(data) {
    try {
      const response = await apiInstance.post('/ueggEmbEstudianteDerechos', data);
      return response;
    } catch (error) {
      this.handleError(error, 'Error al crear registro de derechos del estudiante');
      throw error;
    }
  }

  async updateEstudianteDerechos(id, data) {
    try {
      const response = await apiInstance.put(`/ueggEmbEstudianteDerechos/${id}`, data);
      return response;
    } catch (error) {
      this.handleError(error, `Error al actualizar derechos del estudiante con ID: ${id}`);
      throw error;
    }
  }

  // Métodos CRUD para seguimiento de derechos
  async createEstudianteDerechosSeg(data) {
    try {
      const response = await apiInstance.post('/ueggEmbEstudianteDerechosSeg', data);
      return response;
    } catch (error) {
      this.handleError(error, 'Error al crear registro de seguimiento de derechos');
      throw error;
    }
  }

  async updateEstudianteDerechosSeg(id, data) {
    try {
      const response = await apiInstance.put(`/ueggEmbEstudianteDerechosSeg/${id}`, data);
      return response;
    } catch (error) {
      this.handleError(error, `Error al actualizar seguimiento de derechos con ID: ${id}`);
      throw error;
    }
  }

  // Método para seguimiento de actuación
  async createSeguimientoActuacion(data) {
    try {
      const response = await apiInstance.post('/ueggEmbSeguimientoActuacion', data);
      return response;
    } catch (error) {
      this.handleError(error, 'Error al crear seguimiento de actuación');
      throw error;
    }
  }

  async updateSeguimientoActuacion(id, data) {
    try {
      const response = await apiInstance.put(`/ueggEmbSeguimientoActuacion/${id}`, data);
      return response;
    } catch (error) {
      this.handleError(error, `Error al actualizar seguimiento de actuación con ID: ${id}`);
      throw error;
    }
  }

  // Métodos para seguimiento de situación
  async createSeguimientoSituacion(data) {
    try {
      const response = await apiInstance.post('/ueggEmbSeguimientoSituacion', data);
      return response;
    } catch (error) {
      this.handleError(error, 'Error al crear seguimiento de situación');
      throw error;
    }
  }

  async updateSeguimientoSituacion(id, data) {
    try {
      const response = await apiInstance.put(`/ueggEmbSeguimientoSituacion/${id}`, data);
      return response;
    } catch (error) {
      this.handleError(error, `Error al actualizar seguimiento de situación con ID: ${id}`);
      throw error;
    }
  }

  // Métodos para consultas adicionales
  async xxxgetSeguimientoActuacionPorEstudiante(idEstudiante) {
    try {
      const response = await apiInstance.get(`/ueggEmbSeguimientoActuacionPorEstudiante/${idEstudiante}`);
      return response;
    } catch (error) {
      this.handleError(error, `Error al obtener seguimiento de actuación por estudiante ID: ${idEstudiante}`);
      throw error;
    }
  }

  async xxxgetSeguimientoSituacionPorEstudiante(idEstudiante) {
    try {
      const response = await apiInstance.get(`/ueggEmbSeguimientoSituacionPorEstudiante/${idEstudiante}`);
      return response;
    } catch (error) {
      this.handleError(error, `Error al obtener seguimiento de situación por estudiante ID: ${idEstudiante}`);
      throw error;
    }
  }

  async xxxgetSeguimientoActuacionPorId(id) {
    try {
      const response = await apiInstance.get(`/ueggEmbSeguimientoActuacion/${id}`);
      return response;
    } catch (error) {
      this.handleError(error, `Error al obtener seguimiento de actuación por ID: ${id}`);
      throw error;
    }
  }

  async xxxgetSeguimientoSituacionPorId(id) {
    try {
      const response = await apiInstance.get(`/ueggEmbSeguimientoSituacion/${id}`);
      return response;
    } catch (error) {
      this.handleError(error, `Error al obtener seguimiento de situación por ID: ${id}`);
      throw error;
    }
  }

  async xxxgetEstudiantePorId(id) {
    try {
      const response = await apiInstance.get(`/ueggEmbEstudiante/${id}`);
      return response;
    } catch (error) {
      this.handleError(error, `Error al obtener estudiante por ID: ${id}`);
      throw error;
    }
  }

  // Manejador global de errores (ya no es 'private')
  handleError(error, contextMessage) {
    console.error(`[EstudianteEmbarazoService] ${contextMessage}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method
      }
    });
    
    // No lanzar error si estamos en modo de desarrollo y es un error de red
    if (import.meta.env.DEV && error.message === 'Network Error') {
      console.warn('Error de red en desarrollo. Continuando con datos de ejemplo.');
      return;
    }
    
    // Para producción, relanzar el error con un mensaje amigable
    if (error.response) {
      // El servidor respondió con un código de error
      const status = error.response.status;
      let errorMessage = 'Error en el servidor';
      
      if (status === 401) {
        errorMessage = 'Sesión expirada. Por favor, inicie sesión nuevamente.';
      } else if (status === 404) {
        errorMessage = 'Recurso no encontrado.';
      } else if (status >= 500) {
        errorMessage = 'Error interno del servidor. Por favor, intente más tarde.' + error.config.url;
      }
      
      throw new Error(`${errorMessage} (${status})`);
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      throw new Error('No se pudo conectar con el servidor. Verifique su conexión a internet.');
    } else {
      // Error en la configuración de la petición
      throw new Error('Error en la configuración de la petición.');
    }
  }
}

export default new EstudianteEmbarazoService();