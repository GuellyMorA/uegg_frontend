import http from 'axios';
import http2 from 'axios';
const apiUrl = import.meta.env;

class AuthService {
  
  login(form){
    return http2({
      method:'post',
      url: `/auth`,
      baseURL: apiUrl.VITE_API_URL_AUTH,
      data: form,
      headers: {
        "Content-Type": "application/json",
        'Authorization': apiUrl.VITE_API_URL_AUTH_TOKEN === "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvX2lkIjo5MjQ5ODEyMiwiaWF0IjoxNzEyMjA1OTY5fQ.LsnO4syEI1WT-BDL1qxjPicRHU__XUeHJyGCS5gAZCo" ? "" : apiUrl.VITE_API_URL_AUTH_TOKEN
      },
    })
    .catch((error) => {
        return error;
    });

    // return http.create({
    //   withCredentials: true,
    //   method:'post',
    //   url: `/auth`,
    //   baseURL: 'https://api.infraestructura.sie.gob.bo/api',
    //   data: form,
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    // })
    // .patch((error) => {
    //     return error;
    // });
  }
 
}
  
export default new AuthService();
