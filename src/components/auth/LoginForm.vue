<script setup lang="ts">
import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
// **ASUME que este servicio puede manejar peticiones con el token**
import Auth from '@/services/Auth'; 
// **Necesitarás un servicio para obtener las Unidades Educativas. Podría ser el mismo 'Auth' o uno nuevo.**
// import UnidadEducativaService from '@/services/UnidadEducativaService'; 

import { useRouter } from 'vue-router';
const router = useRouter();

const checkbox = ref(false);
const form = ref({
    username: '4269776', //1895306
    password: '123456', //81720006
    sistema: 'UEGG',
    codSie: ''
});

// --- Nuevas variables de estado para el Modal y Unidades Educativas ---
const showModal = ref(false);
const unidadesEducativas = ref<any[]>([]);          // Lista de unidades: [{ codigo_sie: 1234, nombre: 'UE X' }, ...]
const selectedUnidad = ref<any | null>(null);
//const loginToken = ref<string>(''); // Para almacenar el token temporalmente
  const   tecnicoSIEval= ref<any | null>(null); 
const existeCiAndCodSie= ref<any | null>(null); 

// --- Función para almacenar la sesión y redirigir ---
const finalizeLogin = (sie: string, dependencia: string, username: string, typeUser: string , permiso: string ) => {

     localStorage.setItem('user', JSON.stringify({
            codigo_sie: sie, 
            dependencia:dependencia,
            username :username, 
            typeUser:typeUser,
            permiso:  permiso
        }));
    router.push('/'); 
};

// --- Función  para obtener Director y UE desde uegg_pcpa_unidad_educativa  ---
const findByCiAndCodSie = async () => {  
    form.value.codSie= localStorage.getItem('codigo_sie') || '';
     const tecnico = await ConvivenciaPacifica.findByCiAndCodSie(form.value).then((res) => {
        if (res.status === 200) {
            console.log('  findByCiAndCodSie   res : ', res.data);    
            existeCiAndCodSie.value = res.data|| [];  //  tecnico.data.data|| [];
            if (existeCiAndCodSie.value.length === 1) {
              //  finalizeLogin('','FISCAL', form.value.username,'directorUE','CONV_PACIF:true|REPORTES:[allEdit:true]');
              localStorage.setItem('existeEnBD','true');
             // return true; 
            }else{
              localStorage.setItem('existeEnBD','false');
            }
               
            return true;   
           
        } else {
            toast.error('No se encontro una UE para el Director', {
                autoClose: 3000,
                position: toast.POSITION.TOP_RIGHT
            });
           
            return false;
        }
    }).catch(() => {
        toast.error('Error de conexión con el servidor.', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT
        });
    });    
    
    return tecnico; 
}

// --- Función  para obtener tecnico SIE ---
const fetchUsuarioTecnicoSIE = async () => {  
     const tecnico = await Auth.listUsuarioTecnicoSIE(form.value).then((res) => {
        if (res.status === 200) {
            console.log('Auth.listUnidadesEducativasPorDirector res : ', res.data);    
            tecnicoSIEval.value = res.data.data|| [];  //  tecnico.data.data|| [];
             localStorage.setItem('existeEnBD','false');
             console.log('existeEnBD : ', localStorage.getItem('existeEnBD'));     
             
                // --- Lógica de verificación: Si existe un tecnico SIE
                if (tecnicoSIEval) {
                    finalizeLogin('','DISTRITAL', form.value.username,'tecnicoSIE','CONV_PACIF:true|REPORTES:[allEdit:true]');
                    return true; // Login finalizado
                }
             console.log('user : ', localStorage.getItem('user'));  
            return true;   // NOTA: No redirigimos aquí, esperamos la selección en el modal.
           
        } else {
            toast.error('No se encontro el CI del técnico', {
                autoClose: 3000,
                position: toast.POSITION.TOP_RIGHT
            });
           
            return false;
        }
    }).catch(() => {
        toast.error('Error de conexión con el servidor.', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT
        });
    });  
    
    return tecnico; // Necesita selección manual
};

// --- Función  para obtener unidades educativas ---
const fetchUnidadesEducativasPorDirector = async () => {  
    // **AQUÍ VA TU LÓGICA DE LLAMADA AL ENDPOINT**
        const unidadesEducativasObj = await Auth.listUnidadesEducativasPorDirector(form.value).then((res) => {
            if (res.status === 200) {
                console.log('Auth.listUnidadesEducativasPorDirector: ', res.data);     
                  unidadesEducativas.value= res.data.data || []; //  unidadesEducativasObj.data.data|| [];
                     localStorage.setItem('user', JSON.stringify(res.data));
                // --- Lógica de verificación: Si solo hay una unidad, procede al login automático.
                if (unidadesEducativas.value.length === 1) {//  unidadesEducativas.data.data.length===1){ 
                    const singleUnit = unidadesEducativas.value[0];
                    finalizeLogin(singleUnit.codigo_sie,'FISCAL',  form.value.username,'DIRECTOR','CONV_PACIF:true|ALL:[allEdit:true]');
                    return true; // Login finalizado
                }
                            
                return true;   // NOTA: No redirigimos aquí, esperamos la selección en el modal.           
            } else {

                toast.error('No se encontraron UE para el CI del director', {
                    autoClose: 3000,
                    position: toast.POSITION.TOP_RIGHT
                });
            
                return false;
            }
        }).catch(() => {
            toast.error('Error de conexión con el servidor.', {
                autoClose: 3000,
                position: toast.POSITION.TOP_RIGHT
            });
        });

     
    
    return unidadesEducativasObj; // Necesita selección manual
};

   // Ejemplo de datos simulados. Reemplazar con la llamada a la API 
   // unidadesEducativas.value = [    // Para probar con una sola unidad,  comenta 2 de abajo:
    //    { codigo_sie: '80730460', nombre: 'UE Don Bosco - SIE 80730460' },
     //   { codigo_sie: '12345678', nombre: 'UE San Calixto - SIE 12345678' },
     //   { codigo_sie: '98765432', nombre: 'UE Maria Auxiliadora - SIE 98765432' },
   // ];   //  console.log(`Fetching unidades educativas with data: ${JSON.stringify(unidadesEducativas.value, null, 2)}`);


// --- Función para manejar la selección de la Unidad Educativa ---
const selectUnidadEducativa = async () => {
    if (selectedUnidad.value ) {
        // Almacena la información de la sesión con el SIE seleccionado     
         finalizeLogin(selectedUnidad.value.codigo_sie,'FISCAL',  form.value.username,'DIRECTOR',   'write');

        localStorage.setItem('username', form.value.username);  
        localStorage.setItem('password',  form.value.password);
        localStorage.setItem('codigo_sie',  selectedUnidad.value.codigo_sie);          
        localStorage.setItem('typeUser',  'FISCAL');
        localStorage.setItem('dependencia',  'DIRECTOR');
        localStorage.setItem('permiso',  'write');
        showModal.value = false; // Cierra el modal
        const byCiAndCodSie = await findByCiAndCodSie();
        
          console.log('existeEnBD', localStorage.getItem('existeEnBD')); 
            console.log('user : ', localStorage.getItem('user'));  
        router.push('/'); // Redirige a la página principal
    } else {
        toast.error('Debe seleccionar una Unidad Educativa.', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT
        });
    }
};
// -------------------------------------------------------------------

const submit = async (event: any) => {
    const respuesta = fetchUnidadesEducativasPorDirector(); // await Auth.login(form.value).then( async (res) => {
        if (await respuesta) {  // res.status === 200) {
            //console.log('Auth.login: ', res.data);    
           // if (res.data.codigo_sie) {
                // Caso 1: El usuario tiene un SIE asignado directamente ->director
                //localStorage.setItem('user', JSON.stringify(res.data));
                localStorage.setItem('username', form.value.username);
              //rbc   router.push('/');             
               // Carga las unidades
               //  fetchUnidadesEducativasPorDirector() ;
              
               showModal.value = true; // Muestra el modal                       
              
                return respuesta;   // NOTA: No redirigimos aquí, esperamos la selección en el modal.
            } else {
              // Caso 2: El usuario NO tiene un SIE asignado -> tecnico sie
                if ( await  fetchUsuarioTecnicoSIE()) {                            
                     router.push('/');
                     return respuesta; 
                } 
               if ( unidadesEducativas.value.length === 0 ) {                         
                     toast.error('Usuario no tiene asignado una unidad educativa', {
                      autoClose: 3000,
                     position: toast.POSITION.TOP_RIGHT
                    });
                   localStorage.removeItem('user');
                     return respuesta; 
                } else {
                    toast.error('Usuario y contraseña no válido', {
                        autoClose: 3000,
                        position: toast.POSITION.TOP_RIGHT
                    });
                    localStorage.removeItem('user');
                    localStorage.removeItem('username');

                    return respuesta;
                } 

            }            
        
    /*}).catch(() => {
        toast.error('Error de conexión con el servidor.', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT
        });
    });*/
};
</script>

<template>
    <div class="d-flex align-center text-center mb-6">
        <div class="text-h6 w-100 px-5 font-weight-regular auth-divider position-relative">
            </div>
    </div>
    <div>
        <v-row class="mb-3">
            <v-col cols="12">
                <v-label class="font-weight-medium mb-1">Usuario</v-label>
                <v-text-field variant="outlined" class="pwdInput" hide-details color="primary" v-model="form.username"></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-label class="font-weight-medium mb-1">Contraseña</v-label>
                <v-text-field
                    variant="outlined"
                    class="border-borderColor"
                    type="password"
                    hide-details
                    color="primary"
                    v-model="form.password"
                ></v-text-field>
            </v-col>
            <v-col cols="12">
                <v-btn size="large" rounded="pill" color="primary" class="rounded-pill" block type="submit" flat @click="submit"
                    >Ingresar</v-btn
                >
            </v-col>
        </v-row>
    </div>

    <v-dialog 
        v-model="showModal" 
        persistent 
        max-width="500"
    >
        <v-card>
            <v-card-title class="text-h5 primary white--text">
                Selección de Unidad Educativa
            </v-card-title>
            
            <v-card-text class="pt-4">
                <p class="mb-4">Tu usuario está asociado a múltiples Unidades Educativas. Por favor, selecciona una para continuar:</p>
                
                <v-select
                    v-model="selectedUnidad"
                    :items="unidadesEducativas"
                    item-title="nombre_unidad_educativa" 
                    item-value="codigo_sie"
                    label="Selecciona una Unidad Educativa"
                    persistent-hint
                    return-object
                    single-line
                    variant="outlined"
                    clearable
                ></v-select>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn 
                    color="grey darken-1" 
                    text 
                    @click="showModal = false"
                >
                    Cancelar
                </v-btn>
                <v-btn 
                    color="primary" 
                    flat 
                    @click="selectUnidadEducativa"
                    :disabled="!selectedUnidad"
                >
                    Confirmar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    </template>