const MainRoutes = {
    path: '/main',
    meta: {
        requiresAuth: true
    },
    redirect: '/main',
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
        {
            name: 'Dashboard',
            path: '/',
            requiresAuth: true,
            component: () => import('@/views/dashboard/index.vue')
        },
        {
            name: 'ConvivenciaPacifica',
            path: '/convivencia/pacifica',
            requiresAuth: true,
            component: () => import('@/views/convivencia-pacifica/Index.vue'),
        },
        {
            name: 'ConvivenciaPacifica-Desarrollo',
            path: '/convivencia/pacifica/desarrollo',
            requiresAuth: true,
            component: () => import('@/views/convivencia-pacifica/Desarrollo.vue')
        },
        {
            name: 'ConvivenciaPacifica-Socializacion',
            path: '/convivencia/pacifica/socializacion',
            requiresAuth: true,
            component: () => import('@/views/convivencia-pacifica/Socializacion.vue')
        },
        {
            name: 'ConvivenciaPacifica-Seguimiento',
            path: '/convivencia/pacifica/seguimiento',
            requiresAuth: true,
            component: () => import('@/views/convivencia-pacifica/Seguimiento.vue')
        },
        {
            name: 'ConvivenciaPacifica-Dashboard',
            path: '/convivencia/pacifica/dashboard',
            requiresAuth: true,
            component: () => import('@/views/convivencia-pacifica/Dashboard.vue')
        },
        {
            name: 'EmbarazoAdolecente',
            path: '/embarazo/adolecente',
            requiresAuth: true,
            component: () => import('@/views/embarazo-adolecente/Index.vue')
        },
        {
            name: 'EmbarazoAdolecente-Registro',
            path: '/embarazo/adolecente/registro',
            requiresAuth: true,
            component: () => import('@/views/embarazo-adolecente/Registro.vue')
        },
        {
            name: 'EmbarazoAdolecente-SeguimientoActuacion',
            path: '/embarazo/adolecente/seguimiento/actuacion',
            requiresAuth: true,
            component: () => import('@/views/embarazo-adolecente/SeguimientoActuacion.vue')
        },
        {
            name: 'EmbarazoAdolecente-SeguimientoSituacion',
            path: '/embarazo/adolecente/seguimiento/situacion',
            requiresAuth: true,
            component: () => import('@/views/embarazo-adolecente/SeguimientoSituacion.vue')
        },
        {
            name: 'EmbarazoAdolecente-Dashboard',
            path: '/embarazo/adolecente/dashboard',
            requiresAuth: true,
            component: () => import('@/views/embarazo-adolecente/Dashboard.vue')
        },
        {
            name: 'ViolenciaJerarquica',
            path: '/violencia/jerarquica',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/Index.vue')
        },
        {
            name: 'ViolenciaJerarquica-RegistroVictima',
            path: '/violencia/jerarquica/registro/victima',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/RegistroVictima.vue')
        },
        {
            name: 'ViolenciaJerarquica-RegistroAgresor',
            path: '/violencia/jerarquica/registro/agresor',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/RegistroAgresor.vue')
        },
        {
            name: 'ViolenciaJerarquica-RegistroCaso',
            path: '/violencia/jerarquica/registro/caso',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/RegistroCaso.vue')
        },
        {
            name: 'ViolenciaJerarquica-ReferenciaCaso',
            path: '/violencia/jerarquica/referencia/caso',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/ReferenciaCaso.vue')
        },
        {
            name: 'ViolenciaJerarquica-ComunicacionDistrito',
            path: '/violencia/jerarquica/comunicacion/distrito',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/ComunicacionDistrito.vue')
        },
        {
            name: 'ViolenciaJerarquica-ComunicacionDepartamento',
            path: '/violencia/jerarquica/comunicacion/departamento',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/ComunicacionDepartamento.vue')
        },
        {
            name: 'ViolenciaJerarquica-SeguimientoSancion',
            path: '/violencia/jerarquica/seguimiento/sancion',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/SeguimientoSancion.vue')
        },
        {
            name: 'ViolenciaJerarquica-SeguimientoCasoInfractor',
            path: '/violencia/jerarquica/seguimiento/caso/infractor',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/SeguimientoCasoInfractor.vue')
        },
        {
            name: 'ViolenciaJerarquica-SeguimientoCasoDelito',
            path: '/violencia/jerarquica/seguimiento/caso/delito',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/SeguimientoCasoDelito.vue')
        },
        {
            name: 'ViolenciaJerarquica-SeguimientoProcesoPenal13021320',
            path: '/violencia/jerarquica/seguimiento/proceso/penal/1302/1320',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/SeguimientoProcesoPenal13021320.vue')
        },
        {
            name: 'ViolenciaJerarquica-SeguimientoProcesoAdministrativo13021320',
            path: '/violencia/jerarquica/seguimiento/proceso/administrativo/1302/1320',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/SeguimientoProcesoAdministrativo13021320.vue')
        },
        {
            name: 'ViolenciaJerarquica-Dashboard',
            path: '/violencia/jerarquica/dashboard',
            requiresAuth: true,
            component: () => import('@/views/violencia-jerarquica/Dashboard.vue')
        },
        {
            name: 'ViolenciaEntrePares',
            path: '/violencia/entre/pares',
            requiresAuth: true,
            component: () => import('@/views/violencia-entre-pares/Index.vue')
        },
        {
            name: 'ViolenciaFamiliar',
            path: '/violencia/familiar',
            requiresAuth: true,
            component: () => import('@/views/violencia-familiar/Index.vue')
        },
        {
            name: 'LibreViolencia',
            path: '/libre/violencia',
            requiresAuth: true,
            component: () => import('@/views/libre-violencia/Index.vue')
        },
        {
            name: 'Cumplimiento',
            path: '/cumplimiento',
            requiresAuth: true,
            component: () => import('@/views/cumplimiento/Index.vue')
        },
        {
            name: 'Despatriarcalizacion',
            path: '/despatriarcalizacion',
            requiresAuth: true,
            component: () => import('@/views/despatriarcalizacion/Index.vue')
        },
        {
            name: 'Alert',
            path: '/ui/alerts',
            component: () => import('@/views/ui-components/Alerts.vue')
        },
        {
            name: 'Buttons',
            path: '/ui/buttons',
            component: () => import('@/views/ui-components/Buttons.vue')
        },
        {
            name: 'Cards',
            path: '/ui/cards',
            component: () => import('@/views/ui-components/Cards.vue')
        },
        {
            name: 'Tables',
            path: '/ui/tables',
            component: () => import('@/views/ui-components/Tables.vue')
        },
        {
            name: 'Icons',
            path: '/icons',
            component: () => import('@/views/pages/Icons.vue')
        },
        {
            name: 'Starter',
            path: '/sample-page',
            component: () => import('@/views/pages/SamplePage.vue')
        },
       
    ]
};

export default MainRoutes;
