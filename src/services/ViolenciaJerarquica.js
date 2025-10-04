import http from 'axios';
import http2 from 'axios';

class ViolenciaJerarquicaService {
  createVictima(data){
    return http.post(`/ueggViolenciaVictima`, data).catch((error) => {
        return error.response;
    });
  }

  // createEstudianteEmbarazo(data){
  //   return http.post(`/ueggEmbEstudianteEmbarazo`, data).catch((error) => {
  //       return error;
  //   });
  // } 

  findCaso(data){
    return http.get(`/ueggViolenciaCasoAgresor/caso/${data}`).catch((error) => {
        return error;
    });
  } 

  findCasoDetalle(data){
    return http.get(`/ueggViolenciaCasoAgresor/caso/detalle/${data}`).catch((error) => {
        return error;
    });
  } 

  findCasoRude(data){
    return http.get(`/ueggViolenciaCasoAgresor/rude/${data}`).catch((error) => {
        return error;
    });
  } 

  findCasoRda(data){
    return http.get(`/ueggViolenciaCasoAgresor/rda/${data}`).catch((error) => {
        return error;
    });
  } 

  findVictimaRda(data){
    return http.get(`/ueggViolenciaVictima/rda/${data}`).catch((error) => {
        return error;
    });
  } 

  findVictimaRude(data){
    return http.get(`/ueggViolenciaVictima/rude/${data}`).catch((error) => {
        return error;
    });
  }   
  
  createAgresor(data){
    return http.post(`/ueggViolenciaAgresor`, data).catch((error) => {
        return error.response;
    });
  }

  findAgresorRda(data){
    return http.get(`/ueggViolenciaAgresor/rda/${data}`).catch((error) => {
        return error;
    });
  } 

  findAgresorRude(data){
    return http.get(`/ueggViolenciaAgresor/rude/${data}`).catch((error) => {
        return error;
    });
  }   
  
  createCaso(data){
    return http.post(`/ueggViolenciaCasoAgresor`, data).catch((error) => {
        return error.response;
    });
  }  
  
  createCasoDetalle(data){
    return http.post(`/ueggViolenciaCasoCom`, data).catch((error) => {
        return error.response;
    });
  }  

  findCasoRda(data){
    return http.get(`/ueggViolenciaCasoAgresor/rda/${data}`).catch((error) => {
        return error;
    });
  } 

  findCasoRude(data){
    return http.get(`/ueggViolenciaCasoAgresor/rude/${data}`).catch((error) => {
        return error;
    });
  } 

  createReferenciaCaso(data){
    return http.post(`/ueggViolenciaCasoDna`, data).catch((error) => {
        return error.response;
    });
  }  

  createComunicacionDistrito(data){
    return http.post(`/ueggViolenciaComDist`, data).catch((error) => {
        return error.response;
    });
  }  

  createComunicacionDepartamento(data){
    return http.post(`/ueggViolenciaComDptal`, data).catch((error) => {
        return error.response;
    });
  }    

  createSeguimientoSancion(data){
    return http.post(`/ueggViolenciaSegSanciones`, data).catch((error) => {
        return error.response;
    });
  } 

  createSeguimientoInfraccion(data){
    return http.post(`/ueggViolenciaSegInfraccion`, data).catch((error) => {
        return error.response;
    });
  } 

  createSeguimientoDelito(data){
    return http.post(`/ueggViolenciaSegSancionesDel`, data).catch((error) => {
        return error.response;
    });
  } 

  createSeguimientoProcesoPenal(data){
    return http.post(`/ueggViolenciaSegDs`, data).catch((error) => {
        return error.response;
    });
  } 

  createSeguimientoProcesoAdministrativo(data){
    return http.post(`/ueggViolenciaProceSegDs`, data).catch((error) => {
        return error.response;
    });
  }  

  // createSeguimientoActuacion(data){
  //   return http.post(`/ueggEmbEstudianteDerechos`, data).catch((error) => {
  //       return error.response;
  //   });
  // }

  // createSeguimientoSituacion(data){
  //   return http.post(`/ueggEmbEstudianteDerechosSeg`, data).catch((error) => {
  //       return error.response;
  //   });
  // }

}

export default new ViolenciaJerarquicaService();
