import http from 'axios';
import http2 from 'axios';
const apiUrl = import.meta.env;

class ConvivenciaPacificaService {

  create(data){
    return http.post(`/ueggPcpaUnidadEducativa`, data).catch((error) => {
        return error.response;
    });
  }

  createContruccion(data){
    return http.post(`/ueggPcpaConstruccion`, data).catch((error) => {
        return error;
    });
  } 

  createMiembroComision(data){
    return http.post(`/ueggPcpaMiembroComision`, data).catch((error) => {
        return error;
    });
  } 

  deleteConstruccion(id){
    return http.put(`/ueggPcpaConstruccionDel/${id}`).catch((error) => {
        return error;
    });
  } 

  deleteMiembroComision(id){
    return http.put(`/ueggPcpaMiembroComisionDel/${id}`).catch((error) => {
        return error;
    });
  } 

  listMiembroComision(data){
    return http.get(`/listMiembrosComision/${data}`).catch((error) => {
        return error;
    });
  } 

  findMiembrosComisionConstruccion(data){
    return  http.get(`/ueggPcpaMiembroComisionList/${data}`,).catch((error) => {
        return error;
    });

  }

  createTarea(data){
    return http.post(`/ueggPcpaActividadesPromocion`, data).catch((error) => {
        return error;
    });
  } 

  createTareaPromover(data){
    return http.post(`/ueggPcpaActividadesPromocion`, data).catch((error) => {
        return error;
    });
  } 

  createMiembroComisionAprobacion(data){
    return http.post(`/ueggPcpaMiembroComision`, data).catch((error) => {
        return error;
    });
  } 


  deleteActividadesPromocion(id){
    return http.put(`/ueggPcpaActividadesPromocionDel/${id}`).catch((error) => {
        return error;
    });
  } 


  deleteActividadesEjecutadas(id){
    return http.put(`/ueggPcpaActividadesEjecutadasDel/${id}`).catch((error) => {
        return error;
    });
  } 



  
    // try {
    //   const user = localStorage.getItem('user');
    //   Create a new Axios instance with custom configurations
    //   return http.create({
    //     method:'get',
    //     url: `/institucioneducativa/${id}`,
    //     baseURL: 'https://api.infraestructura.sie.gob.bo/sie',
    //     headers: {
    //       "Content-Type": "application/json",
    //       'Authorization': 'Bearer ' + user.token
    //     },
    //     timeout: 1500,
    //   });
    // } catch (error) {
    //   console.error("Error al buscar la unidad educativa", error);
    //   return error;
    // }

  findInstitucionEducativa(id) {
    // Recuperamos el objeto del usuario desde localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // Tomamos el token del objeto
    const token = user?.token;

    return http2({
      method: 'get',
      url: `/institucioneducativa/${id}`,
      baseURL: apiUrl.VITE_API_URL_API,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // ← Aquí va el token
      },
    })
    .catch((error) => {
      return error;
    });
  }

  getIndicadorTipo(){
    return http.get(`/ueggPcpaIndicadoresTipo`).catch((error) => {
        return error;
    });
  }

  createSocializacion(data){
    return http.post(`/ueggPcpaActividadesEjecutadas`, data).catch((error) => {
        return error;
    });
  }

  createSeguimiento(data){
    return http.post(`/ueggPcpaIndicadoresEjecucion`, data).catch((error) => {
        return error;
    });
  }

  getContruccionUnidadEducativa(data){
    return http.get(`/ueggPcpaConstruccion/${data}`,).catch((error) => {
        return error;
    });
  }


  
  findActividadesPromocion(data){
     return  http.get(`/ueggPcpaActividadesPromocionList/${data}`,).catch((error) => {
         return error;
     });
 
   }

  findActividadesEjecutadas(data){
     return  http.get(`/ueggPcpaActividadesEjecutadasList/${data}`,).catch((error) => {
         return error;
     });
 
   }


}

export default new ConvivenciaPacificaService();
