import http from 'axios';
import http2 from 'axios';
const apiUrl = import.meta.env;

class EstudianteEmbarazoService {
  findInformeEmbarazoByCodSie(data){
    return http.get(`/ueggEmbInformeEmbarazoByCodSie/${data}`).catch((error) => {
        return error;
    });
  }

  findEstudianteEmbarazoApiSie(data) {
      console.log("Datos enviados estudiante: ", data); // <-- Imprime el valor del formulario
          console.log('endpoint', `/estudiante/${data.estudianteCodigoRude}/${data.estudianteFechaNacimiento}/${data.estudianteCedulaIdentidad}/${data.estudianteComplemento}/${data.estudianteNombre}/${data.estudiantePaterno}/${data.estudianteMaterno}`);

      return http2({
        method: 'get',
        url: `/uegg/InfoEstudiante/${data.estudianteCodigoRude}/${data.estudianteNombre}/${data.estudiantePaterno}/${data.estudianteMaterno}/${data.estudianteFechaNacimiento}`,
        baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
        data: data,
        headers: {
          "Content-Type": "application/json",
          'Authorization': apiUrl.VITE_API_URL_AUTH_TOKEN === "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvX2lkIjo5MjQ5ODEyMiwiaWF0IjoxNzEyMjA1OTY5fQ.LsnO4syEI1WT-BDL1qxjPicRHU__XUeHJyGCS5gAZCo"
            ? ""
            : apiUrl.VITE_API_URL_AUTH_TOKEN
        },
      })
      .then((response) => {
      // console.log("Respuesta de findEstudiante:", response); // <-- Imprime la respuesta del servidor
        return response;
      })
      .catch((error) => {
        console.error("Error durante la autenticaciónfindEstudiante:", error); // <-- Imprime el error si ocurre
        return error;
      });
  }

  findEstudianteEmbarazoByCodRude(data){
    return http.get(`/ueggEmbEstudianteEmbarazoByCodRude/${data}`).catch((error) => {
        return error;
    });
  } 

  createInformeEmbarazo(data){
    return http.post(`/ueggEmbInformeEmbarazo`, data).catch((error) => {
        return error.response;
    });
  }
 updateInformeEmbarazo(id,data) {
    return http({
      method:'put',
      url: `/ueggEmbInformeEmbarazo/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data
    })
    .catch((error) => {
      console.log("error ueggEmbInformeEmbarazo  url  : ", error.config.url,data);
        return error;
    });
  }

  createEstudianteEmbarazo(data){
    return http.post(`/ueggEmbEstudianteEmbarazo`, data).catch((error) => {
        return error;
    });
  } 
  
 updateEstudianteEmbarazo(id,data) {
    return http({
      method:'put',
      url: `/ueggEmbEstudianteEmbarazo/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data
    })
    .catch((error) => {
      console.log("error ueggEmbEstudianteEmbarazo  url  : ", error.config.url,data);
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
