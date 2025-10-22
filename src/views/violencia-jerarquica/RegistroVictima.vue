<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import { VDataTable } from 'vuetify/labs/VDataTable';
import ViolenciaJerarquica from '@/services/ViolenciaJerarquica';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import EstudianteEmbarazo from '@/services/EstudianteEmbarazo';

import { values } from 'lodash';
// import { useNavbarStore } from '@/stores/navbar';
// const store = useNavbarStore();  
// store.setPath('/convivencia/pacifica');
const router = useRouter();

const valid = ref(false);
const dialog = ref(false);
const list = ref();
const validationErrors = ref();
const dialogSave = ref(false);
const victima = ref();
const caso = ref();
const institucionEducativa = ref();

const formSearch = ref({
    codigoRude: '',
    codigoRda: '',
    usuario: ''
});
let username: string | null ;

const form: any = ref({
    codigoRude: '',
    estudianteNombre: '',
    codigoRda: '',
    maestroNombre: null,
    usuario: '',
    numeroCaso: '',
    fechaAgresion: null,
    cantidadVictima: '',
    numeroVictima: '',
    carnetIdentidad: null,
    complemento: '',
    paterno: '',
    materno: '',
    nombre: '',
    edad: null,
    fechaNacimiento: null,
    sexo: '',
    genero: '',
    nivel: '',
    grado: null,
    direccionActual: '',
    celular: ''
});
// --- Variables de Estado Nuevas ---
const readOnlyVar = ref( localStorage.getItem('existeEnBD')==='true' ? true : false  );
console.log('existeEnBD-readOnlyVar : ', localStorage.getItem('existeEnBD'));   
const registroExiste = ref(readOnlyVar);
const isLoading = ref(true);
const dataUE = JSON.parse(localStorage.getItem('dataUE'));
const idUE = dataUE[0].id; //   ref({ci:userData.codigo_sie , codigo_sie:userData.codigo_sie } );// Usar el SIE del usuario logueado

// Controla si los campos del formulario están deshabilitados o no
const isFormDisabled = ref(true); 
const isFormDisabledFromNew = ref(true); 


// Habilita el formulario para un nuevo registro. Ejemplo: limpiar campos
const iniciarNuevoRegistro = () => {
    console.log('Ingresar nuevo registro clickeado.');
   isFormDisabled.value = false;
   isFormDisabledFromNew.value = false;
};

// Habilita el formulario para editar un registro existente y deshabilita el botón
const modificarRegistro = () => {
    console.log('modificar registro .');
    isFormDisabled.value = false;
};
onMounted(async() => {
    username = localStorage.getItem('username') ;
     isLoading.value = false;
    let user = JSON.parse(localStorage.getItem('user') || '');
    if(user && user.codigo_sie){
        findInstitucionEducativa(user.codigo_sie);

    //     const res1 = await ViolenciaJerarquica.findVictimaRda(user.codigo_sie).then((data) => {
    //         console.log("data1", data.data, data.status);
    //         if(data.status === 200){
    //             construccion.value = data.data;  
    //         } else {
    //             toast.error('Construcción PCPA no encontrados', {
    //                 autoClose: 3000,
    //                 position: toast.POSITION.TOP_RIGHT,
    //             });
    //         }
    //     });

    }
}); 

const findInstitucionEducativa = async (sie: any) => {
    if(String(sie).length === 8){
        const res = await ConvivenciaPacifica.findInstitucionEducativa(sie);
        console.log("res", res);
        if(res.data && res.data.length > 0){
            institucionEducativa.value = res.data[0];
        }
    } else {
        institucionEducativa.value = null;
    }
}; 

const sieRules = [
    (value: any) => {
        if (value) return true
        return 'El SIE es requerido'
    },
    (value: any) => {
        if (value?.length === 8) return true
        return 'El código SIE requiere 8 dígitos.'
    },
];

const save = async () => {
    console.log(form.value);
    if (!validateForm()) {
        dialog.value = false;  
        toast.info('Debe ingresar los datos requeridos', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
        return false;
    }

    // var dateParts = (form.value.fechaNacimiento).split("-");
     

    // const validaCaso = await ViolenciaJerarquica.findCaso(form.value.numeroCaso).then((res) => {
    //     console.log('res', res);
    //     if(res.status === 200){
    //         if(res.data.length > 0) {
    //             toast.info('caso validado', {
    //                 autoClose: 3000,
    //                 position: toast.POSITION.TOP_RIGHT,
    //             });
    //             caso.value = res.data[0];
    //             return true;
    //         } else {
    //             toast.error('caso no validado', {
    //                 autoClose: 3000,
    //                 position: toast.POSITION.TOP_RIGHT,
    //             });
    //             return false;
    //         }
    //     } else {
    //         toast.error('caso no validado', {
    //             autoClose: 3000,
    //             position: toast.POSITION.TOP_RIGHT,
    //         });
    //         return false;
    //     }
    // });

    // console.log('validaCaso', validaCaso);

    // if(!validaCaso){
    //     return false;
    // }

    const validaEstudiante = await EstudianteEmbarazo.findEstudiante(form.value).then((res) => {
        console.log('res', res);
        if(res.status === 200){
            if(res.data.length > 0) {
                toast.info('Estudiante validado', {
                    autoClose: 3000,
                    position: toast.POSITION.TOP_RIGHT,
                });

                form.value.sexo = 'F', //res.data[0].genero || ' ';
                form.value.genero = res.data[0].genero || ' ';
                form.value.nivel = res.data[0].nivel;
                form.value.grado = res.data[0].grado;
                return true;
            } else {
                toast.error('Estudiante no validado', {
                    autoClose: 3000,
                    position: toast.POSITION.TOP_RIGHT,
                });
                return false;
            }
        } else {
            toast.error('Estudiante no validado', {
                autoClose: 3000,
                position: toast.POSITION.TOP_RIGHT,
            });
            return false;
        }
    });

    if(!validaEstudiante){
        return false;
    }

    if (!validateConfirmForm()) {
        dialog.value = false;  
        toast.info('Debe validar los datos del estudiante', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
        return false;
    }

    var dateParts = (form.value.fechaNacimiento || '').split("/");

    const payload = {    
        uegg_violencia_caso_agresor_id: null, //caso.value.id,
        cod_ue: institucionEducativa.value.institucioneducativa_id,
        desc_ue: institucionEducativa.value.institucioneducativa,
        cod_sie: institucionEducativa.value.institucioneducativa_id,
        cod_rda_director: institucionEducativa.value.director,
        cod_director: institucionEducativa.value.director,
        cod_rude: form.value.codigoRude,
        nombres_victima: form.value.nombre,
        apellido_pat_victima: form.value.paterno,
        apellido_mat_victima: form.value.materno,
        fec_nac: new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]),
        sexo: form.value.sexo,
        genero: form.value.genero,
        nivel: form.value.nivel,
        grado: form.value.grado, 
        dir_actual: form.value.direccionActual,
        celular_contacto: form.value.celular,
        num_ci: form.value.carnetIdentidad,
    
        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }
    console.log(payload);

    const save = await ViolenciaJerarquica.createVictima(payload).then((res) => {
        if(res.status === 201){
            toast.info('Registro guardado correctamente', {
                autoClose: 3000,
                position: toast.POSITION.TOP_RIGHT,
            });
            dialog.value = false;  
            dialogSave.value = true; 
            return res;
        } else {
            toast.error('Registro no guardado', {
                autoClose: 3000,
                position: toast.POSITION.TOP_RIGHT,
            });
            return res;
        }
    });
    console.log("save", save);

    dialog.value = false;  
    dialogSave.value = true;   
};

const reset = () => {
    form.value = {
        codigoRude: '',
        estudianteNombre: '',
        codigoRda: '',
        maestroNombre: null,
        usuario: '',
        numeroCaso: '',
        fechaAgresion: null,
        cantidadVictima: '',
        numeroVictima: '',
        carnetIdentidad: null,
        complemento: '',
        paterno: '',
        materno: '',
        nombre: '',
        edad: null,
        fechaNacimiento: null,
        sexo: '',
        genero: '',
        nivel: '',
        grado: null,
        direccionActual: '',
        celular: ''
    };
    dialogSave.value = false;
};

const onDateInput1 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaAgresion = onDateInput(cleanedInput);
};

const onDateInput2 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.fechaNacimiento = onDateInput(cleanedInput);
};

const onDateInput = (cleanedInput: any) => {
    if (cleanedInput.length <= 2) {
        return cleanedInput;
    } else if (cleanedInput.length <= 4) {
        return cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2);
    } else if (cleanedInput.length <= 8) {
        return cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2, 4) + '/' + cleanedInput.slice(4, 8);
    } else {
        return cleanedInput.slice(0, 2) + '/' + cleanedInput.slice(2, 4) + '/' + cleanedInput.slice(4, 8);
    }
};

const searchVictimaCodigoRude = async () => {    
    console.log(formSearch.value.codigoRude);
    if (!formSearch.value.codigoRude){
        toast.error('Debe ingresar el Código RUDE', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    const res = await ViolenciaJerarquica.findVictimaRude(formSearch.value.codigoRude);
    console.log("res", res);
    if(res.status === 200 && res.data && res.data.length > 0){
        list.value = res.data;
        console.log(res.data);
    } else {
        list.value = null;
    }
};

const searchVictimaCodigoRda = async () => {
    console.log(formSearch.value.codigoRda);
    if (!formSearch.value.codigoRda){
        toast.error('Debe ingresar el Código RDA', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    const res = await ViolenciaJerarquica.findVictimaRda(formSearch.value.codigoRda);
    console.log("res", res);
    if(res.status === 200 && res.data && res.data.length > 0){
        list.value = res.data;
        console.log(res.data);
    } else {
        list.value = null;
    }
};

const searchCaso = async () => {
    if (!form.value.numeroCaso){
        toast.error('Debe ingresar el Código del Caso1', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
    }
    const res = await ViolenciaJerarquica.findCaso(form.value.numeroCaso);
    console.log("res", res);
    if(res.status === 200 && res.data && res.data.length > 0){
        caso.value = res.data[0];
        var dateParts = (res.data[0].fec_agresion || '').split("-");
        form.value.fechaAgresion = dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0];
        console.log(res.data);
    } else {
        form.value.fechaAgresion = null;
    }
};

const searchVictimaUsuario = () => {
    list.value = plants;
    console.log(formSearch);
};

const viewItem = (item: any) => {
    console.log(item);
    victima.value = item;
    form.value.codigoRude = item.cod_rude;
    form.value.carnetIdentidad = item.num_ci || '';
    form.value.complemento = item.complemento || '';
    form.value.paterno = item.apellido_pat_victima;
    form.value.materno = item.apellido_mat_victima;
    form.value.nombre = item.nombres_victima;
    const dateParts = (item.fec_nac || '').split("-");
    form.value.fechaNacimiento = dateParts[2] +'/'+ dateParts[1] +'/'+ dateParts[0];
    // form.value.fechaNacimiento = item.fec_nac;
    form.value.sexo = item.sexo;
    form.value.genero = item.genero;
};

const headers = [
    { title: 'S.I.E.', align: 'start', sortable: false, key: 'cod_ue' },
    { title: 'Unidad Educativa', align: 'end', key: 'desc_ue' },
    { title: 'Director', align: 'end', key: 'cod_rda_director' },
    { title: 'RUDE', align: 'end', key: 'cod_rude' },
    { title: 'Nombre', align: 'end', key: 'nombres_victima' },
    { title: 'Paterno', align: 'end', key: 'apellido_pat_victima' },
    { title: 'Materno', align: 'end', key: 'apellido_mat_victima' },
    { title: 'Fecha de Nacimiento', align: 'end', key: 'fec_nac' },
    { title: 'Actions', key: 'actions', sortable: false, align:'center' },
];

const plants = [
      {
        id: 0,
        name: 'Fern',
        light: 'Low',
        height: '20cm',
        petFriendly: 'Yes',
        price: 20,
      }
];

const validateForm = () => {
    validationErrors.value = {};

    // if (!form.value.numeroCaso) validationErrors.value['numeroCaso'] = true;
    // else delete validationErrors.value['numeroCaso'];

    // if (!form.value.fechaAgresion) validationErrors.value['fechaAgresion'] = true;
    // else delete validationErrors.value['fechaAgresion'];

    // if (!form.value.cantidadVictima) validationErrors.value['cantidadVictima'] = true;
    // else delete validationErrors.value['cantidadVictima'];

    if (!form.value.numeroVictima) validationErrors.value['numeroVictima'] = true;
    else delete validationErrors.value['numeroVictima'];

    if (!form.value.codigoRude) validationErrors.value['codigoRude'] = true;
    else delete validationErrors.value['codigoRude'];

    // if (!form.value.carnetIdentidad) validationErrors.value['carnetIdentidad'] = true;
    // else delete validationErrors.value['carnetIdentidad'];

    // if (!form.value.complemento) validationErrors.value['complemento'] = true;
    // else delete validationErrors.value['complemento'];

    // if (!form.value.paterno) validationErrors.value['paterno'] = true;
    // else delete validationErrors.value['paterno'];

    if (!form.value.materno) validationErrors.value['materno'] = true;
    else delete validationErrors.value['materno'];

    if (!form.value.nombre) validationErrors.value['nombre'] = true;
    else delete validationErrors.value['nombre'];

    if (!form.value.fechaNacimiento) validationErrors.value['fechaNacimiento'] = true;
    else delete validationErrors.value['fechaNacimiento'];

    // if (!form.value.sexo) validationErrors.value['sexo'] = true;
    // else delete validationErrors.value['sexo'];

    // if (!form.value.genero) validationErrors.value['genero'] = true;
    // else delete validationErrors.value['genero'];

    // if (!form.value.nivel) validationErrors.value['nivel'] = true;
    // else delete validationErrors.value['nivel'];

    // if (!form.value.grado) validationErrors.value['grado'] = true;
    // else delete validationErrors.value['grado'];

    if (!form.value.direccionActual) validationErrors.value['direccionActual'] = true;
    else delete validationErrors.value['direccionActual'];

    if (!form.value.celular) validationErrors.value['celular'] = true;
    else delete validationErrors.value['celular'];
   
    return !Object.keys(validationErrors.value).length;
};

const validateConfirmForm = () => {
    validationErrors.value = {};

    if (!form.value.sexo || !form.value.genero || !form.value.nivel || !form.value.grado) validationErrors.value['estudiante'] = true;
    else delete validationErrors.value['estudiante'];
   
    return !Object.keys(validationErrors.value).length;
};

</script>

<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Búsqueda de víctima</v-card-title>
                    
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                        <v-row>
                            <v-col cols="12" md="12">
                                <v-text-field v-model="formSearch.codigoRude" density="compact" variant="solo" label="Código RUDE" append-inner-icon="mdi-magnify" single-line hide-details  @click:append-inner="searchVictimaCodigoRude" ></v-text-field>
                            </v-col>
                                                    </v-row>
                        </v-container>
                    </v-form>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
    <v-row v-if="list">    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2 mb-3">
                        <v-card-title class="text-h5">Víctimas</v-card-title>
                    </div>
                    <v-data-table :headers="headers" :items-per-page="5" :items="list" density="comfortable" item-key="id" :disabled="isFormDisabled">
                        <template v-slot:item.actions="{ item }">
                            <v-icon size="small" class="me-2" @click="viewItem(item)" :disabled="isFormDisabled">mdi-eye</v-icon>
                        </template>
                    </v-data-table>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Registro de víctima</v-card-title>
                             <div class="d-flex align-center">
                            <v-progress-circular v-if="isLoading" indeterminate color="primary" size="24" class="mr-4"></v-progress-circular>
                            
                            <v-btn v-if="!registroExiste && !isLoading" color="primary" class="ml-2" @click="iniciarNuevoRegistro" :disabled="!isFormDisabled" flat>
                                Ingresar nuevo registro
                            </v-btn>

                            <v-btn v-if="registroExiste && !isLoading" color="info" class="ml-2" @click="modificarRegistro" :disabled="!isFormDisabled" flat>
                                Modificar registro
                            </v-btn>
                            </div>
                    </div>
                    <v-form v-model="valid" class="">
                        <v-container>
                        <v-row>
                            <v-col cols="12" md="12">                                
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos de la víctima</span>
                                </div>
                            </v-col>
                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.numeroVictima" type="number" label="Víctima nro." hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.codigoRude" label="Código RUDE" hide-details required :readonly="!!victima" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.carnetIdentidad" type="number" label="Número de C.I." hide-details required :readonly="!!victima" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.complemento"  label="Complemento" hide-details required :readonly="!!victima" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.paterno" label="Apellido Paterno" hide-details required :readonly="!!victima" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.materno" label="Apellido Materno" hide-details required :readonly="!!victima" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.nombre" label="Nombre(s)" hide-details required :readonly="!!victima" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.fechaNacimiento" label="Fecha de nacimiento" @input="onDateInput2" placeholder="DD/MM/AAAA" hide-details required :readonly="!!victima" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.sexo" label="Sexo F/M" hide-details required :readonly="!!victima" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            
                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.nivel" label="Nivel" hide-details required :readonly="!!victima" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.grado" label="Grado" hide-details required :readonly="!!victima" :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.celular" type="number" label="Celular de contacto" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>  

                            <v-col cols="12" md="12" >
                                <v-text-field v-model="form.direccionActual" label="Dirección actual" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>        

                            <v-col cols="12" md="12" >                                
                                <v-dialog v-model="dialog" persistent width="auto" >
                                    <template v-slot:activator="{ props }">                                    
                                        <v-btn size="large" rounded="pill" color="primary" class="rounded-pill" block type="button" flat v-bind="props" :disabled="isFormDisabled">Registrar</v-btn>
                                    </template>
                                    <v-card>
                                        <v-card-title class="text-h5">
                                        Confirmar
                                        </v-card-title>
                                        <v-card-text>¿ Está seguro de guardar el registro ?</v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="green-darken-1" variant="text" @click="dialog = false" :disabled="isFormDisabled"> Cancelar </v-btn>
                                            <v-btn color="green-darken-1" variant="text" @click="save" :disabled="isFormDisabled"> Aceptar </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </v-col>
                        </v-row>
                        </v-container>
                    </v-form>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
    <v-dialog v-model="dialogSave" persistent width="auto" >
        <v-card>
            <v-card-title class="text-h5">
            Mensaje
            </v-card-title>
            <v-card-text>¿ Nuevo registro ? (Si ya añadió el registro y quiere modificarlo escoja NO)</v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="green-darken-1" variant="text" @click="router.push('/violencia/jerarquica')" :disabled="isFormDisabled"> NO </v-btn>
                <v-btn color="green-darken-1" variant="text" @click="reset" :disabled="isFormDisabled"> SI </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>