#### Uso de traducciones en componentes Vue

////////////////////////////////////////////

Uso de traducciones en componentes Vue
Ahora puedes usar las traducciones en cualquier componente Vue:

<template>
  <div>
    <h1>{{ $t('jobs.title') }}</h1>
    <p>{{ $t('jobs.description') }}</p>
    
    <!-- Con parámetros -->
    <p>{{ $t('common.hello', { name: user.firstName }) }}</p>
    
    <!-- Pluralización -->
    <p>{{ $tc('jobs.results', jobCount, { count: jobCount }) }}</p>
  </div>
</template>

////////////////////////////////////////////

### Formatos de fecha y hora localizados

////////////////////////////////////////////

<template>
  <div>
    <!-- Usando filtros globales -->
    <p>{{ job.datePosted | formatDate }}</p>
    <p>{{ job.createdAt | formatTime }}</p>
    <p>{{ job.updatedAt | formatDateTime }}</p>
    <p>{{ job.datePosted | fromNow }}</p>
  </div>
</template>
