export type Language = 'es' | 'en';

export interface Translations {
  common: {
    online: string;
    offline: string;
    standby: string;
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    edit: string;
    actions: string;
    search: string;
    status: string;
    copy: string;
    copied: string;
    refresh: string;
    user: string;
    administrator: string;
    operator: string;
    viewer: string;
    loading: string;
    yes: string;
    no: string;
    required: string;
  };
  navbar: {
    ticker1: string;
    ticker2: string;
    ticker3: string;
    ticker4: string;
    ticker5: string;
    controlPanel: string;
    liveCameras: string;
    live: string;
    cameraManagement: string;
    cameras: string;
    users: string;
    dashboard: string;
    notificationsTab: string;
    logout: string;
    language: string;
  };
  login: {
    title: string;
    subtitle: string;
    header: string;
    desc: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submit: string;
    submitting: string;
    footerNote: string;
    validationError: string;
    invalidResponse: string;
    defaultError: string;
  };
  liveGrid: {
    title: string;
    activeSingle: string;
    activePlural: string;
    subtitle: string;
    searchPlaceholder: string;
    layoutAuto: string;
    layout1x1: string;
    layout2x2: string;
    layout3x3: string;
    refreshTooltip: string;
    addCamera: string;
    noCamerasTitle: string;
    noCamerasSearch: string;
    noCamerasDesc: string;
    checkFeeds: string;
  };
  videoPlayer: {
    liveFull: string;
    liveShort: string;
    tuningFull: string;
    tuningShort: string;
    standby: string;
    noStream: string;
    waitingStream: string;
    reconnect: string;
    connecting: string;
    technicalTelemetry: string;
    saveSnapshot: string;
    fullscreen: string;
    exitFullscreen: string;
    exit: string;
    restartStream: string;
    sectorNode: string;
    buffer: string;
    rotation: string;
    tune: string;
    nodeId: string;
  };
  camerasAdmin: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    newCamera: string;
    colStatus: string;
    colCamera: string;
    colTypeMode: string;
    colSource: string;
    colQuality: string;
    colActions: string;
    deleteConfirm: string;
    noCameras: string;
    modeIpPull: string;
    modePush: string;
    modeEdge: string;
    modeUsb: string;
    modeTest: string;
  };
  cameraModal: {
    editTitle: string;
    addTitle: string;
    modesHelp: string;
    tabIp: string;
    tabPush: string;
    tabEdge: string;
    tabUsb: string;
    tabTest: string;
    nameLabel: string;
    namePlaceholder: string;
    namePathNote: string;
    sourceTypeLabel: string;
    sourceUrlLabel: string;
    sourceUrlPlaceholder: string;
    ipHelpTitle: string;
    ipHelpDesc: string;
    pushHelpTitle: string;
    pushHelpDesc: string;
    edgeHelpTitle: string;
    edgeHelpDesc: string;
    testHelpDesc: string;
    deviceLabel: string;
    resolutionLabel: string;
    fpsLabel: string;
    codecLabel: string;
    rotationLabel: string;
    presetLabel: string;
    tuneLabel: string;
    cancelBtn: string;
    saveBtn: string;
    saveChangesBtn: string;
    addCameraBtn: string;
    savingBtn: string;
    copyCommand: string;
    rtspPresetsTitle: string;
    pushInstructionsTitle: string;
    pushRtspHelp: string;
    pushRtmpHelp: string;
    dockerEdgeHelp: string;
    nameRequiredError: string;
    urlRequiredError: string;
    defaultSaveError: string;
    motionDetectionTitle: string;
    motionActive: string;
    motionPaused: string;
    motionSensitivity: string;
    motionSensitivityHigh: string;
    motionSensitivityMedium: string;
    motionSensitivityLow: string;
    motionPersistence: string;
    motionFrame1: string;
    motionFrame2: string;
    motionFrame3: string;
    motionFrame5: string;
    motionCooldown: string;
  };
  usersAdmin: {
    title: string;
    headerTag: string;
    subtitle: string;
    searchPlaceholder: string;
    newUser: string;
    totalUsers: string;
    filterLabel: string;
    filterAll: string;
    filterAdmin: string;
    filterOperator: string;
    filterViewer: string;
    colUser: string;
    colName: string;
    colEmail: string;
    colRole: string;
    colPermissions: string;
    colStatus: string;
    colActions: string;
    roleAdmin: string;
    roleOperator: string;
    roleViewer: string;
    roleAdminDesc: string;
    roleOperatorDesc: string;
    roleViewerDesc: string;
    statusActive: string;
    statusDisabled: string;
    youBadge: string;
    inheritedPermissions: string;
    accessControlBadge: string;
    modalEditTitle: string;
    modalAddTitle: string;
    modalEditSubtitle: string;
    modalAddSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    usernameLabel: string;
    usernamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholderEdit: string;
    passwordPlaceholderNew: string;
    roleLabel: string;
    permissionsLabel: string;
    permissionsPlaceholder: string;
    accountStateLabel: string;
    activeLabel: string;
    disabledLabel: string;
    deleteConfirm: string;
    noUsers: string;
    saveUserBtn: string;
    createUserBtn: string;
    saveChangesBtn: string;
    processingBtn: string;
    selfDeleteError: string;
    lastAdminError: string;
    requiredError: string;
    passwordRequiredError: string;
    editUserTitle: string;
    deleteUserTitle: string;
    permCamerasRead: string;
    permCamerasReadDesc: string;
    permCamerasWrite: string;
    permCamerasWriteDesc: string;
    permCamerasDelete: string;
    permCamerasDeleteDesc: string;
    permUsersRead: string;
    permUsersReadDesc: string;
    permUsersManage: string;
    permUsersManageDesc: string;
  };
  alerts: {
    title: string;
    badge: string;
    noAlerts: string;
    noAlertsDesc: string;
    markAllRead: string;
    clearHistory: string;
    motionDetected: string;
    soundAlerts: string;
    browserNotifications: string;
    enableNotifications: string;
    notificationsEnabled: string;
    notificationsDenied: string;
    ack: string;
    acked: string;
    delete: string;
    activeAlarm: string;
    cooldownActive: string;
    justNow: string;
    minutesAgo: string;
    testAlert: string;
    viewInPanel: string;
    zoomSnapshot: string;
  };
  dashboardView: {
    title: string;
    subtitle: string;
    totalCameras: string;
    onlineCameras: string;
    standbyCameras: string;
    totalAlerts: string;
    unreadAlerts: string;
    activeAlarms: string;
    systemHealth: string;
    operational: string;
    liveFeeds: string;
    recentSnapshots: string;
    noSnapshots: string;
    viewLiveGrid: string;
    viewAllAlerts: string;
    quickActions: string;
    testAlert: string;
    markAllSeen: string;
    manageCameras: string;
    noCamerasConnected: string;
    liveAndStandby: string;
    streamsInSystem: string;
    pending: string;
    totalHistory: string;
    sectors: string;
    noActiveAlarms: string;
    soundActive: string;
    soundMuted: string;
    soundMuteTooltip: string;
    soundUnmuteTooltip: string;
    soundSynthesizer: string;
    noCamerasConfigured: string;
    infrastructure: string;
    infraTitle: string;
    infraSubtitle: string;
    infraMediaMtx: string;
    infraApi: string;
    infraMotion: string;
    infraDb: string;
    infraConnected: string;
    infraActive: string;
    infraAllOnline: string;
  };
  alertsTab: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterUnread: string;
    filterRead: string;
    allCameras: string;
    galleryMode: string;
    tableMode: string;
    confidence: string;
    downloadSnapshot: string;
    zoomSnapshot: string;
    emptyTitle: string;
    emptyDesc: string;
    searchPlaceholder: string;
    showingCount: string;
    noPhoto: string;
    hoursAgo: string;
    colSnapshot: string;
    colCamera: string;
    colTimeDate: string;
    colLabel: string;
    colStatus: string;
    colActions: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    common: {
      online: 'ONLINE',
      offline: 'OFFLINE',
      standby: 'STANDBY',
      save: 'Guardar',
      saving: 'Guardando...',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      actions: 'Acciones',
      search: 'Buscar...',
      status: 'Estado',
      copy: 'Copiar',
      copied: 'Copiado',
      refresh: 'Actualizar',
      user: 'Usuario',
      administrator: 'ADMINISTRADOR',
      operator: 'OPERADOR',
      viewer: 'SOLO LECTURA',
      loading: 'Cargando...',
      yes: 'Sí',
      no: 'No',
      required: 'Obligatorio',
    },
    navbar: {
      ticker1: 'BIG BROTHER CCTV',
      ticker2: 'SISTEMA DE TELEVIGILANCIA EN TIEMPO REAL',
      ticker3: 'CONEXIÓN SEGURA MTX',
      ticker4: 'TRANSMISIÓN HLS BAJA LATENCIA',
      ticker5: 'SECTOR OPERATIVO 4',
      controlPanel: 'PANEL DE CONTROL',
      liveCameras: 'Cámaras en Vivo',
      live: 'En Vivo',
      cameraManagement: 'Gestión de Cámaras',
      cameras: 'Cámaras',
      users: 'Usuarios',
      dashboard: 'Dashboard',
      notificationsTab: 'Notificaciones',
      logout: 'Cerrar sesión',
      language: 'Idioma',
    },
    login: {
      title: 'BIG BROTHER CCTV',
      subtitle: 'SISTEMA DE TELEVIGILANCIA Y MONITORIZACIÓN',
      header: 'ACCESO AL SISTEMA',
      desc: 'Introduce tus credenciales autorizadas para acceder a las transmisiones',
      usernameLabel: 'Identificador de Usuario',
      usernamePlaceholder: 'Ej: admin u operador',
      passwordLabel: 'Clave de Acceso',
      passwordPlaceholder: '••••••••',
      submit: 'ACCEDER AL PANEL',
      submitting: 'INICIANDO SESIÓN...',
      footerNote: 'TERMINAL SEGURO • CIFRADO JWT ACTIVO',
      validationError: 'Por favor, introduce tu usuario y contraseña',
      invalidResponse: 'Respuesta no válida del servidor',
      defaultError: 'Usuario o contraseña incorrectos',
    },
    liveGrid: {
      title: 'Cámaras en Directo',
      activeSingle: 'ACTIVA',
      activePlural: 'ACTIVAS',
      subtitle: 'TRANSMISIÓN CONTINUA • CCTV EN VIVO',
      searchPlaceholder: 'Buscar cámara o ubicación...',
      layoutAuto: 'Mosaico Automático Fluido',
      layout1x1: 'Vista 1x1 (1 Columna Grande)',
      layout2x2: 'Cuadrícula 2x2 (2 Columnas fijas)',
      layout3x3: 'Cuadrícula 3x3 (3 Columnas)',
      refreshTooltip: 'Actualizar estado de transmisiones',
      addCamera: 'Añadir Cámara',
      noCamerasTitle: 'NO HAY CÁMARAS CONECTADAS',
      noCamerasSearch: 'No se encontraron cámaras que coincidan con "{query}".',
      noCamerasDesc: 'Conecta cámaras IP (RTSP), emite en directo desde tu smartphone u OBS (Push), vincula una webcam local o inicia una señal de prueba.',
      checkFeeds: 'Comprobar Señales',
    },
    videoPlayer: {
      liveFull: 'EN VIVO',
      liveShort: 'EN VIVO',
      tuningFull: 'SINTONIZANDO',
      tuningShort: 'ESPERA',
      standby: 'EN ESPERA',
      noStream: 'SIN EMISIÓN ACTIVA',
      waitingStream: 'Esperando flujo de vídeo en',
      reconnect: 'RECONNECT',
      connecting: 'SINTONIZANDO...',
      technicalTelemetry: 'TELEMETRÍA',
      saveSnapshot: 'SNAPSHOT',
      fullscreen: 'Pantalla completa',
      exitFullscreen: 'Salir de pantalla completa',
      exit: 'SALIR',
      restartStream: 'Reiniciar Transmisión',
      sectorNode: 'BIG BROTHER CCTV // NODO #{id}',
      buffer: 'BUFFER',
      rotation: 'ROTACIÓN',
      tune: 'OPTIMIZACIÓN',
      nodeId: 'NODO ID',
    },
    camerasAdmin: {
      title: 'Gestión de Cámaras',
      subtitle: 'CONFIGURACIÓN DE FUENTES DE VÍDEO, DISPOSITIVOS Y PARÁMETROS DE EMISIÓN',
      searchPlaceholder: 'Filtrar por cámara o dispositivo...',
      newCamera: 'Nueva Cámara',
      colStatus: 'ESTADO',
      colCamera: 'CÁMARA',
      colTypeMode: 'TIPO / MODO',
      colSource: 'ORIGEN / DISPOSITIVO',
      colQuality: 'CALIDAD',
      colActions: 'ACCIONES',
      deleteConfirm: '¿Estás seguro de eliminar la cámara "{name}"?',
      noCameras: 'No se encontraron cámaras configuradas.',
      modeIpPull: 'IP PULL',
      modePush: 'PUSH',
      modeEdge: 'EDGE AGENT',
      modeUsb: 'USB LOCAL',
      modeTest: 'TEST SMPTE',
    },
    cameraModal: {
      editTitle: 'Editar Cámara: {name}',
      addTitle: 'Añadir Nueva Cámara',
      modesHelp: 'MODOS: CÁMARA IP • PUSH (MÓVIL/OBS) • DOCKER EDGE • WEBCAM USB • TEST',
      tabIp: 'Cámara IP (RTSP/HTTP)',
      tabPush: 'Emisión Push (Móvil / OBS)',
      tabEdge: 'Agente Edge (Docker)',
      tabUsb: 'Webcam USB Local',
      tabTest: 'Señal de Prueba SMPTE',
      nameLabel: 'Identificador del Stream / Canal *',
      namePlaceholder: 'ej: pasillo-norte, cam-dahua, entrada-garaje',
      namePathNote: 'Este nombre definirá la ruta de streaming en Oceanía: ',
      sourceTypeLabel: 'Protocolo de Entrada',
      sourceUrlLabel: 'URL del Flujo RTSP / RTMP / HTTP *',
      sourceUrlPlaceholder: 'rtsp://usuario:password@192.168.1.50:554/stream1',
      ipHelpTitle: 'Sintonización Automática por Servidor (PULL)',
      ipHelpDesc: 'El servidor Big Brother se conecta directamente a la cámara IP en tu red local o internet. No necesitas ejecutar ningún script ni ffmpeg en tu ordenador.',
      pushHelpTitle: 'Ingesta Directa (Broadcast / Push)',
      pushHelpDesc: 'Cualquier dispositivo (teléfono móvil con app Larix Broadcaster, OBS Studio, cámara Wi-Fi autónoma o dron) puede emitir directamente hacia Big Brother. ¡Al enviar señal, el stream se sintoniza al instante!',
      edgeHelpTitle: 'Despliegue de Agente Autónomo (Raspberry Pi / Linux Edge)',
      edgeHelpDesc: 'Copia este comando y ejecútalo en cualquier Raspberry Pi u ordenador remoto con cámara. El agente se conectará solo a Big Brother, enviará heartbeats y sincronizará parámetros:',
      testHelpDesc: '📡 Generador sintético de pruebas de Oceanía: Barras SMPTE militares y reloj de tiempo real. Ideal para validar la transmisión sin necesidad de hardware.',
      deviceLabel: 'Dispositivo Linux V4L2',
      resolutionLabel: 'Resolución de Captura',
      fpsLabel: 'Fotogramas por Segundo (FPS)',
      codecLabel: 'Códec de Compresión',
      rotationLabel: 'Rotación de Imagen',
      presetLabel: 'Preset FFmpeg',
      tuneLabel: 'Optimización de Latencia',
      cancelBtn: 'Cancelar',
      saveBtn: 'Guardar Configuración',
      saveChangesBtn: 'GUARDAR CAMBIOS',
      addCameraBtn: 'AÑADIR CÁMARA',
      savingBtn: 'GUARDANDO...',
      copyCommand: 'Copiar Comando',
      rtspPresetsTitle: 'Plantillas rápidas RTSP:',
      pushInstructionsTitle: 'Instrucciones para emisión en vivo (Push):',
      pushRtspHelp: 'Endpoint RTSP Push:',
      pushRtmpHelp: 'Endpoint RTMP (OBS / Larix / OctoStream):',
      dockerEdgeHelp: 'Comando de ejecución para Docker Edge:',
      nameRequiredError: 'El nombre de la cámara es obligatorio',
      urlRequiredError: 'Debes indicar la URL RTSP o HTTP de la cámara IP',
      defaultSaveError: 'Error al guardar la configuración de la cámara',
      motionDetectionTitle: 'Detección de Movimiento (Motion Daemon)',
      motionActive: 'ACTIVADA',
      motionPaused: 'PAUSADA',
      motionSensitivity: 'Sensibilidad de Detección (Umbral: {t} px)',
      motionSensitivityHigh: '⚡ Alta (150px)',
      motionSensitivityMedium: '🎯 Media (350px)',
      motionSensitivityLow: '🛡️ Baja (600px)',
      motionPersistence: 'Persistencia (Frames Mínimos)',
      motionFrame1: '1 Frame (Instantáneo - muy sensible)',
      motionFrame2: '2 Frames (Recomendado - personas)',
      motionFrame3: '3 Frames (Movimiento sostenido)',
      motionFrame5: '5 Frames (Muy estricto)',
      motionCooldown: 'Enfriamiento / Cooldown (Segundos)',
    },
    usersAdmin: {
      title: 'Gestión de Usuarios',
      headerTag: 'BIG BROTHER CCTV // CONTROL DE ACCESO',
      subtitle: 'ADMINISTRACIÓN DE CUENTAS, ROLES DE ACCESO Y PERMISOS DEL SISTEMA',
      searchPlaceholder: 'Buscar por usuario, nombre o email...',
      newUser: 'Añadir Usuario',
      totalUsers: '{count} USUARIOS REGISTRADOS',
      filterLabel: 'Filtrar:',
      filterAll: 'Todos',
      filterAdmin: 'Admin',
      filterOperator: 'Operador',
      filterViewer: 'Observador',
      colUser: 'Usuario',
      colName: 'Nombre',
      colEmail: 'Correo Electrónico',
      colRole: 'Rol',
      colPermissions: 'Permisos',
      colStatus: 'Estado',
      colActions: 'Acciones',
      roleAdmin: 'ADMINISTRADOR',
      roleOperator: 'OPERADOR',
      roleViewer: 'OBSERVADOR',
      roleAdminDesc: 'Control Total',
      roleOperatorDesc: 'Gestión de Cámaras',
      roleViewerDesc: 'Solo Visualización',
      statusActive: 'ACTIVO',
      statusDisabled: 'SUSPENDIDO',
      youBadge: 'TÚ',
      inheritedPermissions: 'Heredados por rol',
      accessControlBadge: 'CONTROL DE ACCESO',
      modalEditTitle: 'Editar Usuario',
      modalAddTitle: 'Nuevo Usuario',
      modalEditSubtitle: 'Actualización de rol y permisos para @{username}.',
      modalAddSubtitle: 'Introduce los datos de la cuenta y asigna su rol y permisos en el sistema.',
      nameLabel: 'Nombre Completo',
      namePlaceholder: 'Ej: Juan Pérez',
      usernameLabel: 'Usuario *',
      usernamePlaceholder: 'ej: operador1',
      emailLabel: 'Correo Electrónico *',
      emailPlaceholder: 'usuario@bigbrother.local',
      passwordLabel: 'Contraseña de Acceso',
      passwordPlaceholderEdit: 'Dejar en blanco para conservar contraseña actual',
      passwordPlaceholderNew: '••••••••',
      roleLabel: 'Rol de Acceso',
      permissionsLabel: 'Permisos Adicionales',
      permissionsPlaceholder: 'Ej: cameras:read,cameras:write',
      accountStateLabel: 'Estado de la Cuenta',
      activeLabel: 'Cuenta Activa y Habilitada',
      disabledLabel: 'Cuenta Deshabilitada / Suspendida',
      deleteConfirm: '¿Estás seguro de eliminar al usuario "{username}"?',
      noUsers: 'NO SE ENCONTRARON USUARIOS',
      saveUserBtn: 'Guardar Usuario',
      createUserBtn: 'CREAR USUARIO',
      saveChangesBtn: 'GUARDAR CAMBIOS',
      processingBtn: 'PROCESANDO...',
      selfDeleteError: 'No puedes eliminar tu propia cuenta.',
      lastAdminError: 'No es posible eliminar al único Administrador del sistema.',
      requiredError: 'El nombre de usuario y el correo electrónico son obligatorios',
      passwordRequiredError: 'Introduce una contraseña para el nuevo usuario',
      editUserTitle: 'Editar usuario',
      deleteUserTitle: 'Eliminar usuario',
      permCamerasRead: 'Ver Cámaras',
      permCamerasReadDesc: 'Acceso a streams en directo',
      permCamerasWrite: 'Gestionar Cámaras',
      permCamerasWriteDesc: 'Añadir y configurar fuentes de vídeo',
      permCamerasDelete: 'Eliminar Cámaras',
      permCamerasDeleteDesc: 'Borrar cámaras del sistema',
      permUsersRead: 'Ver Usuarios',
      permUsersReadDesc: 'Consultar lista de usuarios',
      permUsersManage: 'Administrar Usuarios',
      permUsersManageDesc: 'Crear, editar y eliminar usuarios',
    },
    alerts: {
      title: 'Alertas de Movimiento',
      badge: 'ALERTA',
      noAlerts: 'SIN INCIDENCIAS',
      noAlertsDesc: 'No hay alertas de movimiento registradas en el sector.',
      markAllRead: 'Marcar todo como visto',
      clearHistory: 'Limpiar historial',
      motionDetected: 'Movimiento detectado',
      soundAlerts: 'Alarma acústica',
      browserNotifications: 'Notificaciones nativas',
      enableNotifications: 'Activar en navegador',
      notificationsEnabled: 'Notificaciones activas',
      notificationsDenied: 'Notificaciones bloqueadas',
      ack: 'Confirmar',
      acked: 'Visto',
      delete: 'Eliminar',
      activeAlarm: 'ALARMA ACTIVA',
      cooldownActive: 'Enfriamiento activo',
      justNow: 'Ahora mismo',
      minutesAgo: 'hace {m}m',
      testAlert: 'Probar alerta de movimiento',
      viewInPanel: 'Ver en panel',
      zoomSnapshot: 'Ampliar captura',
    },
    dashboardView: {
      title: 'CENTRO DE CONTROL CCTV',
      subtitle: 'Monitorización táctica en tiempo real, telemetría y detección de eventos',
      totalCameras: 'Cámaras Totales',
      onlineCameras: 'En Emisión Online',
      standbyCameras: 'En Espera / Standby',
      totalAlerts: 'Incidentes Detectados',
      unreadAlerts: 'Alertas Pendientes',
      activeAlarms: 'Sectores en Alarma',
      systemHealth: 'Estado de la Red',
      operational: 'OPERATIVO',
      liveFeeds: 'Vigilancia de Cámaras',
      recentSnapshots: 'Capturas de Movimiento Recientes',
      noSnapshots: 'No hay capturas registradas todavía en el sector.',
      viewLiveGrid: 'Mosaico en Vivo',
      viewAllAlerts: 'Ver Historial Completo',
      quickActions: 'Acciones Tácticas',
      testAlert: 'Simular Detección ⚡',
      markAllSeen: 'Marcar Todo Visto',
      manageCameras: 'Ajustes de Cámaras',
      noCamerasConnected: 'Sin cámaras conectadas',
      liveAndStandby: '{online} en vivo • {standby} en espera',
      streamsInSystem: '{count} transmisión(es) RTSP/HLS en sistema',
      pending: 'PENDIENTES',
      totalHistory: 'Total histórico: {count} incidentes',
      sectors: 'SECTORES',
      noActiveAlarms: 'Ninguna alarma activa en curso',
      soundActive: 'ACTIVA (CHIRP)',
      soundMuted: 'SILENCIADA',
      soundMuteTooltip: 'Silenciar alarma',
      soundUnmuteTooltip: 'Activar alarma acústica',
      soundSynthesizer: 'Sintetizador Web Audio API local',
      noCamerasConfigured: 'No hay cámaras configuradas en el sistema.',
      infrastructure: 'INFRAESTRUCTURA',
      infraTitle: 'INFRAESTRUCTURA DE RED Y SERVICIOS',
      infraSubtitle: 'Topología de nodos distribuidos, puertos y telemetría de comunicación',
      infraMediaMtx: 'Servidor MediaMTX',
      infraApi: 'Big Brother API Core',
      infraMotion: 'Detector Motion Daemon',
      infraDb: 'PostgreSQL Persistente',
      infraConnected: 'CONECTADO',
      infraActive: 'ACTIVO',
      infraAllOnline: '4/4 NODOS OPERATIVOS',
    },
    alertsTab: {
      title: 'HISTORIAL DE NOTIFICACIONES Y CAPTURAS',
      subtitle: 'Registro fotográfico forense y alertas de intrusión en tiempo real',
      filterAll: 'Todas las alertas',
      filterUnread: 'Pendientes (Sin leer)',
      filterRead: 'Atendidas (Leídas)',
      allCameras: 'Todas las cámaras',
      galleryMode: 'Mosaico de Fotos',
      tableMode: 'Lista Detallada',
      confidence: 'Confianza',
      downloadSnapshot: 'Descargar foto',
      zoomSnapshot: 'Ampliar captura',
      emptyTitle: 'SECTOR SEGURO',
      emptyDesc: 'No hay alertas ni detecciones de movimiento registradas con los filtros seleccionados.',
      searchPlaceholder: 'Buscar cámara o etiqueta...',
      showingCount: 'Mostrando {filtered} de {total}',
      noPhoto: 'Sin foto',
      hoursAgo: 'hace {h}h',
      colSnapshot: 'CAPTURA',
      colCamera: 'CÁMARA',
      colTimeDate: 'HORA / FECHA',
      colLabel: 'ETIQUETA',
      colStatus: 'ESTADO',
      colActions: 'ACCIONES',
    },
  },
  en: {
    common: {
      online: 'ONLINE',
      offline: 'OFFLINE',
      standby: 'STANDBY',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      actions: 'Actions',
      search: 'Search...',
      status: 'Status',
      copy: 'Copy',
      copied: 'Copied',
      refresh: 'Refresh',
      user: 'User',
      administrator: 'ADMINISTRATOR',
      operator: 'OPERATOR',
      viewer: 'READ ONLY',
      loading: 'Loading...',
      yes: 'Yes',
      no: 'No',
      required: 'Required',
    },
    navbar: {
      ticker1: 'BIG BROTHER CCTV',
      ticker2: 'REAL-TIME SURVEILLANCE SYSTEM',
      ticker3: 'SECURE MTX CONNECTION',
      ticker4: 'LOW-LATENCY HLS STREAMING',
      ticker5: 'OPERATIONAL SECTOR 4',
      controlPanel: 'CONTROL PANEL',
      liveCameras: 'Live Cameras',
      live: 'Live',
      cameraManagement: 'Camera Management',
      cameras: 'Cameras',
      users: 'Users',
      dashboard: 'Dashboard',
      notificationsTab: 'Notifications',
      logout: 'Sign Out',
      language: 'Language',
    },
    login: {
      title: 'BIG BROTHER CCTV',
      subtitle: 'CCTV SURVEILLANCE & MONITORING SYSTEM',
      header: 'SYSTEM ACCESS',
      desc: 'Enter your authorized credentials to access camera feeds',
      usernameLabel: 'User Identifier',
      usernamePlaceholder: 'E.g.: admin or operator',
      passwordLabel: 'Access Password',
      passwordPlaceholder: '••••••••',
      submit: 'SIGN IN TO PANEL',
      submitting: 'AUTHENTICATING...',
      footerNote: 'SECURE TERMINAL • JWT ENCRYPTION ACTIVE',
      validationError: 'Please enter your username and password',
      invalidResponse: 'Invalid server response',
      defaultError: 'Incorrect username or password',
    },
    liveGrid: {
      title: 'Live Cameras',
      activeSingle: 'ACTIVE',
      activePlural: 'ACTIVE',
      subtitle: 'CONTINUOUS STREAM • LIVE CCTV',
      searchPlaceholder: 'Search camera or location...',
      layoutAuto: 'Fluid Auto Grid',
      layout1x1: '1x1 View (1 Large Column)',
      layout2x2: '2x2 Grid (2 Fixed Columns)',
      layout3x3: '3x3 Grid (3 Columns)',
      refreshTooltip: 'Refresh stream status',
      addCamera: 'Add Camera',
      noCamerasTitle: 'NO CAMERAS CONNECTED',
      noCamerasSearch: 'No cameras found matching "{query}".',
      noCamerasDesc: 'Connect IP cameras (RTSP), stream live from smartphone or OBS (Push), link a local webcam, or launch a test pattern.',
      checkFeeds: 'Check Feeds',
    },
    videoPlayer: {
      liveFull: 'LIVE',
      liveShort: 'LIVE',
      tuningFull: 'TUNING',
      tuningShort: 'STANDBY',
      standby: 'STANDBY',
      noStream: 'NO ACTIVE STREAM',
      waitingStream: 'Waiting for video stream at',
      reconnect: 'RECONNECT',
      connecting: 'CONNECTING...',
      technicalTelemetry: 'TELEMETRY',
      saveSnapshot: 'SNAPSHOT',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit fullscreen',
      exit: 'EXIT',
      restartStream: 'Restart Stream',
      sectorNode: 'BIG BROTHER CCTV // NODE #{id}',
      buffer: 'BUFFER',
      rotation: 'ROTATION',
      tune: 'LATENCY TUNE',
      nodeId: 'NODE ID',
    },
    camerasAdmin: {
      title: 'Camera Management',
      subtitle: 'CONFIGURATION OF VIDEO SOURCES, DEVICES, AND STREAM PARAMETERS',
      searchPlaceholder: 'Filter by camera or device...',
      newCamera: 'New Camera',
      colStatus: 'STATUS',
      colCamera: 'CAMERA',
      colTypeMode: 'TYPE / MODE',
      colSource: 'SOURCE / DEVICE',
      colQuality: 'QUALITY',
      colActions: 'ACTIONS',
      deleteConfirm: 'Are you sure you want to delete camera "{name}"?',
      noCameras: 'No configured cameras found.',
      modeIpPull: 'IP PULL',
      modePush: 'PUSH',
      modeEdge: 'EDGE AGENT',
      modeUsb: 'LOCAL USB',
      modeTest: 'SMPTE TEST',
    },
    cameraModal: {
      editTitle: 'Edit Camera: {name}',
      addTitle: 'Add New Camera',
      modesHelp: 'MODES: IP CAMERA • PUSH (MOBILE/OBS) • DOCKER EDGE • USB WEBCAM • TEST',
      tabIp: 'IP Camera (RTSP/HTTP)',
      tabPush: 'Push Stream (Mobile / OBS)',
      tabEdge: 'Edge Agent (Docker)',
      tabUsb: 'Local USB Webcam',
      tabTest: 'SMPTE Test Signal',
      nameLabel: 'Stream / Channel Identifier *',
      namePlaceholder: 'e.g.: north-hall, cam-dahua, garage-entry',
      namePathNote: 'This name will define the streaming path: ',
      sourceTypeLabel: 'Input Protocol',
      sourceUrlLabel: 'RTSP / RTMP / HTTP Stream URL *',
      sourceUrlPlaceholder: 'rtsp://username:password@192.168.1.50:554/stream1',
      ipHelpTitle: 'Automatic Server Ingest (PULL)',
      ipHelpDesc: 'The Big Brother server connects directly to the IP camera on your network or internet. No external script or ffmpeg required on your machine.',
      pushHelpTitle: 'Direct Ingest (Broadcast / Push)',
      pushHelpDesc: 'Any device (mobile with Larix Broadcaster, OBS Studio, standalone Wi-Fi camera, or drone) can push video directly to Big Brother. As soon as stream is sent, it goes live!',
      edgeHelpTitle: 'Autonomous Agent Deployment (Raspberry Pi / Linux Edge)',
      edgeHelpDesc: 'Copy this command and run it on any Raspberry Pi or remote machine with a camera. The agent connects to Big Brother automatically, sends heartbeats, and syncs settings:',
      testHelpDesc: '📡 Synthetic test pattern generator: SMPTE color bars and real-time clock. Perfect for validating playback without hardware.',
      deviceLabel: 'Linux V4L2 Device',
      resolutionLabel: 'Capture Resolution',
      fpsLabel: 'Frames Per Second (FPS)',
      codecLabel: 'Video Codec',
      rotationLabel: 'Image Rotation',
      presetLabel: 'FFmpeg Preset',
      tuneLabel: 'Latency Tuning',
      cancelBtn: 'Cancel',
      saveBtn: 'Save Configuration',
      saveChangesBtn: 'SAVE CHANGES',
      addCameraBtn: 'ADD CAMERA',
      savingBtn: 'SAVING...',
      copyCommand: 'Copy Command',
      rtspPresetsTitle: 'Quick RTSP presets:',
      pushInstructionsTitle: 'Live streaming instructions (Push):',
      pushRtspHelp: 'RTSP Push Endpoint:',
      pushRtmpHelp: 'RTMP Endpoint (OBS / Larix / OctoStream):',
      dockerEdgeHelp: 'Docker Edge execution command:',
      nameRequiredError: 'Camera name is required',
      urlRequiredError: 'You must provide the RTSP or HTTP URL for the IP camera',
      defaultSaveError: 'Failed to save camera configuration',
      motionDetectionTitle: 'Motion Detection (Motion Daemon)',
      motionActive: 'ACTIVE',
      motionPaused: 'PAUSED',
      motionSensitivity: 'Detection Sensitivity (Threshold: {t} px)',
      motionSensitivityHigh: '⚡ High (150px)',
      motionSensitivityMedium: '🎯 Medium (350px)',
      motionSensitivityLow: '🛡️ Low (600px)',
      motionPersistence: 'Persistence (Minimum Frames)',
      motionFrame1: '1 Frame (Instant - very sensitive)',
      motionFrame2: '2 Frames (Recommended - persons)',
      motionFrame3: '3 Frames (Sustained motion)',
      motionFrame5: '5 Frames (Strict)',
      motionCooldown: 'Cooldown Period (Seconds)',
    },
    usersAdmin: {
      title: 'User Management',
      headerTag: 'BIG BROTHER CCTV // ACCESS CONTROL',
      subtitle: 'ACCOUNT MANAGEMENT, ACCESS ROLES AND SYSTEM PERMISSIONS',
      searchPlaceholder: 'Search by username, name or email...',
      newUser: 'Add User',
      totalUsers: '{count} REGISTERED USERS',
      filterLabel: 'Filter:',
      filterAll: 'All',
      filterAdmin: 'Admin',
      filterOperator: 'Operator',
      filterViewer: 'Viewer',
      colUser: 'User',
      colName: 'Name',
      colEmail: 'Email Address',
      colRole: 'Role',
      colPermissions: 'Permissions',
      colStatus: 'Status',
      colActions: 'Actions',
      roleAdmin: 'ADMINISTRATOR',
      roleOperator: 'OPERATOR',
      roleViewer: 'VIEWER',
      roleAdminDesc: 'Full Control',
      roleOperatorDesc: 'Camera Management',
      roleViewerDesc: 'View Only',
      statusActive: 'ACTIVE',
      statusDisabled: 'SUSPENDED',
      youBadge: 'YOU',
      inheritedPermissions: 'Inherited by role',
      accessControlBadge: 'ACCESS CONTROL',
      modalEditTitle: 'Edit User',
      modalAddTitle: 'New User',
      modalEditSubtitle: 'Updating role and permissions for @{username}.',
      modalAddSubtitle: 'Enter account details and assign role and system permissions.',
      nameLabel: 'Full Name',
      namePlaceholder: 'E.g.: John Doe',
      usernameLabel: 'Username *',
      usernamePlaceholder: 'e.g.: operator1',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'user@bigbrother.local',
      passwordLabel: 'Access Password',
      passwordPlaceholderEdit: 'Leave blank to keep current password',
      passwordPlaceholderNew: '••••••••',
      roleLabel: 'Access Role',
      permissionsLabel: 'Additional Permissions',
      permissionsPlaceholder: 'E.g.: cameras:read,cameras:write',
      accountStateLabel: 'Account Status',
      activeLabel: 'Active & Enabled Account',
      disabledLabel: 'Disabled / Suspended Account',
      deleteConfirm: 'Are you sure you want to delete user "{username}"?',
      noUsers: 'NO USERS FOUND',
      saveUserBtn: 'Save User',
      createUserBtn: 'CREATE USER',
      saveChangesBtn: 'SAVE CHANGES',
      processingBtn: 'PROCESSING...',
      selfDeleteError: 'You cannot delete your own account.',
      lastAdminError: 'Cannot delete the only system Administrator.',
      requiredError: 'Username and email are required',
      passwordRequiredError: 'Enter a password for the new user',
      editUserTitle: 'Edit user',
      deleteUserTitle: 'Delete user',
      permCamerasRead: 'View Cameras',
      permCamerasReadDesc: 'Access live video feeds',
      permCamerasWrite: 'Manage Cameras',
      permCamerasWriteDesc: 'Add and configure video sources',
      permCamerasDelete: 'Delete Cameras',
      permCamerasDeleteDesc: 'Remove cameras from system',
      permUsersRead: 'View Users',
      permUsersReadDesc: 'View users list',
      permUsersManage: 'Manage Users',
      permUsersManageDesc: 'Create, edit, and delete users',
    },
    alerts: {
      title: 'Motion Alerts',
      badge: 'ALERT',
      noAlerts: 'NO INCIDENTS',
      noAlertsDesc: 'No motion alerts recorded in the sector.',
      markAllRead: 'Mark all as read',
      clearHistory: 'Clear history',
      motionDetected: 'Motion detected',
      soundAlerts: 'Acoustic alarm',
      browserNotifications: 'Native notifications',
      enableNotifications: 'Enable in browser',
      notificationsEnabled: 'Notifications active',
      notificationsDenied: 'Notifications blocked',
      ack: 'Acknowledge',
      acked: 'Read',
      delete: 'Delete',
      activeAlarm: 'ACTIVE ALARM',
      cooldownActive: 'Cooldown active',
      justNow: 'Just now',
      minutesAgo: '{m}m ago',
      testAlert: 'Test motion alert',
      viewInPanel: 'View in panel',
      zoomSnapshot: 'Zoom snapshot',
    },
    dashboardView: {
      title: 'CCTV COMMAND CENTER',
      subtitle: 'Real-time tactical monitoring, telemetry and incident detection',
      totalCameras: 'Total Cameras',
      onlineCameras: 'Streaming Online',
      standbyCameras: 'Standby / Offline',
      totalAlerts: 'Detected Incidents',
      unreadAlerts: 'Pending Alerts',
      activeAlarms: 'Sectors in Alarm',
      systemHealth: 'Network Status',
      operational: 'OPERATIONAL',
      liveFeeds: 'Camera Surveillance',
      recentSnapshots: 'Recent Motion Snapshots',
      noSnapshots: 'No snapshots recorded yet in the sector.',
      viewLiveGrid: 'Live Matrix',
      viewAllAlerts: 'View Full History',
      quickActions: 'Tactical Actions',
      testAlert: 'Simulate Detection ⚡',
      markAllSeen: 'Mark All Seen',
      manageCameras: 'Camera Settings',
      noCamerasConnected: 'No cameras connected',
      liveAndStandby: '{online} live • {standby} standby',
      streamsInSystem: '{count} RTSP/HLS stream(s) in system',
      pending: 'PENDING',
      totalHistory: 'Historical total: {count} incidents',
      sectors: 'SECTORS',
      noActiveAlarms: 'No active alarms in progress',
      soundActive: 'ACTIVE (CHIRP)',
      soundMuted: 'MUTED',
      soundMuteTooltip: 'Mute acoustic alarm',
      soundUnmuteTooltip: 'Enable acoustic alarm',
      soundSynthesizer: 'Local Web Audio API synthesizer',
      noCamerasConfigured: 'No cameras configured in the system.',
      infrastructure: 'INFRASTRUCTURE',
      infraTitle: 'NETWORK & SERVICE INFRASTRUCTURE',
      infraSubtitle: 'Distributed node topology, listening ports, and communication telemetry',
      infraMediaMtx: 'MediaMTX Media Server',
      infraApi: 'Big Brother API Core',
      infraMotion: 'Motion Detector Daemon',
      infraDb: 'Persistent PostgreSQL',
      infraConnected: 'CONNECTED',
      infraActive: 'ACTIVE',
      infraAllOnline: '4/4 NODES OPERATIONAL',
    },
    alertsTab: {
      title: 'NOTIFICATIONS & SNAPSHOT ARCHIVE',
      subtitle: 'Forensic photo log and real-time intrusion alarms',
      filterAll: 'All alerts',
      filterUnread: 'Pending (Unread)',
      filterRead: 'Acknowledged',
      allCameras: 'All cameras',
      galleryMode: 'Photo Gallery',
      tableMode: 'Detailed List',
      confidence: 'Confidence',
      downloadSnapshot: 'Download photo',
      zoomSnapshot: 'Zoom snapshot',
      emptyTitle: 'SECTOR SECURE',
      emptyDesc: 'No alerts or motion events recorded matching the selected filters.',
      searchPlaceholder: 'Search camera or label...',
      showingCount: 'Showing {filtered} of {total}',
      noPhoto: 'No photo',
      hoursAgo: '{h}h ago',
      colSnapshot: 'SNAPSHOT',
      colCamera: 'CAMERA',
      colTimeDate: 'TIME / DATE',
      colLabel: 'LABEL',
      colStatus: 'STATUS',
      colActions: 'ACTIONS',
    },
  },
};
