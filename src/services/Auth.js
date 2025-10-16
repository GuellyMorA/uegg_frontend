import http from 'axios';
import http2 from 'axios';
const apiUrl = import.meta.env;

class AuthService {
  
  login(form) {
    console.log("Datos enviados en LOGIN:", form); // <-- Imprime el valor del formulario

    return http2({
      method: 'post',
      url: `/auth`,
      baseURL: apiUrl.VITE_API_URL_AUTH,
      data: form,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_AUTH_TOKEN === "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvX2lkIjo5MjQ5ODEyMiwiaWF0IjoxNzEyMjA1OTY5fQ.LsnO4syEI1WT-BDL1qxjPicRHU__XUeHJyGCS5gAZCo"
          ? ""
          : apiUrl.VITE_API_URL_AUTH_TOKEN
      },
    })
    .then((response) => {
      console.log("Respuesta auth login:", response); // <-- Imprime la respuesta del servidor
      return response;
    })
    .catch((error) => {
      console.error("Error durante la autenticación:", error); // <-- Imprime el error si ocurre
      return error;
    });
  }

  listUsuarioTecnicoSIE(data) {
      console.log("Datos enviados TECNICO SIE: ", data); // <-- Imprime el valor del formulario

      return http2({
        method: 'get',
        url: `/uegg/DatosTecnicoSIE/${data.username}/${data.password}`,
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
      // console.log("Respuesta de listUnidadesEducativasPorDirector:", response); // <-- Imprime la respuesta del servidor
        return response;
      })
      .catch((error) => {
        console.error("Error 400 durante la autenticación Tecnico SIE:", error); // <-- Imprime el error si ocurre
        return error;
      });
  }

    listUnidadesEducativasPorDirector(data) {
      console.log("Datos enviados DIRECTOR: ", data); // <-- Imprime el valor del formulario
      return http2({
        method: 'get',
        url: `/uegg/DatosDirectorUE/${data.username}/${data.password}`,
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
      // console.log("Respuesta de listUnidadesEducativasPorDirector:", response); // <-- Imprime la respuesta del servidor
        return response;
      })
      .catch((error) => {
        console.error("Error durante la autenticación DIRECTOR UE:", error); // <-- Imprime el error si ocurre
        return error;
      });
    }
 
  }
  
  export default new AuthService();
