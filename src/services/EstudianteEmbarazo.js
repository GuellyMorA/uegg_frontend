import http from 'axios';
import http2 from 'axios';
const apiUrl = import.meta.env;

class EstudianteEmbarazoService {
  createInformeEmbarazo(data){
    return http.post(`/ueggEmbInformeEmbarazo`, data).catch((error) => {
        return error.response;
    });
  }

  createEstudianteEmbarazo(data){
    return http.post(`/ueggEmbEstudianteEmbarazo`, data).catch((error) => {
        return error;
    });
  } 
  
  findEstudiante(data){   
    const user = JSON.parse(localStorage.getItem('user'));
    console.log(data);
    console.log('endpoint', `/estudiante/${data.estudianteCodigoRude}/${data.estudianteFechaNacimiento}/${data.estudianteCedulaIdentidad}/${data.estudianteComplemento}/${data.estudianteNombre}/${data.estudiantePaterno}/${data.estudianteMaterno}`);
    return http2({
      method:'get',
      url: `/estudiante/${data.estudianteCodigoRude || data.codigoRude}/${(data.estudianteFechaNacimiento || data.fechaNacimiento).replace(/\//gi, '-')}/${(data.estudianteCedulaIdentidad || data.carnetIdentidad) === '' ? ' ' : (data.estudianteCedulaIdentidad || data.carnetIdentidad)}/${(data.estudianteComplemento || data.complemento) === '' ? ' ' : (data.estudianteComplemento || data.complemento)}/${data.estudianteNombre || data.nombre}/${data.estudiantePaterno || data.paterno}/${data.estudianteMaterno || data.materno}`,
      baseURL: apiUrl.VITE_API_URL_SIE,
      headers: {
        "Content-Type": "application/json",
        'Authorization': ""
      },
    })
    .catch((error) => {
        return error;
    });
  }

  findEstudianteEmbarazo(data){
    return http.get(`/ueggEmbEstudianteEmbarazo/${data}`).catch((error) => {
        return error;
    });
  } 
  
  createSeguimientoActuacion(data){
    return http.post(`/ueggEmbEstudianteDerechos`, data).catch((error) => {
        return error.response;
    });
  }

  createSeguimientoSituacion(data){
    return http.post(`/ueggEmbEstudianteDerechosSeg`, data).catch((error) => {
        return error.response;
    });
  }

}

export default new EstudianteEmbarazoService();
