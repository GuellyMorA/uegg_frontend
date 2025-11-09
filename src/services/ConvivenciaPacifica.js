import http from 'axios';
import http2 from 'axios';
import { toast } from 'vue3-toastify';

const apiUrl = import.meta.env;

class ConvivenciaPacificaService {

  findIdConstByCiAndUe(data){  // en back 
    return  http.get(`/ueggPcpaConstruccion/ci/${data.username}/idUE/${data.idUE}`,).catch((error) => {
        return error;
    });
  }


 // devuelve el ID de Construcción. 
  findIdConstByCiAndUeSetVariables = async (payload) => { 
    
      try {    
          const res = await this.findIdConstByCiAndUe(payload); //   22]

          if (res.status === 200 && res.data && res.data.length > 0) { //   23]
              if (res.data.length === 1) {
                  localStorage.setItem('idConst', res.data[0].id);
                  console.log('findIdConstByCiAndUe -> localStorage.getItem(idConst) : ',res.data[0].id );  
                  return res.data[0].id; // Retorna el ID de Construcción.
              } else {
                  localStorage.setItem('findIdConstByCiAndUe -> localStorage.getItem(idConst) : ', '0');
                  toast.warn('Se encontraron múltiples o ninguna construcción para esta UE.', { autoClose: 3500 }); //   26]
                  return 0;
              }
          } else {
              toast.error('No se encontró una construcción para la UE', { autoClose: 3500 }); //   27]
              return 0;
          }
      } catch (error) {
          console.error("Error en findIdConstByCiAndUeSetVariables. No se encontró una construcción para la UE:", error);
          toast.error('Error en findIdConstByCiAndUeSetVariables. No se encontró una construcción para la UE', { autoClose: 3500 }); //   29]
          return null;
      }
  };


  findUeByCiAndCodSie(data){  // en back  getByCiAndCodSie  -->  ueggPcpaUnidadEducativa/ci/:ci/codSie/:codSie
    return  http.get(`/ueggPcpaUnidadEducativa/ci/${data.username}/codSie/${data.codSie}`,).catch((error) => {
        return error;
    });
  }
  //devuelve el idUE desde uegg_pcpa_unidad_educativa  ---
  findUeByCiAndCodSieSetVariables = async (payload) => {
  try {
   //   Usamos 'this' para acceder al otro método
        const res = await this.findUeByCiAndCodSie(payload);
        console.log('Respuesta de findUeByCiAndCodSie →', res);

        if (res.status === 200 && res.data && res.data.length >= 1) { // [cite: 113-114]
        localStorage.setItem('existeEnBD', 'true');
        console.log('existeEnBD →', 'true');
        localStorage.setItem('dataUE', JSON.stringify(res.data));

        const storedData = localStorage.getItem('dataUE');
        let dataUE = storedData ? JSON.parse(storedData) : null;
        //const idUE = ref(dataUE[0].id); //   ref({ci:userData.codigo_sie , codigo_sie:userData.codigo_sie } );// Usar el SIE del usuario logueado
        localStorage.setItem('idUE', JSON.stringify(dataUE[0].id));
        console.log('idUE →', localStorage.getItem('idUE'));
          console.log('findUeByCiAndCodSie -> localStorage.getItem(idUE) : ',res.data[0].id );  
        return res.data[0].id;

      } else {
        localStorage.setItem('existeEnBD', 'false');
        console.log('existeEnBD →','false');
        localStorage.setItem('dataUE', JSON.stringify([{ id: 0 }]));

        localStorage.setItem('idUE', '0');
        console.log('No se encontró una UE en findUeByCiAndCodSie -> localStorage.getItem(idUE) :','0');

        toast.error('No se encontró una UE registrada en base de datos local para el Director', {
        autoClose: 5000,    position: toast.POSITION.TOP_RIGHT,   });
        
         return 0;
    }

  } catch (error) {
    console.error('❌ Error en findUeByCiAndCodSieSetVariables. No se encontró una UE registrada en base de datos local para el Director:', error);
    toast.error('❌  Error en findUeByCiAndCodSieSetVariables. No se encontró una UE registrada en base de datos local para el Director', {
                autoClose: 3000,      position: toast.POSITION.TOP_RIGHT,    });

    return 0;
  }
  };

  
  getContruccionUnidadEducativa(data){
    return http.get(`/ueggPcpaConstruccion/${data}`,).catch((error) => {
        return error;
    });
  }


  createContruccion(data){
    return http.post(`/ueggPcpaConstruccion`, data).catch((error) => {
        return error;
    });
  } 
  
  updateContruccion(id,data) {
    return http2({
      method:'put',
      url: `/ueggPcpaConstruccion/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data
    })
    .catch((error) => {
      console.log("error ueggPcpaConstruccion  url  : ", error.config.url,data);
        return error;
    });
  }

  xxxdeleteConstruccion(id){
    return http.put(`/ueggPcpaConstruccionDel/${id}`).catch((error) => {
        return error;
    });
  } 

  createUnidadEducativa(data){//  ueggPcpaUnidadEducativa
    return http.post(`/ueggPcpaUnidadEducativa`, data).catch((error) => {
        return error.response;
    });
  }

  updateUnidadEducativa(id,data) {
    return http2({
      method:'put',
      url: `/ueggPcpaUnidadEducativa/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data
    })
    .catch((error) => {
      console.log("error ueggPcpaUnidadEducativa  url  : ", error.config.url,data);
        return error;
    });
  }


  createMiembroComision(data){
    return http.post(`/ueggPcpaMiembroComision`, data).catch((error) => {
        return error;
    });
  } 

  updateMiembroComision(id,data) {
    return http2({
      method:'put',
      url: `/ueggPcpaMiembroComision/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data
    })
    .catch((error) => {
      console.log("error ueggPcpaMiembroComision  url  : ", error.config.url,data);

        return error;
    });

  }
  deleteMiembroComision(id){
    return http.put(`/ueggPcpaMiembroComisionDel/${id}`).catch((error) => {
        return error;
    });
  } 
  listMiembrosComision(data){
    return http.get(`/listMiembrosComision/${data}`).catch((error) => {
        return error;
    });
  } 
  findMiembrosComisionConstruccion(data){
    return  http.get(`/ueggPcpaMiembroComisionList/${data}`,).catch((error) => {
        return error;
    });

  }

  findMiembrosByCodSieSetVariables = async (codSie) => {
    try {

      const res = await this.findMiembrosComisionConstruccion(codSie);
      console.log('Respuesta de listMiembrosComision →', res);

      if (res.status === 200 && res.data && res.data.length > 0) { //   23]
          if (res.data.length === 1) {
              localStorage.setItem('existeMiembro', 'true');
              localStorage.setItem('existeMiembroTipo', 'true');        
              console.log('findMiembrosByCodSie -> existeMiembro : ', localStorage.getItem('existeMiembro'));  
              return true;
        } else {
          localStorage.setItem('existeMiembro', 'false');
          localStorage.setItem('existeMiembroTipo', JSON.stringify([{ id: 0 }]));
          console.log('No se encontró miembros en findMiembrosByCodSie -> existeMiembro : ', localStorage.getItem('existeMiembro'));  
          
          return false;
        }
        
      
      } else {
        toast.error('No se encontró una miembro para la UE', {
          autoClose: 3000,
          position: toast.POSITION.TOP_RIGHT,
        });
        return false;
      }

    } catch (error) {
      console.error('❌ Error en findMiembrosByCodSie. No se encontró miembros en findMiembrosByCodSie:', error);
      toast.error('❌ Error en findMiembrosByCodSie. No se encontró miembros en findMiembrosByCodSie', {
        autoClose: 3000,
        position: toast.POSITION.TOP_RIGHT,
      });
      return false;
    }
  };





  createTarea(data){
    return http.post(`/ueggPcpaActividadesPromocion`, data).catch((error) => {
        return error;
    });
  } 
  updateTarea(id,data) {
    return http2({
      method:'put',
      url: `/ueggPcpaActividadesPromocion/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data    
    })
    .catch((error) => {
      console.log("error ueggPcpaActividadesPromocion  url  : ", error.config.url,data);

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

  
  createTareaPromover(data){
    return http.post(`/ueggPcpaActividadesPromocion`, data).catch((error) => {
        return error;
    });
  } 
  updateTareaPromover(id,data) {
    return http2({
      method:'put',
      url: `/ueggPcpaActividadesPromocion/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data    
    })
    .catch((error) => {
      console.log("error ueggPcpaActividadesPromocion  url  : ", error.config.url,data);

        return error;
    });

  }
  createMiembroComisionAprobacion(data){
    return http.post(`/ueggPcpaMiembroComision`, data).catch((error) => {
        return error;
    });
  } 
 updateMiembroComisionAprobacion(id,data) {
    return http2({
      method:'put',
      url: `/ueggPcpaMiembroComision/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data    
    })
    .catch((error) => {
      console.log("error ueggPcpaMiembroComision  url  : ", error.config.url,data);

        return error;
    });

  }


  createSocializacion(data){
    return http.post(`/ueggPcpaActividadesEjecutadas`, data).catch((error) => {
        return error;
    });
  }
 updateSocializacion(id,data) {
    return http2({
      method:'put',
      url: `/ueggPcpaActividadesEjecutadas/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data    
    })
    .catch((error) => {
      console.log("error ueggPcpaActividadesEjecutadas  url  : ", error.config.url,data);

        return error;
    });

  }


  createSeguimiento(data){
    return http.post(`/ueggPcpaIndicadoresEjecucion`, data).catch((error) => {
        return error;
    });
  }
  updateSeguimiento(id,data) {
    return http2({
      method:'put',
      url: `/ueggPcpaIndicadoresEjecucion/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data    
    })
    .catch((error) => {
      console.log("error ueggPcpaIndicadoresEjecucion  url  : ", error.config.url,data);

        return error;
    });

  }

    createAccionesEjecucion(data){
    return http.post(`/ueggPcpaAccionesEjecucion`, data).catch((error) => {
        return error;
    });
  }
  updateAccionesEjecucion(id,data) {
    return http2({
      method:'put',
      url: `/ueggPcpaAccionesEjecucion/${id}`,
     // baseURL: apiUrl.VITE_API_URL_UEGG_AUTH,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_TOKEN
      },      
    data:data    
    })
    .catch((error) => {
      console.log("error ueggPcpaAccionesEjecucion  url  : ", error.config.url,data);

        return error;
    });
  }
    findAccionesEjecucion(data){
     return  http.get(`/ueggPcpaAccionesEjecucionList/${data}`,).catch((error) => {
         return error;
     });
 
   }
    findIndicadoresEjecucion(data){
     return  http.get(`/ueggPcpaIndicadoresEjecucionList/${data}`,).catch((error) => {
         return error;
     });
 
   }
  getIndicadorTipo(){
    return http.get(`/ueggPcpaIndicadoresTipo`).catch((error) => {
        return error;
    });
  }
  getActividadTipo(){
    return http.get(`/ueggPcpaActividadesTipo`).catch((error) => {
        return error;
    });
  }


  findInstitucionEducativa(id){
    
    //const user = JSON.parse(localStorage.getItem('user'));
    return http2({
      method:'get',
      url: `/institucioneducativa/${id}`,
      baseURL: apiUrl.VITE_API_URL_SIE,
      headers: {
        "Content-Type": "application/json",
      'Authorization': "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvX2lkIjo5MjQ5ODEyMiwiaWF0IjoxNjY4OTQ5OTAwfQ.ikRwPaCK379wwZgujPX1l1EGodkbSVdPI9RsrXRJQFo",
       
      },
    })
    .catch((error) => {
        return error;
    });

  }
}

export default new ConvivenciaPacificaService();
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
