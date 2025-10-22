<script setup lang="ts">
import { ref, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useRouter } from "vue-router";
import { toast } from 'vue3-toastify';
import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
import EstudianteEmbarazo from '@/services/EstudianteEmbarazo';
// import { useNavbarStore } from '@/stores/navbar';
// const store = useNavbarStore();  
// store.setPath('/convivencia/pacifica');
const router = useRouter();

const valid = ref(false);
const dialog = ref(false);
const dialogSave = ref(false);
const validationErrors = ref();
const institucionEducativa = ref();
const find = ref(false);
const variusSie = ref(false);
const construccion = ref();
let username: string | null ;

const form: any = ref({
    sie: null,
    departamentoId: null,
    departamentoNombre: '',
    municipioId: null,
    municipioNombre: '',
    unidadEducativa: '',
    nivel: '',
    modalidad: '',
    director: '',
    reporteNombre1: '',
    reporteNombre2: '',
    reporteNombre3: '',
    estudianteCodigoRude: '',
    estudianteCedulaIdentidad: '',
    estudianteComplemento: ' ',
    estudiantePaterno: '',
    estudianteMaterno: '',
    estudianteNombre: '',
    estudianteFechaNacimiento: '',
    estudianteEdad: '',
    estudianteGrado: '',
    estudianteNivel: '',
    dispacidad: false,
    dispacidadCognitiva: false,
    dispacidadVisual: false,
    dispacidadAuditiva: false,
    dispacidadMotriz: false,
    dispacidadOtro: false,
    unionTemprana: false,
    validado: false
});

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
        form.value.sie = user.codigo_sie;
        findInstitucionEducativa();

        const res1 = await ConvivenciaPacifica.getContruccionUnidadEducativa(user.codigo_sie).then((data) => {
            console.log("data1", data.data, data.status);
            if(data.status === 200){
                construccion.value = data.data;  
            } else {
                toast.error('Construcción PCPA no encontrados', {
                    autoClose: 3000,
                    position: toast.POSITION.TOP_RIGHT,
                });
            }
        });
    }
}); 

const findInstitucionEducativa = async () => {
    console.log(form.value.sie);
    if(String(form.value.sie).length === 8){
        const res = await ConvivenciaPacifica.findInstitucionEducativa(form.value.sie);
        console.log("res", res);
        if(res.data && res.data.length > 0){
            form.value.departamentoId = res.data[0].departamento_codigo;
            form.value.departamentoNombre = res.data[0].departamento;
            form.value.municipioId = res.data[0].municipio_codigo;  
            form.value.municipioNombre = res.data[0].municipio;
            form.value.unidadEducativa = res.data[0].institucioneducativa;
            form.value.nivel = res.data[0].niveles_abrv;
            form.value.modalidad = res.data[0].dependencia;
            form.value.director = res.data[0].director;
            find.value = true;
            institucionEducativa.value = res.data[0];
            console.log(res.data[0], form.value.sie, res);
        }
    } else {
        institucionEducativa.value = null;
        find.value = false;
        form.value.departamentoId = null;
        form.value.departamentoNombre = '';
        form.value.municipioId = null;
        form.value.municipioNombre = '';
        form.value.unidadEducativa = '';
        form.value.nivel = '';
        form.value.modalidad = '';
        form.value.director = '';
    }
}; 

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

    const validaEstudiante = await EstudianteEmbarazo.findEstudiante(form.value).then((res) => {
        console.log('res', res);
        if(res.status === 200){
            if(res.data.length > 0) {
                toast.info('Estudiante validado', {
                    autoClose: 3000,
                    position: toast.POSITION.TOP_RIGHT,
                });

                form.value.validado = true;
                form.value.estudianteNivel = res.data[0].nivel;
                form.value.estudianteGrado = res.data[0].grado;
                form.value.estudianteEdad = res.data[0].edad;
                return res;
            }
        } else {
            toast.error('Estudiante no validado', {
                autoClose: 3000,
                position: toast.POSITION.TOP_RIGHT,
            });
            return res;
        }
    });

    if (!validateConfirmForm()) {
        dialog.value = false;  
        toast.info('Debe validar los datos del estudiante', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT,
        });
        return false;
    }

    const payload1 = {    
        id_pcpa_unidad_educativa: construccion.value.id,
        id_emb_reporte_embarazo_tipo_1: form.value.reporteNombre1?.id,
        id_emb_reporte_embarazo_tipo_2: form.value.reporteNombre2?.id,
        id_emb_reporte_embarazo_tipo_3: form.value.reporteNombre3?.id,
    
        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }

    console.log(payload1);

    const save1 = await EstudianteEmbarazo.createInformeEmbarazo(payload1).then((res) => {
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
    console.log("save1", save1);


    var dateParts = (form.value.estudianteFechaNacimiento).split("/");
            
    const payload2 = {    
        id_pcpa_unidad_educativa: construccion.value.id,
        id_emb_informe_embarazo: save1.data.id,
        cod_rude: form.value.estudianteCodigoRude,
        cedula_identidad: form.value.estudianteCedulaIdentidad,
        complemento: form.value.estudianteComplemento,
        fec_nacimiento:  new Date(dateParts[2] +'-'+ dateParts[1] +'-'+ dateParts[0]).toISOString(),   //// form.value.estudianteFechaNacimiento, //
        nombres_estudiante: form.value.estudianteNombre,
        apellido_pat_estudiante: form.value.estudiantePaterno,
        apellido_mat_estudiante: form.value.estudianteMaterno,
        nivel: form.value.estudianteNivel,
        grado: form.value.estudianteGrado,
        edad: form.value.estudianteEdad,
        check_estudiante_discapacidad: form.value.dispacidad,
        check_estudiante_casada: form.value.unionTemprana,
        check_estudiante_conviviente: form.value.unionTemprana,
    
        estado: 'ACTIVO',
       usu_cre: username,
        fec_cre: new Date()
    }

    console.log(payload2);

    const save2 = await EstudianteEmbarazo.createEstudianteEmbarazo(payload2).then((res) => {
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
    console.log("save2", save2);

    dialog.value = false;  
    dialogSave.value = true;   
};

const reset = () => {
    form.value.reporteNombre1 = '';
    form.value.reporteNombre2 = '';
    form.value.reporteNombre3 = '';
    form.value.estudianteCodigoRude = '';
    form.value.estudianteCedulaIdentidad = '';
    form.value.estudianteComplemento = '';
    form.value.estudiantePaterno = '';
    form.value.estudianteMaterno = '';
    form.value.estudianteNombre = '';
    form.value.estudianteFechaNacimiento = '';
    form.value.estudianteEdad = '';
    form.value.estudianteGrado = '';
    form.value.estudianteNivel = '';
    form.value.dispacidad = false;
    form.value.dispacidadCognitiva = false;
    form.value.dispacidadVisual = false;
    form.value.dispacidadAuditiva = false;
    form.value.dispacidadMotriz = false;
    form.value.dispacidadOtro = false;
    form.value.unionTemprana = false;
    form.value.validado = false;
    dialogSave.value = false;
};

const onDateInput1 = (event: any) => {
    const cleanedInput = event.target.value.replace(/\D/g, '');
    form.value.estudianteFechaNacimiento = onDateInput(cleanedInput);
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

const personaReporteTipo = [
    { id: 1, name: 'Estudiante embarazada' },  
    { id: 2, name: 'Pareja de estudiante' },  
    { id: 3, name: 'Familia de estudiante' },  
    { id: 4, name: 'Otro estudiante' },  
    { id: 5, name: 'Maestro/Maestra' },  
    { id: 6, name: 'Personal administrativo' },
    { id: 6, name: 'Director' },
    { id: 6, name: 'Otros' }
]

const validateForm = () => {
    validationErrors.value = {};

    if (!form.value.sie || !form.value.unidadEducativa) validationErrors.value['sie'] = true;
    else delete validationErrors.value['sie'];

    if (!form.value.reporteNombre1 && !form.value.reporteNombre2 && !form.value.reporteNombre3) validationErrors.value['reporteNombre'] = true;
    else delete validationErrors.value['reporteNombre'];


    if (!form.value.estudianteCodigoRude || !form.value.estudianteCedulaIdentidad || !form.value.estudianteMaterno || !form.value.estudianteNombre || !form.value.estudianteFechaNacimiento) validationErrors.value['estudiante'] = true;
    else delete validationErrors.value['estudiante'];

    // if (!form.value.estudianteNivel || !form.value.estudianteGrado || !form.value.estudianteEdad) validationErrors.value['estudianteInscripcion'] = true;
    // else delete validationErrors.value['estudianteInscripcion'];

    if (form.value.dispacidad){
        if (!form.value.dispacidadCognitiva && !form.value.dispacidadVisual && !form.value.dispacidadAuditiva && !form.value.dispacidadMotriz && !form.value.dispacidadOtro) validationErrors.value['dispacidad'] = true;
        else delete validationErrors.value['dispacidad'];
    }

    // if (!form.value.validado) validationErrors.value['validado'] = true;
    // else delete validationErrors.value['validado'];
   
    return !Object.keys(validationErrors.value).length;
};

const validateConfirmForm = () => {
    validationErrors.value = {};

    if (!form.value.estudianteNivel || !form.value.estudianteGrado || !form.value.estudianteEdad) validationErrors.value['estudianteInscripcion'] = true;
    else delete validationErrors.value['estudianteInscripcion'];

    if (!form.value.validado) validationErrors.value['validado'] = true;
    else delete validationErrors.value['validado'];
   
    return !Object.keys(validationErrors.value).length;
};


</script>

<template>
    <v-row>    
        <v-col cols="12" lg="12" sm="12">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Registro de estudiante embarazada</v-card-title>
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
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos de Unidad Educativa</span>
                                </div>
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field v-model="form.sie" :rules="sieRules" :counter="8" label="SIE" required hide-details :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.unidadEducativa" :counter="10" label="Unidad Educativa" hide-details required :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.departamentoNombre" label="Departamento" hide-details required :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.municipioNombre" label="Distrito" hide-details required :readonly="true"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.nivel" label="Nivel" hide-details required :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.modalidad" label="" hide-details required :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="8" >
                                <v-text-field v-model="form.director" label="Director" hide-details required :readonly="true" ></v-text-field>
                            </v-col>

                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">¿ Quién informa el embarazo ?</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-select v-model="form.reporteNombre1" :items="personaReporteTipo" item-title="name" item-value="id" label="Reporte 1" return-object :disabled="isFormDisabledFromNew"></v-select>
                            </v-col>
                             <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Datos de la estudiante embarazada</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.estudianteCodigoRude" label="Código RUDE" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-text-field v-model="form.estudianteCedulaIdentidad" label="Cédula de Identidad" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="2" >
                                <v-text-field v-model="form.estudianteComplemento" label="Complemento" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.estudianteFechaNacimiento" label="DD/MM/AAAA" @input="onDateInput1" placeholder="DD/MM/AAAA" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.estudiantePaterno" label="Apellido Paterno" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.estudianteMaterno" label="Apellido Materno" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.estudianteNombre" label="Nombre(s)" hide-details required :disabled="isFormDisabled"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.estudianteNivel" label="Nivel" hide-details required :readonly="true" :disabled="isFormDisabledFromNew"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.estudianteGrado" label="Grado" hide-details required :readonly="true" :disabled="isFormDisabledFromNew"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-text-field v-model="form.estudianteEdad" label="Edad" type="number" min="0" hide-details required :readonly="true" :disabled="isFormDisabledFromNew"></v-text-field>
                            </v-col>

                            <v-col cols="12" md="4" >
                                <v-checkbox v-model="form.dispacidad" label="¿ La adolescente tiene discapacidad ?" required :disabled="isFormDisabledFromNew"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="8" v-if="form.dispacidad" >
                                <v-row class="pl-10 pt-5 secondarybg" >
                                    <v-col cols="12" md="12" >
                                        ¿ Qué tipo de discapacidad tiene ?
                                    </v-col>
                                    <v-col cols="12" md="6" >
                                        <v-checkbox v-model="form.dispacidadCognitiva" label="Cognitiva" required :disabled="isFormDisabledFromNew"></v-checkbox>
                                        <v-checkbox v-model="form.dispacidadVisual" label="Visual" required :disabled="isFormDisabledFromNew"></v-checkbox> 
                                        <v-checkbox v-model="form.dispacidadAuditiva" label="Auditiva" required :disabled="isFormDisabledFromNew"></v-checkbox> 
                                    </v-col>
                                    <v-col cols="12" md="6" > 
                                        <v-checkbox v-model="form.dispacidadMotriz" label="Motriz" required :disabled="isFormDisabledFromNew"></v-checkbox> 
                                        <v-checkbox v-model="form.dispacidadOtro" label="Otro" required :disabled="isFormDisabledFromNew"></v-checkbox> 
                                    </v-col>
                                </v-row>
                            </v-col>

                            <v-col cols="12" md="12">
                                <div class="text-h6 w-100 font-weight-regular auth-divider position-relative">
                                    <span class="bg-surface position-relative text-subtitle-1 text-grey100">Unión a temprana edad</span>
                                </div>
                            </v-col>

                            <v-col cols="12" md="12" >
                                <v-checkbox v-model="form.unionTemprana" label="La adolescente actualmente está casada o convive en pareja" required :disabled="isFormDisabledFromNew"></v-checkbox>
                            </v-col>

                            <v-col cols="12" md="12"  >                                
                                <v-dialog v-model="dialog" persistent width="auto" >
                                    <template v-slot:activator="{ props }">                                
                                        <v-btn size="large" rounded="pill" color="primary" class="rounded-pill" block type="button" flat v-bind="props" :disabled="isFormDisabledFromNew">Registrar</v-btn>
                                    </template>
                                    <v-card>
                                        <v-card-title class="text-h5">
                                        Confirmar
                                        </v-card-title>
                                        <v-card-text>¿ Está seguro de guardar el registro ?</v-card-text>
                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn color="green-darken-1" variant="text" @click="dialog = false"> Cancelar </v-btn>
                                            <v-btn color="green-darken-1" variant="text" @click="save"> Aceptar </v-btn>
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
                <v-btn color="green-darken-1" variant="text" @click="router.push('/convivencia/pacifica')"> NO </v-btn>
                <v-btn color="green-darken-1" variant="text" @click="reset"> SI </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
