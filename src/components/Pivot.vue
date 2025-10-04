<template>
    <section class="dhx_sample-controls pr-3">
        <v-btn rounded="pill" color="primary" class="v-btn--size-large v-btn--variant-elevated mt-4 mb-2 px-7" @click="runExport('xlsx')">Exportar XLSX</v-btn>
        <v-btn rounded="pill" color="primary" class="v-btn--size-large v-btn--variant-elevated mt-4 mb-2 px-7" @click="runExport('csv')">Exportar CSV</v-btn>
    </section>
    <div class="dhx_sample-container__widget" ref="pivot"></div>
</template>
 
<script>
import fromCDN from "from-cdn";
import dataset from "@/assets/dataset.json";
 
export default {
    name: "Pivot",
    data: () => ({
        pivot: null,
        fields: {
            rows: ["form", "name"],
            columns: ["year"],
            values: [
                { id: "oil", method: "count" },
                { id: "oil", method: "sum" },
            ],
        },
        fieldList: [
            { id: "name", label: "Nombre" },
            { id: "year", label: "Año" },
            { id: "continent", label: "Continente" },
            { id: "form", label: "Form" },
            { id: "gdp", label: "Moneda" },
            { id: "oil", label: "Precio" },
            { id: "balance", label: "Balance" },
            { id: "when", label: "Fecha", type: "date", format: "%d/%m/%Y" },
        ],
        layout: {
            footer: true,
        },
    }),
    mounted() {
        fromCDN([
            "../../src/assets/js/pivot.js",
            "../../src/assets/css/pivot.css",
            "../../src/assets/css/pivot_auxiliary_controls.css"
        ]).then(() => {
            // eslint-disable-next-line no-undef
            this.pivot = new dhx.Pivot(this.$refs.pivot, {
                data: dataset,
                fields: this.fields,
                fieldList: this.fieldList,
                layout: this.layout
            });
        });
    },
    methods: {
        runExport(type){
            if (type === "xlsx") {
                this.pivot.export.xlsx({
                    url: "//export.dhtmlx.com/excel"
                });
            }
            if (type === "csv") {
                this.pivot.export.csv();
            }
        }
    },
    beforeDestroy() {
        if (this.pivot) {
            this.pivot.destructor();
        }
    }
};
</script>
 
<style scoped>
.dhx_sample-container__widget {
    height: 100vh;
    width: 100vw;
}
</style>