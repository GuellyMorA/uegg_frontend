<script setup lang="ts">
    import { ref, computed, onMounted } from "vue";
    import { useTheme } from 'vuetify';
    import ConvivenciaPacifica from '@/services/ConvivenciaPacifica';
    import { toast } from 'vue3-toastify';
    //import Pivot from '@/components/Pivot.vue'

    const theme = useTheme();
    const primary = theme.current.value.colors.primary;
    const error = theme.current.value.colors.error;
    const warning = theme.current.value.colors.warning;
    const secondary = theme.current.value.colors.secondary;
    const success = theme.current.value.colors.success;
    const info = theme.current.value.colors.info;
    const surface = theme.current.value.colors.surface;
    const lightprimary = theme.current.value.colors.lightprimary;
    const lilac = "#ccc3ff";
    const coffee = "#ce9166";
    const chartOptions = computed(() => {
        return {
            series: [5368, 3500, 4106],
            labels: [
                "Movilización social", 
                "Fomento al desarrollo de habilidades y práctica de valores", 
                "Capacitación", 
                "Medidas de seguridad en la infraestructura", 
                "Normas de convivencia en la unidad unidadEducativa", 
                "Promoción de la participación de las y los estudiantes", 
                "Gestión y articulación con la comunidad educativa", 
                "Acción comunal", 
                "Acciones para reducción de riesgos en el contexto y en la unidad educativa"
            ],
            chart: {
                height: 170,
                type: "donut",
                fontFamily: "Plus Jakarta Sans', sans-serif",
                foreColor: "#c6d1e9",
            },

            tooltip: {
                theme: "dark",
                fillSeriesColor: false,
            },

            colors: [primary, error, warning, success, secondary, info, lightprimary, lilac, coffee],
            dataLabels: {
                enabled: false,
            },

            legend: {
                show: false,
            },

            stroke: {
                show: false,
            },
            responsive: [
                {
                    breakpoint: 991,
                    options: {
                        chart: {
                            width: 150,
                        },
                    },
                },
            ],
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        background: "none",
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: "12px",
                                color: undefined,
                                offsetY: 5,
                            },
                            value: {
                                show: false,
                                color: "#98aab4",
                            },
                        },
                    },
                },
            },

        };
    });
    const Chart = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  
    // variable de PCPA aprobados
    const aprobados = ref(0);
    // variable de PCPA socializados
    const solicitudes = ref(0);
    //Actividades de promoción
    const actividadesPromocion = ref(0);

    onMounted(async () => {
        try {
            const response = await ConvivenciaPacifica.convivienciaPacificaArmonicaDashboardCounts();
            aprobados.value = Number(response.data.total_true) || 0;
            solicitudes.value = Number(response.data.total_false) || 0;
            actividadesPromocion.value = Number(response.data.actividades_promocion_total) || 0;
            //console.log('Aprobados:', aprobados.value);
        } catch (error) {
            //console.error('Error al cargar los datos del panel:', error);
            toast.error('Error al cargar los datos del panel', {
            autoClose: 3000,
            position: toast.POSITION.TOP_RIGHT
            });
        }
    });
    
</script>

<template>
    <v-row>
        <v-col cols="12" sm="12" lg="4">
            <div>
                <v-card elevation="10" class="withbg">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">PCPA <span class="text-subtitle-1 text-muted">aprobados</span></v-card-title>
                            <v-btn  size="small" icon class="bg-error">
                                <v-avatar size="20" class="text-surface">
                                    <BuildingIcon size="20" />
                                </v-avatar>
                            </v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12">
                                <div class="mt-2">
                                    <h3 class="text-h4">{{ aprobados }}</h3>
                                    <div class="mt-2">
                                        <span class="text-subtitle-1 text-muted">unidades educativas</span>
                                    </div>  
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-item>
                    <div class="mt-3">
                    </div>
                </v-card>
            </div>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <div>
                <v-card elevation="10" class="withbg">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">PCPA <span class="text-subtitle-1 text-muted">socializados</span></v-card-title>
                            <v-btn  size="small" icon class="bg-success">
                                <v-avatar size="20" class="text-surface">
                                    <BuildingIcon size="20" />
                                </v-avatar>
                            </v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12">
                                <div class="mt-2">
                                    <h3 class="text-h4">{{ solicitudes }}</h3>
                                    <div class="mt-2">
                                        <span class="text-subtitle-1 text-muted">unidades educativas</span>
                                    </div>  
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-item>
                    <div class="mt-3">
                    </div>
                </v-card>
            </div>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <div>
                <v-card elevation="10" class="">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">PCPA <span class="text-subtitle-1 text-muted">desarrollo con diagnóstico previo</span></v-card-title>
                            <v-btn  size="small" icon class="bg-warning">
                                <v-avatar size="20" class="text-surface">
                                    <QuestionMarkIcon size="20" />
                                </v-avatar>
                            </v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12">
                                <div class="mt-2">
                                    <h3 class="text-h4">0</h3>
                                    <div class="mt-2">
                                        <span class="text-subtitle-1 text-muted">unidades educativas</span>
                                    </div>  
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-item>
                    <div class="mt-3">
                    </div>
                </v-card>
            </div>
        </v-col>        
        <!-- <v-col cols="12" sm="12" lg="4">
            <div>
                <v-card elevation="10" class="secondarybg">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">Uniones tempranas <span class="text-subtitle-1 text-muted"></span></v-card-title>
                            <v-btn  size="small" icon class="bg-secondary">
                                <v-avatar size="20" class="text-surface">
                                    <WomanIcon size="20" />
                                </v-avatar>
                            </v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12">
                                <div class="mt-2">
                                    <h3 class="text-h4">25</h3>
                                    <div class="mt-2">
                                        <span class="text-subtitle-1 text-muted">niñas y/o adolescentes embarazadas</span>
                                    </div>  
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-item>
                    <div class="mt-3">
                    </div>
                </v-card>
            </div>
        </v-col> -->
        <v-col cols="12" sm="12" lg="4">
            <div>
                <v-card elevation="10" class="infobg">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">Planes de seguimiento <span class="text-subtitle-1 text-muted"> </span></v-card-title>
                            <v-btn  size="small" icon class="bg-info">
                                <v-avatar size="20" class="text-surface">
                                    <BuildingIcon size="20" />
                                </v-avatar>
                            </v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12">
                                <div class="mt-2">
                                    <h3 class="text-h4">0</h3>
                                    <div class="mt-2">
                                        <span class="text-subtitle-1 text-muted">unidades educativas</span>
                                    </div>  
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-item>
                    <div class="mt-3">
                    </div>
                </v-card>
            </div>
        </v-col>
        <v-col cols="12" sm="12" lg="4">
            <div>
                <v-card elevation="10" class="errorbg">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">Cumplimiento del 80% <span class="text-subtitle-1 text-muted"> </span></v-card-title>
                            <v-btn  size="small" icon class="bg-error">
                                <v-avatar size="20" class="text-surface">
                                    <BuildingIcon size="20" />
                                </v-avatar>
                            </v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12">
                                <div class="mt-2">
                                    <h3 class="text-h4">0</h3>
                                    <div class="mt-2">
                                        <span class="text-subtitle-1 text-muted">unidades educativas</span>
                                    </div>  
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-item>
                    <div class="mt-3">
                    </div>
                </v-card>
            </div>
        </v-col>

        <v-col cols="12" sm="12" lg="8">
            <v-card elevation="10" class="withbg">
                <v-card-item>
                    <div class="d-sm-flex align-center justify-space-between pt-sm-2">
                        <v-card-title class="text-h5">Actividades de promoción</v-card-title>
                    </div>
                    <v-row>
                        <v-col cols="6" sm="8">
                            <div class="mt-6">
                                <h3 class="text-h4">{{ actividadesPromocion }}</h3>
                                <div class="align-center mt-6 ml-1">
                                    <h6 class="text-subtitle-2 text-muted pl-5">
                                        <v-icon icon="mdi mdi-checkbox-blank-circle" class="mr-1" size="10" color="primary"></v-icon> Movilización social
                                    </h6>
                                    <h6 class="text-subtitle-2 text-muted pl-5">
                                        <v-icon icon="mdi mdi-checkbox-blank-circle" class="mr-1" size="10" color="error"></v-icon> Fomento al desarrollo de habilidades y práctica de valores
                                    </h6>
                                    <h6 class="text-subtitle-2 text-muted pl-5">
                                        <v-icon icon="mdi mdi-checkbox-blank-circle" class="mr-1" size="10" color="warning"></v-icon> Capacitación
                                    </h6>
                                    <h6 class="text-subtitle-2 text-muted pl-5">
                                        <v-icon icon="mdi mdi-checkbox-blank-circle" class="mr-1" size="10" color="success"></v-icon> Medidas de seguridad en la infraestructura
                                    </h6>
                                    <h6 class="text-subtitle-2 text-muted pl-5">
                                        <v-icon icon="mdi mdi-checkbox-blank-circle" class="mr-1" size="10" color="secondary"></v-icon> Normas de convivencia en la unidad unidadEducativa
                                    </h6>
                                    <h6 class="text-subtitle-2 text-muted pl-5">
                                        <v-icon icon="mdi mdi-checkbox-blank-circle" class="mr-1" size="10" color="info"></v-icon> Promoción de la participación de las y los estudiantes
                                    </h6>
                                    <h6 class="text-subtitle-2 text-muted pl-5">
                                        <v-icon icon="mdi mdi-checkbox-blank-circle" class="mr-1" size="10" :style="`color: ${lightprimary}`"></v-icon> Gestión y articulación con la comunidad educativa
                                    </h6>
                                    <h6 class="text-subtitle-2 text-muted pl-5">
                                        <v-icon icon="mdi mdi-checkbox-blank-circle" class="mr-1" size="10" :style="`color: ${lilac}`"></v-icon> Acción comunal
                                    </h6>
                                    <h6 class="text-subtitle-2 text-muted pl-5">
                                        <v-icon icon="mdi mdi-checkbox-blank-circle" class="mr-1" size="10" :style="`color: ${coffee}`"></v-icon> Acciones para reducción de riesgos en el contexto y en la unidad educativa
                                    </h6>  
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="6" sm="4" class="pl-lg-0">
                            <div class="d-flex align-center flex-shrink-0">
                                <apexchart type="donut" height="250" :options="chartOptions" :series="Chart">
                                </apexchart>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-item>
            </v-card>
        </v-col>
        <!-- <v-col cols="12" sm="12" lg="4">
            <div class="mb-6">
            </div>
            <div>
                <v-card elevation="10" class="infobg">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">PCPA <span class="text-subtitle-1 text-muted"> con diagnóstico previo</span></v-card-title>
                            <v-btn  size="small" icon class="bg-info">
                                <v-avatar size="20" class="text-surface">
                                    <BuildingIcon size="20" />
                                </v-avatar>
                            </v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12">
                                <div class="mt-2">
                                    <h3 class="text-h4">20</h3>
                                    <div class="mt-2">
                                        <span class="text-subtitle-1 text-muted">unidades educativas</span>
                                    </div>  
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-item>
                    <div class="mt-3">
                    </div>
                </v-card>
            </div>
        </v-col> -->
<!--    <v-col cols="12" sm="12" lg="12">
            <Pivot />
        </v-col>
        <v-col cols="12" sm="12" lg="8">
        </v-col>
        <v-col cols="12" sm="12" lg="12">
        </v-col>
-->
        <!-- <v-col class="text-center mt-2">
            <p class="text-muted">Design and Developed by <a flat variant="text" href="https://www.wrappixel.com/" target="_blank" class="pl-1 text-primary">wrappixel.com</a></p>
        </v-col> -->
    </v-row>
</template>
<style>
.dhx_sample-container__widget {
    height: 100vh;
    width: 100% !important;
}
.dhx_columns-fields-wrap {
    padding-left: 12px !important;
}
</style>