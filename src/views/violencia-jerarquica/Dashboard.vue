<script setup lang="ts">
import { ref, computed } from "vue";
import { useTheme } from 'vuetify';
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
const Chart = [38, 40, 25, 10, 12, 8, 5, 25, 12];

</script>

<template>
    <v-row>
        <v-col cols="12" sm="12" lg="4">
            <div>
                <v-card elevation="10" class="withbg">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">Casos <span class="text-subtitle-1 text-muted">violencia jerárquica</span></v-card-title>
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
                                        <span class="text-subtitle-1 text-muted">estudiantes</span>
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
                            <v-card-title class="text-h5">Casos <span class="text-subtitle-1 text-muted">violencia jerárquica psicológica</span></v-card-title>
                            <v-btn  size="small" icon class="bg-success">
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
                                        <span class="text-subtitle-1 text-muted">estudiantes</span>
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
                            <v-card-title class="text-h5">Casos <span class="text-subtitle-1 text-muted">violencia jerárquica sexual</span></v-card-title>
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
                                        <span class="text-subtitle-1 text-muted">estudiantes</span>
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
                <v-card elevation="10" class="secondarybg">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">Casos <span class="text-subtitle-1 text-muted">remitidos a la DNA</span></v-card-title>
                            <v-btn  size="small" icon class="bg-secondary">
                                <v-avatar size="20" class="text-surface">
                                    <WomanIcon size="20" />
                                </v-avatar>
                            </v-btn>
                        </div>
                        <v-row>
                            <v-col cols="12">
                                <div class="mt-2">
                                    <h3 class="text-h4">0</h3>
                                    <div class="mt-2">
                                        <span class="text-subtitle-1 text-muted">estudiantes</span>
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
                <v-card elevation="10" class="infobg">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">Róptulos observados <span class="text-subtitle-1 text-muted"> preventivo</span></v-card-title>
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
                                        <span class="text-subtitle-1 text-muted">directivos, maestros(as) o administrativos</span>
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
                            <v-card-title class="text-h5">Róptulos observados <span class="text-subtitle-1 text-muted">definitivo</span></v-card-title>
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
                                        <span class="text-subtitle-1 text-muted">directivos, maestros(as) o administrativos</span>
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
                <v-card elevation="10">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">Imputación <span class="text-subtitle-1 text-muted"> formal</span></v-card-title>
                            <v-btn  size="small" icon class="bg-success">
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
                                        <span class="text-subtitle-1 text-muted">directivos, maestros(as) o administrativos</span>
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
                <v-card elevation="10">
                    <v-card-item>
                        <div class="d-flex align-center justify-space-between pt-sm-2">
                            <v-card-title class="text-h5">Imputación <span class="text-subtitle-1 text-muted"> condenatoria</span></v-card-title>
                            <v-btn  size="small" icon class="bg-warning">
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
                                        <span class="text-subtitle-1 text-muted">directivos, maestros(as) o administrativos</span>
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